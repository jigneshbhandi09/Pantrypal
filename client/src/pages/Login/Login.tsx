import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button/Button';
import { Toast } from '../../components/Toast/Toast';
import { Utensils, Mail, Lock } from 'lucide-react';
import './Login.css';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password. Please check your credentials.';
      setToastMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Form Side (~45%) */}
      <div className="auth-form-side">
        <div className="auth-form-container">
          <div className="auth-brand">
            <Utensils size={28} className="brand-logo" />
            <span className="brand-wordmark">PantryPal</span>
          </div>

          <div className="auth-header">
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Log in to manage your pantry and plan your weekly meals.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrap">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="chef@pantrypal.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className={errors.email ? 'input-error' : ''}
                />
              </div>
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={errors.password ? 'input-error' : ''}
                />
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <Button type="submit" isLoading={isLoading} size="large" className="auth-submit-btn">
              Log In
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Line Art Side Panel (~55%) */}
      <div className="auth-art-side">
        <div className="art-content">
          <svg className="pantry-art-svg" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Shelf 1 */}
            <path d="M 60 160 L 440 160" stroke="#F3F5EF" strokeWidth="4" strokeLinecap="round" />
            <path d="M 70 160 L 70 170 M 430 160 L 430 170" stroke="#F3F5EF" strokeWidth="3" />
            
            {/* Olive Oil Bottle */}
            <rect x="90" y="70" width="36" height="85" rx="6" stroke="#F3F5EF" strokeWidth="3" />
            <path d="M 102 50 L 114 50 L 114 70 L 102 70 Z" stroke="#F3F5EF" strokeWidth="3" />
            <circle cx="108" cy="115" r="10" stroke="#E8A33D" strokeWidth="2.5" />

            {/* Jar of Spices */}
            <rect x="150" y="90" width="40" height="65" rx="4" stroke="#F3F5EF" strokeWidth="3" />
            <rect x="145" y="82" width="50" height="10" rx="2" stroke="#F3F5EF" strokeWidth="3" />
            <line x1="160" y1="115" x2="180" y2="115" stroke="#F3F5EF" strokeWidth="2" strokeDasharray="3 3" />

            {/* Honey Jar */}
            <path d="M 215 100 C 215 90 245 90 245 100 L 250 150 C 250 158 210 158 210 150 Z" stroke="#F3F5EF" strokeWidth="3" />
            <line x1="218" y1="94" x2="242" y2="94" stroke="#F3F5EF" strokeWidth="3" />

            {/* Herb Pot */}
            <path d="M 285 115 L 325 115 L 320 155 L 290 155 Z" stroke="#F3F5EF" strokeWidth="3" />
            <path d="M 305 115 Q 295 90 280 85 M 305 115 Q 315 85 330 80 M 305 115 Q 305 75 305 65" stroke="#F3F5EF" strokeWidth="3" strokeLinecap="round" />

            {/* Cookbook */}
            <rect x="350" y="80" width="60" height="75" rx="3" stroke="#F3F5EF" strokeWidth="3" />
            <line x1="365" y1="80" x2="365" y2="155" stroke="#F3F5EF" strokeWidth="2" />

            {/* Shelf 2 */}
            <path d="M 60 320 L 440 320" stroke="#F3F5EF" strokeWidth="4" strokeLinecap="round" />

            {/* Recipe Card Pinned */}
            <rect x="90" y="220" width="100" height="95" rx="4" stroke="#F3F5EF" strokeWidth="3" fill="#1E3A2F" />
            <line x1="110" y1="245" x2="170" y2="245" stroke="#E8A33D" strokeWidth="3" />
            <line x1="110" y1="265" x2="160" y2="265" stroke="#F3F5EF" strokeWidth="2" />
            <line x1="110" y1="280" x2="150" y2="280" stroke="#F3F5EF" strokeWidth="2" />

            {/* Flour Bag */}
            <path d="M 220 230 Q 250 220 280 230 L 285 315 L 215 315 Z" stroke="#F3F5EF" strokeWidth="3" />
            <text x="235" y="278" fill="#F3F5EF" fontSize="16" fontFamily="serif">FLOUR</text>

            {/* Cutting Board & Cheese */}
            <path d="M 315 250 L 415 250 L 415 315 L 315 315 Z" stroke="#F3F5EF" strokeWidth="3" />
            <circle cx="400" cy="282" r="4" fill="#F3F5EF" />

            {/* Hanging Whisk */}
            <path d="M 140 320 L 140 370 M 130 380 Q 140 420 150 380 Q 140 430 130 380 Q 140 400 150 380" stroke="#F3F5EF" strokeWidth="2.5" strokeLinecap="round" />
          </svg>

          <h2 className="art-quote font-display">"Cooking is about creating something delicious out of what you already have."</h2>
          <p className="art-author">— PantryPal Kitchen Philosophy</p>
        </div>
      </div>

      {toastMessage && (
        <Toast
          message={toastMessage}
          type="error"
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};
