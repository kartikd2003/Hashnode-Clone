import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import {
  createPost,
  getPostForEdit,
  updatePost,
} from "../services/postService";

import { useAuth } from "../context/AuthContext";

const PostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const editing = Boolean(id);

  const storageKey = editing
    ? `hashnode-edit-draft-${id}`
    : "hashnode-new-post-draft";

  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    coverImage: "",
    tags: "",
    status: "draft",
  });

  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [hasUnsavedChanges, setHasUnsavedChanges] =
    useState(false);

  const [lastSaved, setLastSaved] = useState(null);

  /*
   * Load existing post
   */
  useEffect(() => {
    if (!editing) return;

    const loadPost = async () => {
      try {
        setLoading(true);
        setError("");

        const savedDraft = localStorage.getItem(storageKey);

        if (savedDraft) {
          try {
            const parsedDraft = JSON.parse(savedDraft);

            if (parsedDraft?.form) {
              setForm(parsedDraft.form);
              setHasUnsavedChanges(true);
              setLastSaved(
                parsedDraft.savedAt
                  ? new Date(parsedDraft.savedAt)
                  : null
              );

              setLoading(false);
              return;
            }
          } catch {
            localStorage.removeItem(storageKey);
          }
        }

        const data = await getPostForEdit(id);

        if (!data.success) {
          setError(
            data.message || "Unable to load post."
          );
          return;
        }

        setForm({
          title: data.post.title || "",
          content: data.post.content || "",
          excerpt: data.post.excerpt || "",
          coverImage: data.post.coverImage || "",
          tags: (data.post.tags || [])
            .map((tag) => (typeof tag === "string" ? tag : tag?.name))
            .filter(Boolean)
            .join(", "),
          status: data.post.status || "draft",
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load post."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [editing, id, storageKey]);

  /*
   * Restore new-post local draft
   */
  useEffect(() => {
    if (editing) return;

    const savedDraft = localStorage.getItem(storageKey);

    if (!savedDraft) return;

    try {
      const parsedDraft = JSON.parse(savedDraft);

      if (parsedDraft?.form) {
        setForm(parsedDraft.form);
        setHasUnsavedChanges(true);

        setLastSaved(
          parsedDraft.savedAt
            ? new Date(parsedDraft.savedAt)
            : null
        );
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [editing, storageKey]);

  /*
   * Handle input changes
   */
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setHasUnsavedChanges(true);
  };

  /*
   * Word / character / reading time
   */
  const wordCount = useMemo(() => {
    const text = form.content.trim();

    if (!text) return 0;

    return text.split(/\s+/).length;
  }, [form.content]);

  const characterCount = form.content.length;

  const readingTime = Math.max(
    1,
    Math.ceil(wordCount / 200)
  );

  /*
   * Tags
   */
  const parsedTags = useMemo(() => {
    return [
      ...new Set(
        form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      ),
    ].slice(0, 10);
  }, [form.tags]);

  /*
   * Local auto-save
   *
   * Saves 1 second after the user stops typing.
   */
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          form,
          savedAt: new Date().toISOString(),
        })
      );

      setLastSaved(new Date());
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    form,
    hasUnsavedChanges,
    storageKey,
  ]);

  /*
   * Browser close / refresh protection
   */
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [hasUnsavedChanges]);

  /*
   * Save to backend
   */
  const save = async (status) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    if (form.title.trim().length < 3) {
      setError(
        "Title must be at least 3 characters."
      );
      return;
    }

    if (!form.content.trim()) {
      setError("Content is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: form.title.trim(),
        content: form.content,
        excerpt: form.excerpt.trim(),
        coverImage: form.coverImage.trim(),
        tags: parsedTags,
        status,
      };

      const data = editing
        ? await updatePost(id, payload)
        : await createPost(payload);

      if (!data.success) {
        setError(
          data.message || "Unable to save post."
        );
        return;
      }

      // Remove local auto-save after backend save
      localStorage.removeItem(storageKey);

      setHasUnsavedChanges(false);
      setLastSaved(new Date());

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save post. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Clear local draft
   */
  const discardLocalDraft = () => {
    const confirmed = window.confirm(
      "Discard your locally saved draft?"
    );

    if (!confirmed) return;

    localStorage.removeItem(storageKey);

    setForm({
      title: "",
      content: "",
      excerpt: "",
      coverImage: "",
      tags: "",
      status: "draft",
    });

    setHasUnsavedChanges(false);
    setLastSaved(null);
  };

  /*
   * Login
   */
  const goToLogin = () => {
    sessionStorage.setItem(
      "pendingPost",
      JSON.stringify(form)
    );

    setShowAuthModal(false);

    navigate("/login", {
      state: {
        from: editing
          ? `/editor/${id}`
          : "/editor/new",
      },
    });
  };

  if (loading) {
    return (
      <section className="editor-page">
        <div className="editor-loading">
          Loading editor...
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="editor-page">
        <div className="page-header editor-header">
          <div>
            <span className="editor-eyebrow">
              {editing
                ? "EDIT ARTICLE"
                : "CREATE ARTICLE"}
            </span>

            <h1>
              {editing
                ? "Edit your post"
                : "Write something great"}
            </h1>

            <p>
              Write in Markdown and preview your article
              before publishing.
            </p>
          </div>

          <div className="editor-save-status">
            {hasUnsavedChanges ? (
              <>
                <span className="unsaved-dot"></span>
                Unsaved changes
              </>
            ) : (
              <>
                <span className="saved-dot"></span>
                All changes saved
              </>
            )}

            {lastSaved && (
              <small>
                Auto-saved{" "}
                {lastSaved.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </small>
            )}
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="editor-form">
          {/* TITLE */}
          <div className="editor-field">
            <label htmlFor="title">
              Title
            </label>

            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter an engaging title..."
              maxLength={200}
            />

            <span className="field-counter">
              {form.title.length}/200
            </span>
          </div>

          {/* EXCERPT */}
          <div className="editor-field">
            <label htmlFor="excerpt">
              Excerpt
              <span>Optional</span>
            </label>

            <textarea
              id="excerpt"
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              placeholder="Write a short description of your article..."
              maxLength={300}
              rows={3}
            />

            <span className="field-counter">
              {form.excerpt.length}/300
            </span>
          </div>

          {/* COVER */}
          <div className="editor-field">
            <label htmlFor="coverImage">
              Cover Image URL
              <span>Optional</span>
            </label>

            <input
              id="coverImage"
              name="coverImage"
              value={form.coverImage}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />

            {form.coverImage && (
              <div className="cover-preview">
                <img
                  src={form.coverImage}
                  alt="Cover preview"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* TAGS */}
          <div className="editor-field">
            <label htmlFor="tags">
              Tags
              <span>Maximum 10</span>
            </label>

            <input
              id="tags"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="javascript, mongodb, react"
            />

            {parsedTags.length > 0 && (
              <div className="editor-tag-preview">
                {parsedTags.map((tag) => (
                  <span key={tag}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* CONTENT */}
          <div className="editor-field">
            <div className="editor-content-header">
              <label htmlFor="content">
                Content
              </label>

              <div className="editor-tabs">
                <button
                  type="button"
                  className={
                    !showPreview ? "active" : ""
                  }
                  onClick={() =>
                    setShowPreview(false)
                  }
                >
                  Write
                </button>

                <button
                  type="button"
                  className={
                    showPreview ? "active" : ""
                  }
                  onClick={() =>
                    setShowPreview(true)
                  }
                >
                  Preview
                </button>
              </div>
            </div>

            {!showPreview ? (
              <textarea
                id="content"
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder={`# Hello Hashnode

Write your article here...

## Add a heading

You can use **bold**, *italic*, lists, links and code blocks.

\`\`\`javascript
const message = "Hello Hashnode";
console.log(message);
\`\`\`
`}
                rows={24}
              />
            ) : (
              <div className="markdown-preview">
                {form.content.trim() ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({
                        inline,
                        className,
                        children,
                        ...props
                      }) {
                        const match =
                          /language-(\w+)/.exec(
                            className || ""
                          );

                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                          >
                            {String(children).replace(
                              /\n$/,
                              ""
                            )}
                          </SyntaxHighlighter>
                        ) : (
                          <code
                            className={className}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {form.content}
                  </ReactMarkdown>
                ) : (
                  <div className="preview-empty">
                    Start writing to see the preview.
                  </div>
                )}
              </div>
            )}

            <div className="editor-stats">
              <span>
                {wordCount} words
              </span>

              <span>
                {characterCount} characters
              </span>

              <span>
                {readingTime} min read
              </span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="editor-actions">
            <div className="editor-secondary-actions">
              {hasUnsavedChanges && (
                <button
                  type="button"
                  className="editor-discard-button"
                  disabled={saving}
                  onClick={discardLocalDraft}
                >
                  Discard Local Draft
                </button>
              )}
            </div>

            <div className="editor-primary-actions">
              <button
                type="button"
                className="editor-draft-button"
                disabled={saving}
                onClick={() => save("draft")}
              >
                {saving
                  ? "Saving..."
                  : "Save Draft"}
              </button>

              <button
                type="button"
                className="editor-publish-button"
                disabled={saving}
                onClick={() =>
                  save("published")
                }
              >
                {saving
                  ? "Publishing..."
                  : "Publish"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div
          className="auth-modal-overlay"
          onClick={() =>
            setShowAuthModal(false)
          }
        >
          <div
            className="auth-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="auth-modal-icon">
              🔒
            </div>

            <h2>
              Authentication Required
            </h2>

            <p>
              You need to log in to save or publish
              a post.
            </p>

            <div className="auth-modal-actions">
              <button
                type="button"
                className="modal-cancel-button"
                onClick={() =>
                  setShowAuthModal(false)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="modal-login-button"
                onClick={goToLogin}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostEditor;