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

// Public routes
router.get("/", getPublicPosts);
router.get("/slug/:slug", getPostBySlug);

// Protected routes
router.use(authMiddleware);

router.get("/mine", getMyPosts);
router.get("/:id/edit", getPostForEdit);
router.post("/", createPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);
router.post("/:id/publish", publishPost);
router.post("/:id/unpublish", unpublishPost);

module.exports = router;
