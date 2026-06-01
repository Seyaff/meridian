"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { SignupForm } from "@/components/signup-form";
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

interface ArrangedIcon {
  src: string;
  baseX: number; // Storing concrete percentage-based anchors
  baseY: number;
  scale: number;
}

export default function SignupPage() {
  const [icons, setIcons] = useState<ArrangedIcon[]>([]);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  // 1. Arrange tokens in a loose, floating geometric pattern on mount
  useEffect(() => {
    const total = iconSources.length;
    const generated = iconSources.map((src, i) => {
      // Form a loose spiral/circular network instead of pure random dispersion
      const angle = (i / total) * Math.PI * 2;
      const radius = 22 + Math.random() * 12; // Radius amplitude bounds
      
      const baseX = 50 + Math.cos(angle) * radius;
      const baseY = 50 + Math.sin(angle) * radius;

      return {
        src,
        baseX,
        baseY,
        scale: Math.random() * 0.2 + 0.85,
      };
    });
    setIcons(generated);
  }, []);

  // 2. Liquid Push & Morph Easing Physics Engine
  useEffect(() => {
    if (icons.length === 0 || !rightPanelRef.current) return;

    const tokens = rightPanelRef.current.querySelectorAll(".signup-token");
    const panel = rightPanelRef.current;

    // A. Ambient "Breathing" Easing Cluster Loop
    tokens.forEach((token, index) => {
      gsap.to(token, {
        scaleX: "*=1.06",
        scaleY: "*=0.94",
        rotation: "+=8",
        duration: 3 + (index % 3),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: index * 0.2,
      });
    });

    // B. The Evasion Repel Logic
    const handleMouseMove = (e: MouseEvent) => {
      const rect = panel.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      tokens.forEach((token) => {
        const tRect = token.getBoundingClientRect();
        const pRect = panel.getBoundingClientRect();
        
        // Target calculations
        const tx = (tRect.left + tRect.width / 2) - pRect.left;
        const ty = (tRect.top + tRect.height / 2) - pRect.top;

        const dx = tx - mx;
        const dy = ty - my;
        const distance = Math.hypot(dx, dy);
        
        const forceRadius = 250; // Dynamic push tracking zone

        if (distance < forceRadius) {
          // Normalize force scale factor (Stronger closer to the center mouse coordinate)
          const force = (forceRadius - distance) / forceRadius;
          
          // Evasion vectors (pushing away from mouse)
          const pushX = (dx / distance) * 75 * force;
          const pushY = (dy / distance) * 75 * force;
          
          // Liquid morphing scale properties
          const morphScaleX = 1 - force * 0.25; 
          const morphScaleY = 1 + force * 0.15;
          const escapeAngle = Math.atan2(pushY, pushX) * (180 / Math.PI) - 90;

          gsap.to(token, {
            x: pushX,
            y: pushY,
            scaleX: morphScaleX,
            scaleY: morphScaleY,
            rotation: escapeAngle * 0.4,
            opacity: 1,
            boxShadow: "0 15px 30px rgba(139,92,246,0.08)",
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto"
          });
        } else {
          // Return to home state smoothly
          gsap.to(token, {
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            opacity: 0.7,
            boxShadow: "0 4px 10px rgba(0,0,0,0.02)",
            duration: 0.6,
            ease: "power3.out",
            overwrite: "auto"
          });
        }
      });
    };

    // Return to default anchor layout with custom morph bounce
    const handleMouseLeave = () => {
      tokens.forEach((token) => {
        gsap.to(token, {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          opacity: 0.6,
          duration: 1,
          ease: "elastic.out(1.2, 0.4)",
        });
      });
    };

    panel.addEventListener("mousemove", handleMouseMove);
    panel.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      panel.removeEventListener("mousemove", handleMouseMove);
      panel.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [icons]);

  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-zinc-50">
      
      {/* LEFT PANEL: INPUT SIGNUP FORM */}
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
            <SignupForm />
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: REPELLENT METABALL LIQUID EFFECTS CANVAS */}
      <div 
        ref={rightPanelRef}
        className="relative hidden bg-zinc-50 lg:flex flex-col items-center justify-center overflow-hidden border-l border-zinc-200/80 select-none"
      >
        {/* Soft Pastel Aura Glow Bleeds */}
        <div className="absolute top-[20%] left-[10%] w-[450px] h-[450px] bg-purple-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[15%] right-[5%] w-[450px] h-[450px] bg-rose-400/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(244,244,245,0.7)_100%)] pointer-events-none" />

        {/* Minimal Floating Core Identity Description */}
        <div className="text-center relative z-10 max-w-xs px-4 pointer-events-none">
          <h3 className="text-2xl font-bold tracking-tight text-zinc-800 mb-2">
            Build Without Boundaries
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed font-medium">
            Join the developer ecosystem network. Wave your pointer across the vector space to clear a path.
          </p>
        </div>

        {/* Dynamic Structural Evasion Asset Layout Nodes */}
        {icons.map((item, index) => (
          <div
            key={index}
            className="signup-token absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto will-change-transform"
            style={{ 
              top: `${item.baseY}%`, 
              left: `${item.baseX}%`,
              opacity: 0.6,
            }}
          >
            {/* Morph squish container box */}
            <div className="p-3 bg-white/80 border border-white hover:border-purple-400/30 rounded-[2rem] hover:rounded-xl shadow-[0_6px_15px_rgba(0,0,0,0.02)] backdrop-blur-md transition-all duration-500 ease-out">
              <Image
                src={item.src}
                className="w-7 h-7 object-contain selection:bg-transparent"
                width={28}
                height={28}
                alt="Ecosystem Integrations Module"
                draggable={false}
              />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}