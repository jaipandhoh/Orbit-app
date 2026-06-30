import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trash2, Send, MessageSquare } from 'lucide-react';
import { Avatar, Button } from './ui';
import { Textarea } from './ui';
import { useToast } from '../ToastProvider';

const CURRENT_USER = { id: '1', name: 'Solo User' };

function timeAgo(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const CommentsThread = ({ entityType, entityId }) => {
  const { toast } = useToast();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const threadRef = useRef(null);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?entity_type=${entityType}&entity_id=${entityId}`);
      if (!res.ok) throw new Error('Failed to load comments');
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    setLoading(true);
    fetchComments();
  }, [fetchComments]);

  const scrollToBottomIfNeeded = useCallback(() => {
    const el = threadRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const isBottomBelowViewport = rect.bottom > window.innerHeight;
    if (isBottomBelowViewport) {
      el.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, []);

  const handleSubmit = async () => {
    const body = newComment.trim();
    if (!body || submitting) return;

    // Optimistic append
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      comment_id: tempId,
      entity_type: entityType,
      entity_id: entityId,
      author_id: CURRENT_USER.id,
      author_name: CURRENT_USER.name,
      body,
      created_at: new Date().toISOString(),
    };
    setComments((prev) => [...prev, optimistic]);
    setNewComment('');
    setTimeout(scrollToBottomIfNeeded, 50);

    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity_type: entityType, entity_id: entityId, body }),
      });
      if (!res.ok) throw new Error('Failed to post comment');
      const saved = await res.json();
      // Reconcile: replace temp with real
      setComments((prev) => prev.map((c) => (c.comment_id === tempId ? saved : c)));
    } catch (err) {
      // Rollback
      setComments((prev) => prev.filter((c) => c.comment_id !== tempId));
      toast('Failed to post comment. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    const removed = comments.find((c) => c.comment_id === commentId);
    // Optimistic remove
    setComments((prev) => prev.filter((c) => c.comment_id !== commentId));

    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete comment');
    } catch (err) {
      // Restore
      setComments((prev) => {
        const restored = [...prev, removed].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        return restored;
      });
      toast('Failed to delete comment. Please try again.', 'error');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div ref={threadRef}>
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={16} className="text-ds-fg-muted" />
        <h3 className="text-sm font-semibold text-ds-fg">
          Comments
          {comments.length > 0 && (
            <span className="ml-1.5 text-xs font-medium text-ds-fg-muted">· {comments.length}</span>
          )}
        </h3>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-8 h-8 rounded-full bg-ds-bg-subtle shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-24 bg-ds-bg-subtle rounded" />
                <div className="h-3 w-full bg-ds-bg-subtle rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-ds-fg-muted py-4">No comments yet. Start the conversation.</p>
      ) : (
        <div className="space-y-4 mb-4">
          {comments.map((comment) => {
            const isOwn = comment.author_id === CURRENT_USER.id;
            return (
              <div key={comment.comment_id} className="flex gap-3 group">
                <Avatar name={comment.author_name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ds-fg">{comment.author_name}</span>
                    <span className="text-xs text-ds-fg-muted">{timeAgo(comment.created_at)}</span>
                    {isOwn && (
                      <button
                        onClick={() => handleDelete(comment.comment_id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-0.5 rounded hover:bg-red-50 text-ds-fg-subtle hover:text-red-500 cursor-pointer"
                        title="Delete comment"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-ds-fg mt-0.5 whitespace-pre-wrap break-words">{comment.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-2 items-end">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a comment..."
          rows={2}
          maxLength={5000}
          className="flex-1"
        />
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={!newComment.trim() || submitting}
        >
          <Send size={14} />
        </Button>
      </div>
    </div>
  );
};

export default CommentsThread;
