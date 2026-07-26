"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function ParticlesBackground() {
    const points = useRef<THREE.Points>(null);
    const groupRef = useRef<THREE.Group>(null);

    const particleCount = 2500;

    // Zarralar tarqalish maydonini kattalashtiramiz (30 o'rniga 60-80)
    // Shunda sahifa qancha uzun bo'lsa ham zarralar butun koinotni qoplab turadi
    const positions = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 70; // x
            pos[i * 3 + 1] = (Math.random() - 0.5) * 70; // y
            pos[i * 3 + 2] = (Math.random() - 0.5) * 50; // z
        }
        return pos;
    }, [particleCount]);

    useFrame((state, delta) => {
        // Zarralarning o'z o'qida sekin va doimiy aylanishi
        if (points.current) {
            points.current.rotation.y -= delta * 0.05;
            points.current.rotation.x -= delta * 0.02;
        }

        // Kursor bo'yicha harakat
        if (groupRef.current) {
            const targetX = (state.pointer.x * Math.PI) / 4;
            const targetY = (state.pointer.y * Math.PI) / 4;

            groupRef.current.rotation.y = THREE.MathUtils.lerp(
                groupRef.current.rotation.y,
                targetX,
                0.02,
            );
            groupRef.current.rotation.x = THREE.MathUtils.lerp(
                groupRef.current.rotation.x,
                -targetY,
                0.02,
            );

            const distance = Math.sqrt(
                state.pointer.x ** 2 + state.pointer.y ** 2,
            );
            const targetScale = 1 + distance * 0.15;
            groupRef.current.scale.setScalar(
                THREE.MathUtils.lerp(
                    groupRef.current.scale.x,
                    targetScale,
                    0.03,
                ),
            );
        }
    });

    return (
        <group ref={groupRef}>
            <points ref={points}>
                <bufferGeometry>
                    {/* @ts-ignore */}
                    <bufferAttribute
                        attach="attributes-position"
                        count={positions.length / 3}
                        array={positions}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.08}
                    color="#c084fc"
                    transparent
                    opacity={0.8}
                    sizeAttenuation={true}
                    blending={THREE.AdditiveBlending}
                />
            </points>
        </group>
    );
}
