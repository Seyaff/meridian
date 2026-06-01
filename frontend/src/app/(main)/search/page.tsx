"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MessageSquare, Search, X } from "lucide-react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useSearchUsers from "@/hooks/search/useSearchUsers";
import useCreateConversation from "@/hooks/chat/useCreateConversation";
import { useRouter } from "next/navigation";

interface SearchUser {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebouncedValue(searchQuery, 300);
  const router = useRouter();
  const { mutate: startConversation, isPending: creatingId } =
    useCreateConversation();

  const { data: users = [], isPending, isError } = useSearchUsers(debouncedQuery);

  const filteredUsers = useMemo(() => users as SearchUser[], [users]);

  const handleMessage = (userId: string) => {
    startConversation(userId, {
      onSuccess: (conversation) => {
        router.push(`/chat/inbox/${conversation.id}`);
      },
    });
  };

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-destructive">Failed to load users</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="sticky top-0 z-10 border-b border-border/40 bg-background/90 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="mb-3 text-xl font-bold sm:text-2xl">Search</h1>
          <div className="relative flex items-center rounded-full border bg-background px-4 py-2.5 shadow-sm focus-within:ring-1 focus-within:ring-primary/30">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or username…"
              className="flex-1 bg-transparent px-3 text-sm outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto w-full max-w-2xl">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {debouncedQuery.trim() ? "Results" : "Suggested"}
          </h2>

          {isPending ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : filteredUsers.length > 0 ? (
            <ul className="space-y-2">
              {filteredUsers.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-3 shadow-sm"
                >
                  <Link
                    href={`/search/${user.username}`}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <Avatar className="h-11 w-11 shrink-0">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>
                        {user.name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        @{user.username}
                      </p>
                      {user.bio && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </Link>

                  <button
                    type="button"
                    disabled={creatingId}
                    onClick={() => handleMessage(user.id)}
                    className="shrink-0 rounded-full border p-2.5 text-muted-foreground hover:bg-muted"
                    aria-label={`Message ${user.name}`}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No users found. Try another name or username.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
