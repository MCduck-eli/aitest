"use client";

import { useEffect, useState } from "react";

export function CssParticles() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isMounted]);

  if (!isMounted) return null;

  const particles = Array.from({ length: 150 }, (_, i) => ({
    id: i,
    size: Math.random() * 2 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 30 + 20,
    delay: Math.random() * 10,
  }));

  return (
    <div
      className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-0 overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at center, #1e1b4b 0%, #020617 100%)",
      }}
    >
      {/* Glow effects */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] animate-pulse"
        style={{
          transform: `translate(${mousePosition.x * 50}px, ${mousePosition.y * 50}px)`,
          transition: "transform 0.3s ease-out",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px] animate-pulse"
        style={{
          animationDelay: "1s",
          transform: `translate(${mousePosition.x * -30}px, ${mousePosition.y * -30}px)`,
          transition: "transform 0.3s ease-out",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[150px]"
        style={{
          transform: `translate(calc(-50% + ${mousePosition.x * 20}px), calc(-50% + ${mousePosition.y * 20}px))`,
          transition: "transform 0.3s ease-out",
        }}
      />

      {/* Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-purple-400/50 shadow-[0_0_8px_rgba(168,85,247,0.6)]"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: 0.7,
            transform: `translate(${mousePosition.x * 15}px, ${mousePosition.y * 15}px)`,
            transition: "transform 0.3s ease-out, opacity 0.3s ease-in-out",
            animation: `float ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translate(0, -10px) scale(1.2);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
}
