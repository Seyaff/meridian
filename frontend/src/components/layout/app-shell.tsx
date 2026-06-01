"use client";

import OverlayNav from "@/components/chat/overlay-nav";
import { SocketProvider } from "@/components/providers/socket-provider";
import { useInboxRealtime } from "@/hooks/chat/useInboxRealtime";
import { useParams } from "next/navigation";

function InboxRealtimeBridge() {
  const params = useParams();
  const activeId = (params?.id as string) || undefined;
  useInboxRealtime(activeId);
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
