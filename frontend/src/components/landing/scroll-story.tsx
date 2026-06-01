"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/ui/navbar";
import { routes } from "@/lib/routes";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const chapters = [
  {
    id: "dawn",
    kicker: "Chapter I",
    title: "Every story begins in silence.",
    body: "Before the notification, before the noise — there is a single line waiting to be written.",
  },
  {
    id: "signal",
    kicker: "Chapter II",
    title: "A signal crosses the void.",
    body: "Meridian carries your words with intention: present, warm, and unmistakably human.",
  },
  {
    id: "orbit",
    kicker: "Chapter III",
    title: "Conversations find their orbit.",
    body: "Threads align. Presence glows. Read receipts breathe — never shouting, always clear.",
  },
  {
    id: "constellation",
    kicker: "Chapter IV",
    title: "People become constellations.",
    body: "Search, discover, nickname, remember — relationships mapped the way your mind already does.",
  },
  {
    id: "horizon",
    kicker: "Chapter V",
    title: "The horizon keeps expanding.",
    body: "Stories, spaces, and features yet unwritten. Meridian grows with every chapter you add.",
  },
];

function SceneOrb({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
      aria-hidden
    />
  );
}

export default function ScrollStoryLanding() {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: rootRef, offset: ["start start", "end end"] });
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0.35]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".story-panel").forEach((panel) => {
        const inner = panel.querySelector(".story-inner");
        const orb = panel.querySelector(".story-orb");

        gsap.fromTo(
          inner,
          { y: 80, opacity: 0, rotateX: 14 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: panel,
              start: "top 78%",
              end: "top 30%",
              scrub: 0.6,
            },
          },
        );

        if (orb) {
          gsap.to(orb, {
            y: -40,
            rotateZ: 12,
            scrollTrigger: {
              trigger: panel,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      });

      gsap.to(".meridian-core", {
        rotateY: 360,
        rotateX: 18,
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative bg-[#07080c] text-zinc-100">
      <Navbar />

      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pt-24"
      >
        <SceneOrb className="left-1/4 top-1/4 h-72 w-72 bg-amber-500/20" />
        <SceneOrb className="right-1/4 bottom-1/3 h-96 w-96 bg-violet-600/15" />

        <div
          className="meridian-core relative z-10 flex h-44 w-44 items-center justify-center rounded-[2rem] border border-white/10 bg-linear-to-br from-zinc-900/90 to-zinc-950 shadow-[0_40px_120px_rgba(0,0,0,0.55)]"
          style={{ transformStyle: "preserve-3d", perspective: 900 }}
        >
          <span className="font-serif text-6xl text-amber-200/90">M</span>
          <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/5" />
        </div>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-10 max-w-xl text-center font-serif text-4xl leading-tight text-zinc-50 sm:text-5xl"
        >
          Meridian is a story told one scroll at a time.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-4 max-w-md text-center text-sm text-zinc-400"
        >
          Scroll to move through chapters — from silence to constellation.
        </motion.p>
      </motion.section>

      {chapters.map((chapter, index) => (
        <section
          key={chapter.id}
          className="story-panel relative flex min-h-[100svh] items-center justify-center px-6 py-24"
          style={{ perspective: 1200 }}
        >
          <div
            className={`story-orb absolute h-64 w-64 rounded-full blur-3xl ${
              index % 2 === 0 ? "left-8 bg-amber-500/10" : "right-8 bg-sky-500/10"
            }`}
          />
          <div
            className="story-inner relative z-10 max-w-2xl rounded-3xl border border-white/10 bg-white/3 p-10 backdrop-blur-md"
            style={{ transformStyle: "preserve-3d" }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">
              {chapter.kicker}
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-snug text-zinc-50 sm:text-4xl">
              {chapter.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-400">{chapter.body}</p>
          </div>
        </section>
      ))}

      <section
        ref={heroRef}
        className="relative flex min-h-[70svh] flex-col items-center justify-center px-6 pb-24 text-center"
      >
        <p className="font-serif text-3xl text-zinc-100 sm:text-4xl">Begin your chapter.</p>
        <p className="mt-3 max-w-md text-sm text-zinc-500">
          Thoughtful chat, clean threads, and room for what comes next.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={routes.signup}
            className="rounded-full bg-amber-200/90 px-6 py-2.5 text-sm text-zinc-900 transition hover:bg-amber-100"
          >
            Create account
          </Link>
          <Link
            href={routes.login}
            className="rounded-full border border-white/15 px-6 py-2.5 text-sm text-zinc-200 transition hover:bg-white/5"
          >
            Sign in
          </Link>
        </div>
      </section>
    </div>
  );
}
