"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle } from "lucide-react";
import { MessageItem } from "./MessageItem";
import type { MessageListOutput } from "@/lib/trpc";
import { MessageListSkeleton } from "./ChatSkeletons";
import { EmptyState } from "@/components/ui/empty-state";

type Message = MessageListOutput['messages'][number];

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  conversationMembers: Array<{
    userId: string;
    user: {
      id: string;
      username: string;
      profile?: {
        displayName?: string;
        profilePicture?: string;
      };
    };
  }>;
  onUpdateMessage?: (messageId: string, content: string, mentionedUserIds: string[]) => void;
  onDeleteMessage?: (messageId: string) => void;
  isUpdatingMessage?: boolean;
  isDeletingMessage?: boolean;
}

export function MessageList({
  messages,
  currentUserId,
  isLoading = false,
  hasNextPage = false,
  onLoadMore,
  conversationMembers,
  onUpdateMessage,
  onDeleteMessage,
  isUpdatingMessage = false,
  isDeletingMessage = false,
}: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

  // Auto-scroll to bottom when new messages arrive (if already at bottom)
  useEffect(() => {
    if (shouldScrollToBottom && scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
      setShouldScrollToBottom(false);
    }
  }, [messages, shouldScrollToBottom]);

  // Check if we should auto-scroll when new messages arrive
  useEffect(() => {
    if (isAtBottom) {
      setShouldScrollToBottom(true);
    }
  }, [messages.length, isAtBottom]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsAtBottom(isNearBottom);

    // Load more messages when scrolling to top
    if (scrollTop === 0 && hasNextPage && onLoadMore && !isLoading) {
      onLoadMore();
    }
  };

  const scrollToBottom = () => {
    setShouldScrollToBottom(true);
  };

  if (isLoading && messages.length === 0) {
    return <MessageListSkeleton />;
  }

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <EmptyState
          icon={MessageCircle}
          title="No messages yet"
          description="This is the beginning of your conversation"
          className="py-12"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative bg-background min-h-0">
      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-1"
        onScrollCapture={handleScroll}
      >
        <div className="py-2">
          {/* Load more button */}
          {hasNextPage && (
            <div className="text-center py-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onLoadMore}
                disabled={isLoading}
                className="text-muted-foreground hover:text-foreground"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load more messages'
                )}
              </Button>
            </div>
          )}

          {/* Messages */}
          {messages.map((message, index) => {
            const previousMessage = messages[index - 1];
            const showAvatar = !previousMessage || 
              previousMessage.senderId !== message.senderId ||
              (new Date(message.createdAt).getTime() - new Date(previousMessage.createdAt).getTime()) > 5 * 60 * 1000; // 5 minutes
            
            return (
              <MessageItem
                key={message.id}
                message={message}
                currentUserId={currentUserId}
                showAvatar={showAvatar}
                conversationMembers={conversationMembers}
                onUpdateMessage={onUpdateMessage}
                onDeleteMessage={onDeleteMessage}
                isUpdatingMessage={isUpdatingMessage}
                isDeletingMessage={isDeletingMessage}
              />
            );
          })}

          {isLoading && messages.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Scroll to bottom button */}
      {!isAtBottom && (
        <div className="absolute bottom-4 right-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={scrollToBottom}
            className="rounded-full shadow-lg bg-muted hover:bg-muted/80 text-foreground"
          >
            ↓
          </Button>
        </div>
      )}
    </div>
  );
}
