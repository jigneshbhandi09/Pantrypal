import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ShoppingBag, Calendar, Utensils, LayoutDashboard, LogOut, Package } from 'lucide-react';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <NavLink to="/dashboard" className="navbar-brand">
          <Utensils className="brand-icon" size={24} />
          <span className="brand-title">PantryPal</span>
        </NavLink>

        {user && (
          <>
            <nav className="navbar-links">
              <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>

              <NavLink to="/pantry" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Package size={18} />
                <span>Pantry</span>
              </NavLink>

              <NavLink to="/recipes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Utensils size={18} />
                <span>Recipes</span>
              </NavLink>

              <NavLink to="/cook-now" className={({ isActive }) => `nav-item cook-now-btn ${isActive ? 'active' : ''}`}>
                <Sparkles size={18} />
                <span>Cook Now</span>
              </NavLink>

              <NavLink to="/meal-planner" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Calendar size={18} />
                <span>Planner</span>
              </NavLink>

              <NavLink to="/grocery-list" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <ShoppingBag size={18} />
                <span>Grocery List</span>
              </NavLink>
            </nav>

            <div className="navbar-user-section">
              <NavLink to="/profile" className={({ isActive }) => `user-profile-link ${isActive ? 'active' : ''}`}>
                <div className="user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
                <span className="user-name">{user.name}</span>
              </NavLink>

              <button onClick={handleLogout} className="logout-button" title="Logout" aria-label="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

