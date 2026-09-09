import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../utils/api";
import PostList from "../components/PostList";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

const PublicProfile = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/users/${encodeURIComponent(id)}`);
      setData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load this profile right now."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading profile..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadProfile} />;

  const user = data?.user;
  const posts = data?.posts || [];

  return (
    <section className="page-container profile-page">
      <div className="profile-header">
        <Link className="back-link" to="/">
          ← Back to feed
        </Link>

        <div className="profile-header__identity">
          {user?.avatar ? (
            <img
              className="profile-avatar"
              src={user.avatar}
              alt={user.name || "Author"}
            />
          ) : (
            <div className="profile-avatar profile-avatar--placeholder">
              {(user?.name || "?").charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <h1>{user?.name || "Author"}</h1>
            {user?.bio && <p>{user.bio}</p>}
          </div>
        </div>
      </div>

      <div className="page-header">
        <h2>Published posts</h2>
      </div>

      <PostList
        posts={posts}
        emptyMessage="This author has no published posts yet."
      />
    </section>
  );
};

export default PublicProfile;
