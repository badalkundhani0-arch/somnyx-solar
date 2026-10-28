import type { Metadata } from "next";
import { adminConfigured } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const sp = await searchParams;
  const configured = adminConfigured();
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Logo id="login-logo" tagline />
        <h1 className="mt-10 font-display text-3xl tracking-tight">Admin sign in</h1>
        {configured ? (
          <LoginForm next={sp.next?.startsWith("/admin") ? sp.next : "/admin"} />
        ) : (
          <div className="mt-6 rounded-xl border border-warn/30 bg-warn/5 p-4 text-sm text-warn">
            Admin access is locked because it is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD and SESSION_SECRET (at least 32 characters) in the server environment, then reload this page.
          </div>
        )}
      </div>
    </main>
  );
}
