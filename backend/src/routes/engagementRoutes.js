const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  recordPostView,

  getLikeStatus,
  likePost,
  unlikePost,

  getComments,
  createComment,
  updateComment,
  deleteComment,

  getBookmarkStatus,
  bookmarkPost,
  removeBookmark,
  getMyBookmarks,

  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/engagementController");

const router = express.Router();

// Public
router.post(
  "/posts/:postId/view",
  recordPostView
);

router.get(
  "/posts/:postId/comments",
  getComments
);

// Authentication required below
router.use(authMiddleware);

// Likes
router.get(
  "/posts/:postId/like",
  getLikeStatus
);

router.post(
  "/posts/:postId/like",
  likePost
);

router.delete(
  "/posts/:postId/like",
  unlikePost
);

// Comments
router.post(
  "/posts/:postId/comments",
  createComment
);

router.put(
  "/comments/:commentId",
  updateComment
);

router.delete(
  "/comments/:commentId",
  deleteComment
);

// Bookmarks
router.get(
  "/posts/:postId/bookmark",
  getBookmarkStatus
);

router.post(
  "/posts/:postId/bookmark",
  bookmarkPost
);

router.delete(
  "/posts/:postId/bookmark",
  removeBookmark
);

router.get(
  "/bookmarks",
  getMyBookmarks
);

// Notifications
router.get(
  "/notifications",
  getNotifications
);

router.patch(
  "/notifications/:notificationId/read",
  markNotificationRead
);

router.patch(
  "/notifications/read-all",
  markAllNotificationsRead
);

module.exports = router;