import PostCard from "./PostCard";

const PostList = ({ posts = [], emptyMessage = "No posts found." }) => {
  if (!posts.length) {
    return <div className="empty-state">{emptyMessage}</div>;
  }

  return (
    <div className="post-list">
      {posts.map((post) => (
        <PostCard key={post.id || post._id || post.slug} post={post} />
      ))}
    </div>
  );
};

export default PostList;
