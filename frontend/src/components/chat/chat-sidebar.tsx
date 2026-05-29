"use client";

import NavMain from "../sidebar/nav-main";
import NavUser from "../sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "../ui/sidebar";

export default function ChatSidebar() {
  const { setOpen } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      
      className="transition-all duration-300 ease-in-out"
    >
      
  
      <SidebarHeader className="h-14 flex items-center justify-center border-b border-border/40 shrink-0">
        <h1 className="font-serif text-xl font-semibold">M</h1>
      </SidebarHeader>

    
      <SidebarContent className="overflow-x-hidden ">
        <NavMain />
      </SidebarContent>

   
      <SidebarFooter className="h-16 flex items-center justify-center shrink-0 border-t border-border/40 p-2">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}