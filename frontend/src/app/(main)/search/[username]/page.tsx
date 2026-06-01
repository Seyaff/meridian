"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Loader2, MessageSquare } from "lucide-react";

import useUserByUsername from "@/hooks/auth/useGetUserByUsername";
import useCreateConversation from "@/hooks/chat/useCreateConversation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatPresenceLabel } from "@/lib/presence.util";
import { usePresence } from "@/hooks/chat/usePresence";

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = params?.username as string;

  const { data: user, isPending, isError } = useUserByUsername(username);
  const { mutate: startConversation, isPending: isCreating } =
    useCreateConversation();

  const { getPresence } = usePresence(user?.id ? [user.id] : []);
  const presence = user?.id ? getPresence(user.id) : undefined;

  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-lg font-medium">User not found</p>
        <Link href="/search" className="text-sm text-primary underline">
          Back to search
        </Link>
      </div>
    );
  }

  const handleMessage = () => {
    startConversation(user.id, {
      onSuccess: (conversation) => {
        router.push(`/chat/inbox/${conversation.id}`);
      },
    });
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 border">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="text-lg">
              {user.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <h1 className="mt-4 text-2xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">@{user.username}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatPresenceLabel(presence, user.name)}
          </p>

          {user.bio && (
            <p className="mt-4 text-sm leading-relaxed text-foreground/90">
              {user.bio}
            </p>
          )}

          <Button
            className="mt-6 w-full gap-2 sm:w-auto"
            onClick={handleMessage}
            disabled={isCreating}
          >
            <MessageSquare className="h-4 w-4" />
            {isCreating ? "Opening chat…" : "Message"}
          </Button>
        </div>
      </div>
    </div>
  );
}
