import { INDUSTRIES } from "@/lib/industries";
import { SolarArt } from "./Art";

/** Panels expand on hover/focus (desktop) to reveal detail; on touch they show it inline. */
export function IndustryPanels({ expanded = false }: { expanded?: boolean }) {
  return (
    <ul className={`grid gap-3 ${expanded ? "md:grid-cols-2" : "lg:flex lg:h-[560px]"}`} data-stagger>
      {INDUSTRIES.map((ind) => (
        <li
          key={ind.id}
          tabIndex={expanded ? undefined : 0}
          className={`group relative min-h-[340px] overflow-hidden rounded-[24px] border border-line bg-graphite outline-none transition-[flex-grow] duration-700 ease-out-expo focus-visible:border-cyan ${
            expanded ? "" : "lg:min-h-0 lg:flex-1 lg:hover:flex-[2.6] lg:focus-within:flex-[2.6] lg:focus:flex-[2.6]"
          }`}
        >
          <SolarArt variant={ind.art} className="absolute inset-0 h-full w-full transition-transform duration-1000 ease-out-expo group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/75 to-obsidian/10" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
            <h3 className="font-display text-2xl leading-tight tracking-tight">{ind.title}</h3>
            <p className="mt-2 text-sm text-silver">{ind.short}</p>
            <div className={`grid transition-[grid-template-rows,opacity] duration-700 ease-out-expo ${expanded ? "grid-rows-[1fr]" : "grid-rows-[1fr] lg:grid-rows-[0fr] lg:opacity-0 lg:group-hover:grid-rows-[1fr] lg:group-hover:opacity-100 lg:group-focus:grid-rows-[1fr] lg:group-focus:opacity-100"}`}>
              <p className="overflow-hidden pt-3 text-sm text-silver lg:max-w-md">{ind.detail}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
