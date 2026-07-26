"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ParticlesCanvas = dynamic(() => import("./ParticlesCanvas"), {
    ssr: false,
});

export function SceneWrapper() {
    const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <ParticlesCanvas />;
}
