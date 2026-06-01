"use client";

import Hero from "@/components/ui/hero";
import Navbar from "@/components/ui/navbar";
import { motion } from "motion/react";

export default function Home() {
  return (
    <motion.main className="w-full h-screen">
   
        <Navbar />
        <Hero />
      
    </motion.main>
  );
}
