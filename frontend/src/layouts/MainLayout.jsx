import Footer from "../components/Footer";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth();

  const firstName = user?.name?.split(" ")[0] || "Profile";
  const userId = user?.id || user?._id;

  return (
    <div className="app">
      <header className="site-header">
        <Link to="/" className="brand">
          Hashnode
        </Link>

        <nav>
          <Link to="/">Feed</Link>
          <Link to="/tags">Tags</Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/posts/new">Write</Link>
              <Link to="/my-posts">My Posts</Link>
              <Link to={`/profile/${userId}`} className="nav-user">{firstName}</Link>
              <Link to="/bookmarks">Bookmarks</Link>
              <Link to="/notifications">Notifications</Link>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>

      <main className="container">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;