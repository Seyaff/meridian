"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConversationActions } from "@/hooks/chat/useConversationActions";
import { routes } from "@/lib/routes";

type Props = {
  conversationRef: string;
  currentNickname?: string;
  onMarkRead: () => void;
};

export function ConversationMenu({
  conversationRef,
  currentNickname,
  onMarkRead,
}: Props) {
  const router = useRouter();
  const { deleteMutation, nicknameMutation } = useConversationActions(conversationRef);
  const [nicknameOpen, setNicknameOpen] = useState(false);
  const [nickname, setNickname] = useState(currentNickname ?? "");

  const handleDelete = () => {
    if (!confirm("Remove this conversation from your inbox?")) return;
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Conversation removed");
        router.push(routes.chatInbox);
      },
      onError: () => toast.error("Could not remove conversation"),
    });
  };

  const handleSaveNickname = () => {
    nicknameMutation.mutate(nickname.trim() || undefined, {
      onSuccess: () => {
        toast.success("Nickname updated");
        setNicknameOpen(false);
      },
      onError: () => toast.error("Could not update nickname"),
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Conversation options"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => {
              onMarkRead();
              toast.success("Marked as read");
            }}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark as read
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setNicknameOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Set nickname
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete conversation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={nicknameOpen} onOpenChange={setNicknameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conversation nickname</DialogTitle>
          </DialogHeader>
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="e.g. Design team"
            maxLength={80}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNicknameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNickname} disabled={nicknameMutation.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
