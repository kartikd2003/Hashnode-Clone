const mongoose = require("mongoose");

const postViewSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },

    visitor: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// One recorded view per visitor per post — repeat visits are ignored
// (see the duplicate-key handling in engagementController.recordPostView).
postViewSchema.index({ post: 1, visitor: 1 }, { unique: true });

module.exports = mongoose.model("PostView", postViewSchema);
