export function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return Boolean(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

/** Phones and small tablets get a lighter renderer: lower resolution, no MSAA. */
export function isSmallScreen() {
  return typeof window !== "undefined" && window.innerWidth < 768;
}

/** Shared renderer settings so every canvas stays light enough for mid-range phones. */
export function canvasPerf() {
  const small = isSmallScreen();
  return {
    dpr: (small ? [1, 1.25] : [1, 1.5]) as [number, number],
    gl: { antialias: !small, alpha: true, powerPreference: "high-performance" as const, stencil: false },
  };
}
