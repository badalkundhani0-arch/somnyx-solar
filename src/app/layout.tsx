import type { Metadata, Viewport } from "next";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./globals.css";
import { SITE_URL, TAGLINE } from "@/lib/brand";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `Somnyx Solar | ${TAGLINE}`, template: "%s | Somnyx Solar" },
  description:
    "Somnyx Solar manufactures 3-split photovoltaic junction boxes for module manufacturers, with 3.6 GW of annual capacity in Gujarat, India.",
  applicationName: "Somnyx Solar",
  openGraph: {
    type: "website",
    siteName: "Somnyx Solar",
    locale: "en_GB",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Somnyx Solar. Engineering a Cleaner Tomorrow." }],
  },
  twitter: { card: "summary_large_image", images: ["/og-image.png"] },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = { themeColor: "#F8F7F4", colorScheme: "light" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('js-motion')}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
