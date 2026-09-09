import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import PostEngagement from "../components/PostEngagement";
import CommentSection from "../components/CommentSection";

import { recordView } from "../services/engagementService";

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
        setError("");

        const data = await getPostBySlug(slug);

        if (!data.success) {
          setError(
            data.message || "Unable to load post."
          );
          return;
        }

        setPost(data.post);

        const loadedPostId = data.post?._id || data.post?.id;

        if (loadedPostId) {
          recordView(loadedPostId).catch((error) => {
            console.error("Failed to record post view:", error);
          });
        }
        
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load post."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  const readingTime = useMemo(() => {
    if (!post?.content) return 1;

    const words = post.content
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    return Math.max(1, Math.ceil(words / 200));
  }, [post]);

  const formattedDate = post?.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(
      undefined,
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    )
    : post?.createdAt
      ? new Date(post.createdAt).toLocaleDateString(
        undefined,
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      )
      : "";

  if (loading) {
    return (
      <section className="post-detail-page">
        <div className="post-detail-loading">
          Loading article...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="post-detail-page">
        <div className="post-detail-error">
          <h1>Unable to load article</h1>
          <p>{error}</p>
          <Link to="/" className="primary-link">
            Back to Feed
          </Link>
        </div>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="post-detail-page">
        <div className="post-detail-error">
          <h1>Post not found</h1>
          <Link to="/" className="primary-link">
            Back to Feed
          </Link>
        </div>
      </section>
    );
  }

  const postId = post?._id || post?.id;
  console.log("POST OBJECT:", post);
  console.log("POST ID:", postId);

  const authorId =
    post.author?._id || post.author?.id;

  const authorName =
    post.author?.name || "Unknown Author";

  return (
    <article className="post-detail-page">

      {/* Article Header */}
      <header className="article-header">

        {post.tags?.length > 0 && (
          <div className="article-tags">
            {post.tags.map((tag) => {
              const tagName =
                typeof tag === "string"
                  ? tag
                  : tag.name || tag.slug;

              const tagSlug =
                typeof tag === "string"
                  ? tag.toLowerCase().trim().replace(/\s+/g, "-")
                  : tag.slug;

              return (
                <Link
                  key={tagSlug}
                  to={`/tag/${encodeURIComponent(tagSlug)}`}
                  className="article-tag"
                >
                  #{tagName}
                </Link>
              );
            })}
          </div>
        )}

        <h1>{post.title}</h1>

        {post.excerpt && (
          <p className="article-excerpt">
            {post.excerpt}
          </p>
        )}

        <div className="article-meta">

          <div className="article-author">
            {authorId ? (
              <Link
                to={`/profile/${authorId}`}
                className="article-author-link"
              >
                <div className="article-author-avatar">
                  {post.author?.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={authorName}
                    />
                  ) : (
                    authorName
                      .charAt(0)
                      .toUpperCase()
                  )}
                </div>

                <div>
                  <strong>{authorName}</strong>
                  <span>Author</span>
                </div>
              </Link>
            ) : (
              <div className="article-author-link">
                <div className="article-author-avatar">
                  {authorName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>{authorName}</strong>
                  <span>Author</span>
                </div>
              </div>
            )}
          </div>

          <div className="article-meta-divider"></div>

          <div className="article-meta-info">
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{readingTime} min read</span>
          </div>

        </div>
      </header>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="article-cover">
          <img
            src={post.coverImage}
            alt={post.title}
            onError={(event) => {
              event.currentTarget.parentElement.style.display =
                "none";
            }}
          />
        </div>
      )}

      {/* Article Body */}
      <div className="article-layout">

        <main className="article-content">

          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({
                inline,
                className,
                children,
                ...props
              }) {
                const match =
                  /language-(\w+)/.exec(
                    className || ""
                  );

                return !inline && match ? (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                  >
                    {String(children).replace(
                      /\n$/,
                      ""
                    )}
                  </SyntaxHighlighter>
                ) : (
                  <code
                    className={className}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },

              a({ children, ...props }) {
                return (
                  <a
                    {...props}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                );
              },

              img({ src, alt, ...props }) {
                return (
                  <img
                    src={src}
                    alt={alt || ""}
                    loading="lazy"
                    {...props}
                  />
                );
              },
            }}
          >
            {post.content}
          </ReactMarkdown>

        </main>

        {/* Article Sidebar */}
        <aside className="article-sidebar">

          <div className="article-sidebar-card">

            <span className="sidebar-label">
              ARTICLE
            </span>

            <div>
              <strong>{readingTime} min</strong>
              <span>Reading time</span>
            </div>

            <div>
              <strong>
                {post.views || 0}
              </strong>
              <span>Views</span>
            </div>

          </div>

        </aside>

      </div>

      <PostEngagement postId={post._id || post.id} />
      <CommentSection postId={post._id || post.id} />

      {/* Bottom Author Card */}
      <section className="article-author-card">

        <div className="article-author-avatar large">
          {post.author?.avatar ? (
            <img
              src={post.author.avatar}
              alt={authorName}
            />
          ) : (
            authorName
              .charAt(0)
              .toUpperCase()
          )}
        </div>

        <div>
          <span className="author-card-label">
            WRITTEN BY
          </span>

          {authorId ? (
            <Link
              to={`/profile/${authorId}`}
              className="author-card-name"
            >
              {authorName}
            </Link>
          ) : (
            <strong className="author-card-name">
              {authorName}
            </strong>
          )}

          {post.author?.bio && (
            <p>{post.author.bio}</p>
          )}
        </div>

      </section>

    </article>
  );
};

export default PostDetail;