"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { run } from "@/lib/db";
import { saveContent } from "@/lib/content";
import { updateProduct } from "@/lib/products";
import { STATUS_ORDER, type ProductStatus, type Spec } from "@/lib/seed";

const RFQ_STATUSES = ["new", "in-review", "quoted", "won", "lost", "archived"];

export async function setRfqStatus(id: string, fd: FormData) {
  await requireAdmin();
  const status = String(fd.get("status"));
  if (!RFQ_STATUSES.includes(status)) throw new Error("Invalid status");
  await run("UPDATE rfqs SET status = ?, admin_notes = ? WHERE id = ?", [status, String(fd.get("notes") ?? "").slice(0, 10000), id]);
  revalidatePath("/admin", "layout");
}

export async function deleteRfq(id: string) {
  await requireAdmin();
  await run("DELETE FROM rfqs WHERE id = ?", [id]);
  revalidatePath("/admin", "layout");
  redirect("/admin/rfqs");
}

export async function setMessageStatus(id: string, status: string) {
  await requireAdmin();
  if (!["new", "replied", "archived"].includes(status)) throw new Error("Invalid status");
  await run("UPDATE contacts SET status = ? WHERE id = ?", [status, id]);
  revalidatePath("/admin", "layout");
}

export async function saveProduct(id: string, fd: FormData) {
  await requireAdmin();
  const status = String(fd.get("status")) as ProductStatus;
  if (!STATUS_ORDER.includes(status)) throw new Error("Invalid status");
  const labels = fd.getAll("spec_label").map(String);
  const values = fd.getAll("spec_value").map(String);
  const notes = fd.getAll("spec_note").map(String);
  const specs: Spec[] = labels
    .map((label, i) => ({ label: label.trim(), value: (values[i] ?? "").trim(), note: (notes[i] ?? "").trim() || undefined }))
    .filter((s) => s.label && s.value);
  await updateProduct(id, {
    name: String(fd.get("name")).trim().slice(0, 120),
    tagline: String(fd.get("tagline")).trim().slice(0, 200),
    summary: String(fd.get("summary")).trim().slice(0, 2000),
    status,
    statusNote: String(fd.get("statusNote")).trim().slice(0, 1000),
    specs,
  });
  revalidatePath("/", "layout");
  redirect(`/admin/products/${id}?saved=1`);
}

export async function saveCopy(fd: FormData) {
  await requireAdmin();
  const values: Record<string, string> = {};
  for (const [k, v] of fd.entries()) if (!k.startsWith("$") && typeof v === "string") values[k] = v;
  await saveContent(values);
  revalidatePath("/", "layout");
  redirect("/admin/content?saved=1");
}
