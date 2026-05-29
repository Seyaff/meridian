"use client";

import dynamic from "next/dynamic";
import { Smile } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Lazily load emoji-picker-react for fast performance and zero next-js hydration errors
const Picker = dynamic(() => import("emoji-picker-react"), { 
  ssr: false,
  loading: () => (
    <div className="h-[380px] w-[320px] flex items-center justify-center text-xs tracking-wide text-zinc-400 bg-white rounded-2xl border border-zinc-100 shadow-xl">
      Loading expressions...
    </div>
  )
});

interface EmojiPickerProps {
  onChange: (emoji: string) => void;
}

export default function EmojiPickerComponent({ onChange }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Open emoji picker"
          className="p-2 rounded-full transition-all duration-200 outline-none active:scale-95 flex items-center justify-center"
        >
          {/* Light-gray icon styling that shifts to darker zinc on hover */}
          <Smile className="h-[21px] w-[21px] stroke-[1.75]" />
        </button>
      </PopoverTrigger>
      
      <PopoverContent 
        side="top" 
        sideOffset={14} 
        align="start"
        className="p-0 border-none bg-transparent shadow-2xl rounded-2xl overflow-hidden"
      >
        <Picker
          theme={"light" as any}             // Forces strict light mode
          emojiStyle={"native" as any}       // Uses modern local system emojis
          skinTonesDisabled={true}          // Keeps it minimalist and clean
          searchPlaceholder="Search emoji..."
          height={380}
          width={320}
          onEmojiClick={(emojiData) => {
            onChange(emojiData.emoji);       // Sends selection up to state
            setIsOpen(false);                // Closes popover immediately
          }}
          // Customize CSS variables to blend the picker naturally into white light-mode design
          style={{
            ["--epr-bg-color" as any]: "#ffffff",
            ["--epr-category-label-bg-color" as any]: "#ffffff",
            ["--epr-hover-bg-color" as any]: "#f4f4f5", // matches tailwind's zinc-100
            ["--epr-search-border-color" as any]: "#e4e4e7", // matches tailwind's zinc-200
            ["--epr-search-input-bg-color" as any]: "#fafafa",
            ["--epr-border-color" as any]: "transparent", // hides the harsh default wrapper box border
            ["--epr-picker-border-radius" as any]: "16px",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}