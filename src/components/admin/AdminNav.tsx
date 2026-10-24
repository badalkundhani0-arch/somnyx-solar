"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({ newRfqs, newMessages }: { newRfqs: number; newMessages: number }) {
  const path = usePathname();
  const items = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/rfqs", label: "Quotation requests", badge: newRfqs },
    { href: "/admin/messages", label: "Messages", badge: newMessages },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/content", label: "Website copy" },
    { href: "/admin/resources", label: "Technical resources" },
  ];
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0">
      {items.map((i) => {
        const on = i.href === "/admin" ? path === "/admin" : path.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} aria-current={on ? "page" : undefined} className={`flex shrink-0 items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm ${on ? "bg-obsidian text-white" : "text-silver hover:text-white"}`}>
            {i.label}
            {!!i.badge && <span className="rounded-full bg-cyan px-2 text-xs font-medium text-ink">{i.badge}</span>}
          </Link>
        );
      })}
      <form action="/api/admin/logout" method="post" className="lg:hidden">
        <button className="shrink-0 px-3 py-2 text-sm text-silver">Sign out</button>
      </form>
    </nav>
  );
}
