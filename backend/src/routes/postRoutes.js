const express = require("express");

const {
  createPost,
  getPublicPosts,
  getPostBySlug,
  getMyPosts,
  getPostForEdit,
  updatePost,
  deletePost,
  publishPost,
  unpublishPost,
} = require("../controllers/postController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// NOTE ON ORDERING: /mine and /:slug are both single-segment GET routes.
// Express matches routes in the order they're registered, so the literal
// "/mine" route must come before the generic "/:slug" route below it —
// otherwise a request for /api/posts/mine would incorrectly be captured
// by the :slug handler and treated as a request for a post literally
// titled "mine".

// Public routes
router.get("/", getPublicPosts);
router.get("/mine", authMiddleware, getMyPosts);
router.get("/:id/edit", authMiddleware, getPostForEdit);
router.get("/:slug", getPostBySlug);

// Protected routes
router.post("/", authMiddleware, createPost);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);
router.post("/:id/publish", authMiddleware, publishPost);
router.post("/:id/unpublish", authMiddleware, unpublishPost);

module.exports = router;
