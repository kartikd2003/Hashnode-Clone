import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PostCard from "../components/PostCard";
import { getPosts } from "../services/postService";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPosts({
        search,
        page,
        limit: 10,
      });

      if (!data.success) {
        setError(data.message || "Unable to load posts");
        return;
      }

      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load posts. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [page]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    loadPosts();
  };

  return (
    <section className="feed-page">
      <div className="page-header">
        <div>
          <h1>Developer Feed</h1>
          <p>Discover the latest published posts.</p>
        </div>

        <Link to="/posts/new" className="primary-link">
          Write a post
        </Link>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search posts..."
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p>Loading posts...</p>}

      {error && <div className="error-message">{error}</div>}

      {!loading && !error && posts.length === 0 && (
        <div className="empty-state">
          <h2>No posts found</h2>
          <p>Try another search or create the first post.</p>
        </div>
      )}

      <div className="post-list">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={pagination.page <= 1}
            onClick={() => setPage((value) => value - 1)}
          >
            Previous
          </button>

          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default Feed;
