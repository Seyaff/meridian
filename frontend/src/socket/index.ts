import { io, Socket } from "socket.io-client";


const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "https://meridian-07bh.onrender.com";
console.log(SOCKET_URL)

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
      
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  socket?.disconnect();
}
