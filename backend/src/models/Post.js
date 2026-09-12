const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },

    excerpt: {
      type: String,
      trim: true,
      maxlength: [300, "Excerpt cannot exceed 300 characters"],
      default: "",
    },

    coverImage: {
      type: String,
      trim: true,
      default: "",
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    tags: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
      default: [],
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },

    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ tags: 1 });

module.exports = mongoose.model("Post", postSchema);
