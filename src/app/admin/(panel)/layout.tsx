import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifyToken } from "@/lib/auth";
import { LogoMark } from "@/components/Logo";
import { AdminNav } from "@/components/admin/AdminNav";
import { query } from "@/lib/db";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await verifyToken((await cookies()).get(SESSION_COOKIE)?.value))) redirect("/admin/login");
  const [r, m] = await Promise.all([
    query<{ n: number }>("SELECT COUNT(*) AS n FROM rfqs WHERE status = 'new'"),
    query<{ n: number }>("SELECT COUNT(*) AS n FROM contacts WHERE status = 'new'"),
  ]);
  return (
    <div className="min-h-dvh bg-obsidian lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-graphite lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between p-5">
          <Link href="/admin" className="flex items-center gap-2 font-display font-semibold tracking-wide">
            <LogoMark className="h-6 w-6" /> Somnyx admin
          </Link>
        </div>
        <AdminNav newRfqs={Number(r[0].n)} newMessages={Number(m[0].n)} />
        <div className="hidden p-5 lg:absolute lg:bottom-0 lg:block lg:w-full">
          <Link href="/" target="_blank" className="block text-sm text-silver hover:text-white">View website</Link>
          <form action="/api/admin/logout" method="post">
            <button className="mt-3 text-sm text-silver hover:text-white">Sign out</button>
          </form>
        </div>
      </aside>
      <div className="min-w-0 p-5 md:p-10">{children}</div>
    </div>
  );
}
