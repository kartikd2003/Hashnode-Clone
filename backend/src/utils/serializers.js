// Shared response shapes so every endpoint that returns a Post or a User
// sends back the same field names. Keeping this in one place avoids the
// drift that had crept in (e.g. userController returning raw Mongoose
// documents with `_id` while postController returned `id`).

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  bio: user.bio,
  avatar: user.avatar,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// Post.tags is an array of ObjectId refs to the Tag collection. Wherever a
// post is fetched, the controller should .populate("tags", "name slug") —
// this helper then normalizes each populated Tag doc into the same
// {id, name, slug} shape every other serialized entity uses. If a caller
// forgets to populate, the raw ObjectId is passed through rather than
// blowing up, so the failure is a missing tag name in the UI, not a crash.
const safeTag = (tag) => {
  if (tag && typeof tag === "object" && tag.name !== undefined) {
    return {
      id: tag._id,
      name: tag.name,
      slug: tag.slug,
    };
  }

  return tag;
};

const safePost = (post) => ({
  id: post._id,
  title: post.title,
  slug: post.slug,
  content: post.content,
  excerpt: post.excerpt,
  coverImage: post.coverImage,
  author: post.author,
  tags: (post.tags || []).map(safeTag),
  status: post.status,
  views: post.views,
  publishedAt: post.publishedAt,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
});

module.exports = { safeUser, safePost };
