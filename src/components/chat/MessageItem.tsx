"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MessageListOutput } from "@/lib/trpc";
import { MessageActions } from "./MessageActions";
import { MessageEdit } from "./MessageEdit";
import { AIMarkdown } from "./AIMarkdown";
import { AISuggestedContent } from "./AISuggestedContent";
import { DraggableFileItem } from "@/components/DraggableFileItem";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FilePreviewModal } from "@/components/modals";
import { 
  Sparkles,
} from "lucide-react";
import type { FileItem, FileHandlers } from "@/lib/types/file";
import { baseFileHandler } from "@/lib/file/fileHandler";
import { useParams } from "next/navigation";
import UserProfilePicture from "../UserProfilePicture";
import { convertAttachmentsToFileItems } from "@/lib/file/file";
import Attachment from "../Attachment";

type Message = MessageListOutput['messages'][number];

interface MessageItemProps {
  message: Message;
  currentUserId: string;
  showAvatar?: boolean;
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

const formatMessageTime = (date: Date): string => {
  const now = new Date();
  const messageDate = new Date(date);
  const isToday = messageDate.toDateString() === now.toDateString();
  
  if (isToday) {
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  const isThisWeek = (now.getTime() - messageDate.getTime()) < (7 * 24 * 60 * 60 * 1000);
  if (isThisWeek) {
    return messageDate.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
  }
  
  return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const renderMessageContent = (content: string, mentions: Message['mentions']) => {
  if (!mentions || mentions.length === 0) {
    return content;
  }

  let renderedContent = content;
  
  // Replace @mentions with styled spans
  mentions.forEach(mention => {
    const mentionText = `@${mention.user.username}`;
    const displayName = mention.user.profile?.displayName || mention.user.username;
    
    renderedContent = renderedContent.replace(
      new RegExp(mentionText, 'g'),
      `<span class="bg-primary/20 hover:bg-primary/30 text-primary cursor-pointer px-1.5 py-0.5 rounded font-medium">@${displayName}</span>`
    );
  });

  return <span dangerouslySetInnerHTML={{ __html: renderedContent }} />;
};

export function MessageItem({
  message,
  currentUserId,
  showAvatar = true,
  conversationMembers,
  onUpdateMessage,
  onDeleteMessage,
  isUpdatingMessage = false,
  isDeletingMessage = false,
}: MessageItemProps) {
  const params = useParams();
  const classId = params.id as string;
  
  const [isEditing, setIsEditing] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const isMentioned = message.mentionsMe;
  const isAIAssistant = message.senderId === 'AI_ASSISTANT';
  
  const senderDisplayName = message.sender.profile?.displayName || message.sender.username;
  const senderAvatar = message.sender.profile?.profilePicture || "";

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = (content: string, mentionedUserIds: string[]) => {
    if (onUpdateMessage) {
      onUpdateMessage(message.id, content, mentionedUserIds);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleDelete = (messageId: string) => {
    if (onDeleteMessage) {
      onDeleteMessage(messageId);
    }
  };

  // Handle preview modal actions
  const handlePreviewAction = async (action: string, file: FileItem) => {
    if (action === 'download') {
      const attachment = message.attachments?.find(a => a.id === file.id);
      if (attachment && 'data' in attachment) {
        const blob = new Blob([atob(attachment.data as string)], { type: attachment.type });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = attachment.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } else if (action === 'share') {
      // Handle share
      console.log('Share file:', file);
    }
  };

  // File handlers for attachments (read-only)
  const fileHandlers: FileHandlers = {
    ...baseFileHandler,
    onFolderClick: () => {},
    onDownload: async (item: FileItem) => {
      // Handle download
      const attachment = message.attachments?.find(a => a.id === item.id);
      if (attachment && 'data' in attachment) {
        // If attachment has base64 data, download it
        const blob = new Blob([atob(attachment.data as string)], { type: attachment.type });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = attachment.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    },
  };

  return (
    <div
      className={cn(
        "flex space-x-3 group relative hover:bg-muted px-4 py-1 transition-colors",
        isMentioned && "bg-yellow-500/10 hover:bg-yellow-500/20 border-l-2 border-yellow-500",
        isAIAssistant && "bg-primary/5 hover:bg-primary/10 border-l-2 border-primary/30",
      )}
    >
      {/* Avatar */}

      {isAIAssistant ? (
        <UserProfilePicture profilePicture="/ai-icon.png" username="AI Assistant" />
      ) : (
        <UserProfilePicture profilePicture={senderAvatar || ""} username={senderDisplayName || ""} />
      )}
      
      <div className="flex-1 min-w-0">
        {/* Message Header */}
        {showAvatar && (
          <div className="flex items-baseline space-x-2 mb-0.5">
            <span className={cn(
              "font-semibold text-sm hover:underline cursor-pointer",
              isAIAssistant ? "text-primary" : "text-foreground"
            )}>
              {isAIAssistant ? "Newton AI" : senderDisplayName}
            </span>
            {isAIAssistant && (
              <Badge variant="outline" className="text-xs h-4 px-1 bg-primary/10 text-primary border-primary/20">
                <Sparkles className="h-2 w-2 mr-1" />
                AI
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatMessageTime(new Date(message.createdAt))}
            </span>
            {isMentioned && (
              <Badge variant="secondary" className="text-xs h-4 px-1 bg-yellow-500/20 text-yellow-700 border-yellow-500/30">
                mentioned you
              </Badge>
            )}
          </div>
        )}
        
        {/* Message Content */}
        {isEditing && !isAIAssistant ? (
          <MessageEdit
            initialContent={message.content}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
            conversationMembers={conversationMembers}
            currentUserId={currentUserId}
            isUpdating={isUpdatingMessage}
          />
        ) : (
          <div className="flex items-start justify-between w-full">
            <div className={cn(
              "text-sm leading-relaxed text-foreground flex-1 min-w-0 pr-2",
            )}>
              {isAIAssistant ? (
                <AIMarkdown content={message.content} />
              ) : (
                renderMessageContent(message.content, message.mentions)
              )}
            </div>
            
            {/* Message Actions and Timestamp */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              {/* Timestamp for grouped messages */}
              {!showAvatar && (
                <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatMessageTime(new Date(message.createdAt))}
                </span>
              )}
              
              {/* Message Actions */}
              {!isAIAssistant && (
                <MessageActions
                  messageId={message.id}
                  currentUserId={currentUserId}
                  senderId={message.senderId}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isDeleting={isDeletingMessage}
                />
              )}
            </div>
          </div>
        )}
        
        {/* File Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-3">
            <DndProvider backend={HTML5Backend}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {convertAttachmentsToFileItems(message.attachments).map((fileItem) => (
                  <Attachment
                    key={fileItem.id}
                    fileItem={fileItem}
                    />
                ))}
              </div>
            </DndProvider>
          </div>
        )}
        
        {/* AI Suggested Content (Assignments, Worksheets, Sections) */}
        {isAIAssistant && (
          <AISuggestedContent meta={message.meta} classId={classId} />
        )}
      </div>
      
      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onAction={handlePreviewAction}
      />
    </div>
  );
}
