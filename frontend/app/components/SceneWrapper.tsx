"use client";

import { useEffect, useState } from "react";
import { ParticlesBackground } from "./ParticlesBackground";

export function SceneWrapper() {
    const [Component, setComponent] = useState<React.ComponentType | null>(
        null,
    );

    useEffect(() => {
        const { Canvas } = require("@react-three/fiber");

        function CanvasWrapper() {
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

        setComponent(() => CanvasWrapper);
    }, []);

    if (!Component) return null;

    return <Component />;
}
