export const TAGLINE = "Engineering a Cleaner Tomorrow.";
export const COMPANY = "Somnyx Solar";
export const PARENT = "Somnyx Industries";
export const LOCATION = "Surat, Gujarat, India";
export const EMAILS = {
  sales: "sales@somnyxsolar.com",
  procurement: "procurement@somnyxsolar.com",
  technical: "technical@somnyxsolar.com",
} as const;
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.somnyxsolar.com").replace(/\/$/, "");

export const NAV = [
  { href: "/products", label: "Products" },
  { href: "/technology", label: "Technology" },
  { href: "/manufacturing", label: "Manufacturing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
