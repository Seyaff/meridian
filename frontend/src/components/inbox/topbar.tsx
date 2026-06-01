"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Info, Phone, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface Props {
  avatarUrl?: string;
  name: string;
  username?: string;
  status?: string | null;
  showBack?: boolean;
  profileHref?: string;
  actions?: ReactNode;
}

export default function InboxTopbar({
  avatarUrl,
  name,
  username,
  status,
  showBack,
  profileHref,
  actions,
}: Props) {
  const profileLink = profileHref || (username ? `/search/${username}` : undefined);

  return (
    <header className="shrink-0 border-b bg-background px-3 py-3 sm:px-5 sm:py-4">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {showBack && (
            <Link
              href="/chat/inbox"
              className="rounded-full p-2 text-muted-foreground hover:bg-muted md:hidden"
              aria-label="Back to inbox"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}

          {profileLink ? (
            <Link href={profileLink} className="flex min-w-0 items-center gap-3">
              <Avatar className="h-10 w-10 shrink-0 border sm:h-12 sm:w-12">
                <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
                <AvatarFallback>{name?.slice(0, 2).toUpperCase() || "CH"}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 leading-tight">
                <h1 className="truncate text-base sm:text-lg">{name}</h1>
                <p className="truncate text-xs text-muted-foreground">
                  {status || (username ? `@${username}` : "Offline")}
                </p>
              </div>
            </Link>
          ) : (
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="h-10 w-10 shrink-0 border sm:h-12 sm:w-12">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback>{name?.slice(0, 2).toUpperCase() || "CH"}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 leading-tight">
                <h1 className="truncate text-base sm:text-lg">{name}</h1>
                <p className="truncate text-xs text-muted-foreground">{status}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1 text-muted-foreground sm:gap-2">
          {actions}
          <button
            type="button"
            className="rounded-full p-2 hover:bg-muted hover:text-foreground"
            aria-label="Voice call"
          >
            <Phone className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="rounded-full p-2 hover:bg-muted hover:text-foreground"
            aria-label="Video call"
          >
            <Video className="h-5 w-5" />
          </button>
          {profileLink && (
            <Link
              href={profileLink}
              className="rounded-full p-2 hover:bg-muted hover:text-foreground"
              aria-label="Profile"
            >
              <Info className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
