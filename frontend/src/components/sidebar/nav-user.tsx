"use client";

import { useAuth } from "../providers/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ChevronsUpDown, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useLogout } from "@/hooks/auth/useLogout";
import { cn } from "@/lib/utils";

export default function NavUser({ expanded }: { expanded: boolean }) {
  const { user } = useAuth();
  const { mutate: logout, isPending } = useLogout();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center rounded-lg p-2 text-left transition-colors hover:bg-sidebar-accent",
            expanded ? "gap-2" : "justify-center",
          )}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-medium text-sidebar-primary-foreground">
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div
            className={cn(
              "min-w-0 flex-1 overflow-hidden transition-all duration-300",
              expanded ? "opacity-100" : "w-0 opacity-0",
            )}
          >
            <p className="truncate text-sm font-semibold">{user.name || "User"}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          {expanded && <ChevronsUpDown className="size-4 shrink-0 opacity-50" />}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="right" align="end" className="min-w-56">
        <DropdownMenuItem asChild>
          <Link href="/account" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={() => logout()}
          disabled={isPending}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isPending ? "Logging out…" : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
