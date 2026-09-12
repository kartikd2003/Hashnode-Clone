const User = require("../models/User");
const Post = require("../models/Post");
const { safePost, safeUser } = require("../utils/serializers");

const getPublicProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select(
      "_id name bio avatar createdAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Post.tags is an array of ObjectId refs to Tag — populate + safePost
    // (below) turn each into a plain {id, name, slug} object.
    const posts = await Post.find({
      author: user._id,
      status: "published",
    })
      .populate("author", "name bio avatar")
      .populate("tags", "name slug")
      .sort({
        publishedAt: -1,
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        bio: user.bio,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      // Serialized the same way as every other post-returning endpoint
      // (postController) so the frontend can treat `post.id` consistently.
      posts: posts.map(safePost),
    });
  } catch (error) {
    next(error);
  }
};

const updateOwnProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }

      user.name = name.trim();
    }

    if (bio !== undefined) {
      user.bio = typeof bio === "string" ? bio.trim() : bio;
    }

    if (avatar !== undefined) {
      user.avatar = typeof avatar === "string" ? avatar.trim() : avatar;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: safeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicProfile,
  updateOwnProfile,
};
