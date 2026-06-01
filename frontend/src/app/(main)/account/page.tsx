"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUpdateProfile } from "@/hooks/auth/useUpdateProfile";

export default function AccountPage() {
  const { user, isLoading } = useAuth();
  const { mutate: saveProfile, isPending } = useUpdateProfile();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setBio(user.bio || "");
    setAvatarUrl(user.avatarUrl || "");
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Link href="/login" className="text-primary underline">
          Sign in
        </Link>{" "}
        to manage your profile.
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile(
      { name: name.trim(), bio: bio.trim(), avatarUrl: avatarUrl.trim() },
      {
        onSuccess: () => toast.success("Profile updated"),
        onError: () => toast.error("Could not update profile"),
      },
    );
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-lg">
        <h1 className="font-serif text-2xl">Your profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">@{user.username}</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarUrl || undefined} alt={name} />
              <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">
                Avatar URL
              </label>
              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://…"
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={500}
              className="mt-1 w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}
