const crypto = require("crypto");

const Post = require("../models/Post");
const Like = require("../models/Like");
const Comment = require("../models/Comment");
const Bookmark = require("../models/Bookmark");
const Notification = require("../models/Notification");
const PostView = require("../models/PostView");

const getUserId = (req) => req.user.userId;

// --------------------------------------------------
// VIEWS
// --------------------------------------------------

const recordPostView = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const rawVisitor = [
      req.ip || "",
      req.headers["user-agent"] || "",
    ].join("|");

    const visitor = crypto
      .createHash("sha256")
      .update(rawVisitor)
      .digest("hex");

    try {
      await PostView.create({
        post: postId,
        visitor,
      });

      await Post.findByIdAndUpdate(postId, {
        $inc: { views: 1 },
      });
    } catch (error) {
      if (error.code !== 11000) {
        throw error;
      }
    }

    const updatedPost = await Post.findById(postId).select(
      "views"
    );

    res.json({
      success: true,
      views: updatedPost.views,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// LIKES
// --------------------------------------------------

const getLikeStatus = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const [liked, count] = await Promise.all([
      Like.exists({
        post: postId,
        user: getUserId(req),
      }),

      Like.countDocuments({
        post: postId,
      }),
    ]);

    res.json({
      success: true,
      liked: Boolean(liked),
      count,
    });
  } catch (error) {
    next(error);
  }
};

const likePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = getUserId(req);

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    try {
      await Like.create({
        post: postId,
        user: userId,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Post already liked",
        });
      }

      throw error;
    }

    if (post.author.toString() !== userId) {
      await Notification.create({
        recipient: post.author,
        sender: userId,
        type: "like",
        post: postId,
        message: "liked your post",
      });
    }

    const count = await Like.countDocuments({
      post: postId,
    });

    res.status(201).json({
      success: true,
      liked: true,
      count,
    });
  } catch (error) {
    next(error);
  }
};

const unlikePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    await Like.findOneAndDelete({
      post: postId,
      user: getUserId(req),
    });

    const count = await Like.countDocuments({
      post: postId,
    });

    res.json({
      success: true,
      liked: false,
      count,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// COMMENTS
// --------------------------------------------------

const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({
      post: req.params.postId,
    })
      .populate("author", "name username avatar")
      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      comments,
    });
  } catch (error) {
    next(error);
  }
};

const createComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const userId = getUserId(req);

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = await Comment.create({
      post: post._id,
      author: userId,
      content: content.trim(),
    });

    await comment.populate(
      "author",
      "name username avatar"
    );

    if (post.author.toString() !== userId) {
      await Notification.create({
        recipient: post.author,
        sender: userId,
        type: "comment",
        post: post._id,
        comment: comment._id,
        message: "commented on your post",
      });
    }

    res.status(201).json({
      success: true,
      comment,
    });
  } catch (error) {
    next(error);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(
      req.params.commentId
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (
      comment.author.toString() !==
      getUserId(req)
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own comment",
      });
    }

    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    comment.content = content.trim();

    await comment.save();

    await comment.populate(
      "author",
      "name username avatar"
    );

    res.json({
      success: true,
      comment,
    });
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(
      req.params.commentId
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (
      comment.author.toString() !==
      getUserId(req)
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comment",
      });
    }

    await comment.deleteOne();

    res.json({
      success: true,
      message: "Comment deleted",
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// BOOKMARKS
// --------------------------------------------------

const getBookmarkStatus = async (req, res, next) => {
  try {
    const exists = await Bookmark.exists({
      post: req.params.postId,
      user: getUserId(req),
    });

    res.json({
      success: true,
      bookmarked: Boolean(exists),
    });
  } catch (error) {
    next(error);
  }
};

const bookmarkPost = async (req, res, next) => {
  try {
    await Bookmark.create({
      post: req.params.postId,
      user: getUserId(req),
    });

    res.status(201).json({
      success: true,
      bookmarked: true,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Post already bookmarked",
      });
    }

    next(error);
  }
};

const removeBookmark = async (req, res, next) => {
  try {
    await Bookmark.findOneAndDelete({
      post: req.params.postId,
      user: getUserId(req),
    });

    res.json({
      success: true,
      bookmarked: false,
    });
  } catch (error) {
    next(error);
  }
};

const getMyBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({
      user: getUserId(req),
    })
      .populate({
        path: "post",
        populate: {
          path: "author",
          select: "name username avatar",
        },
      })
      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      bookmarks,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// NOTIFICATIONS
// --------------------------------------------------

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      recipient: getUserId(req),
    })
      .populate("sender", "name username avatar")
      .populate("post", "title slug")
      .sort({
        createdAt: -1,
      })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: getUserId(req),
      read: false,
    });

    res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

const markNotificationRead = async (
  req,
  res,
  next
) => {
  try {
    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: req.params.notificationId,
          recipient: getUserId(req),
        },
        {
          $set: {
            read: true,
          },
        },
        {
          new: true,
        }
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
};

const markAllNotificationsRead = async (
  req,
  res,
  next
) => {
  try {
    await Notification.updateMany(
      {
        recipient: getUserId(req),
        read: false,
      },
      {
        $set: {
          read: true,
        },
      }
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};