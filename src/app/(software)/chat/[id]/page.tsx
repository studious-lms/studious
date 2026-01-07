"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MessageSquare, Settings, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useChat } from "@/hooks/useChat";
import { 
  MessageList, 
  MessageInput,
  ChatSettingsModal,
} from "@/components/chat";
import { ConversationPageSkeleton } from "@/components/chat/ChatSkeletons";
import { useTranslations } from "next-intl";
import UserProfilePicture, { GroupProfilePicture } from "@/components/UserProfilePicture";
import { toast } from "sonner";

export default function ConversationPage() {
  const t = useTranslations('chat.page');

  console.log(t)
  const params = useParams();
  const router = useRouter();
  const appState = useSelector((state: RootState) => state.app);
  const user = appState.user;
  const conversationId = params.id as string;
  
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Always call hooks - useChat handles the case when user is not logged in
  const {
    selectedConversation,
    messages,
    isLoadingMessages,
    hasMoreMessages,
    loadMoreMessages,
    sendMessage,
    updateMessage,
    deleteMessage,
    selectConversation,
    markMentionsAsRead,
    isUpdatingMessage,
    isDeletingMessage,
    addMember,
    removeMember,
    hideConversation,
  } = useChat(user.loggedIn ? user.id : "");

  // Auto-select the conversation when component mounts
  useEffect(() => {
    if (conversationId) {
      selectConversation(conversationId);
    }
  }, [conversationId, selectConversation]);

  const getConversationDisplayName = (): string => {
    if (!selectedConversation) return t('unknown');
    
    if (selectedConversation.type === 'GROUP') {
      return selectedConversation.name || t('unnamedGroup');
    }
    
    // For DMs, find the other user
    const otherMember = selectedConversation.members.find(member => member.userId !== user.id);
    return otherMember?.user.profile?.displayName || otherMember?.user.username || t('unknownUser');
  };

  const handleAddMember = async (username: string) => {
    try {
      await addMember(username);
      toast.success(`Added @${username} to the group`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMember(userId);
      toast.success(`Removed @${userId} from the group`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to remove member');
    }
  };

  const handleHideConversation = async () => {
    try {
      await hideConversation();
      toast.success('Conversation hidden');
      router.push('/chat');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to hide conversation');
      throw error;
    }
  };

  if (isLoadingMessages && !selectedConversation) {
    return <ConversationPageSkeleton />;
  }

  if (!selectedConversation && !isLoadingMessages) {
    return (
      <div className="h-full bg-background flex items-center justify-center">
        <div className="text-center space-y-6">
          <EmptyState
            icon={MessageSquare}
            title={t('notFound.title')}
            description={t('notFound.description')}
          />
          <Button onClick={() => router.push('/chat')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('notFound.backToChat')}
            {t('header.members')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background flex flex-col">
      {selectedConversation ? (
        <>
          {/* Chat Header */}
          <div className="h-12 border-b border-border px-2 sm:px-4 flex items-center justify-between bg-background flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {/* Back button - mobile only */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden h-8 w-8 p-0 flex-shrink-0"
                onClick={() => router.push('/chat')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-2 min-w-0">
                {
                  selectedConversation.type === 'DM' ? (
                    <UserProfilePicture profilePicture={selectedConversation.members.find(m => m.userId !== user.id)?.user.profile?.profilePicture || ""} username={selectedConversation.members.find(m => m.userId !== user.id)?.user.username || "Unknown"} />
                  ) : (
                    <GroupProfilePicture users={selectedConversation.members.map(m => ({
                      id: m.userId,
                      profilePicture: m.user.profile?.profilePicture || "",
                      username: m.user.username,
                    }))} />
                  )
                }

                <span className="font-semibold text-foreground text-sm sm:text-base truncate">
                  {getConversationDisplayName()}
                </span>
                {selectedConversation.type === 'GROUP' && (
                  <span className="hidden sm:inline text-sm text-muted-foreground whitespace-nowrap">
                    ({selectedConversation.members.length} {t('header.members')})
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={markMentionsAsRead}
                className="hidden sm:inline-flex text-xs text-muted-foreground hover:text-foreground"
              >
                {t('header.markMentionsRead')}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => setShowSettingsModal(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Settings Modal */}
          <ChatSettingsModal
            open={showSettingsModal}
            onOpenChange={setShowSettingsModal}
            conversation={selectedConversation}
            currentUserId={user.id}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
            onHideConversation={handleHideConversation}
          />

          {/* Messages */}
          <MessageList
            messages={messages}
            currentUserId={user.id}
            isLoading={isLoadingMessages}
            hasNextPage={hasMoreMessages}
            onLoadMore={loadMoreMessages}
            conversationMembers={selectedConversation.members.map(m => ({
              ...m,
              user: {
                ...m.user,
                profile: m.user.profile ? {
                  displayName: m.user.profile.displayName ?? undefined,
                  profilePicture: m.user.profile.profilePicture ?? undefined
                } : undefined
              }
            }))}
            onUpdateMessage={updateMessage}
            onDeleteMessage={deleteMessage}
            isUpdatingMessage={isUpdatingMessage}
            isDeletingMessage={isDeletingMessage}
          />

          {/* Message Input */}
          <div className="flex-shrink-0">
            <MessageInput
              onSend={sendMessage}
              placeholder={`${t('input.placeholderPrefix')} ${getConversationDisplayName()}`}
              conversationMembers={selectedConversation.members.map(m => ({
                ...m,
                user: {
                  ...m.user,
                  profile: m.user.profile ? {
                    displayName: m.user.profile.displayName ?? undefined,
                    profilePicture: m.user.profile.profilePicture ?? undefined
                  } : undefined
                }
              }))}
              currentUserId={user.id}
            />
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
