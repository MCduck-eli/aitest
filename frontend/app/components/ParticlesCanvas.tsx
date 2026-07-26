"use client";

import { Canvas } from "@react-three/fiber";
import { ParticlesBackground } from "./ParticlesBackground";

export default function ParticlesCanvas() {
    return (
        <div className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-0">
            <Canvas
                camera={{ position: [0, 0, 10], fov: 60 }}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                }}
            >
                <ParticlesBackground />
            </Canvas>
        </div>
    );
}
