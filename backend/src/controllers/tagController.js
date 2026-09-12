const Tag = require("../models/Tag");
const Post = require("../models/Post");
const slugify = require("../utils/slugify");
const { safePost } = require("../utils/serializers");

const normalizeTagName = (name) => {
  return name.trim().replace(/\s+/g, " ");
};

const getAllTags = async (req, res, next) => {
  try {
    // Post.tags is an array of Tag ObjectIds, so counting is a direct
    // $lookup + $size match against each tag's own _id — no more string
    // comparison games between a tag's name/slug and what's stored on
    // the post.
    const tags = await Tag.aggregate([
      {
        $lookup: {
          from: "posts",
          let: { tagId: "$_id" },
          pipeline: [
            { $match: { status: "published" } },
            { $match: { $expr: { $in: ["$$tagId", "$tags"] } } },
            { $count: "count" },
          ],
          as: "postStats",
        },
      },
      {
        $addFields: {
          postCount: {
            $ifNull: [{ $arrayElemAt: ["$postStats.count", 0] }, 0],
          },
        },
      },
      { $project: { postStats: 0 } },
      { $sort: { postCount: -1, name: 1 } },
    ]);

    res.status(200).json({
      success: true,
      tags,
    });
  } catch (error) {
    next(error);
  }
};

const createOrFindTag = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({
        success: false,
        message: "Tag name is required",
      });
    }

    const normalizedName = normalizeTagName(name);
    const slug = slugify(normalizedName);

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Invalid tag name",
      });
    }

    let tag = await Tag.findOne({
      $or: [{ name: normalizedName }, { slug }],
    });

    if (!tag) {
      tag = await Tag.create({
        name: normalizedName,
        slug,
      });
    }

    res.status(200).json({
      success: true,
      message: "Tag ready",
      tag,
    });
  } catch (error) {
    next(error);
  }
};

const getPostsByTag = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const normalizedSlug = slug.toLowerCase();

    const tag = await Tag.findOne({
      slug: normalizedSlug,
    });

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found",
      });
    }

    const posts = await Post.find({
      tags: tag._id,
      status: "published",
    })
      .populate("author", "name avatar")
      .populate("tags", "name slug")
      .sort({
        publishedAt: -1,
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      tag,
      posts: posts.map(safePost),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTags,
  createOrFindTag,
  getPostsByTag,
};
