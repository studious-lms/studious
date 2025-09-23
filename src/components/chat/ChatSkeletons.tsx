"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ConversationListSkeleton() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        
        {/* Search */}
        <Skeleton className="h-9 w-full rounded-md" />
      </div>

      {/* Conversations List */}
      <div className="p-2 space-y-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-full p-3 rounded-md">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MessageListSkeleton() {
  return (
    <div className="flex-1 flex flex-col relative bg-background min-h-0">
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => {
          const showAvatar = i === 0 || i === 3 || i === 6; // Simulate grouped messages
          return (
            <div key={i} className="flex space-x-3">
              {showAvatar ? (
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              ) : (
                <div className="w-10 flex-shrink-0" />
              )}
              
              <div className="flex-1 min-w-0">
                {showAvatar && (
                  <div className="flex items-center space-x-2 mb-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                )}
                
                <div className="space-y-1">
                  <Skeleton className={`h-4 ${i % 3 === 0 ? 'w-3/4' : i % 3 === 1 ? 'w-1/2' : 'w-2/3'}`} />
                  {i % 4 === 0 && <Skeleton className="h-4 w-1/3" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MessageInputSkeleton() {
  return (
    <div className="p-4 border-t border-border bg-background">
      <div className="flex space-x-3">
        <div className="flex-1 relative">
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function ChatHeaderSkeleton() {
  return (
    <div className="h-12 border-b border-border px-4 flex items-center justify-between bg-background flex-shrink-0">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}

export function ConversationPageSkeleton() {
  return (
    <div className="h-full bg-background flex flex-col">
      <ChatHeaderSkeleton />
      <MessageListSkeleton />
      <MessageInputSkeleton />
    </div>
  );
}
