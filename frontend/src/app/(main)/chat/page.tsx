"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";

export default function ChatHomePage() {
  const { user } = useAuth();

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <p className="font-serif text-2xl font-semibold sm:text-3xl">
        {user?.name ? `Hi, ${user.name.split(" ")[0]}` : "Welcome"}
      </p>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Jump into your inbox or discover people to chat with.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/chat/inbox"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Messages
        </Link>
        <Link
          href="/search"
          className="rounded-full border px-5 py-2.5 text-sm font-medium"
        >
          Search
        </Link>
      </div>
    </div>
  );
}
