import React from 'react';
import Sidebar from './Sidebar';
import { Bell, Search } from 'lucide-react';

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      <Sidebar />

      <main className="main-content">
        <header className="topbar">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search for assignments, courses..." />
          </div>

          <div className="topbar-actions">
            <button className="notification-btn">
              <Bell size={20} />
              <span className="notification-badge"></span>
            </button>
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
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: var(--danger);
          border-radius: 50%;
          border: 2px solid var(--bg-card);
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
