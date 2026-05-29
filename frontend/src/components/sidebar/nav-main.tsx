"use client";

import { Home, Search, Send } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  SidebarGroup, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  useSidebar
} from "../ui/sidebar";

const navMainItems = [
  { label: "Home", icon: Home, href: "/chat" },
  {label : "Search" , icon : Search , href : "/search"},
  { label: "Messages", icon: Send, href: "/chat/inbox" },
];

export default function NavMain() {
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    // Removed flex-1 and absolute positioning to keep item spacing tight and identical in both modes
    <SidebarGroup className="p-2 transition-all duration-300 flex flex-1 items-center justify-center">
      <SidebarMenu className="gap-1">
        {navMainItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton 
                asChild 
                isActive={isActive}
                tooltip={item.label}
                // Removed dynamic layout overrides that cause jumping.
                // We let the flex alignment keep elements uniform.
                className="h-10 w-full transition-all duration-300"
              >
                <Link 
                  href={item.href} 
                  className={`flex items-center w-full h-full transition-all duration-300 ${
                    open ? "justify-start px-3 gap-3" : "justify-center px-0"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  
                  {/* Using display states matching the open flag ensures the layout engine 
                    forces the text row calculation smoothly without clipping glitches.
                  */}
                  {open && (
                    <span className="font-medium text-sm text-foreground tracking-wide animate-in fade-in duration-200 delay-75 whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}