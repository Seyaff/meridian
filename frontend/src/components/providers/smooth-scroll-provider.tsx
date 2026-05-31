"use client";

import { ReactLenis } from "lenis/react";
import React, { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Props {
  children: React.ReactNode;
}


export default function LenisProvider({ children }: Props) {
  useEffect(() => {
    ScrollTrigger.refresh();
  }, []);

  return (
    <ReactLenis
      root
      options={{
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        autoRaf: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
