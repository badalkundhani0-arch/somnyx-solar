/**
 * Responsive photo. Unsplash URLs get resized variants via their image CDN;
 * any other URL (for example an image uploaded in the admin) is used as-is.
 */
const WIDTHS = [640, 1080, 1600, 2200];

function variant(src: string, w: number, q = 72) {
  return `${src}?auto=format&fit=crop&w=${w}&q=${q}`;
}

export function Photo({
  src,
  alt,
  className = "",
  sizes = "100vw",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const unsplash = src.startsWith("https://images.unsplash.com/") && !src.includes("?");
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={unsplash ? variant(src, 1600) : src}
      srcSet={unsplash ? WIDTHS.map((w) => `${variant(src, w)} ${w}w`).join(", ") : undefined}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={`object-cover ${className}`}
    />
  );
}
