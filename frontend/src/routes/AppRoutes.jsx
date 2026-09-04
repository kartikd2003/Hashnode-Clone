import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Register from "../pages/Register";
import Login from "../pages/Login";
import Feed from "../pages/Feed";
import PostEditor from "../pages/PostEditor";
import PostDetail from "../pages/PostDetail";
import MyPosts from "../pages/MyPosts";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Feed />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/posts/new" element={<PostEditor />} />
        <Route path="/posts/:id/edit" element={<PostEditor />} />
        <Route path="/posts/:slug" element={<PostDetail />} />

        <Route path="/my-posts" element={<MyPosts />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;

