import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

  // Authentication popup state
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!editing) return;

    const loadPost = async () => {
      try {
        const data = await getPostForEdit(id);

        if (!data.success) {
          setError(data.message || "Unable to load post");
          return;
        }

        setForm({
          title: data.post.title || "",
          content: data.post.content || "",
          excerpt: data.post.excerpt || "",
          coverImage: data.post.coverImage || "",
          tags: (data.post.tags || []).join(", "),
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
  }, [editing, id]);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const save = async (status) => {
    // Show authentication popup instead of sending API request
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: form.title,
        content: form.content,
        excerpt: form.excerpt,
        coverImage: form.coverImage,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        status,
      };

      const data = editing
        ? await updatePost(id, payload)
        : await createPost(payload);

      if (!data.success) {
        setError(data.message || "Unable to save post");
        return;
      }

      navigate("/my-posts");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to save post. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const goToLogin = () => {
    // Save the current editor content before leaving the page
    sessionStorage.setItem(
      "pendingPost",
      JSON.stringify(form)
    );

    setShowAuthModal(false);

    // Tell login page where to return
    navigate("/login", {
      state: {
        from: "/posts/new",
      },
    });
  };

  if (loading) return <p>Loading editor...</p>;

  return (
    <>
      <section className="editor-page">
        <div className="page-header">
          <div>
            <h1>{editing ? "Edit Post" : "Create Post"}</h1>
            <p>
              Write in Markdown. You can save a draft or publish.
            </p>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="editor-form">
          <label>
            Title
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Post title"
              required
            />
          </label>

          <label>
            Excerpt
            <textarea
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              placeholder="Short description"
              rows={3}
            />
          </label>

          <label>
            Cover image URL
            <input
              name="coverImage"
              value={form.coverImage}
              onChange={handleChange}
              placeholder="https://..."
            />
          </label>

          <label>
            Tags
            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="javascript, mongodb, career"
            />
          </label>

          <label>
            Markdown content
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder={`# Hello Hashnode

Write your post here...`}
              rows={20}
              required
            />
          </label>

          <div className="editor-actions">
            <button
              type="button"
              disabled={saving}
              onClick={() => save("draft")}
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => save("published")}
            >
              {saving ? "Saving..." : "Publish"}
            </button>
          </div>
        </div>
      </section>

      {/* Authentication Required Modal */}
      {showAuthModal && (
        <div
          className="auth-modal-overlay"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="auth-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="auth-modal-icon">🔒</div>

            <h2>Authentication Required</h2>

            <p>
              You need to log in to save or publish a post.
            </p>

            <div className="auth-modal-actions">
              <button
                type="button"
                className="modal-cancel-button"
                onClick={() => setShowAuthModal(false)}
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