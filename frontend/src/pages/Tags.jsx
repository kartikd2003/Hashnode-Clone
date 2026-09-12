import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { getTags } from "../services/postService";

const Tags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTags = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTags();

      if (!data.success) {
        setError(data.message || "Unable to load tags.");
        return;
      }

      setTags(data.tags || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load tags. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading tags..." />;
  }

  if (error) {
    return (
      <section className="page-container error-page">
        <div className="page-header">
          <h1>Tags unavailable</h1>
        </div>
        <ErrorMessage message={error} onRetry={loadTags} />
        <Link className="back-link" to="/">
          ← Back to feed
        </Link>
      </section>
    );
  }

  return (
    <section className="page-container tags-page">
      <div className="page-header">
        <div>
          <h1>Explore Tags</h1>
          <p>Discover posts by topic.</p>
        </div>
      </div>

      {tags.length === 0 ? (
        <div className="empty-state">
          <h2>No tags yet</h2>
          <p>Tags will appear here when they are created.</p>
        </div>
      ) : (
        <div className="tag-grid">
          {tags.map((tag) => (
            <Link
              key={tag._id || tag.id}
              to={`/tag/${tag.slug}`}
              className="tag-card"
            >
              <h2>#{tag.name}</h2>
              <p>
                {tag.postCount || 0}{" "}
                {tag.postCount === 1 ? "post" : "posts"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default Tags;