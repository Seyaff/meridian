"use client";

import { useParams } from "next/navigation";
import ChatThread from "@/components/chat/chat-thread";

const RESERVED = new Set(["inbox"]);

export default function ChatThreadPage() {
  const params = useParams();
  const slug = params?.slug as string;
 

  if (!slug || RESERVED.has(slug)) {
    return null;
  }

  return <ChatThread slug={slug} />;
}
