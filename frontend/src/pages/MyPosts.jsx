import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  deletePost,
  getMyPosts,
  publishPost,
  unpublishPost,
} from "../services/postService";

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await getMyPosts();

      if (!data.success) {
        setError(data.message || "Unable to load your posts");
        return;
      }

      setPosts(data.posts);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your posts."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post permanently?")) return;

    try {
      const data = await deletePost(id);

      if (!data.success) {
        setError(data.message || "Unable to delete post");
        return;
      }

      setPosts((current) => current.filter((post) => post.id !== id));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete post."
      );
    }
  };

  const handlePublish = async (post) => {
    try {
      const data = post.status === "published"
        ? await unpublishPost(post.id)
        : await publishPost(post.id);

      if (!data.success) {
        setError(data.message || "Unable to change post status");
        return;
      }

      setPosts((current) =>
        current.map((item) =>
          item.id === post.id ? data.post : item
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to change post status."
      );
    }
  };

  if (loading) return <p>Loading your posts...</p>;

  return (
    <section className="my-posts-page">
      <div className="page-header">
        <div>
          <h1>My Posts</h1>
          <p>Manage your drafts and published posts.</p>
        </div>

        <Link to="/posts/new" className="primary-link">
          New Post
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {posts.length === 0 && (
        <div className="empty-state">
          <h2>No posts yet</h2>
          <Link to="/posts/new">Create your first post</Link>
        </div>
      )}

      <div className="dashboard-list">
        {posts.map((post) => (
          <article className="dashboard-card" key={post.id}>
            <div>
              <span className={`status ${post.status}`}>
                {post.status}
              </span>
              <h2>{post.title}</h2>
              <p>{post.excerpt}</p>
              <small>
                Updated{" "}
                {new Date(post.updatedAt).toLocaleString()}
              </small>
            </div>

            <div className="dashboard-actions">
              <Link to={`/posts/${post.id}/edit`}>Edit</Link>

              <button onClick={() => handlePublish(post)}>
                {post.status === "published"
                  ? "Unpublish"
                  : "Publish"}
              </button>

              <button
                className="danger-button"
                onClick={() => handleDelete(post.id)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default MyPosts;
