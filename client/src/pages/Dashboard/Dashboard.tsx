import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPantryItems, getExpiringItems } from '../../api/pantry';
import { getMealPlan } from '../../api/mealPlan';
import type { PantryItem } from '../../types/PantryItem';
import type { MealPlanSlot } from '../../types/MealPlan';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { Toast } from '../../components/Toast/Toast';
import { Package, AlertTriangle, Calendar, Sparkles, ArrowRight, ShoppingBag, Plus } from 'lucide-react';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pantryCount, setPantryCount] = useState<number>(0);
  const [expiringItems, setExpiringItems] = useState<PantryItem[]>([]);
  const [todayMeals, setTodayMeals] = useState<MealPlanSlot[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [allPantry, expiring, weekPlan] = await Promise.all([
          getPantryItems(),
          getExpiringItems(),
          getMealPlan(),
        ]);

        setPantryCount(allPantry.length);
        setExpiringItems(expiring);

        const todayStr = new Date().toISOString().split('T')[0];
        const todaySlots = weekPlan.filter(
          (slot) => slot.date.split('T')[0] === todayStr
        );
        setTodayMeals(todaySlots);
      } catch (err: any) {
        setToastMessage("Couldn't load dashboard data right now — please check your connection and try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Fetching your kitchen overview..." size="large" />;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Editorial Welcome Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="welcome-title">Hello, {user?.name || 'Chef'}!</h1>
            <p className="welcome-subtitle">Here is what's happening in your kitchen today.</p>
          </div>
          <button className="cook-ai-btn" onClick={() => navigate('/cook-now')}>
            <Sparkles size={18} />
            <span>AI Cook Now</span>
          </button>
        </div>

        {/* Asymmetric Stats Layout */}
        <div className="stats-layout">
          {/* Distinct Hero Stat Card (Deep Pine Green) */}
          <div className="hero-stat-card" onClick={() => navigate('/pantry')}>
            <div className="hero-stat-content">
              <span className="hero-stat-number">{pantryCount}</span>
              <span className="hero-stat-label">Pantry Ingredients Logged</span>
              <p className="hero-stat-subtext">Ready for AI recipe generation</p>
            </div>
            <Package size={64} className="hero-stat-bg-icon" />
          </div>

          {/* Secondary Stat Widgets */}
          <div className="secondary-stats-col">
            <div className="sub-stat-card" onClick={() => navigate('/pantry')}>
              <div className="sub-stat-icon-wrap warning-badge">
                <AlertTriangle size={20} />
              </div>
              <div>
                <span className="sub-stat-num">{expiringItems.length}</span>
                <span className="sub-stat-lbl">Expiring Soon (&le; 7 days)</span>
              </div>
            </div>

            <div className="sub-stat-card" onClick={() => navigate('/meal-planner')}>
              <div className="sub-stat-icon-wrap primary-badge">
                <Calendar size={20} />
              </div>
              <div>
                <span className="sub-stat-num">{todayMeals.length}</span>
                <span className="sub-stat-lbl">Meals Scheduled Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Main Grid */}
        <div className="dashboard-main-grid">
          {/* Expiring Soon Section */}
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-header-title">
                <AlertTriangle size={18} className="warning-text" />
                <h3 className="card-headline">Expiring Soon</h3>
              </div>
              <Link to="/pantry" className="card-link">View Pantry <ArrowRight size={14} /></Link>
            </div>

            {expiringItems.length === 0 ? (
              <div className="empty-widget">
                <p>No items expiring in the next 7 days — nice work! 🎉</p>
              </div>
            ) : (
              <ul className="expiring-list">
                {expiringItems.slice(0, 5).map((item) => {
                  const daysLeft = item.expiryDate
                    ? Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
                    : null;
                  return (
                    <li key={item._id} className="expiring-item">
                      <div className="expiring-info">
                        <span className="item-name">{item.name}</span>
                        <span className="item-qty">{item.quantity} {item.unit}</span>
                      </div>
                      {daysLeft !== null && (
                        <span className={`expiry-badge ${daysLeft <= 2 ? 'urgent' : ''}`}>
                          {daysLeft <= 0 ? 'Expires today' : `${daysLeft} days left`}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Today's Meals Section */}
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-header-title">
                <Calendar size={18} className="primary-text" />
                <h3 className="card-headline">Today's Meal Plan</h3>
              </div>
              <Link to="/meal-planner" className="card-link">Full Planner <ArrowRight size={14} /></Link>
            </div>

            {todayMeals.length === 0 ? (
              <div className="empty-widget">
                <p>No meals scheduled for today yet.</p>
                <button className="widget-action-btn" onClick={() => navigate('/meal-planner')}>
                  <Plus size={14} /> Schedule Meals
                </button>
              </div>
            ) : (
              <div className="today-meals-list">
                {todayMeals.map((slot) => (
                  <div key={slot._id} className="today-meal-slot">
                    <span className="meal-type-tag">{slot.mealType}</span>
                    <span className="meal-title">{slot.recipeId?.title || 'Selected Recipe'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="quick-actions-bar">
          <h3 className="quick-actions-title">Kitchen Shortcuts</h3>
          <div className="quick-actions-btns">
            <button onClick={() => navigate('/pantry')} className="action-btn outline">
              <Package size={18} /> Add Pantry Ingredient
            </button>
            <button onClick={() => navigate('/cook-now')} className="action-btn primary-action">
              <Sparkles size={18} /> Generate AI Recipes
            </button>
            <button onClick={() => navigate('/grocery-list')} className="action-btn outline">
              <ShoppingBag size={18} /> View Grocery List
            </button>
          </div>
        </div>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} type="error" onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
};
