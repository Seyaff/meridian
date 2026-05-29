"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { MessageSquare, Search, UserPlus, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import useSuggestedUsers from "@/hooks/search/useSuggestedUsers";

interface IUser {
  _id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  isOnline?: boolean;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users = [], isPending, isError } = useSuggestedUsers();

  console.log(users);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();

    return users.filter((user: IUser) => {
      return (
        user.name?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query)
      );
    });
  }, [users, searchQuery]);

  if (isError) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-sm font-medium text-red-500">
            Failed to load users
          </p>

          <p className="text-xs text-zinc-400 mt-1">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-slate-50/50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/40 bg-background/80 px-6 py-5 backdrop-blur-md">
        <div className="max-w-2xl mx-auto w-full">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mb-4">
            Search
          </h1>

          {/* Search Box */}
          <div className="relative flex items-center rounded-full border border-zinc-200 bg-white px-4 py-2.5 shadow-sm transition-all duration-200 focus-within:border-zinc-400/80 focus-within:shadow-md">
            <Search className="h-5 w-5 text-zinc-400 shrink-0" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or username..."
              className="flex-1 bg-transparent px-3 text-sm text-zinc-800 placeholder-zinc-400 outline-none"
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="p-1 rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto w-full">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">
            {searchQuery ? "Search Results" : "Suggested Accounts"}
          </h2>

          {/* Loading */}
          {isPending ? (
            <div className="space-y-3">
              {Array.from({
                length: 6,
              }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl bg-zinc-100 animate-pulse"
                />
              ))}
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="space-y-2">
              {filteredUsers.map((user: IUser) => (
                <Link href={`/search/${user?.username}`}>
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white border border-zinc-100 shadow-sm hover:border-zinc-200 hover:shadow transition-all duration-200 group"
                  >
                    {/* Left */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 border border-border/50">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />

                        <AvatarFallback className="bg-zinc-100 text-zinc-600 text-xs font-semibold">
                          {user.name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col">
                        <h3 className="text-sm font-semibold text-zinc-800">
                          {user.name}
                        </h3>

                        <p className="text-xs text-zinc-400">
                          @{user.username}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link href={`/chat/inbox/${user._id}`}>
                        <button
                          aria-label={`Message ${user.name}`}
                          className="p-2.5 rounded-full border border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition active:scale-95"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      </Link>

                      <button
                        aria-label={`Add ${user.name}`}
                        className="p-2.5 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 transition active:scale-95 shadow-sm"
                      >
                        <UserPlus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="p-4 bg-zinc-100 rounded-full mb-3">
                <Search className="h-6 w-6 text-zinc-400" />
              </div>

              <p className="text-sm font-medium text-zinc-500">
                No users found
              </p>

              <p className="text-xs text-zinc-400 mt-1">
                Try another username or name
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
