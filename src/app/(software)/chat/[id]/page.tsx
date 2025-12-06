"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MessageSquare, Settings, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useChat } from "@/hooks/useChat";
import { 
  MessageList, 
  MessageInput 
} from "@/components/chat";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ConversationPageSkeleton } from "@/components/chat/ChatSkeletons";
import { useTranslations } from "next-intl";

export default function ConversationPage() {
  const t = useTranslations('chat.page');

  console.log(t)
  const params = useParams();
  const router = useRouter();
  const appState = useSelector((state: RootState) => state.app);
  const user = appState.user;
  const conversationId = params.id as string;
  
  // Always call hooks - useChat handles the case when user is not logged in
  const {
    conversations,
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
          <div className="h-12 border-b border-border px-4 flex items-center justify-between bg-background flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={selectedConversation.type === 'DM' ? 
                      selectedConversation.members.find(m => m.userId !== user.id)?.user.profile?.profilePicture 
                      // @TODO: Fix this
                      : selectedConversation.members.find(m => m.userId !== user.id)?.user.profile?.profilePicture || ""
                    }
                  />
                  <AvatarFallback>
                    {getConversationDisplayName().charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-foreground">
                  {getConversationDisplayName()}
                </span>
                {selectedConversation.type === 'GROUP' && (
                  <span className="text-sm text-muted-foreground">
                    ({selectedConversation.members.length} {t('header.members')})
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={markMentionsAsRead}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {t('header.markMentionsRead')}
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

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
