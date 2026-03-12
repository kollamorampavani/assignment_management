import React from 'react';
import Sidebar from './Sidebar';
import { Bell, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useSearch } from '../context/SearchContext';

const Layout = ({ children }) => {
  const { searchQuery, setSearchQuery } = useSearch();
  const [notifications, setNotifications] = React.useState([]);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/read/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  return (
    <div className="layout-container">
      <Sidebar />

      <main className="main-content">
        <header className="topbar">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search for assignments, courses..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="topbar-actions">
            <div className="notification-wrapper">
              <button className="notification-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>

              {showNotifications && (
                <div className="notification-dropdown glass-card">
                  <div className="dropdown-header">
                    <h3>Notifications</h3>
                    {unreadCount > 0 && <span className="unread-status">{unreadCount} new</span>}
                  </div>
                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <p className="empty-notif">No notifications yet</p>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                          onClick={() => markAsRead(notif.id)}
                        >
                          <p>{notif.message}</p>
                          <span className="notif-time">{new Date(notif.created_at).toLocaleDateString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content-area">
          {children}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .layout-container {
          display: flex;
          min-height: 100vh;
          background: var(--bg-dark);
        }

        .main-content {
          flex: 1;
          margin-left: 300px; /* Increased from 260px */
          display: flex;
          flex-direction: column;
        }

        .topbar {
          height: 70px;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .search-bar {
          display: flex;
          align-items: center;
          background: var(--bg-card);
          border: 1px solid var(--border);
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          width: 320px;
          gap: 0.75rem;
        }

        .search-icon {
          color: var(--text-muted);
        }

        .search-bar input {
          background: transparent;
          border: none;
          color: white;
          font-size: 1.1rem; /* Increased from 0.875rem */
          width: 100%;
          outline: none;
        }

        .notification-btn {
          position: relative;
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-muted);
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .notification-btn:hover {
          color: var(--primary);
          border-color: var(--primary);
        }

        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: var(--danger);
          color: white;
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 10px;
          border: 2px solid var(--bg-card);
        }

        .notification-wrapper {
          position: relative;
        }

        .notification-dropdown {
          position: absolute;
          top: calc(100% + 15px);
          right: 0;
          width: 350px;
          max-height: 400px;
          display: flex;
          flex-direction: column;
          z-index: 1000;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }

        .dropdown-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255,255,255,0.03);
        }

        .dropdown-header h3 {
          font-size: 1.1rem;
          margin: 0;
        }

        .unread-status {
          font-size: 0.75rem;
          color: var(--primary);
          background: rgba(99, 102, 241, 0.1);
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 600;
        }

        .notification-list {
          overflow-y: auto;
        }

        .notification-item {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.2s;
        }

        .notification-item:hover {
          background: rgba(255,255,255,0.05);
        }

        .notification-item.unread {
          border-left: 3px solid var(--primary);
          background: rgba(99, 102, 241, 0.03);
        }

        .notification-item p {
          font-size: 0.95rem;
          margin: 0 0 0.5rem 0;
          line-height: 1.4;
          color: #e2e8f0;
        }

        .notif-time {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .empty-notif {
          padding: 2rem;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .content-area {
          padding: 3rem; /* Increased from 2rem */
          max-width: 1400px; /* Increased from 1200px */
          width: 100%;
          margin: 0 auto;
        }
      `}} />
    </div>
  );
};

export default Layout;
