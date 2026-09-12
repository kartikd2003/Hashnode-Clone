import api from "../utils/api";

export const getPosts = async (params = {}) => {
  const response = await api.get("/posts", { params });
  return response.data;
};

export const getPostBySlug = async (slug) => {
  const response = await api.get(`/posts/${slug}`);
  return response.data;
};

export const getMyPosts = async () => {
  const response = await api.get("/posts/mine");
  return response.data;
};

export const getPostForEdit = async (id) => {
  const response = await api.get(`/posts/${id}/edit`);
  return response.data;
};

export const createPost = async (postData) => {
  const response = await api.post("/posts", postData);
  return response.data;
};

export const updatePost = async (id, postData) => {
  const response = await api.put(`/posts/${id}`, postData);
  return response.data;
};

export const deletePost = async (id) => {
  const response = await api.delete(`/posts/${id}`);
  return response.data;
};

export const publishPost = async (id) => {
  const response = await api.post(`/posts/${id}/publish`);
  return response.data;
};

export const unpublishPost = async (id) => {
  const response = await api.post(`/posts/${id}/unpublish`);
  return response.data;
};

export const getPostsByTag = async (slug) => {
  const response = await api.get(`/tags/${encodeURIComponent(slug)}/posts`);
  return response.data;
};

export const getTags = async () => {
  const response = await api.get("/tags");
  return response.data;
};
