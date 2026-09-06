import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar/Sidebar';
import { LoadingSpinner } from './components/LoadingSpinner/LoadingSpinner';

import { Login } from './pages/Login/Login';
import { Signup } from './pages/Signup/Signup';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Pantry } from './pages/Pantry/Pantry';
import { Recipes } from './pages/Recipes/Recipes';
import { CookNow } from './pages/CookNow/CookNow';
import { MealPlanner } from './pages/MealPlanner/MealPlanner';
import { GroceryList } from './pages/GroceryList/GroceryList';
import { Profile } from './pages/Profile/Profile';

import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Checking authentication status..." size="large" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Loading..." size="medium" />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className={`app-root ${user ? 'with-sidebar' : 'auth-mode'}`}>
      {user && <Sidebar />}
      <main className={user ? 'app-main-content' : 'app-auth-main'}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/pantry" element={<ProtectedRoute><Pantry /></ProtectedRoute>} />
          <Route path="/recipes" element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
          <Route path="/cook-now" element={<ProtectedRoute><CookNow /></ProtectedRoute>} />
          <Route path="/meal-planner" element={<ProtectedRoute><MealPlanner /></ProtectedRoute>} />
          <Route path="/grocery-list" element={<ProtectedRoute><GroceryList /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
