"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { RootState } from "@/store/store";
import { useChat } from "@/hooks/useChat";
import { ConversationList, CreateConversationModal } from "@/components/chat";
import { toast } from "sonner";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const appState = useSelector((state: RootState) => state.app);
  const user = appState.user;

  // Always call hooks - useChat handles the case when user is not logged in
  const {
    conversations,
    createConversation,
    isLoadingConversations,
    refetchConversations,
  } = useChat(user.loggedIn ? user.id : "");

  const handleSelectConversation = (conversationId: string) => {
    router.push(`/chat/${conversationId}`);
  };

  const handleCreateConversation = async (
    type: 'DM' | 'GROUP',
    memberUsernames: string[],
    name?: string
  ) => {
    try {
      const newConversation = await createConversation(type, memberUsernames, name);
      // Success - refresh conversations and navigate to new conversation
      await refetchConversations();
      router.push(`/chat/${newConversation.id}`);
      // Close modal
      setShowCreateModal(false);
      toast.success('Conversation created successfully');
    } catch (error: any) {
      // Show error message
      const errorMessage = error?.message || 'Failed to create conversation';
      toast.error(errorMessage);
      // Don't close modal on error, let user retry
    }
  };

  // Extract conversation ID from pathname for highlighting
  const currentConversationId = pathname.startsWith('/chat/') && pathname !== '/chat'
    ? pathname.split('/chat/')[1]
    : null;

  if (!user.loggedIn) {
    return children; // Let individual pages handle auth
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Conversation List Sidebar */}
      <div className="w-80 bg-sidebar-background border-r border-sidebar-border">
        <ConversationList
          conversations={conversations}
          selectedConversationId={currentConversationId || ''}
          onSelectConversation={handleSelectConversation}
          onCreateConversation={() => setShowCreateModal(true)}
          currentUserId={user.id}
          isLoading={isLoadingConversations}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-background">
        {children}
      </div>

      {/* Create Conversation Modal */}
      <CreateConversationModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateConversation={handleCreateConversation}
        availableUsers={[]} // No user list for privacy
        isLoading={false}
      />
    </div>
  );
}
