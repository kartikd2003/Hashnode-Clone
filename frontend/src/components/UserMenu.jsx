import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Collapses the account-related links (Dashboard, Bookmarks, Profile,
// Logout) into a single avatar dropdown, so the top-level navbar only
// shows the handful of links people actually use on every visit.
function UserMenu({ user, userId, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const firstName = user?.name?.split(" ")[0] || "Account";
  const initial = user?.name?.charAt(0).toUpperCase() || "?";

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const closeAnd = (action) => {
    setOpen(false);
    action?.();
  };

  const handleLogout = () => {
    setOpen(false);
    onLogout();
    navigate("/");
  };

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        type="button"
        className="user-menu-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {user?.avatar ? (
          <img src={user.avatar} alt={firstName} />
        ) : (
          <span>{initial}</span>
        )}
        <span className="user-menu-name">{firstName}</span>
      </button>

      {open && (
        <div className="user-menu-dropdown" role="menu">
          <Link
            to={`/profile/${userId}`}
            role="menuitem"
            onClick={() => closeAnd()}
          >
            View Profile
          </Link>
          <Link to="/dashboard" role="menuitem" onClick={() => closeAnd()}>
            Dashboard
          </Link>
          <Link to="/bookmarks" role="menuitem" onClick={() => closeAnd()}>
            Bookmarks
          </Link>
          <Link to="/settings" role="menuitem" onClick={() => closeAnd()}>
            Settings
          </Link>

          <div className="user-menu-divider" />

          <button type="button" role="menuitem" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
