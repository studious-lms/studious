"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  User, 
  Copy, 
  Download, 
  Image, 
  FileVideo, 
  File,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  files?: FileAttachment[];
  generatedContent?: {
    type: 'worksheet' | 'presentation' | 'assignment' | 'course';
    title: string;
    preview: string;
  };
}

interface ChatMessageProps {
  message: Message;
  onCopy?: (content: string) => void;
  onDownload?: (content: any) => void;
  onFeedback?: (messageId: string, type: 'like' | 'dislike') => void;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return FileVideo;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function ChatMessage({ message, onCopy, onDownload, onFeedback }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex gap-3 group",
        message.type === 'user' ? "justify-end" : "justify-start"
      )}
    >
      {message.type === 'ai' && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-3",
          message.type === 'user'
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm flex-1">{message.content}</p>
          
          {/* Action buttons for AI messages */}
          {message.type === 'ai' && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onCopy?.(message.content)}
              >
                <Copy className="h-3 w-3" />
              </Button>
              {message.generatedContent && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onDownload?.(message.generatedContent)}
                >
                  <Download className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
        
        {/* Generated content preview */}
        {message.generatedContent && (
          <div className="mt-3 p-3 bg-background/50 rounded-md border">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {message.generatedContent.type}
              </Badge>
              <span className="font-medium text-sm">{message.generatedContent.title}</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-3">
              {message.generatedContent.preview}
            </p>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" className="h-7 text-xs">
                View Full Content
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs">
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        )}
        
        {/* File attachments */}
        {message.files && message.files.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.files.map((file) => {
              const FileIcon = getFileIcon(file.type);
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-2 p-2 bg-background/50 rounded text-xs"
                >
                  <FileIcon className="h-4 w-4" />
                  <span className="flex-1 truncate">{file.name}</span>
                  <span className="text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs opacity-70">
            {message.timestamp.toLocaleTimeString()}
          </p>
          
          {/* Feedback buttons for AI messages */}
          {message.type === 'ai' && onFeedback && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onFeedback(message.id, 'like')}
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onFeedback(message.id, 'dislike')}
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {message.type === 'user' && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
