"use client";
import dynamic from "next/dynamic";

const Loading = () => (
  <div className="flex h-full w-full items-center justify-center">
    <span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-cyan" aria-label="Loading 3D view" />
  </div>
);

export const LazyProductViewer = dynamic(() => import("./ProductViewer"), { ssr: false, loading: Loading });
export const LazyExplorer = dynamic(() => import("./Explorer"), { ssr: false, loading: () => <div className="h-[680px] rounded-[28px] border border-line bg-graphite"><Loading /></div> });
