import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/products";
import { BoxDrawing } from "./Art";
import { StatusBadge } from "./ui";

/** Full-width product presentation used in the home gallery. */
export function ProductPanel({ p, index, total }: { p: Product; index: number; total: number }) {
  const key = p.specs.filter((s) => ["Maximum PV system voltage", "Enclosure protection", "Standard"].includes(s.label));
  return (
    <article className="relative grid w-full overflow-hidden rounded-[32px] border border-line bg-graphite lg:min-h-[520px] lg:grid-cols-[1.05fr_1fr]">
      <div className="relative flex flex-col justify-between p-7 md:p-10">
        <div className="flex items-center justify-between">
          <span className="label">
            {index + 1} of {total}
          </span>
          <StatusBadge status={p.status} />
        </div>
        <div className="mt-10">
          <p className="font-display text-[clamp(5.5rem,13vw,11rem)] font-medium leading-[0.8] tracking-[-0.06em]">
            {p.currentRating}
            <span className="ml-2 text-[0.38em] tracking-tight text-accent">A</span>
          </p>
          <h3 className="mt-6 font-display text-2xl tracking-tight md:text-3xl">{p.name}</h3>
          <p className="mt-3 max-w-md text-silver">{p.summary}</p>
        </div>
        <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-6">
          {key.map((s) => (
            <div key={s.label}>
              <dt className="text-xs text-steel">{s.label.replace("Maximum PV system voltage", "System voltage").replace("Enclosure protection", "Protection")}</dt>
              <dd className="mt-1 font-display text-base tabular-nums md:text-lg">{s.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href={`/products/${p.id}`} className="btn btn-primary btn-sm">
            View {p.code}
          </Link>
          <Link href={`/request-quote?variant=${p.id}&intent=specifications`} className="btn btn-ghost btn-sm">
            Request Specifications
          </Link>
          <Link href={`/request-quote?variant=${p.id}`} className="btn btn-ghost btn-sm">
            Request a Quotation
          </Link>
        </div>
      </div>
      <div className="relative hidden border-l border-line bg-[radial-gradient(ellipse_at_center,#ffffff,#F1EEE9_75%)] lg:block">
        <div className="blueprint-grid absolute inset-0" />
        {p.imageUrl ? (
          <Image src={p.imageUrl} alt={`${p.name} product image`} fill className="object-contain p-10" sizes="40vw" unoptimized={p.imageUrl.startsWith("/api/")} />
        ) : (
          <BoxDrawing rating={p.currentRating} className="absolute inset-0 m-auto w-[85%]" />
        )}
        <span className="label absolute bottom-5 left-6">{p.imageUrl ? "Product image" : "3-split layout, top view"}</span>
      </div>
    </article>
  );
}
