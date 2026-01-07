"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import {
  MessageList,
  MessageInput
} from "@/components/chat";
import {
  ArrowLeft,
  Bot,
  Sparkles,
} from "lucide-react";

export default function AILabChatPage() {
  const t = useTranslations('aiLabChat');
  const params = useParams();
  const router = useRouter();
  const appState = useSelector((state: RootState) => state.app);

  const classId = params.id as string;
  const labChatId = params.chatId as string;

  // Initialize chat hook
  const chat = useChat(appState.user.id);

  // Fetch lab chat data
  const { data: labChat, isLoading: isLoadingLabChat } = trpc.labChat.get.useQuery({
    labChatId
  });

  // Send message mutation
  const sendLabMessageMutation = trpc.labChat.postToLabChat.useMutation({
    onError: (error) => {
      toast.error(t('toast.messageFailed') + error.message);
    }
  });

  // Select the lab chat conversation when it loads
  useEffect(() => {
    if (labChat?.conversationId && labChat.conversationId !== chat.selectedConversationId) {
      chat.selectConversation(labChat.conversationId);
    }
  }, [labChat?.conversationId, chat.selectedConversationId, chat.selectConversation]);

  const conversationMembers = [
    {
      userId: appState.user.id,
      user: {
        id: appState.user.id,
        username: appState.user.username || 'You',
        profile: {
          displayName: appState.user.displayName || undefined,
          profilePicture: appState.user.profilePicture || undefined
        }
      }
    },
    {
      userId: 'AI_ASSISTANT',
      user: {
        id: 'AI_ASSISTANT',
        username: 'AI Assistant',
        profile: {
          displayName: 'AI Assistant',
          profilePicture: "/ai-icon.png"
        }
      }
    }
  ];

  const handleSendMessage = (content: string, mentionedUserIds: string[]) => {
    if (!content.trim() || !labChatId) return;

    sendLabMessageMutation.mutate({
      labChatId,
      content,
      mentionedUserIds
    });
  };

  const goBack = () => router.push(`/class/${classId}/ai-labs`);

  if (isLoadingLabChat) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <div className="h-12 px-4 border-b border-border flex items-center gap-3 flex-shrink-0">
          <button onClick={goBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!labChat) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <div className="h-12 px-4 border-b border-border flex items-center gap-3 flex-shrink-0">
          <button onClick={goBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-sm">AI Lab</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">{t('notFound.title')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header - Single row */}
      <div className="h-12 px-4 border-b border-border flex items-center gap-3 flex-shrink-0">
        <button onClick={goBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
          <Bot className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="text-sm font-medium">Newton</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-sm text-muted-foreground truncate">{labChat.title}</span>
        </div>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={chat.messages}
        currentUserId={appState.user.id}
        isLoading={chat.isLoadingMessages}
        hasNextPage={chat.hasMoreMessages}
        onLoadMore={chat.loadMoreMessages}
        conversationMembers={conversationMembers}
        onUpdateMessage={chat.updateMessage}
        onDeleteMessage={chat.deleteMessage}
        isUpdatingMessage={chat.isUpdatingMessage}
        isDeletingMessage={chat.isDeletingMessage}
      />

      {/* Message Input */}
      <div className="flex-shrink-0 border-t border-border">
        <MessageInput
          onSend={handleSendMessage}
          placeholder="Ask the AI..."
          conversationMembers={conversationMembers}
          currentUserId={appState.user.id}
          disabled={sendLabMessageMutation.isPending || chat.isSendingMessage}
        />
      </div>
    </div>
  );
}
