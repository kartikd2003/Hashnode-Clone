const User = require("../models/User");
const Post = require("../models/Post");

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
      posts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicProfile,
};