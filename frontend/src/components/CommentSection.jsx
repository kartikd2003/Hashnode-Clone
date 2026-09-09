import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "../services/engagementService";

const CommentSection = ({ postId }) => {
  if (!postId) {
    return null;
  }
  
  const { user, isAuthenticated } = useAuth();

  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [editingText, setEditingText] =
    useState("");

  const loadComments = async () => {
    try {
      const data = await getComments(postId);

      if (data.success) {
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error(
        "Failed to load comments:",
        error
      );
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

      const data = await createComment(
        postId,
        content
      );

      if (data.success) {
        setComments((current) => [
          data.comment,
          ...current,
        ]);

        setContent("");
      }
    } catch (error) {
      console.error(
        "Failed to create comment:",
        error
      );
    } finally {
      setSubmitting(false);
    }
  };

  const saveEdit = async (commentId) => {
    if (!editingText.trim()) return;

    try {
      const data = await updateComment(
        commentId,
        editingText
      );

      if (data.success) {
        setComments((current) =>
          current.map((comment) =>
            comment._id === commentId
              ? data.comment
              : comment
          )
        );

        setEditingId(null);
        setEditingText("");
      }
    } catch (error) {
      console.error(
        "Failed to update comment:",
        error
      );
    }
  };

  const removeComment = async (
    commentId
  ) => {
    if (
      !window.confirm(
        "Delete this comment?"
      )
    ) {
      return;
    }

    try {
      const data =
        await deleteComment(commentId);

      if (data.success) {
        setComments((current) =>
          current.filter(
            (comment) =>
              comment._id !== commentId
          )
        );
      }
    } catch (error) {
      console.error(
        "Failed to delete comment:",
        error
      );
    }
  };

  return (
    <section className="comments-section">
      <h2>
        Comments ({comments.length})
      </h2>

      {isAuthenticated ? (
        <form
          className="comment-form"
          onSubmit={submitComment}
        >
          <textarea
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            placeholder="Write a comment..."
            rows={4}
            maxLength={2000}
          />

          <button
            type="submit"
            disabled={
              submitting ||
              !content.trim()
            }
          >
            {submitting
              ? "Posting..."
              : "Post Comment"}
          </button>
        </form>
      ) : (
        <p className="comment-login">
          <Link to="/login">
            Login
          </Link>{" "}
          to join the discussion.
        </p>
      )}

      {loading ? (
        <p>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="comments-empty">
          No comments yet. Be the first to
          comment.
        </p>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => {
            const authorId =
              comment.author?._id ||
              comment.author?.id;

            const isOwner =
              user?.id === authorId ||
              user?._id === authorId;

            return (
              <article
                key={comment._id}
                className="comment-card"
              >
                <div className="comment-header">
                  <div className="comment-author">
                    {comment.author?.avatar ? (
                      <img
                        src={
                          comment.author.avatar
                        }
                        alt={
                          comment.author.name
                        }
                      />
                    ) : (
                      comment.author?.name
                        ?.charAt(0)
                        .toUpperCase()
                    )}

                    <div>
                      {authorId ? (
                        <Link
                          to={`/profile/${authorId}`}
                        >
                          {
                            comment.author
                              ?.name
                          }
                        </Link>
                      ) : (
                        <strong>
                          {
                            comment.author
                              ?.name
                          }
                        </strong>
                      )}

                      <small>
                        {new Date(
                          comment.createdAt
                        ).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                </div>

                {editingId ===
                  comment._id ? (
                  <div className="comment-edit">
                    <textarea
                      value={editingText}
                      onChange={(event) =>
                        setEditingText(
                          event.target.value
                        )
                      }
                      rows={3}
                    />

                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          saveEdit(
                            comment._id
                          )
                        }
                      >
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
                  <p className="comment-content">
                    {comment.content}
                  </p>
                )}

                {isOwner &&
                  editingId !==
                  comment._id && (
                    <div className="comment-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(
                            comment._id
                          );
                          setEditingText(
                            comment.content
                          );
                        }}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeComment(
                            comment._id
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CommentSection;