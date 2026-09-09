import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  getLikeStatus,
  likePost,
  unlikePost,
  getBookmarkStatus,
  bookmarkPost,
  removeBookmark,
} from "../services/engagementService";

const PostEngagement = ({ postId }) => {
  if (!postId) {
    return null;
  }

  const { isAuthenticated } = useAuth();

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const [bookmarked, setBookmarked] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        if (!isAuthenticated) {
          setLoading(false);
          return;
        }

        const [likeData, bookmarkData] =
          await Promise.all([
            getLikeStatus(postId),
            getBookmarkStatus(postId),
          ]);

        setLiked(likeData.liked);
        setLikeCount(likeData.count);
        setBookmarked(bookmarkData.bookmarked);
      } catch (error) {
        console.error(
          "Failed to load engagement status:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, [postId, isAuthenticated]);

  const handleLike = async () => {
    if (!isAuthenticated) return;

    try {
      setActionLoading(true);

      const data = liked
        ? await unlikePost(postId)
        : await likePost(postId);

      setLiked(data.liked);
      setLikeCount(data.count);
    } catch (error) {
      console.error(
        "Like action failed:",
        error
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) return;

    try {
      setActionLoading(true);

      const data = bookmarked
        ? await removeBookmark(postId)
        : await bookmarkPost(postId);

      setBookmarked(data.bookmarked);
    } catch (error) {
      console.error(
        "Bookmark action failed:",
        error
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="post-engagement-loading">
        Loading...
      </div>
    );
  }

  return (
    <div className="post-engagement">
      <button
        type="button"
        onClick={handleLike}
        disabled={
          !isAuthenticated || actionLoading
        }
        className={
          liked
            ? "engagement-button active"
            : "engagement-button"
        }
      >
        {liked ? "♥" : "♡"}{" "}
        <span>{likeCount}</span>
      </button>

      <button
        type="button"
        onClick={handleBookmark}
        disabled={
          !isAuthenticated || actionLoading
        }
        className={
          bookmarked
            ? "engagement-button active"
            : "engagement-button"
        }
      >
        {bookmarked ? "🔖" : "🔗"}{" "}
        <span>
          {bookmarked
            ? "Bookmarked"
            : "Bookmark"}
        </span>
      </button>

      {!isAuthenticated && (
        <span className="engagement-login">
          <Link to="/login">Login</Link> to like or save
        </span>
      )}
    </div>
  );
};

export default PostEngagement;