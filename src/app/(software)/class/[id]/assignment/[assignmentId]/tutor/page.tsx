"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MessageList, 
  MessageInput 
} from "@/components/chat";
import { 
  ArrowLeft, 
  Sparkles,
  BookOpen,
  Calendar,
  GraduationCap,
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
  // This query automatically creates the conversation if it doesn't exist
  const { data: tutorConversation, isLoading: isLoadingConversation } = trpc.newtonChat.getTutorConversation.useQuery({
    assignmentId,
    classId,
  }, {
    enabled: !!assignment, // Only run after assignment loads
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
          displayName: 'Newton Tutor',
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

  // Loading state
  if (isLoadingAssignment) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <div className="px-6 py-3 border-b border-border bg-background flex-shrink-0">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push(`/class/${classId}/assignment/${assignmentId}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Assignment
          </Button>
        </div>
        <div className="px-6 py-4 border-b border-border">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Sparkles className="h-8 w-8 mx-auto text-violet-500 animate-pulse" />
            <p className="text-sm text-muted-foreground">Starting Newton Tutor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!assignment) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <div className="px-6 py-3 border-b border-border bg-background flex-shrink-0">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push(`/class/${classId}/assignment/${assignmentId}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Assignment
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold text-muted-foreground">Assignment not found</h2>
            <p className="text-sm text-muted-foreground">This assignment may have been deleted.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Back Button */}
      <div className="px-6 py-3 border-b border-border bg-background flex-shrink-0">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push(`/class/${classId}/assignment/${assignmentId}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assignment
        </Button>
      </div>

      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-background flex-shrink-0">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">Newton Tutor</h1>
              <Badge variant="secondary" className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-0">
                AI Assistant
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                <span className="truncate">{assignment.title}</span>
              </div>
              {assignment.dueDate && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Due {new Date(assignment.dueDate).toLocaleDateString()}</span>
                  </div>
                </>
              )}
              {assignment.maxGrade && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>{assignment.maxGrade} points</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Welcome message when no messages yet */}
      {chat.messages.length === 0 && !chat.isLoadingMessages && !isLoadingConversation && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center mx-auto">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Hi! I&apos;m Newton</h2>
              <p className="text-muted-foreground">
                I&apos;m your AI tutor for this assignment. I can help you understand concepts, 
                give hints without spoiling answers, and guide you through problems. 
                What would you like to learn?
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSendMessage("Can you explain the main concepts I need to understand for this assignment?", [])}
                disabled={!tutorConversation}
              >
                <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                Explain concepts
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSendMessage("I'm stuck. Can you give me a hint without giving away the answer?", [])}
                disabled={!tutorConversation}
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Give me a hint
              </Button>
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
          placeholder="Ask Newton anything about this assignment..."
          conversationMembers={conversationMembers}
          currentUserId={appState.user.id}
          disabled={sendMessageMutation.isPending || chat.isSendingMessage || !tutorConversation}
        />
      </div>
    </div>
  );
}
