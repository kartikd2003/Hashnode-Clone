const express = require("express");

const {
  getAllTags,
  createOrFindTag,
  getPostsByTag,
} = require("../controllers/tagController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", getAllTags);
router.get("/:slug/posts", getPostsByTag);

// Protected route
router.post("/", authMiddleware, createOrFindTag);

module.exports = router;