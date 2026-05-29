"use client";

import { createContext, useContext, useEffect } from "react";
import type { Socket } from "socket.io-client";
import { useAuth } from "./auth-provider";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    } else {
      disconnectSocket();
    }
    return () => disconnectSocket();
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={getSocket()}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
