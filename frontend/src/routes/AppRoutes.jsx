import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import Register from "../pages/Register";
import Login from "../pages/Login";
import Feed from "../pages/Feed";
import PostEditor from "../pages/PostEditor";
import PostDetail from "../pages/PostDetail";
import MyPosts from "../pages/MyPosts";
import TagPage from "../pages/TagPage";
import PublicProfile from "../pages/PublicProfile";
import Tags from "../pages/Tags";
import Dashboard from "../pages/Dashboard";
import Bookmarks from "../pages/Bookmarks";
import Notifications from "../pages/Notifications";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public */}
        <Route path="/" element={<Feed />} />
        <Route path="/tags" element={<Tags />} />
        <Route path="/tag/:slug" element={<TagPage />} />
        <Route path="/post/:slug" element={<PostDetail />} />
        <Route path="/profile/:id" element={<PublicProfile />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/posts/new" element={<ProtectedRoute> <PostEditor /></ProtectedRoute>} />
        <Route path="/posts/:id/edit" element={<ProtectedRoute> <PostEditor /></ProtectedRoute>} />
        <Route path="/my-posts" element={<ProtectedRoute> <MyPosts /></ProtectedRoute>} />
        <Route path="/bookmarks" element={<ProtectedRoute> <Bookmarks /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute> <Notifications /></ProtectedRoute>} />
 

      </Route>
    </Routes>
  );
}

export default AppRoutes;
