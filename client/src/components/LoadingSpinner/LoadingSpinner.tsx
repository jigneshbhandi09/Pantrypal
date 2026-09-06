import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...', size = 'medium' }) => {
  return (
    <div className={`spinner-container spinner-${size}`}>
      <div className="spinner-circle"></div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
};

