import { query } from "@/lib/db";
import { H1, fmtDate } from "@/components/admin/ui";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { storageMode } from "@/lib/storage";

export default async function ResourcesAdmin() {
  const rows = await query<{ id: string; title: string; category: string; file_url: string; file_name: string; file_size: number; published: number; created_at: string }>("SELECT * FROM resources ORDER BY created_at DESC");
  return (
    <>
      <H1 sub="Documents published on the Technical Resources page. Unpublished documents stay private to this dashboard only by not being listed; their links still work if shared.">Technical resources</H1>
      <ResourceManager mode={storageMode()} rows={rows.map((r) => ({ ...r, created: fmtDate(r.created_at), published: Number(r.published), file_size: Number(r.file_size) }))} />
    </>
  );
}
