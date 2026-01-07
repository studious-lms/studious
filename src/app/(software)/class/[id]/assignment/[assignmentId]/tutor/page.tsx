"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageList,
  MessageInput
} from "@/components/chat";
import {
  ArrowLeft,
  Bot,
  BookOpen,
} from "lucide-react";

export default function NewtonTutorPage() {
  const params = useParams();
  const router = useRouter();
  const appState = useSelector((state: RootState) => state.app);

  const classId = params.id as string;
  const assignmentId = params.assignmentId as string;

  // Initialize chat hook
  const chat = useChat(appState.user.id);

  // Fetch assignment data
  const { data: assignment, isLoading: isLoadingAssignment } = trpc.assignment.get.useQuery({
    classId,
    id: assignmentId
  });

  // Get or create tutor conversation for this assignment
  const { data: tutorConversation, isLoading: isLoadingConversation } = trpc.newtonChat.getTutorConversation.useQuery({
    assignmentId,
    classId,
  }, {
    enabled: !!assignment,
  });

  // Send message mutation
  const sendMessageMutation = trpc.newtonChat.postToNewtonChat.useMutation({
    onError: (error) => {
      toast.error("Failed to send message: " + error.message);
    }
  });

  // Select conversation when it loads
  useEffect(() => {
    if (tutorConversation?.conversationId && tutorConversation.conversationId !== chat.selectedConversationId) {
      chat.selectConversation(tutorConversation.conversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorConversation?.conversationId]);

  // Conversation members
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
        username: 'Newton',
        profile: {
          displayName: 'Newton',
          profilePicture: "/ai-icon.png"
        }
      }
    }
  ];

  const handleSendMessage = (content: string, mentionedUserIds: string[]) => {
    if (!content.trim() || !tutorConversation?.newtonChatId) return;

    sendMessageMutation.mutate({
      newtonChatId: tutorConversation.newtonChatId,
      content,
      mentionedUserIds
    });
  };

  const goBack = () => router.push(`/class/${classId}/assignment/${assignmentId}`);

  // Loading state
  if (isLoadingAssignment) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <div className="h-12 px-4 border-b border-border flex items-center gap-3 flex-shrink-0">
          <button onClick={goBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!assignment) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <div className="h-12 px-4 border-b border-border flex items-center gap-3 flex-shrink-0">
          <button onClick={goBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-sm">Newton Tutor</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Assignment not found</p>
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
          <Bot className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="text-sm font-medium">Newton</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-sm text-muted-foreground truncate">{assignment.title}</span>
        </div>
      </div>

      {/* Welcome message when no messages yet */}
      {chat.messages.length === 0 && !chat.isLoadingMessages && !isLoadingConversation && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-sm text-center space-y-4">
            <Bot className="h-8 w-8 text-primary mx-auto" />
            <div>
              <h2 className="text-base font-medium mb-1">Newton Tutor</h2>
              <p className="text-sm text-muted-foreground">
                I can help you understand concepts and guide you through problems without giving away answers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {(chat.messages.length > 0 || chat.isLoadingMessages || isLoadingConversation) && (
        <MessageList
          messages={chat.messages}
          currentUserId={appState.user.id}
          isLoading={chat.isLoadingMessages || isLoadingConversation}
          hasNextPage={chat.hasMoreMessages}
          onLoadMore={chat.loadMoreMessages}
          conversationMembers={conversationMembers}
          onUpdateMessage={chat.updateMessage}
          onDeleteMessage={chat.deleteMessage}
          isUpdatingMessage={chat.isUpdatingMessage}
          isDeletingMessage={chat.isDeletingMessage}
        />
      )}

      {/* Message Input */}
      <div className="flex-shrink-0 border-t border-border">
        <MessageInput
          onSend={handleSendMessage}
          placeholder="Ask Newton anything..."
          conversationMembers={conversationMembers}
          currentUserId={appState.user.id}
          disabled={sendMessageMutation.isPending || chat.isSendingMessage || !tutorConversation}
        />
      </div>
    </div>
  );
}
