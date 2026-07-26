"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function Particles() {
    const ref = useRef<THREE.Points>(null);
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    const particlesCount = 4000;

    const [positions, initialPositions] = useMemo(() => {
        const pos = new Float32Array(particlesCount * 3);
        const initialPos = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i += 3) {
            const x = (Math.random() - 0.5) * 900;
            const y = (Math.random() - 0.5) * 900;
            const z = (Math.random() - 0.5) * 900;

            pos[i] = x;
            pos[i + 1] = y;
            pos[i + 2] = z;

            initialPos[i] = x;
            initialPos[i + 1] = y;
            initialPos[i + 2] = z;
        }

        return [pos, initialPos];
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMouse({
                x: (e.clientX / window.innerWidth - 0.5) * 600,
                y: -(e.clientY / window.innerHeight - 0.5) * 600,
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useFrame(() => {
        if (!ref.current) return;

        ref.current.rotation.x += 0.00003;
        ref.current.rotation.y += 0.00005;

        const positionAttribute = ref.current.geometry.attributes.position;
        const array = positionAttribute.array as Float32Array;

        for (let i = 0; i < particlesCount; i++) {
            const i3 = i * 3;

            const targetX = initialPositions[i3] + mouse.x * 0.25;
            const targetY = initialPositions[i3 + 1] + mouse.y * 0.25;

            array[i3] += (targetX - array[i3]) * 0.03;
            array[i3 + 1] += (targetY - array[i3 + 1]) * 0.03;
        }

        positionAttribute.needsUpdate = true;
    });

    return (
        <Points
            ref={ref}
            positions={positions}
            stride={3}
            frustumCulled={false}
        >
            <PointMaterial
                transparent
                color="#c4b5fd"
                size={1.2}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.5}
            />
        </Points>
    );
}

export default function InteractiveParticles() {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas
                camera={{
                    position: [0, 0, 300],
                    fov: 75,
                    near: 0.1,
                    far: 5000,
                }}
                style={{ background: "transparent" }}
            >
                <Particles />
            </Canvas>
        </div>
    );
}
