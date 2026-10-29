"use client";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type Turnstile = { render: (el: HTMLElement, options: Record<string, unknown>) => string; remove: (id: string) => void };
declare global { interface Window { turnstile?: Turnstile } }

export function Verification({ action, attempt }: { action: "contact" | "rfq"; attempt: number }) {
  const el = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  useEffect(() => {
    if (!ready || !el.current || !window.turnstile || !sitekey) return;
    const widget = window.turnstile.render(el.current, { sitekey, action, theme: "auto", "error-callback": () => setFailed(true), callback: () => setFailed(false) });
    return () => window.turnstile?.remove(widget);
  }, [ready, sitekey, action, attempt]);
  if (!sitekey) return null;
  return <div>
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={() => setReady(true)} onError={() => setFailed(true)} />
    <div ref={el} />
    {failed && <p role="alert">Verification could not load. Reload this page or email sales@somnyxsolar.com.</p>}
  </div>;
}
