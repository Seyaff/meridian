"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import NavMain from "../sidebar/nav-main";
import NavUser from "../sidebar/nav-user";

export default function OverlayNav() {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={cn(
        "fixed left-0 top-0 z-[99] flex h-screen flex-col border-r border-border/40 bg-sidebar text-sidebar-foreground shadow-lg transition-[width] duration-300 ease-out",
        expanded ? "w-52" : "w-14",
      )}
      aria-label="Main navigation"
    >
      <div className="flex h-14 shrink-0 items-center justify-center border-b border-border/40">
        <h1 className="font-serif text-xl">M</h1>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <NavMain expanded={expanded} />
      </div>

      <div className="shrink-0 border-t border-border/40 p-2">
        <NavUser expanded={expanded} />
      </div>
    </aside>
  );
}
