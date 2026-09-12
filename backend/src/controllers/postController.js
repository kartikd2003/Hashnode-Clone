const Post = require("../models/Post");
const Tag = require("../models/Tag");
const slugify = require("../utils/slugify");
const { safePost } = require("../utils/serializers");

const buildUniqueSlug = async (title, excludeId = null) => {
  const base = slugify(title) || `post-${Date.now()}`;
  let slug = base;
  let counter = 2;

  while (true) {
    const query = { slug };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await Post.findOne(query).select("_id");

    if (!existing) return slug;

    slug = `${base}-${counter++}`;
  }
};

const cleanTagNames = (tags) => {
  if (!Array.isArray(tags)) return [];

  const seenSlugs = new Set();
  const result = [];

  for (const raw of tags) {
    if (typeof raw !== "string") continue;

    const trimmed = raw.trim().replace(/\s+/g, " ");
    if (!trimmed) continue;

    const slug = slugify(trimmed);
    if (!slug || seenSlugs.has(slug)) continue;

    seenSlugs.add(slug);
    result.push(trimmed);

    if (result.length >= 10) break;
  }

  return result;
};

// Turns the tag-name strings typed by the author into an array of Tag
// ObjectIds, creating any tag that doesn't exist yet. Two posts tagging
// "Web Dev" and "web dev" resolve to the same Tag document (matched by
// slug), so the display name shown everywhere is whichever came first.
const resolveTagIds = async (tags) => {
  const names = cleanTagNames(tags);
  const tagIds = [];

  for (const name of names) {
    const slug = slugify(name);

    if (!slug) continue;

    const tag = await Tag.findOneAndUpdate(
      { slug },
      {
        $setOnInsert: {
          name,
          slug,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    tagIds.push(tag._id);
  }

  return tagIds;
};

const makeExcerpt = (content) => {
  if (!content) return "";
  return content
    .replace(/[#*_>`~\[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
};

const createPost = async (req, res, next) => {
  try {
    const { title, content, excerpt, coverImage, tags, status } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!content || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    const normalizedStatus =
      status === "published" ? "published" : "draft";

    const post = await Post.create({
      title: title.trim(),
      slug: await buildUniqueSlug(title),
      content: content.trim(),
      excerpt:
        typeof excerpt === "string" && excerpt.trim()
          ? excerpt.trim()
          : makeExcerpt(content),
      coverImage:
        typeof coverImage === "string" ? coverImage.trim() : "",
      tags: await resolveTagIds(tags),
      status: normalizedStatus,
      author: req.user.userId,
      publishedAt: normalizedStatus === "published" ? new Date() : null,
    });

    const populated = await post.populate([
      { path: "author", select: "name email bio avatar" },
      { path: "tags", select: "name slug" },
    ]);

    return res.status(201).json({
      success: true,
      message: normalizedStatus === "published"
        ? "Post published successfully"
        : "Post saved as draft",
      post: safePost(populated),
    });
  } catch (error) {
    next(error);
  }
};

const getPublicPosts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 10, 1),
      50
    );
    const search = typeof req.query.search === "string"
      ? req.query.search.trim()
      : "";
    const tag = typeof req.query.tag === "string"
      ? req.query.tag.trim().toLowerCase()
      : "";

    const query = { status: "published" };

    if (search) {
      // tags is now an array of ObjectIds, so a keyword search can no
      // longer regex-match it directly — first find any tags whose name
      // matches, then match posts carrying one of those tag ids.
      const matchingTagIds = await Tag.find({
        name: { $regex: search, $options: "i" },
      }).distinct("_id");

      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { tags: { $in: matchingTagIds } },
      ];
    }

    if (tag) {
      const tagDoc = await Tag.findOne({ slug: tag });

      // No matching tag at all — return an empty page rather than either
      // an error or (worse) silently ignoring the filter.
      query.tags = tagDoc ? tagDoc._id : null;
    }

    const total = await Post.countDocuments(query);

    const posts = await Post.find(query)
      .populate("author", "name bio avatar")
      .populate("tags", "name slug")
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      posts: posts.map(safePost),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getPostBySlug = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      slug: req.params.slug,
      status: "published",
    })
      .populate("author", "name bio avatar")
      .populate("tags", "name slug");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Published post not found",
      });
    }

    post.views += 1;
    await post.save();

    return res.status(200).json({
      success: true,
      post: safePost(post),
    });
  } catch (error) {
    next(error);
  }
};

const getMyPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({
      author: req.user.userId,
    })
      .populate("author", "name bio avatar")
      .populate("tags", "name slug")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      posts: posts.map(safePost),
    });
  } catch (error) {
    next(error);
  }
};

const getPostForEdit = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      author: req.user.userId,
    })
      .populate("author", "name bio avatar")
      .populate("tags", "name slug");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found or not owned by you",
      });
    }

    return res.status(200).json({
      success: true,
      post: safePost(post),
    });
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      author: req.user.userId,
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found or you do not own this post",
      });
    }

    const { title, content, excerpt, coverImage, tags, status } = req.body;

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }

      if (title.trim() !== post.title) {
        post.slug = await buildUniqueSlug(title, post._id);
      }

      post.title = title.trim();
    }

    if (content !== undefined) {
      if (typeof content !== "string" || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: "Content cannot be empty",
        });
      }

      post.content = content.trim();

      if (excerpt === undefined) {
        post.excerpt = makeExcerpt(content);
      }
    }

    if (excerpt !== undefined) {
      post.excerpt =
        typeof excerpt === "string" ? excerpt.trim() : "";
    }

    if (coverImage !== undefined) {
      post.coverImage =
        typeof coverImage === "string" ? coverImage.trim() : "";
    }

    if (tags !== undefined) {
      post.tags = await resolveTagIds(tags);
    }

    if (status !== undefined) {
      if (!["draft", "published"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be draft or published",
        });
      }

      if (status === "published" && post.status !== "published") {
        post.publishedAt = new Date();
      }

      if (status === "draft") {
        post.publishedAt = null;
      }

      post.status = status;
    }

    await post.save();

    const populated = await post.populate([
      { path: "author", select: "name email bio avatar" },
      { path: "tags", select: "name slug" },
    ]);

    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post: safePost(populated),
    });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      author: req.user.userId,
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found or you do not own this post",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const publishPost = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      author: req.user.userId,
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found or you do not own this post",
      });
    }

    post.status = "published";
    post.publishedAt = post.publishedAt || new Date();

    await post.save();

    const populated = await post.populate([
      { path: "author", select: "name email bio avatar" },
      { path: "tags", select: "name slug" },
    ]);

    return res.status(200).json({
      success: true,
      message: "Post published successfully",
      post: safePost(populated),
    });
  } catch (error) {
    next(error);
  }
};

const unpublishPost = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      author: req.user.userId,
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found or you do not own this post",
      });
    }

    post.status = "draft";
    post.publishedAt = null;

    await post.save();

    const populated = await post.populate([
      { path: "author", select: "name email bio avatar" },
      { path: "tags", select: "name slug" },
    ]);

    return res.status(200).json({
      success: true,
      message: "Post moved to draft",
      post: safePost(populated),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getPublicPosts,
  getPostBySlug,
  getMyPosts,
  getPostForEdit,
  updatePost,
  deletePost,
  publishPost,
  unpublishPost,
};
