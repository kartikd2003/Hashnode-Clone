import { Link } from "react-router-dom";

const PostCard = ({ post }) => {
  const authorName = post.author?.name || "Unknown author";

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
          <span>{authorName}</span>
          <span>
            {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
          </span>
        </div>

        <h2>
          <Link to={`/posts/${post.slug}`}>{post.title}</Link>
        </h2>

        <p>{post.excerpt || "No excerpt available."}</p>

        <div className="tag-list">
          {post.tags?.map((tag) => (
            <span className="tag" key={tag}>
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};

export default PostCard;
