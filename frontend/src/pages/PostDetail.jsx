import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { getPostBySlug } from "../services/postService";

const PostDetail = () => {
  const { slug } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        const data = await getPostBySlug(slug);

        if (!data.success) {
          setError(data.message || "Post not found");
          return;
        }

        setPost(data.post);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load this post."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  if (loading) return <p>Loading post...</p>;

  if (error) {
    return (
      <div className="error-page">
        <h1>Post unavailable</h1>
        <p>{error}</p>
        <Link to="/">Back to feed</Link>
      </div>
    );
  }

  return (
    <article className="post-detail">
      {post.coverImage && (
        <img
          src={post.coverImage}
          alt={post.title}
          className="post-detail-cover"
        />
      )}

      <header className="post-detail-header">
        <div className="tag-list">
          {post.tags?.map((tag) => (
            <span className="tag" key={tag}>
              #{tag}
            </span>
          ))}
        </div>

        <h1>{post.title}</h1>

        <p className="post-author">
          By {post.author?.name || "Unknown author"} ·{" "}
          {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
          {" · "}
          {post.views} views
        </p>
      </header>

      <div className="markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");

              return !inline && match ? (
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  );
};

export default PostDetail;
