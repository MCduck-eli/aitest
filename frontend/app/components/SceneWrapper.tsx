"use client";

import dynamic from "next/dynamic";

const ParticlesCanvas = dynamic(() => import("./ParticlesCanvas"), {
    ssr: false,
});

export function SceneWrapper() {
    return <ParticlesCanvas />;
}
