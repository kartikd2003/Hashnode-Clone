import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "../services/engagementService";

const commentId = (comment) => comment._id || comment.id;

// Groups a flat comment list into top-level comments + their replies.
// Threading is single-level: every reply's parentComment already points
// at a top-level comment (the backend flattens reply-to-reply), so this
// is a simple one-pass grouping, not a general tree builder.
const buildThreads = (comments) => {
  const topLevel = [];
  const repliesByParent = new Map();

  for (const comment of comments) {
    const parentId = comment.parentComment
      ? String(comment.parentComment)
      : null;

    if (!parentId) {
      topLevel.push(comment);
      continue;
    }

    if (!repliesByParent.has(parentId)) {
      repliesByParent.set(parentId, []);
    }

    repliesByParent.get(parentId).push(comment);
  }

  // Replies read most naturally oldest-first (a conversation, top to
  // bottom), even though top-level threads stay newest-first.
  for (const replies of repliesByParent.values()) {
    replies.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }

  return { topLevel, repliesByParent };
};

const CommentSection = ({ postId }) => {
  if (!postId) {
    return null;
  }

  const { user, isAuthenticated } = useAuth();

  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const loadComments = async () => {
    try {
      const data = await getComments(postId);

      if (data.success) {
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  const submitComment = async (event) => {
    event.preventDefault();

    if (!content.trim()) return;

    try {
      setSubmitting(true);

      const data = await createComment(postId, content);

      if (data.success) {
        setComments((current) => [data.comment, ...current]);
        setContent("");
      }
    } catch (error) {
      console.error("Failed to create comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const submitReply = async (parentId) => {
    if (!replyText.trim()) return;

    try {
      setReplySubmitting(true);

      const data = await createComment(postId, replyText, parentId);

      if (data.success) {
        setComments((current) => [...current, data.comment]);
        setReplyingToId(null);
        setReplyText("");
      }
    } catch (error) {
      console.error("Failed to create reply:", error);
    } finally {
      setReplySubmitting(false);
    }
  };

  const saveEdit = async (id) => {
    if (!editingText.trim()) return;

    try {
      const data = await updateComment(id, editingText);

      if (data.success) {
        setComments((current) =>
          current.map((comment) =>
            commentId(comment) === id ? data.comment : comment
          )
        );

        setEditingId(null);
        setEditingText("");
      }
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  const removeComment = async (id) => {
    if (!window.confirm("Delete this comment?")) {
      return;
    }

    try {
      const data = await deleteComment(id);

      if (data.success) {
        // Deleting a top-level comment also drops its replies from view
        // (they'd be orphaned — the backend keeps them, but there's
        // nothing sensible to show them attached to anymore).
        setComments((current) =>
          current.filter(
            (comment) =>
              commentId(comment) !== id &&
              String(comment.parentComment) !== id
          )
        );
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const renderCommentBody = (comment, { isReply }) => {
    const id = commentId(comment);
    const authorId = comment.author?._id || comment.author?.id;
    const isOwner = user?.id === authorId || user?._id === authorId;
    const isEditing = editingId === id;
    const isReplying = replyingToId === id;

    return (
      <article
        key={id}
        className={
          isReply ? "comment-card comment-card--reply" : "comment-card"
        }
      >
        <div className="comment-header">
          <div className="comment-author">
            <span className="comment-avatar">
              {comment.author?.avatar ? (
                <img src={comment.author.avatar} alt={comment.author.name} />
              ) : (
                comment.author?.name?.charAt(0).toUpperCase()
              )}
            </span>

            <div>
              {authorId ? (
                <Link to={`/profile/${authorId}`}>
                  {comment.author?.name}
                </Link>
              ) : (
                <strong>{comment.author?.name}</strong>
              )}

              <small>
                {new Date(comment.createdAt).toLocaleDateString()}
              </small>
            </div>
          </div>
        </div>

        {isEditing ? (
          <div className="comment-edit">
            <textarea
              value={editingText}
              onChange={(event) => setEditingText(event.target.value)}
              rows={3}
            />

            <div>
              <button type="button" onClick={() => saveEdit(id)}>
                Save
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setEditingText("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="comment-content">{comment.content}</p>
        )}

        {!isEditing && (
          <div className="comment-actions">
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  setReplyingToId(isReplying ? null : id);
                  setReplyText("");
                }}
              >
                {isReplying ? "Cancel" : "Reply"}
              </button>
            )}

            {isOwner && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(id);
                    setEditingText(comment.content);
                  }}
                >
                  Edit
                </button>

                <button type="button" onClick={() => removeComment(id)}>
                  Delete
                </button>
              </>
            )}
          </div>
        )}

        {isReplying && (
          <div className="comment-form comment-reply-form">
            <textarea
              value={replyText}
              onChange={(event) => setReplyText(event.target.value)}
              placeholder={`Reply to ${comment.author?.name || "this comment"}...`}
              rows={3}
              maxLength={2000}
            />

            <button
              type="button"
              onClick={() => submitReply(id)}
              disabled={replySubmitting || !replyText.trim()}
            >
              {replySubmitting ? "Posting..." : "Post Reply"}
            </button>
          </div>
        )}
      </article>
    );
  };

  const { topLevel, repliesByParent } = buildThreads(comments);

  return (
    <section className="comments-section">
      <h2>Comments ({comments.length})</h2>

      {isAuthenticated ? (
        <form className="comment-form" onSubmit={submitComment}>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write a comment..."
            rows={4}
            maxLength={2000}
          />

          <button
            type="submit"
            disabled={submitting || !content.trim()}
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <p className="comment-login">
          <Link to="/login">Login</Link> to join the discussion.
        </p>
      )}

      {loading ? (
        <LoadingSpinner text="Loading comments..." />
      ) : topLevel.length === 0 ? (
        <p className="comments-empty">
          No comments yet. Be the first to comment.
        </p>
      ) : (
        <div className="comments-list">
          {topLevel.map((comment) => {
            const id = commentId(comment);
            const replies = repliesByParent.get(id) || [];

            return (
              <div className="comment-thread" key={id}>
                {renderCommentBody(comment, { isReply: false })}

                {replies.length > 0 && (
                  <div className="comment-replies">
                    {replies.map((reply) =>
                      renderCommentBody(reply, { isReply: true })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CommentSection;
