"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Plus, Search, MessageSquare, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConversationListOutput } from "@/lib/trpc";
import { ConversationListSkeleton } from "./ChatSkeletons";
import { EmptyState } from "@/components/ui/empty-state";

type Conversation = ConversationListOutput[number];

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation: () => void;
  currentUserId: string;
  isLoading?: boolean;
}

const getConversationDisplayName = (conversation: Conversation, currentUserId: string): string => {
  if (conversation.type === 'GROUP') {
    return conversation.name || 'Unnamed Group';
  }
  
  // For DMs, find the other user
  const otherMember = conversation.members.find(member => member.userId !== currentUserId);
  return otherMember?.user.profile?.displayName || otherMember?.user.username || 'Unknown User';
};

const getConversationAvatar = (conversation: Conversation, currentUserId: string): string => {
  if (conversation.type === 'GROUP') {
    return conversation.name?.charAt(0).toUpperCase() || 'G';
  }
  
  const otherMember = conversation.members.find(member => member.userId !== currentUserId);
  return otherMember?.user.profile?.displayName?.charAt(0).toUpperCase() || 
         otherMember?.user.username.charAt(0).toUpperCase() || 'U';
};

const formatLastMessageTime = (date: Date): string => {
  const now = new Date();
  const messageDate = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'now';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;
  
  return messageDate.toLocaleDateString();
};

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onCreateConversation,
  currentUserId,
  isLoading = false,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter(conversation => {
    const displayName = getConversationDisplayName(conversation, currentUserId);
    return displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (isLoading) {
    return <ConversationListSkeleton />;
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Messages</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCreateConversation}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              <EmptyState
                icon={MessageSquare}
                title={searchQuery ? 'No conversations found' : 'No conversations yet'}
                description={searchQuery ? 'Try adjusting your search terms' : 'Start chatting with someone'}
              />
              {!searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCreateConversation}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Start a conversation
                </Button>
              )}
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const displayName = getConversationDisplayName(conversation, currentUserId);
              const avatarText = getConversationAvatar(conversation, currentUserId);
              const isSelected = selectedConversationId === conversation.id;
              
              return (
                <Button
                  key={conversation.id}
                  variant={isSelected ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-auto p-3 text-left",
                    isSelected && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex items-start space-x-3 w-full min-w-0">
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.type === 'DM' ? 
                          conversation.members.find(m => m.userId !== currentUserId)?.user.profile?.profilePicture 
                          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.members.find(m => m.userId !== currentUserId)?.user.username}`
                        } />
                        <AvatarFallback className={cn(
                          "text-sm font-medium",
                          conversation.type === 'GROUP' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                          {conversation.type === 'GROUP' ? (
                            <Users className="h-4 w-4" />
                          ) : (
                            avatarText
                          )}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate flex-1 min-w-0">
                          {displayName}
                        </h4>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          {conversation.lastMessage && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatLastMessageTime(conversation.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs text-muted-foreground truncate max-w-48 flex-1 min-w-0 leading-tight">
                          {conversation.lastMessage ? (
                            <span className="break-words">
                              <span className="font-medium">{conversation.lastMessage.sender.username}:</span>{' '}
                              <span className="break-all">{conversation.lastMessage.content}</span>
                            </span>
                          ) : (
                            'No messages yet'
                          )}
                        </p>
                        
                        <div className="flex space-x-1 flex-shrink-0">
                          {conversation.unreadMentionCount > 0 && (
                            <Badge variant="destructive" className="h-4 text-xs px-1 min-w-[16px] flex items-center justify-center">
                              @{conversation.unreadMentionCount}
                            </Badge>
                          )}
                          {conversation.unreadCount > 0 && conversation.unreadMentionCount === 0 && (
                            <Badge variant="secondary" className="h-4 text-xs px-1 min-w-[16px] flex items-center justify-center">
                              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
