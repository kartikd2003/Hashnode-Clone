const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Single-level threading: a reply always points at a top-level
    // comment. If someone replies to a reply, the controller flattens it
    // to the same top-level parent rather than nesting further — keeps
    // the UI to two visual levels (comment + replies) instead of
    // unbounded nesting.
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },

    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      minlength: [1, "Comment cannot be empty"],
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.index({
  post: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "Comment",
  commentSchema
);