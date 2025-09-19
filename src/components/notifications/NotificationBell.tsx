"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { NotificationDropdown } from "./NotificationDropdown";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);

  // Get notifications
  const { data: notifications, isLoading } = trpc.notification.list.useQuery();

  // Count unread notifications
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative h-10 w-10 rounded-md hover:bg-muted"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-80 max-h-96 p-0" 
        align="end" 
        side="right"
        sideOffset={8}
      >
        <NotificationDropdown 
          notifications={notifications || []} 
          isLoading={isLoading}
          onClose={() => setIsOpen(false)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
