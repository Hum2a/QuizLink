import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'medium',
  className = '',
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className={`loading-container ${className}`}>
      <div className="loading-spinner">
        <div className={`spinner ${sizeClasses[size]}`} />
        <p className="loading-message">{message}</p>
      </div>

      <style>{`
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
          padding: 2rem;
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .spinner {
          border: 3px solid #e5e7eb;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-message {
          color: #6b7280;
          font-size: 0.875rem;
          text-align: center;
          margin: 0;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-container.small {
          min-height: 100px;
          padding: 1rem;
        }

        .loading-container.large {
          min-height: 300px;
          padding: 3rem;
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
