"use client";

import { useEffect, useState, useMemo } from "react";

export function CssParticles() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const particles = useMemo(() => {
        return Array.from({ length: 150 }, (_, i) => ({
            id: i,
            size: Math.random() * 3 + 2,
            x: Math.random() * 100,
            y: Math.random() * 100,
            duration: Math.random() * 14 + 10,
            delay: Math.random() * 5,
            floatType: i % 3,
        }));
    }, []);

    if (!isMounted) return null;

    return (
        <div
            className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-0 overflow-hidden"
            style={{
                background:
                    "radial-gradient(ellipse at center, #1e1b4b 0%, #020617 100%)",
            }}
        >
            <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-purple-600/30 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-cyan-500/30 rounded-full blur-[120px] animate-pulse style-delay" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-pink-500/20 rounded-full blur-[140px]" />

            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute rounded-full bg-cyan-200"
                    style={{
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        boxShadow: `0 0 ${particle.size * 3}px #38bdf8, 
                                    0 0 ${particle.size * 6}px #a855f7, 
                                    0 0 ${particle.size * 10}px #ec4899`,
                        animation: `float-slow-${particle.floatType} ${particle.duration}s ease-in-out infinite alternate`,
                        animationDelay: `${particle.delay}s`,
                    }}
                />
            ))}

            <style>{`
                .style-delay {
                    animation-delay: 1s;
                }
                @keyframes float-slow-0 {
                    0% {
                        transform: translate(0px, 0px) scale(0.8);
                        opacity: 0.3;
                    }
                    50% {
                        opacity: 0.9;
                    }
                    100% {
                        transform: translate(20px, -25px) scale(1.2);
                        opacity: 0.4;
                    }
                }
                @keyframes float-slow-1 {
                    0% {
                        transform: translate(0px, 0px) scale(0.9);
                        opacity: 0.4;
                    }
                    50% {
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-18px, 20px) scale(1.1);
                        opacity: 0.3;
                    }
                }
                @keyframes float-slow-2 {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                        opacity: 0.3;
                    }
                    50% {
                        opacity: 0.85;
                    }
                    100% {
                        transform: translate(-20px, -15px) scale(1.3);
                        opacity: 0.5;
                    }
                }
            `}</style>
        </div>
    );
}
