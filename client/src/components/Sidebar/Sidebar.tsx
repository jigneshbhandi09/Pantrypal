import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Utensils,
  LayoutDashboard,
  Package,
  BookOpen,
  Sparkles,
  Calendar,
  ShoppingBag,
  User,
  LogOut,
} from 'lucide-react';
import './Sidebar.css';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Pantry', path: '/pantry', icon: Package },
    { label: 'Recipes', path: '/recipes', icon: BookOpen },
    { label: 'AI Cook Now', path: '/cook-now', icon: Sparkles, isAi: true },
    { label: 'Meal Planner', path: '/meal-planner', icon: Calendar },
    { label: 'Grocery List', path: '/grocery-list', icon: ShoppingBag },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'C';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="app-sidebar">
      {/* Top Brand / Wordmark */}
      <div className="sidebar-brand">
        <div className="brand-icon-wrap">
          <Utensils size={22} className="sidebar-brand-icon" />
        </div>
        <span className="sidebar-brand-title">PantryPal</span>
      </div>

      {/* Navigation Stack */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''} ${item.isAi ? 'ai-item' : ''}`
              }
            >
              <Icon size={19} className="nav-item-icon" />
              <span className="nav-item-label">{item.label}</span>
              {item.isAi && <span className="ai-badge">AI</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile & Logout Bottom Panel */}
      <div className="sidebar-user-panel">
        <div className="user-profile-info" onClick={() => navigate('/profile')}>
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <div className="user-text">
            <span className="user-name">{user?.name || 'Chef'}</span>
            <span className="user-email">{user?.email || 'user@pantrypal.com'}</span>
          </div>
        </div>

        <button className="sidebar-logout-btn" onClick={handleLogout} title="Log out">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

