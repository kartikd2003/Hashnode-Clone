import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";

const Settings = () => {
  const { user, updateProfile, changePassword } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
  });

  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileChange = (event) => {
    setProfileData({
      ...profileData,
      [event.target.name]: event.target.value,
    });
  };

  const handlePasswordChange = (event) => {
    setPasswordData({
      ...passwordData,
      [event.target.name]: event.target.value,
    });
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);

    try {
      const response = await updateProfile(profileData);

      if (!response.success) {
        setProfileError(response.message || "Unable to update profile.");
        return;
      }

      setProfileSuccess("Profile updated successfully.");
    } catch (err) {
      setProfileError(
        err.response?.data?.message ||
          "Unable to update profile. Please try again."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (!response.success) {
        setPasswordError(response.message || "Unable to update password.");
        return;
      }

      setPasswordSuccess("Password updated successfully.");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordError(
        err.response?.data?.message ||
          "Unable to update password. Please try again."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <section className="settings-page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your public profile and account security.</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-card">
          <h2>Profile</h2>
          <p className="settings-card-subtitle">
            This information is shown on your public profile.
          </p>

          {profileError && (
            <div className="error-message">{profileError}</div>
          )}

          {profileSuccess && (
            <div className="success-message">{profileSuccess}</div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <div>
              <label htmlFor="name">Display name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={profileData.name}
                onChange={handleProfileChange}
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={profileData.bio}
                onChange={handleProfileChange}
                placeholder="A short bio about yourself"
                maxLength={500}
              />
            </div>

            <div>
              <label htmlFor="avatar">Avatar URL</label>
              <input
                id="avatar"
                name="avatar"
                type="url"
                value={profileData.avatar}
                onChange={handleProfileChange}
                placeholder="https://example.com/your-photo.jpg"
              />
            </div>

            <button type="submit" disabled={profileLoading}>
              {profileLoading ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>

        <div className="settings-card">
          <h2>Change Password</h2>
          <p className="settings-card-subtitle">
            Choose a new password. You'll need your current one.
          </p>

          {passwordError && (
            <div className="error-message">{passwordError}</div>
          )}

          {passwordSuccess && (
            <div className="success-message">{passwordSuccess}</div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div>
              <label htmlFor="currentPassword">Current password</label>
              <PasswordInput
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Your current password"
                autoComplete="current-password"
                required
              />
            </div>

            <div>
              <label htmlFor="newPassword">New password</label>
              <PasswordInput
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Minimum 6 characters"
                minLength={6}
                autoComplete="new-password"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword">Confirm new password</label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Re-enter new password"
                minLength={6}
                autoComplete="new-password"
                required
              />
            </div>

            <button type="submit" disabled={passwordLoading}>
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Settings;
