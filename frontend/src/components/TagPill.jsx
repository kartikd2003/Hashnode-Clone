import { Link } from "react-router-dom";

const TagPill = ({ tag }) => {
  const name = typeof tag === "string" ? tag : tag?.name;
  const slug = typeof tag === "string" ? tag : tag?.slug;

  if (!name) return null;

  const tagSlug =
    slug ||
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  return (
    <Link className="tag-pill" to={`/tag/${tagSlug}`}>
      #{name}
    </Link>
  );
};

export default TagPill;
