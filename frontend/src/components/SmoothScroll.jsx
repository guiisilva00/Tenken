"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      anchors: { offset: 80 },
      respectReducedMotion: true,
    });

    return () => lenis.destroy();
  }, []);

  return children;
}
