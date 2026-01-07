"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { X, UserPlus, EyeOff, Users } from "lucide-react";
import UserProfilePicture from "@/components/UserProfilePicture";

interface ConversationMember {
  userId: string;
  user: {
    id: string;
    username: string;
    profile?: {
      displayName?: string | null;
      profilePicture?: string | null;
    } | null;
  };
}

interface Conversation {
  id: string;
  type: "DM" | "GROUP";
  name?: string | null;
  members: ConversationMember[];
}

interface ChatSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: Conversation | Record<string, unknown> | null | undefined;
  currentUserId: string;
  onAddMember: (username: string) => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
  onHideConversation: () => Promise<void>;
}

export function ChatSettingsModal({
  open,
  onOpenChange,
  conversation,
  currentUserId,
  onAddMember,
  onRemoveMember,
  onHideConversation,
}: ChatSettingsModalProps) {
  const [usernameInput, setUsernameInput] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  // Type guard to ensure conversation has required properties
  const isValidConversation = (conv: unknown): conv is Conversation => {
    return (
      conv !== null &&
      typeof conv === 'object' &&
      'id' in conv &&
      'type' in conv &&
      'members' in conv &&
      Array.isArray((conv as Conversation).members)
    );
  };

  if (!conversation || !isValidConversation(conversation)) return null;

  const isGroup = conversation.type === "GROUP";

  const handleAddMember = async () => {
    const trimmedUsername = usernameInput.trim();
    if (!trimmedUsername) return;

    setIsAddingMember(true);
    try {
      await onAddMember(trimmedUsername);
      setUsernameInput("");
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    setRemovingMemberId(userId);
    try {
      await onRemoveMember(userId);
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleHide = async () => {
    setIsHiding(true);
    try {
      await onHideConversation();
      onOpenChange(false);
    } finally {
      setIsHiding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddMember();
    }
  };

  const getMemberDisplayName = (member: ConversationMember): string => {
    return member.user.profile?.displayName || member.user.username;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isGroup ? "Group Settings" : "Chat Settings"}
          </DialogTitle>
          <DialogDescription>
            {isGroup
              ? `Manage "${conversation.name || "Unnamed Group"}" settings`
              : "Manage this conversation"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Members Section - Only for groups */}
          {isGroup && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">
                  Members ({conversation.members.length})
                </Label>
              </div>

              {/* Add Member */}
              <div className="space-y-2">
                <Label htmlFor="add-member" className="text-xs text-muted-foreground">
                  Add new member
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="add-member"
                    placeholder="Enter username..."
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isAddingMember}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddMember}
                    disabled={!usernameInput.trim() || isAddingMember}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Member List */}
              <ScrollArea className="h-[200px] rounded-md border p-2">
                <div className="space-y-2">
                  {conversation.members.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between rounded-md p-2 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <UserProfilePicture
                          profilePicture={member.user.profile?.profilePicture || ""}
                          username={member.user.username}
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {getMemberDisplayName(member)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            @{member.user.username}
                          </span>
                        </div>
                        {member.userId === currentUserId && (
                          <Badge variant="secondary" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      {member.userId !== currentUserId && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={removingMemberId === member.userId}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove member?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove{" "}
                                <strong>{getMemberDisplayName(member)}</strong> from
                                this group? They will no longer be able to see new
                                messages.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveMember(member.userId)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          <Separator />

          {/* Hide/Leave Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Hide Conversation</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              {isGroup
                ? "Hide this group from your chat list. You'll still receive messages but the conversation will be hidden until you open it again."
                : "Hide this conversation from your chat list. You'll still receive messages but it will be hidden until you open it again."}
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                  disabled={isHiding}
                >
                  <EyeOff className="h-4 w-4" />
                  Hide this {isGroup ? "group" : "conversation"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hide conversation?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This conversation will be hidden from your chat list. You can
                    still access it by searching or if someone sends a new message.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleHide}>
                    Hide
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

