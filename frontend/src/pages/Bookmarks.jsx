import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { getMyBookmarks } from "../services/engagementService";

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyBookmarks();

      if (!data.success) {
        setError(data.message || "Unable to load bookmarks.");
        return;
      }

      setBookmarks(data.bookmarks || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load bookmarks."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading bookmarks..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadBookmarks} />;
  }

  return (
    <section className="page-container bookmarks-page">
      <div className="page-header">
        <div>
          <h1>My Bookmarks</h1>
          <p>Posts you saved for later.</p>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="empty-state">
          <h2>No bookmarks yet</h2>
          <p>Save interesting posts and find them here.</p>

          <Link to="/" className="primary-link">
            Explore Posts
          </Link>
        </div>
      ) : (
        <div className="bookmarks-list">
          {bookmarks.map((bookmark) => {
            const post = bookmark.post;

            if (!post) return null;

            return (
              <article key={bookmark._id} className="bookmark-card">
                {post.coverImage && (
                  <img src={post.coverImage} alt={post.title} />
                )}

                <div>
                  <h2>
                    <Link to={`/post/${post.slug}`}>{post.title}</Link>
                  </h2>

                  {post.excerpt && <p>{post.excerpt}</p>}

                  <small>{post.author?.name || "Unknown Author"}</small>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Bookmarks;
