"use client";

import { usePathname } from "next/navigation";
import InboxSidebar from "@/components/sidebar/inbox-sidebar";

function shouldShowInboxShell(pathname: string) {
  if (pathname === "/chat/inbox" || pathname.startsWith("/chat/inbox/")) {
    return true;
  }
  const match = pathname.match(/^\/chat\/([a-z0-9]{6,24})$/i);
  if (!match) return false;
  const segment = match[1]!.toLowerCase();
  return segment !== "inbox";
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showInbox = shouldShowInboxShell(pathname);
  const activeSlug = pathname.match(/^\/chat\/([a-z0-9]{6,24})$/i)?.[1];

  if (!showInbox) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen min-h-0 w-full">
      <InboxSidebar
        className={activeSlug ? "hidden md:flex" : "flex"}
        activeSlug={activeSlug}
      />
      <main
        className={`min-w-0 flex-1 flex-col bg-background ${
          activeSlug ? "flex" : "hidden md:flex"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
