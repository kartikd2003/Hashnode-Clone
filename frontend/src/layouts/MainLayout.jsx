import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="app">
      <header className="site-header">
        <Link to="/" className="brand">
          Hashnode
        </Link>

        <nav>
          <Link to="/">Feed</Link>

          {isAuthenticated ? (
            <>
              <Link to="/posts/new">Write</Link>
              <Link to="/my-posts">My Posts</Link>
              <span className="nav-user">
                {user?.name}
              </span>
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
    </div>
  );
}

export default MainLayout;
