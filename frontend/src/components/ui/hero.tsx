"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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

// Type structure for our randomized client-side state
interface ScatteredIcon {
  src: string;
  top: string;
  left: string;
  scale: number;
  opacity: number;
}

export default function Hero() {
  const [scatteredIcons, setScatteredIcons] = useState<ScatteredIcon[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generated = iconSources.map((src) => {
     
      const randomTop = Math.floor(Math.random() * 70 + 15) + "%";
      const randomLeft = Math.floor(Math.random() * 80 + 10) + "%";
      
      const randomScale = Math.random() * 0.7 + 0.6;
      
      const randomOpacity = Math.random() * 0.5 + 0.2;

      return {
        src,
        top: randomTop,
        left: randomLeft,
        scale: randomScale,
        opacity: randomOpacity,
      };
    });

    setScatteredIcons(generated);
  }, []);


  useEffect(() => {
    if (scatteredIcons.length === 0 || !containerRef.current) return;

    const iconElements = containerRef.current.querySelectorAll(".scattered-icon");

    iconElements.forEach((el) => {
  
      gsap.to(el, {
        x: `random(-15, 15)`,
        y: `random(-15, 15)`,
        rotation: `random(-10, 10)`,
        duration: `random(3, 5)`,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

 
      const handleMouseMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
   
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;


        gsap.to(el, {
          x: dx * 0.3,
          y: dy * 0.3,
          scale: 1.4,
          opacity: 1, 
          filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.15))",
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      };

      const handleMouseLeave = () => {
        
        gsap.to(el, {
          x: 0,
          y: 0,
          scale: (el as HTMLElement).dataset.scale ? parseFloat((el as HTMLElement).dataset.scale!) : 1,
          opacity: (el as HTMLElement).dataset.opacity ? parseFloat((el as HTMLElement).dataset.opacity!) : 0.5,
          filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.02))",
          rotation: 0,
          duration: 0.5,
          ease: "power2.out",
          overwrite: "auto",
        });
      };

      el.addEventListener("mousemove", handleMouseMove as EventListener);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
    
      iconElements.forEach((el) => {
        el.removeEventListener("mousemove", onmousemove as EventListener);
        el.removeEventListener("mouseleave", onmouseleave as EventListener);
      });
    };
  }, [scatteredIcons]);

  return (
    <main 
      ref={containerRef} 
      className="w-full min-h-screen relative overflow-hidden bg-zinc-50 flex flex-col items-center justify-center select-none"
    >
      
      <div className="text-center relative z-10 max-w-xl pointer-events-auto"> 
        <span className="px-4 py-1 text-sm border border-zinc-200 text-zinc-600 bg-white/80 backdrop-blur shadow-sm rounded-full font-medium inline-block mb-4">
          In beta
        </span>
        <h2 className="text-5xl font-bold tracking-tight bg-linear-to-r from-amber-500 via-orange-600 to-yellow-500 bg-clip-text text-transparent mb-4">
          Engineered to Innovate
        </h2>
        <p className="text-zinc-500 text-lg">
          Connecting your workflow with tomorrow's leading digital ecosystems.
        </p>
      </div>

    
      {scatteredIcons.map((item, index) => (
        <div
          key={index}
          className="scattered-icon absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto will-change-transform transition-shadow"
          style={{ 
            top: item.top, 
            left: item.left,
            opacity: item.opacity,
            transform: `scale(${item.scale})`
          }}
          data-scale={item.scale}
          data-opacity={item.opacity}
        >
          <div className="p-3 bg-white border border-zinc-200/60 rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.02)] backdrop-blur-sm">
            <Image
              src={item.src}
              className="w-8 h-8 object-contain"
              width={32}
              height={32}
              alt="Ecosystem Icon"
              draggable={false}
            />
          </div>
        </div>
      ))}
    </main>
  );
}