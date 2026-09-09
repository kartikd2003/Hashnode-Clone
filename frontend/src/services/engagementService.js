import api from "../utils/api";

export const recordView = async (postId) => {
  const response = await api.post(
    `/engagement/posts/${postId}/view`
  );

  return response.data;
};

export const getLikeStatus = async (postId) => {
  const response = await api.get(
    `/engagement/posts/${postId}/like`
  );

  return response.data;
};

export const likePost = async (postId) => {
  const response = await api.post(
    `/engagement/posts/${postId}/like`
  );

  return response.data;
};

export const unlikePost = async (postId) => {
  const response = await api.delete(
    `/engagement/posts/${postId}/like`
  );

  return response.data;
};

export const getComments = async (postId) => {
  const response = await api.get(
    `/engagement/posts/${postId}/comments`
  );

  return response.data;
};

export const createComment = async (
  postId,
  content
) => {
  const response = await api.post(
    `/engagement/posts/${postId}/comments`,
    { content }
  );

  return response.data;
};

export const updateComment = async (
  commentId,
  content
) => {
  const response = await api.put(
    `/engagement/comments/${commentId}`,
    { content }
  );

  return response.data;
};

export const deleteComment = async (
  commentId
) => {
  const response = await api.delete(
    `/engagement/comments/${commentId}`
  );

  return response.data;
};

export const getBookmarkStatus = async (
  postId
) => {
  const response = await api.get(
    `/engagement/posts/${postId}/bookmark`
  );

  return response.data;
};

export const bookmarkPost = async (postId) => {
  const response = await api.post(
    `/engagement/posts/${postId}/bookmark`
  );

  return response.data;
};

export const removeBookmark = async (
  postId
) => {
  const response = await api.delete(
    `/engagement/posts/${postId}/bookmark`
  );

  return response.data;
};

export const getMyBookmarks = async () => {
  const response = await api.get(
    "/engagement/bookmarks"
  );

  return response.data;
};

export const getNotifications = async () => {
  const response = await api.get(
    "/engagement/notifications"
  );

  return response.data;
};

export const markNotificationRead = async (
  notificationId
) => {
  const response = await api.patch(
    `/engagement/notifications/${notificationId}/read`
  );

  return response.data;
};

export const markAllNotificationsRead =
  async () => {
    const response = await api.patch(
      "/engagement/notifications/read-all"
    );

    return response.data;
  };