import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button/Button';
import { Toast } from '../../components/Toast/Toast';
import { Utensils, Mail, Lock, User as UserIcon } from 'lucide-react';
import './Signup.css';

export const Signup: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const validate = () => {
    const errs: { name?: string; email?: string; password?: string } = {};
    if (!name.trim()) {
      errs.name = 'Full name is required';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters long';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create account. Please try again.';
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
            <h1 className="auth-title">Create account</h1>
            <p className="auth-subtitle">Join PantryPal to reduce food waste and cook smart meals.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrap">
                <UserIcon size={18} className="input-icon" />
                <input
                  id="name"
                  type="text"
                  placeholder="Chef Jane"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  className={errors.name ? 'input-error' : ''}
                />
              </div>
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

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
                  placeholder="At least 8 characters"
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
              Get Started Free
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Line Art Side Panel (~55%) */}
      <div className="auth-art-side">
        <div className="art-content">
          <svg className="pantry-art-svg" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 60 160 L 440 160" stroke="#F3F5EF" strokeWidth="4" strokeLinecap="round" />
            <rect x="90" y="70" width="36" height="85" rx="6" stroke="#F3F5EF" strokeWidth="3" />
            <circle cx="108" cy="115" r="10" stroke="#E8A33D" strokeWidth="2.5" />
            <rect x="150" y="90" width="40" height="65" rx="4" stroke="#F3F5EF" strokeWidth="3" />
            <path d="M 285 115 L 325 115 L 320 155 L 290 155 Z" stroke="#F3F5EF" strokeWidth="3" />
            <path d="M 305 115 Q 295 90 280 85 M 305 115 Q 315 85 330 80" stroke="#F3F5EF" strokeWidth="3" strokeLinecap="round" />
            <path d="M 60 320 L 440 320" stroke="#F3F5EF" strokeWidth="4" strokeLinecap="round" />
            <rect x="90" y="220" width="100" height="95" rx="4" stroke="#F3F5EF" strokeWidth="3" fill="#1E3A2F" />
            <line x1="110" y1="245" x2="170" y2="245" stroke="#E8A33D" strokeWidth="3" />
            <path d="M 220 230 Q 250 220 280 230 L 285 315 L 215 315 Z" stroke="#F3F5EF" strokeWidth="3" />
            <text x="235" y="278" fill="#F3F5EF" fontSize="16" fontFamily="serif">FLOUR</text>
          </svg>

          <h2 className="art-quote font-display">"Organize your kitchen, discover recipes, and simplify grocery shopping."</h2>
          <p className="art-author">— Welcome to PantryPal</p>
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
