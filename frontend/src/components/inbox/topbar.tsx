import { Info, Phone, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface Props {
  avatarUrl: string;
  name: string;
  username?: string;
}

export default function InboxTopbar({
  avatarUrl,
  name,
  username,
}: Props) {
  return (
    <main className="border-b  px-5 py-4">
      <div className="flex items-center justify-between">
        
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border">
            <AvatarImage
              src={avatarUrl}
              alt={name}
              className="object-cover"
            />

            <AvatarFallback className="">
              {name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="leading-tight">
            <h1 className="text-[20px] font-bold">
              {name}
            </h1>

            <p className="mt-1 text-sm ">
              {username ? `@${username}` : "Active now"}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-5 ">
          
          <button className="transition hover:scale-110">
            <Phone
              size={26}
              className="stroke-[2px] cursor-pointer"
            />
          </button>

          <button className="transition hover:scale-110 ">
            <Video
              size={26}
              className="stroke-[2px] cursor-pointer"
            />
          </button>

          <button className="transition hover:scale-110 ">
            <Info
              size={26}
              className="stroke-[2px] cursor-pointer"
            />
          </button>
        </div>
      </div>
    </main>
  );
}