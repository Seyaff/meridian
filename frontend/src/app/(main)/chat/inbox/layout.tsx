"use client";

import InboxSidebar from "@/components/sidebar/inbox-sidebar";
import { useParams } from "next/navigation";

export default function InboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const activeId = params?.id as string | undefined;

  return (
    <div className="flex h-screen min-h-0 w-full">
      <InboxSidebar className={activeId ? "hidden md:flex" : "flex"} />
      <main
        className={`min-w-0 flex-1 flex-col bg-background ${
          activeId ? "flex" : "hidden md:flex"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
