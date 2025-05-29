"use client";

import { useEffect, useState } from "react";

export function FuturisticGraphic() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main gradient orb */}
      <div
        className="absolute w-96 h-96 rounded-full opacity-30 blur-3xl transition-all duration-1000 ease-out"
        style={{
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(147, 51, 234, 0.6) 50%, rgba(236, 72, 153, 0.4) 100%)",
          transform: `translate(${50 + mousePosition.x * 10}%, ${
            30 + mousePosition.y * 10
          }%)`,
        }}
      />

      {/* Secondary orb */}
      <div
        className="absolute w-64 h-64 rounded-full opacity-20 blur-2xl transition-all duration-700 ease-out"
        style={{
          background:
            "radial-gradient(circle, rgba(34, 197, 94, 0.6) 0%, rgba(59, 130, 246, 0.4) 100%)",
          transform: `translate(${70 - mousePosition.x * 15}%, ${
            60 - mousePosition.y * 15
          }%)`,
        }}
      />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white rounded-full opacity-40 animate-pulse"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
            animationDelay: `${i * 0.5}s`,
            transform: `translate(${
              Math.sin(mousePosition.x * Math.PI) * 20
            }px, ${Math.cos(mousePosition.y * Math.PI) * 20}px)`,
          }}
        />
      ))}

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Subtle wave animation */}
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-10">
        <svg
          className="w-full h-full"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z"
            fill="url(#wave-gradient)"
            className="animate-pulse"
          />
          <defs>
            <linearGradient
              id="wave-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop
                offset="0%"
                style={{ stopColor: "rgba(59, 130, 246, 0.3)", stopOpacity: 1 }}
              />
              <stop
                offset="50%"
                style={{ stopColor: "rgba(147, 51, 234, 0.3)", stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "rgba(236, 72, 153, 0.3)", stopOpacity: 1 }}
              />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
