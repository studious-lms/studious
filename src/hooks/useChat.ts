"use client";

import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import {
  subscribeToConversation,
  unsubscribeFromConversation,
  bindNewMessage,
  bindConversationViewed,
  bindMentionsViewed,
  bindMessageUpdated,
  bindMessageDeleted,
  unbindAllEvents,
  type NewMessageEvent,
  type ConversationViewedEvent,
  type MentionsViewedEvent,
  type MessageUpdatedEvent,
  type MessageDeletedEvent,
} from '@/lib/pusher';
import type {
  ConversationListOutput,
  ConversationGetOutput,
  MessageListOutput,
  MessageSendInput,
} from '@/lib/trpc';

export function useChat(currentUserId: string) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Only run queries if user is logged in
  const isEnabled = !!currentUserId;

  // Get tRPC utils for manual fetches
  const utils = trpc.useUtils();

  // Queries
  const conversationsQuery = trpc.conversation.list.useQuery(undefined, {
    enabled: isEnabled
  });
  const selectedConversationQuery = trpc.conversation.get.useQuery(
    { conversationId: selectedConversationId! },
    { enabled: !!selectedConversationId && isEnabled }
  );
  
  const [messagesData, setMessagesData] = useState<{
    messages: MessageListOutput['messages'];
    nextCursor?: string;
  }>({ messages: [] });

  const messagesQuery = trpc.message.list.useQuery(
    {
      conversationId: selectedConversationId!,
      limit: 50,
    },
    {
      enabled: !!selectedConversationId && isEnabled,
    }
  );

  // Update messages when query data changes
  useEffect(() => {
    if (messagesQuery.data) {
      setMessagesData(messagesQuery.data);
    }
  }, [messagesQuery.data]);

  // Mutations
  const sendMessageMutation = trpc.message.send.useMutation({
    onSuccess: (newMessage) => {
      // Replace temporary message with real message from server
      setMessagesData(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id.startsWith('temp-') && msg.content === newMessage.content
            ? {
                ...msg,
                id: newMessage.id,
                createdAt: typeof newMessage.createdAt === 'string'
                  ? newMessage.createdAt
                  : (newMessage.createdAt as Date).toISOString(),
                sender: newMessage.sender,
              }
            : msg
        ),
      }));
    },
    onError: (error) => {
      // Remove optimistic message on error
      setMessagesData(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => !msg.id.startsWith('temp-')),
      }));
    },
  });

  const markAsReadMutation = trpc.message.markAsRead.useMutation({
    onSuccess: () => {
      // Refresh conversations to update unread counts
      conversationsQuery.refetch();
    },
  });

  const markMentionsAsReadMutation = trpc.message.markMentionsAsRead.useMutation({
    onSuccess: () => {
      // Refresh conversations to update mention counts
      conversationsQuery.refetch();
    },
  });

  const updateMessageMutation = trpc.message.update.useMutation({
    onSuccess: () => {
      // Message already updated optimistically
    },
    onError: (error, variables) => {
      // Revert optimistic update on error
      messagesQuery.refetch();
    },
  });

  const deleteMessageMutation = trpc.message.delete.useMutation({
    onSuccess: () => {
      // Message already removed optimistically
    },
    onError: (error, variables) => {
      // Revert optimistic deletion on error
      messagesQuery.refetch();
    },
  });

  const createConversationMutation = trpc.conversation.create.useMutation({
    onSuccess: (newConversation) => {
      // Refresh conversations list and select the new conversation
      conversationsQuery.refetch();
      setSelectedConversationId(newConversation.id);
    },
  });

  // Helper to map real-time message data to our message format
  const mapToMessage = useCallback((data: NewMessageEvent): MessageListOutput['messages'][number] => ({
    id: data.id,
    content: data.content,
    senderId: data.senderId,
    conversationId: data.conversationId,
    attachments: data.attachments,
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : data.createdAt.toISOString(),
    sender: {
      ...data.sender,
      profile: data.sender.profile ? {
        displayName: data.sender.profile.displayName || null,
        profilePicture: data.sender.profile.profilePicture || null,
      } : null,
    },
    mentions: [],
    mentionsMe: data.mentionedUserIds.includes(currentUserId),
  }), [currentUserId]);

  // Load more messages using manual fetch
  const loadMoreMessages = useCallback(async () => {
    if (!selectedConversationId || !messagesData.nextCursor || messagesQuery.isFetching) {
      return;
    }

    try {
      const moreMessages = await utils.message.list.fetch({
        conversationId: selectedConversationId,
        cursor: messagesData.nextCursor,
        limit: 50,
      });

      setMessagesData(prev => ({
        messages: [...moreMessages.messages, ...prev.messages],
        nextCursor: moreMessages.nextCursor,
      }));
    } catch (error) {
      console.error('Failed to load more messages:', error);
    }
  }, [selectedConversationId, messagesData.nextCursor, messagesQuery.isFetching, utils]);

  // Real-time event handlers
  const handleNewMessage = useCallback((data: NewMessageEvent) => {
    // Add message to current conversation if it matches
    if (data.conversationId === selectedConversationId) {
      setMessagesData(prev => {
        // Check if message already exists (avoid duplicates from optimistic update)
        const messageExists = prev.messages.some(msg =>
          msg.id === data.id ||
          (msg.senderId === data.senderId && msg.content === data.content && msg.id.startsWith('temp-'))
        );

        if (messageExists) {
          // Update temp message with real data from server
          return {
            ...prev,
            messages: prev.messages.map(msg =>
              msg.id.startsWith('temp-') && msg.senderId === data.senderId && msg.content === data.content
                ? mapToMessage(data)
                : msg
            ),
          };
        }

        // Add new message (from other users)
        return {
          ...prev,
          messages: [...prev.messages, mapToMessage(data)],
        };
      });

      // Mark as read if user is actively viewing this conversation
      if (document.visibilityState === 'visible') {
        markAsReadMutation.mutate({ conversationId: data.conversationId });
      }
    }

    // Always refresh conversations list to update last message and unread counts
    conversationsQuery.refetch();
  }, [selectedConversationId, mapToMessage, markAsReadMutation.mutate, conversationsQuery.refetch]);

  const handleConversationViewed = useCallback((data: ConversationViewedEvent) => {
    // Refresh conversations to update read indicators
    conversationsQuery.refetch();
  }, [conversationsQuery.refetch]);

  const handleMentionsViewed = useCallback((data: MentionsViewedEvent) => {
    // Refresh conversations to update mention indicators
    conversationsQuery.refetch();
  }, [conversationsQuery.refetch]);

  const handleMessageUpdated = useCallback((data: MessageUpdatedEvent) => {
    // Update message in current conversation if it matches
    if (data.conversationId === selectedConversationId) {
      setMessagesData(prev => {
        // Check if message needs updating (avoid unnecessary re-renders)
        const existingMsg = prev.messages.find(msg => msg.id === data.id);
        if (existingMsg && existingMsg.content === data.content) {
          // Message already up to date (from optimistic update)
          return prev;
        }

        return {
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === data.id
              ? { ...msg, content: data.content }
              : msg
          ),
        };
      });
    }

    // Refresh conversations to update last message if needed
    conversationsQuery.refetch();
  }, [selectedConversationId, conversationsQuery.refetch]);

  const handleMessageDeleted = useCallback((data: MessageDeletedEvent) => {
    // Remove message from current conversation if it matches
    if (data.conversationId === selectedConversationId) {
      setMessagesData(prev => {
        // Check if message still exists (might already be removed optimistically)
        const messageExists = prev.messages.some(msg => msg.id === data.messageId);
        if (!messageExists) {
          // Message already removed (from optimistic delete)
          return prev;
        }

        return {
          ...prev,
          messages: prev.messages.filter(msg => msg.id !== data.messageId),
        };
      });
    }

    // Refresh conversations to update last message if needed
    conversationsQuery.refetch();
  }, [selectedConversationId, conversationsQuery.refetch]);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!selectedConversationId || !isEnabled) return;

    const channel = subscribeToConversation(selectedConversationId);
    
    bindNewMessage(channel, handleNewMessage);
    bindConversationViewed(channel, handleConversationViewed);
    bindMentionsViewed(channel, handleMentionsViewed);
    bindMessageUpdated(channel, handleMessageUpdated);
    bindMessageDeleted(channel, handleMessageDeleted);

    return () => {
      unbindAllEvents(channel);
      unsubscribeFromConversation(selectedConversationId);
    };
  }, [selectedConversationId, handleNewMessage, handleConversationViewed, handleMentionsViewed, handleMessageUpdated, handleMessageDeleted, isEnabled]);

  // Mark conversation as read when selected
  useEffect(() => {
    if (selectedConversationId && document.visibilityState === 'visible' && isEnabled) {
      markAsReadMutation.mutate({ conversationId: selectedConversationId });
    }
  }, [selectedConversationId, markAsReadMutation.mutate, isEnabled]);

  // Actions
  const sendMessage = useCallback((content: string, mentionedUserIds: string[] = []) => {
    if (!selectedConversationId || !currentUserId) return;

    // Get current user info from conversation members
    const currentUserMember = selectedConversationQuery.data?.members.find(
      m => m.userId === currentUserId
    );

    // Optimistic update: Add message immediately with temporary ID
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: MessageListOutput['messages'][number] = {
      id: tempId,
      content,
      senderId: currentUserId,
      conversationId: selectedConversationId,
      createdAt: new Date().toISOString(),
      sender: currentUserMember?.user || {
        id: currentUserId,
        username: '',
        profile: null,
      },
      attachments: [],
      mentions: [],
      mentionsMe: false,
    };

    setMessagesData(prev => ({
      ...prev,
      messages: [...prev.messages, optimisticMessage],
    }));

    // Send to server
    sendMessageMutation.mutate({
      conversationId: selectedConversationId,
      content,
      mentionedUserIds,
    });
  }, [selectedConversationId, currentUserId, selectedConversationQuery.data, sendMessageMutation]);

  const selectConversation = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId);
    setMessagesData({ messages: [] }); // Clear previous messages
  }, []);

  const createConversation = useCallback(async (
    type: 'DM' | 'GROUP',
    memberIds: string[],
    name?: string
  ) => {
    return await createConversationMutation.mutateAsync({
      type,
      memberIds,
      name,
    });
  }, [createConversationMutation]);

  const markMentionsAsRead = useCallback(() => {
    if (!selectedConversationId) return;
    markMentionsAsReadMutation.mutate({ conversationId: selectedConversationId });
  }, [selectedConversationId, markMentionsAsReadMutation]);

  const updateMessage = useCallback((messageId: string, content: string, mentionedUserIds: string[] = []) => {
    // Optimistic update: Update message immediately in UI
    setMessagesData(prev => ({
      ...prev,
      messages: prev.messages.map(msg =>
        msg.id === messageId
          ? { ...msg, content }
          : msg
      ),
    }));

    // Send update to server
    updateMessageMutation.mutate({
      messageId,
      content,
      mentionedUserIds,
    });
  }, [updateMessageMutation]);

  const deleteMessage = useCallback((messageId: string) => {
    // Optimistic update: Remove message immediately from UI
    setMessagesData(prev => ({
      ...prev,
      messages: prev.messages.filter(msg => msg.id !== messageId),
    }));

    // Send delete request to server
    deleteMessageMutation.mutate({
      messageId,
    });
  }, [deleteMessageMutation]);

  return {
    // Data - filter out lab chat conversations (exclude conversations with labChatId)
    conversations: (conversationsQuery.data || []).filter(conversation => 
      !conversation.labChat
    ),
    selectedConversation: selectedConversationQuery.data,
    messages: messagesData.messages,
    selectedConversationId,

    // Loading states
    isLoadingConversations: conversationsQuery.isLoading,
    isLoadingMessages: messagesQuery.isLoading,
    isLoadingMoreMessages: messagesQuery.isFetching && messagesData.messages.length > 0,
    isSendingMessage: sendMessageMutation.isPending,
    isUpdatingMessage: updateMessageMutation.isPending,
    isDeletingMessage: deleteMessageMutation.isPending,
    isCreatingConversation: createConversationMutation.isPending,

    // Pagination
    hasMoreMessages: !!messagesData.nextCursor,
    loadMoreMessages,

    // Actions
    sendMessage,
    updateMessage,
    deleteMessage,
    selectConversation,
    createConversation,
    markMentionsAsRead,

    // Utilities
    refetchConversations: conversationsQuery.refetch,
  };
}
