import Footer from "../components/Footer";
import UserMenu from "../components/UserMenu";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BellIcon = () => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth();

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
              <Link to="/editor/new" className="nav-write-button">
                Write
              </Link>

              <Link
                to="/notifications"
                className="nav-icon-link"
                aria-label="Notifications"
                title="Notifications"
              >
                <BellIcon />
              </Link>

              <UserMenu user={user} userId={userId} onLogout={logout} />
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="nav-write-button">
                Register
              </Link>
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
