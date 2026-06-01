"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getSingleConversation } from "@/lib/api/api";
import { routes } from "@/lib/routes";

/** Legacy ObjectId URLs → redirect to slug-based route */
export default function LegacyConversationRedirect() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  useEffect(() => {
    if (!id) return;
    getSingleConversation(id)
      .then((data) => {
        const slug = data?.conversation?.slug;
        if (slug) router.replace(routes.chatThread(slug));
        else router.replace(routes.chatInbox);
      })
      .catch(() => router.replace(routes.chatInbox));
  }, [id, router]);

  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
