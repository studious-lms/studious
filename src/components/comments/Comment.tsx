"use client";

import { useState, useCallback, memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Reply, 
  Send, 
  X,
  Loader2,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { RouterOutputs, trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { ReactionButton } from "@/components/reactions/ReactionButton";
import { Skeleton } from "../ui/skeleton";

interface CommentProps {
  comment: { id: string; };
  onUpdate?: () => void;
  showReplies?: boolean;
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, "h:mm a");
  } catch {
    return "";
  }
}

export default memo(function Comment({
  comment,
  onUpdate,
  showReplies: initialShowReplies = false,
}: CommentProps) {
  const currentUserId = useSelector((state: RootState) => state.app.user.id);
  const isTeacher = useSelector((state: RootState) => state.app.user.teacher);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(initialShowReplies);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyText, setEditReplyText] = useState("");

  // Fetch the comment itself (which includes replies) - much simpler!
  const { data: commentData, refetch: refetchComment } = trpc.comment.get.useQuery(
    {
      id: comment.id,
    },
    {
      enabled: !!comment.id,
      staleTime: 30000, // Cache for 30 seconds
    }
  );

  // Use fetched comment data if available, otherwise fall back to prop
  const currentComment = commentData;
 
  const replies = trpc.comment.getReplies.useQuery({
    commentId: comment.id,
  });

  const replyCount = replies.data?.length || 0;

  // Mutations
  
  // Use announcement endpoints for update/delete since comment router doesn't have them
  const updateCommentMutation = trpc.announcement.updateComment.useMutation({
    onSuccess: () => {
      toast.success("Comment updated");
      setIsEditing(false);
      setEditText("");
      onUpdate?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update comment");
    },
  });

  const deleteCommentMutation = trpc.announcement.deleteComment.useMutation({
    onSuccess: () => {
      toast.success("Comment deleted");
      onUpdate?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete comment");
    },
  });

  // Use comment.replyToComment for replies
  const addReplyMutation = trpc.comment.replyToComment.useMutation({
    onSuccess: () => {
      toast.success("Reply added");
      setReplyText("");
      setIsReplying(false);
      refetchComment(); // Refetch the comment itself to get updated replies
      onUpdate?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add reply");
    },
  });

  const updateReplyMutation = trpc.announcement.updateComment.useMutation({
    onSuccess: () => {
      toast.success("Reply updated");
      setEditingReplyId(null);
      setEditReplyText("");
      refetchComment(); // Refetch the comment itself to get updated replies
      onUpdate?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update reply");
    },
  });

  const deleteReplyMutation = trpc.announcement.deleteComment.useMutation({
    onSuccess: () => {
      toast.success("Reply deleted");
      refetchComment(); // Refetch the comment itself to get updated replies
      onUpdate?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete reply");
    },
  });

  const canEdit = currentComment && currentComment.author.id === currentUserId;
  const canDelete = currentComment && currentComment.author.id === currentUserId || isTeacher;
  // Handle different comment type structures - some have createdAt, some don't
  const createdAt = currentComment?.createdAt;
  const modifiedAt = currentComment && currentComment.modifiedAt;
  const isModified = modifiedAt && createdAt && 
    new Date(modifiedAt).getTime() !== new Date(createdAt).getTime();

  const handleStartEdit = useCallback(() => {
    setEditText(currentComment && currentComment.content || "");
    setIsEditing(true);
  }, [currentComment && currentComment.content]);

  const handleSaveEdit = useCallback(() => {
    if (!editText.trim() || !currentComment || !currentComment.id) return;
    updateCommentMutation.mutate({
      id: currentComment.id,
      content: editText.trim(),
    });
  }, [editText, updateCommentMutation, currentComment && currentComment.id]);

  const handleDelete = useCallback(() => {
    if (confirm("Are you sure you want to delete this comment?") && currentComment && currentComment.id) {
      deleteCommentMutation.mutate({ 
        id: currentComment.id,
      });
    }
  }, [deleteCommentMutation, currentComment && currentComment.id]);

  const handleAddReply = useCallback(() => {
    if (!replyText.trim() || !currentComment || !currentComment.id) return;
    addReplyMutation.mutate({
      content: replyText.trim(),
      parentCommentId: currentComment.id,
    });
  }, [replyText, addReplyMutation, currentComment && currentComment.id]);

  const handleStartEditReply = useCallback((replyId: string, content: string) => {
    setEditingReplyId(replyId);
    setEditReplyText(content);
  }, []);

  const handleSaveReplyEdit = useCallback((replyId: string) => {
    if (!editReplyText.trim()) return;
    updateReplyMutation.mutate({
      id: replyId,
      content: editReplyText.trim(),
    });
  }, [editReplyText, updateReplyMutation]);

  const handleDeleteReply = useCallback((replyId: string) => {
    if (confirm("Are you sure you want to delete this reply?")) {
      deleteReplyMutation.mutate({ 
        id: replyId,
      });
    }
  }, [deleteReplyMutation]);
  if (!currentComment) return <Skeleton className="h-7 w-7 flex-shrink-0" />;

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <Avatar className="h-7 w-7 flex-shrink-0">
          <AvatarImage src={currentComment.author.id === 'AI_ASSISTANT' ? '/ai-icon.png' : (currentComment && currentComment.author?.profile?.profilePicture || "")} />
          <AvatarFallback className="text-xs">
            {currentComment && currentComment.author?.username?.substring(0, 2).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium">{currentComment && currentComment.author?.profile?.displayName || currentComment && currentComment.author?.username || "Unknown"}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(createdAt)}
              </p>
              {isModified && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
            </div>
            {(canEdit || canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEdit && (
                    <DropdownMenuItem onClick={handleStartEdit}>
                      <Edit className="h-3 w-3 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem 
                      onClick={handleDelete}
                      className="text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="min-h-[60px] resize-none text-sm"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSaveEdit} className="h-7 text-xs" disabled={updateCommentMutation.isPending}>
                  {updateCommentMutation.isPending ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3 mr-1" />
                  )}
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setEditText(""); }} className="h-7 text-xs">
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs whitespace-pre-wrap leading-relaxed">{currentComment && currentComment.content}</p>
              <div className="flex items-center gap-2 mt-1">
                  <ReactionButton
                    commentId={currentComment && currentComment.id}
                    size="sm"
                  />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={() => setIsReplying(!isReplying)}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
                {replyCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={() => setShowReplies(!showReplies)}
                  >
                    {showReplies ? (
                      <ChevronDown className="h-3 w-3 mr-1" />
                    ) : (
                      <ChevronRight className="h-3 w-3 mr-1" />
                    )}
                    {replyCount} {replyCount !== 1 ? 'replies' : 'reply'}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Inline Reply Form */}
      {isReplying && (
        <div className="ml-9 mt-2 space-y-2">
          <Textarea
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="min-h-[60px] resize-none text-sm"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleAddReply}
              disabled={!replyText.trim() || addReplyMutation.isPending}
              className="h-7 text-xs"
            >
              {addReplyMutation.isPending ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Send className="h-3 w-3 mr-1" />
              )}
              Reply
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setIsReplying(false); setReplyText(""); }}
              className="h-7 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Nested Replies */}
      {showReplies && replyCount > 0 && (
        <div className="ml-9 mt-2 space-y-3 border-l-2 border-muted pl-4">
          {replies.data?.map((reply) => {
            const canEditReply = reply.author.id === currentUserId;
            const canDeleteReply = reply && reply.author.id === currentUserId || isTeacher;
            const replyCreatedAt = reply && reply.createdAt;
            const replyModifiedAt = reply && reply.modifiedAt;
            const isReplyModified = replyModifiedAt && replyCreatedAt && 
              new Date(replyModifiedAt).getTime() !== new Date(replyCreatedAt).getTime();
            const isEditingThisReply = editingReplyId === reply.id;

            return (
              <div key={reply.id} className="space-y-2">
                <div className="flex items-start gap-2">
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarImage src={reply.author?.profile?.profilePicture || ""} />
                    <AvatarFallback className="text-xs">
                      {reply.author?.profile?.displayName?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium">{reply.author.profile?.displayName || reply.author?.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(reply.createdAt)}
                        </p>
                        {isReplyModified && (
                          <span className="text-xs text-muted-foreground">(edited)</span>
                        )}
                      </div>
                      {(canEditReply || canDeleteReply) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canEditReply && (
                              <DropdownMenuItem onClick={() => handleStartEditReply(reply.id, reply.content)}>
                                <Edit className="h-3 w-3 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {canDeleteReply && (
                              <DropdownMenuItem 
                                onClick={() => handleDeleteReply(reply.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    
                    {isEditingThisReply ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editReplyText}
                          onChange={(e) => setEditReplyText(e.target.value)}
                          className="min-h-[60px] resize-none text-sm"
                          autoFocus
                        />
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleSaveReplyEdit(reply.id)} 
                            className="h-7 text-xs"
                            disabled={updateReplyMutation.isPending}
                          >
                            {updateReplyMutation.isPending ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <Send className="h-3 w-3 mr-1" />
                            )}
                            Save
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => { setEditingReplyId(null); setEditReplyText(""); }} 
                            className="h-7 text-xs"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs whitespace-pre-wrap leading-relaxed">{reply.content}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
