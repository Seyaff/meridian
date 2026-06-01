import { Info, Phone, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface Props {
  avatarUrl?: string;
  name: string;
  username?: string;
  status?: string | null;
}

export default function InboxTopbar({
  avatarUrl,
  name,
  username,
  status,
}: Props) {
  return (
    <header className="border-b px-5 py-4 bg-background shrink-0">
      <div className="flex items-center justify-between gap-4">
        
        {/* LEFT: User Profile & Presence */}
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-12 w-12 border shrink-0">
            <AvatarImage
              src={avatarUrl}
              alt={name}
              className="object-cover"
            />
            <AvatarFallback>
              {name?.slice(0, 2).toUpperCase() || "CH"}
            </AvatarFallback>
          </Avatar>

          <div className="leading-tight min-w-0">
            <h1 className="text-[18px] font-bold text-foreground truncate max-w-[200px] sm:max-w-[400px]">
              {name}
            </h1>

            <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-[400px]">
              {status || (username ? `@${username}` : "Offline")}
            </p>
          </div>
        </div>

        {/* RIGHT: Action Buttons */}
        <div className="flex items-center gap-4 text-muted-foreground shrink-0">
          <button className="p-1 rounded-full hover:bg-muted hover:text-foreground transition active:scale-95">
            <Phone
              size={22}
              className="stroke-[2px] cursor-pointer"
            />
          </button>

          <button className="p-1 rounded-full hover:bg-muted hover:text-foreground transition active:scale-95">
            <Video
              size={22}
              className="stroke-[2px] cursor-pointer"
            />
          </button>

          <button className="p-1 rounded-full hover:bg-muted hover:text-foreground transition active:scale-95">
            <Info
              size={22}
              className="stroke-[2px] cursor-pointer"
            />
          </button>
        </div>

      </div>
    </header>
  );
}