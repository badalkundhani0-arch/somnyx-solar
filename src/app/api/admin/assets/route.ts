import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { acceptRefs, removeFile, storeFile, storageMode, validateFile, ALLOWED, type StoredFile } from "@/lib/storage";
import { getProduct, updateProduct } from "@/lib/products";
import { newId, query, run } from "@/lib/db";

export const runtime = "nodejs";

const TARGETS = {
  "product-image": { kind: "images", field: "imageUrl" },
  "product-model": { kind: "models", field: "modelUrl" },
  "product-datasheet": { kind: "datasheets", field: "datasheetUrl" },
  resource: { kind: "documents", field: null },
} as const;

/** Upload or remove admin-managed files: product imagery, 3D models, datasheets and technical resources. */
export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  const fd = await req.formData();
  const target = String(fd.get("target")) as keyof typeof TARGETS;
  const action = String(fd.get("action") || "upload");
  const id = String(fd.get("id") || "");
  const t = TARGETS[target];
  if (!t) return NextResponse.json({ error: "Unknown target" }, { status: 400 });

  if (target.startsWith("product-")) {
    const p = await getProduct(id);
    if (!p) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    const field = t.field as "imageUrl" | "modelUrl" | "datasheetUrl";
    if (action === "remove") {
      await removeFile(p[field]);
      await updateProduct(id, { [field]: null });
    } else {
      const got = await receive(fd, `public/products/${id}/`, t.kind);
      if ("error" in got) return NextResponse.json({ error: got.error }, { status: 422 });
      await removeFile(p[field]);
      await updateProduct(id, { [field]: got.file.url });
    }
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  }

  // resources
  if (action === "remove") {
    const rows = await query<{ file_url: string }>("SELECT file_url FROM resources WHERE id = ?", [id]);
    if (rows[0]) await removeFile(rows[0].file_url);
    await run("DELETE FROM resources WHERE id = ?", [id]);
  } else if (action === "toggle") {
    await run("UPDATE resources SET published = 1 - published WHERE id = ?", [id]);
  } else {
    const title = String(fd.get("title") || "").trim();
    if (!title) return NextResponse.json({ error: "Give the document a title." }, { status: 422 });
    const got = await receive(fd, "public/resources/", "documents");
    if ("error" in got) return NextResponse.json({ error: got.error }, { status: 422 });
    await run("INSERT INTO resources (id, title, description, category, file_url, file_name, file_size, published, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
      newId("res_"),
      title.slice(0, 200),
      String(fd.get("description") || "").slice(0, 1000),
      String(fd.get("category") || "Technical note").slice(0, 60),
      got.file.url,
      got.file.name,
      got.file.size,
      fd.get("published") === "yes" ? 1 : 0,
      new Date().toISOString(),
    ]);
  }
  revalidatePath("/resources");
  return NextResponse.json({ ok: true });
}

async function receive(fd: FormData, prefix: string, kind: keyof typeof ALLOWED): Promise<{ file: StoredFile } | { error: string }> {
  const refs = acceptRefs(fd.get("file__refs"), prefix, kind);
  if (refs.error) return { error: refs.error };
  if (refs.files[0]) return { file: refs.files[0] };
  const f = fd.get("file");
  if (!(f instanceof File) || f.size === 0) return { error: "Choose a file to upload." };
  const err = validateFile(f, kind);
  if (err) return { error: err };
  if (storageMode() === "unavailable") return { error: "File storage is not configured. Set BLOB_READ_WRITE_TOKEN." };
  return { file: await storeFile(f, prefix.replace(/\/$/, "")) };
}
