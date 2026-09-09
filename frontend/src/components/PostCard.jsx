import { Link } from "react-router-dom";

const PostCard = ({ post }) => {
  const authorName = post.author?.name || "Unknown author";
  const authorId = post.author?.id || post.author?._id;

  return (
    <article className="post-card">
      {post.coverImage && (
        <img
          src={post.coverImage}
          alt={post.title}
          className="post-cover"
        />
      )}

      <div className="post-card-body">
        <div className="post-meta">
          {authorId ? (
            <Link to={`/profile/${authorId}`}>
              {authorName}
            </Link>
          ) : (
            <span>{authorName}</span>
          )}

          <span>
            {new Date(
              post.publishedAt || post.createdAt
            ).toLocaleDateString()}
          </span>
        </div>

        <h2>
          <Link to={`/post/${post.slug}`}>
            {post.title}
          </Link>
        </h2>

        <p>{post.excerpt || "No excerpt available."}</p>

        <div className="tag-list">
          {post.tags?.map((tag) => (
            <span className="tag" key={tag._id || tag.id || tag.slug}>
              #{tag.name || tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};

export default PostCard;
