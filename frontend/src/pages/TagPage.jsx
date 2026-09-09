import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../utils/api";
import PostList from "../components/PostList";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

const TagPage = () => {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTag = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(
        `/tags/${encodeURIComponent(slug)}/posts`
      );
      setData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load this tag right now."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTag();
  }, [slug]);

  if (loading) return <LoadingSpinner text="Loading tag..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadTag} />;

  const tag = data?.tag;
  const posts = data?.posts || [];

  return (
    <section className="page-container tag-page">
      <div className="page-header">
        <Link className="back-link" to="/">
          ← Back to feed
        </Link>
        <h1>#{tag?.name || slug}</h1>
        <p>{posts.length} published {posts.length === 1 ? "post" : "posts"}</p>
      </div>

      <PostList
        posts={posts}
        emptyMessage="No published posts use this tag yet."
      />
    </section>
  );
};

export default TagPage;
