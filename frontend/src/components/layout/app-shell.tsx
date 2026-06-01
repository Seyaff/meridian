"use client";

import OverlayNav from "@/components/chat/overlay-nav";
import { SocketProvider } from "@/components/providers/socket-provider";
import { useInboxRealtime } from "@/hooks/chat/useInboxRealtime";
import { useParams, usePathname } from "next/navigation";

function InboxRealtimeBridge() {
  const params = useParams();
  const pathname = usePathname();
  const slugFromPath = pathname.match(/^\/chat\/([a-z0-9]{6,24})$/i)?.[1];
  const activeSlug = (params?.slug as string) || slugFromPath;
  useInboxRealtime(activeSlug);
  return null;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OverlayNav />
      <div className="flex min-h-screen w-full pl-14">
        <SocketProvider>
          <InboxRealtimeBridge />
          <div className="flex min-h-screen min-w-0 flex-1 flex-col">{children}</div>
        </SocketProvider>
      </div>
    </>
  );
}
