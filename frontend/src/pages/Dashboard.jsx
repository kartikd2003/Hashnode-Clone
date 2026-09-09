import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getMyPosts,
  publishPost,
  unpublishPost,
  deletePost,
} from "../services/postService";

import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyPosts();

      setPosts(response.posts || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load your posts."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const publishedPosts = posts.filter(
    (post) => post.status === "published"
  );

  const draftPosts = posts.filter(
    (post) => post.status === "draft"
  );

  const handlePublish = async (id) => {
    try {
      setError("");

      await publishPost(id);
      await loadPosts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to publish post."
      );
    }
  };

  const handleUnpublish = async (id) => {
    try {
      setError("");

      await unpublishPost(id);
      await loadPosts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to unpublish post."
      );
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await deletePost(id);
      await loadPosts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete post."
      );
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <section className="dashboard-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            AUTHOR DASHBOARD
          </span>

          <h1>
            Welcome back 👋
          </h1>

          <p>
            Manage your articles, drafts, and published posts.
          </p>
        </div>

        <Link
          to="/posts/new"
          className="dashboard-create-button"
        >
          ＋ Write Post
        </Link>
      </div>

      {error && (
        <ErrorMessage message={error} />
      )}

      {/* =========================
          STATISTICS
      ========================= */}

      <div className="dashboard-stats">

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">
            ✦
          </div>

          <div>
            <span>Total Posts</span>
            <strong>{posts.length}</strong>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">
            ✓
          </div>

          <div>
            <span>Published</span>
            <strong>
              {publishedPosts.length}
            </strong>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">
            ◷
          </div>

          <div>
            <span>Drafts</span>
            <strong>
              {draftPosts.length}
            </strong>
          </div>
        </div>

      </div>

      {/* =========================
          POSTS
      ========================= */}

      <div className="dashboard-content">

        <div className="dashboard-content-header">
          <div>
            <h2>My Posts</h2>

            <p>
              Create, edit, publish, or remove your articles.
            </p>
          </div>

          <span className="post-count">
            {posts.length}{" "}
            {posts.length === 1 ? "post" : "posts"}
          </span>
        </div>

        {/* EMPTY STATE */}

        {posts.length === 0 ? (
          <div className="dashboard-empty">

            <div className="empty-icon">
              ✍️
            </div>

            <h3>
              No posts yet
            </h3>

            <p>
              You haven't written anything yet.
              Start sharing your ideas with the community.
            </p>

            <Link
              to="/posts/new"
              className="dashboard-create-button"
            >
              ＋ Create Your First Post
            </Link>

          </div>
        ) : (

          /* POSTS LIST */

          <div className="dashboard-list">

            {posts.map((post) => {
              const postId = post._id || post.id;

              return (
                <article
                  className="dashboard-card"
                  key={postId}
                >

                  {/* POST INFORMATION */}

                  <div className="dashboard-post-main">

                    <div className="dashboard-post-status-row">

                      <span
                        className={`dashboard-status ${post.status}`}
                      >
                        <span className="status-dot"></span>

                        {post.status}
                      </span>

                      <span className="dashboard-post-date">
                        Updated{" "}
                        {new Date(
                          post.updatedAt ||
                            post.createdAt
                        ).toLocaleDateString()}
                      </span>

                    </div>

                    {/* TITLE */}

                    <h3>
                      {post.status === "published" ? (
                        <Link
                          to={`/post/${post.slug}`}
                        >
                          {post.title}
                        </Link>
                      ) : (
                        post.title
                      )}
                    </h3>

                    {/* EXCERPT */}

                    {post.excerpt && (
                      <p className="dashboard-post-excerpt">
                        {post.excerpt}
                      </p>
                    )}

                    {/* META */}

                    <div className="dashboard-post-footer">

                      <span>
                        👁 {post.views || 0} views
                      </span>

                      {post.tags?.length > 0 && (
                        <div className="dashboard-post-tags">

                          {post.tags
                            .slice(0, 3)
                            .map((tag) => (
                              <span key={tag}>
                                #{tag.name || tag}
                              </span>
                            ))}

                        </div>
                      )}

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="dashboard-actions">

                    <Link
                      to={`/posts/${postId}/edit`}
                      className="dashboard-action edit"
                    >
                      Edit
                    </Link>

                    {post.status === "published" ? (
                      <button
                        type="button"
                        className="dashboard-action"
                        onClick={() =>
                          handleUnpublish(postId)
                        }
                      >
                        Unpublish
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="dashboard-action publish"
                        onClick={() =>
                          handlePublish(postId)
                        }
                      >
                        Publish
                      </button>
                    )}

                    <button
                      type="button"
                      className="dashboard-action delete"
                      onClick={() =>
                        handleDelete(postId)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </div>

    </section>
  );
}

export default Dashboard;