import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTags } from "../services/postService";

const Tags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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

    loadTags();
  }, []);

  if (loading) {
    return <p>Loading tags...</p>;
  }

  if (error) {
    return (
      <div className="error-page">
        <h1>Tags unavailable</h1>
        <p>{error}</p>
        <Link to="/">Back to feed</Link>
      </div>
    );
  }

  return (
    <section className="tags-page">
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