const express = require("express");

const {
  getPublicProfile,
  updateOwnProfile,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.put("/me", authMiddleware, updateOwnProfile);
router.get("/:id", getPublicProfile);

module.exports = router;
