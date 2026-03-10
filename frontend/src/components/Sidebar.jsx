import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  BarChart3,
  Bell,
  LogOut,
  User
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isTeacher = user.role === 'teacher';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = isTeacher ? [
    { name: 'Dashboard', path: '/teacher-dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'My Courses', path: '/teacher-courses', icon: <BookOpen size={20} /> },
    { name: 'Assignments', path: '/teacher-assignments', icon: <ClipboardList size={20} /> },
    { name: 'Submissions', path: '/view-submissions', icon: <ClipboardList size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart3 size={20} /> },
  ] : [
    { name: 'Dashboard', path: '/student-dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'My Courses', path: '/my-courses', icon: <BookOpen size={20} /> },
    { name: 'Assignments', path: '/assignments', icon: <ClipboardList size={20} /> },
    { name: 'My Grades', path: '/grades', icon: <BarChart3 size={20} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">A</div>
        <h2>Antigravity</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">
            <User size={18} />
          </div>
          <div className="user-info">
            <p className="user-name">{user.name || 'User'}</p>
            <p className="user-role">{user.role}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .sidebar {
          width: 300px;
          height: 100vh;
          background: var(--bg-card);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          padding: 1.5rem;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2.5rem;
          padding-left: 0.5rem;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          background: var(--primary);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
        }

        .sidebar-header h2 {
          font-size: 2rem; /* Increased from 1.75rem */
          font-weight: 800;
          background: linear-gradient(to right, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 1.25rem; 
          padding: 1.25rem 1.75rem; /* Increased padding */
          border-radius: 0.75rem;
          color: var(--text-muted);
          font-size: 1.4rem; /* Increased from 1.2rem */
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .nav-link.active {
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
        }

        .avatar {
          width: 36px;
          height: 36px;
          background: var(--bg-dark);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          border: 1px solid var(--border);
        }

        .user-name {
          font-size: 1.3rem; /* Increased from 1.15rem */
          font-weight: 700;
          color: white;
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: capitalize;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 1.75rem;
          border-radius: 0.75rem;
          color: var(--danger);
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 1.3rem; /* Increased from 1.15rem */
          transition: all 0.2s;
          width: 100%;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }
      `}} />
    </aside>
  );
};

export default Sidebar;
