"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LoginForm } from "@/components/login-form";
import { GalleryVerticalEndIcon } from "lucide-react";
import { gsap } from "gsap";

const iconSources = [
  "/clickup.svg",
  "/cursor_light.svg",
  "/deepseek.svg",
  "/gemini.svg",
  "/github_light.svg",
  "/google-meet.svg",
  "/grafana.svg",
  "/lovable.svg",
  "/n8n.svg",
  "/notion.svg",
  "/slack.svg",
];

interface ScatteredIcon {
  src: string;
  top: string;
  left: string;
  scale: number;
  opacity: number;
}

export default function LoginPage() {
  const [scatteredIcons, setScatteredIcons] = useState<ScatteredIcon[]>([]);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, lastX: 0, lastY: 0 });

  useEffect(() => {
    const generated = iconSources.map((src) => ({
      src,
      top: Math.floor(Math.random() * 65 + 15) + "%",   
      left: Math.floor(Math.random() * 70 + 15) + "%",
      scale: Math.random() * 0.4 + 0.75,                 
      opacity: Math.random() * 0.3 + 0.45,               
    }));
    setScatteredIcons(generated);
  }, []);

  useEffect(() => {
    if (scatteredIcons.length === 0 || !rightPanelRef.current) return;

    const tokens = rightPanelRef.current.querySelectorAll(".panel-token");
    const panel = rightPanelRef.current;

    tokens.forEach((token) => {
      gsap.to(token, {
        x: `random(-15, 15)`,
        y: `random(-15, 15)`,
        rotation: `random(-10, 10)`,
        duration: `random(4, 6)`,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });

    const handleMouseMove = (e: MouseEvent) => {
      const m = mouseRef.current;
      const rect = panel.getBoundingClientRect();
      
      m.x = e.clientX - rect.left;
      m.y = e.clientY - rect.top;

      m.vx = m.x - m.lastX;
      m.vy = m.y - m.lastY;

      m.lastX = m.x;
      m.lastY = m.y;

      tokens.forEach((token) => {
        const tRect = token.getBoundingClientRect();
        const pRect = panel.getBoundingClientRect();
        
        const tx = (tRect.left + tRect.width / 2) - pRect.left;
        const ty = (tRect.top + tRect.height / 2) - pRect.top;

        const dx = m.x - tx;
        const dy = m.y - ty;
        const distance = Math.hypot(dx, dy);

        const activeRadius = 200; 

        if (distance < activeRadius) {
          const proximity = (activeRadius - distance) / activeRadius;
          
          const targetX = dx * 0.35 * proximity;
          const targetY = dy * 0.35 * proximity;
          
          const speed = Math.hypot(m.vx, m.vy);
          const stretchFactor = Math.min(speed * 0.012, 0.35) * proximity;
          const angle = Math.atan2(m.vy, m.vx) * (180 / Math.PI);

          gsap.to(token, {
            x: targetX,
            y: targetY,
            scale: 1.25,
            opacity: 1,
            skewX: stretchFactor * 25, 
            rotation: angle * 0.15,      
            filter: "drop-shadow(0 20px 25px rgba(99,102,241,0.12))", 
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
          });
        } else {
          const baseScale = parseFloat((token as HTMLElement).dataset.scale || "1");
          const baseOpacity = parseFloat((token as HTMLElement).dataset.opacity || "0.5");

          gsap.to(token, {
            x: 0,
            y: 0,
            scale: baseScale,
            opacity: baseOpacity,
            skewX: 0,
            rotation: 0,
            filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.02))",
            duration: 0.5,
            ease: "power3.out",
            overwrite: "auto",
          });
        }
      });
    };

    const handleMouseLeave = () => {
      tokens.forEach((token) => {
        const baseScale = parseFloat((token as HTMLElement).dataset.scale || "1");
        const baseOpacity = parseFloat((token as HTMLElement).dataset.opacity || "0.5");

        gsap.to(token, {
          x: 0,
          y: 0,
          scale: baseScale,
          opacity: baseOpacity,
          skewX: 0,
          rotation: 0,
          duration: 0.8,
          ease: "elastic.out(1, 0.6)",
        });
      });
    };

    panel.addEventListener("mousemove", handleMouseMove);
    panel.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      panel.removeEventListener("mousemove", handleMouseMove);
      panel.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [scatteredIcons]);

  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-zinc-50">
      
      {/* LEFT CONTENT BLOCK: LOGIN FORM */}
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-white">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium text-zinc-900">
            <div className="flex size-6 items-center justify-center rounded-md bg-zinc-900 text-white">
              <GalleryVerticalEndIcon className="size-4" />
            </div>
            Acme Inc.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT BLOCK: CLEAN LIGHT SHOWCASE CANVAS (GRID REMOVED) */}
      <div 
        ref={rightPanelRef}
        className="relative hidden bg-zinc-100 lg:flex flex-col items-center justify-center overflow-hidden border-l border-zinc-200/80 select-none"
      >
        {/* Soft Ambient Light Theme Gradients */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-sky-400/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(244,244,245,0.8)_100%)] pointer-events-none" />

        {/* Core Typography */}
        <div className="text-center relative z-10 max-w-sm px-6 pointer-events-none">
          <h3 className="text-2xl font-bold tracking-tight text-zinc-800 mb-2">
            The Hub of Modern Integration
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed font-medium">
            Move your cursor across the panel interface boundaries to interact with our ecosystem networks directly.
          </p>
        </div>

        {/* Scattered Frosted-Glass Icon Capsules */}
        {scatteredIcons.map((item, index) => (
          <div
            key={index}
            className="panel-token absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto will-change-transform"
            style={{ 
              top: item.top, 
              left: item.left,
              opacity: item.opacity,
              transform: `scale(${item.scale})`
            }}
            data-scale={item.scale}
            data-opacity={item.opacity}
          >
            <div className="p-3 bg-white/70 border border-white/60 hover:border-indigo-500/30 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.03)] backdrop-blur-md transition-colors duration-300">
              <Image
                src={item.src}
                className="w-7 h-7 object-contain"
                width={28}
                height={28}
                alt="Ecosystem Integration Token"
                draggable={false}
              />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}