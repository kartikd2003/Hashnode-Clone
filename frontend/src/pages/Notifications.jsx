import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/engagementService";

const Notifications = () => {
  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const loadNotifications = async () => {
    try {
      const data =
        await getNotifications();

      if (data.success) {
        setNotifications(
          data.notifications || []
        );

        setUnreadCount(
          data.unreadCount || 0
        );
      }
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markRead = async (
    notification
  ) => {
    if (notification.read) return;

    try {
      await markNotificationRead(
        notification._id
      );

      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id
            ? { ...item, read: true }
            : item
        )
      );

      setUnreadCount((count) =>
        Math.max(0, count - 1)
      );
    } catch (error) {
      console.error(
        "Failed to mark notification:",
        error
      );
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();

      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          read: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Failed to mark notifications:",
        error
      );
    }
  };

  if (loading) {
    return <p>Loading notifications...</p>;
  }

  return (
    <section className="notifications-page">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>
            {unreadCount} unread notification
            {unreadCount === 1 ? "" : "s"}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <h2>No notifications</h2>
          <p>
            Your likes and comments will
            appear here.
          </p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map(
            (notification) => (
              <article
                key={notification._id}
                className={
                  notification.read
                    ? "notification-card"
                    : "notification-card unread"
                }
                onClick={() =>
                  markRead(notification)
                }
              >
                <div className="notification-avatar">
                  {notification.sender
                    ?.avatar ? (
                    <img
                      src={
                        notification.sender
                          .avatar
                      }
                      alt=""
                    />
                  ) : (
                    notification.sender?.name
                      ?.charAt(0)
                      .toUpperCase() || "?"
                  )}
                </div>

                <div>
                  <p>
                    <strong>
                      {
                        notification.sender
                          ?.name
                      }
                    </strong>{" "}
                    {notification.message}
                  </p>

                  {notification.post && (
                    <Link
                      to={`/post/${notification.post.slug}`}
                    >
                      {notification.post.title}
                    </Link>
                  )}

                  <small>
                    {new Date(
                      notification.createdAt
                    ).toLocaleString()}
                  </small>
                </div>
              </article>
            )
          )}
        </div>
      )}
    </section>
  );
};

export default Notifications;