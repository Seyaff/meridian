"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { useAuth } from "./auth-provider";
import { connectSocket, disconnectSocket, getSocket } from "@/socket";

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [socket] = useState<Socket>(() => getSocket());

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => disconnectSocket();
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}


export function useSocket() {
  
  const s =  useContext(SocketContext);
  if(!s) {
    throw new Error("use socket must be used within a provider bro")
  }

  return s
}
