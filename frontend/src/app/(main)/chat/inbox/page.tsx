"use client";

import Link from "next/link";

export default function InboxIndexPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-muted/20 px-6 text-center">
      <p className="font-serif text-xl text-foreground sm:text-2xl">
        Select a conversation
      </p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Choose a chat from the list or{" "}
        <Link href="/search" className="text-primary underline-offset-4 hover:underline">
          find someone new
        </Link>
        .
      </p>
    </div>
  );
}
