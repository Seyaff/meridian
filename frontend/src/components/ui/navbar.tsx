"use client";

import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
} from "motion/react";
import { Button } from "./button";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 20) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  return (
    <div className="fixed top-4 left-0 right-0 z-50 px-4 flex flex-col items-center gap-2">
      <motion.nav
        initial={{ opacity: 0, y: -50 }}
        animate={{
          opacity: 1,
          y: 0,
          maxWidth: isScrolled ? "36rem" : "64rem",
        }}
        transition={{
          type: "spring",
          stiffness: 120,
          damping: 14,
          mass: 0.6,
        }}
        className="w-full bg-white/70 backdrop-blur-md border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full flex items-center justify-between p-2 pl-6 relative z-50"
      >
        <div className="flex items-center gap-8">
          <div>
            <h1
              className={`text-xl font-bold tracking-tight cursor-pointer hover:opacity-80 transition-all duration-300 ${menu ? "text-white" : "text-zinc-900"}`}
            >
              Meridian
            </h1>
          </div>
          <nav className="hidden md:flex">
            <ul className="flex items-center gap-6">
              {["Product", "Pricing"].map((navLink, index) => (
                <li key={index}>
                  <Link
                    href={`#${navLink.toLowerCase()}`}
                    className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors duration-200 py-1 block"
                  >
                    {navLink}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="items-center gap-2 hidden md:flex">
          <Button
            variant="ghost"
            className="bg-transparent text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 rounded-full text-sm font-medium px-4 h-9 transition-colors"
          >
            <Link href="/login">Login</Link>
          </Button>
          <Button className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-full text-sm font-medium px-5 h-9 shadow-sm transition-all active:scale-95">
             <Link href="/signup">Signup</Link>
          </Button>
        </div>

        <button
          onClick={() => setMenu(!menu)}
          className={`p-2 mr-2 rounded-full md:hidden transition-colors duration-300 relative z-50 ${menu ? "text-white hover:bg-zinc-800" : "text-zinc-800 hover:bg-zinc-100"}`}
          aria-label="Toggle Menu"
        >
          {menu ? <X size={20} /> : <Menu size={20} />}
        </button>
      </motion.nav>

      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-zinc-950 text-white md:hidden flex flex-col justify-between p-8 pt-32 z-40"
          >
            <nav className="flex flex-col gap-6 mt-8">
              <ul className="flex flex-col gap-6">
                {["Product", "Pricing"].map((navLink, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <a
                      href={`#${navLink.toLowerCase()}`}
                      onClick={() => setMenu(false)}
                      className="text-3xl font-semibold text-zinc-300 hover:text-white transition-colors block"
                    >
                      {navLink}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col gap-3 mb-8"
            >
              <Button
                variant="ghost"
                className="w-full justify-center text-zinc-300 hover:text-white hover:bg-zinc-900 border border-zinc-800 rounded-full h-12 text-base"
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button className="w-full justify-center bg-white text-black hover:bg-zinc-200 rounded-full h-12 text-base font-medium">
                <Link href="/signup">Signup</Link>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
