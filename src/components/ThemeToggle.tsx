import React from 'react';
import { FaSun, FaMoon, FaDesktop } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
  size = 'md',
}) => {
  const { theme, actualTheme, setTheme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <FaDesktop />;
    }
    return actualTheme === 'dark' ? <FaMoon /> : <FaSun />;
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      case 'system':
        return 'System Theme';
      default:
        return 'Toggle Theme';
    }
  };

  const getTooltip = () => {
    switch (theme) {
      case 'light':
        return 'Switch to Dark Mode';
      case 'dark':
        return 'Switch to System Theme';
      case 'system':
        return 'Switch to Light Mode';
      default:
        return 'Toggle Theme';
    }
  };

  return (
    <div className={`theme-toggle ${className}`}>
      <button
        onClick={toggleTheme}
        className={`theme-toggle-button ${sizeClasses[size]}`}
        title={getTooltip()}
        aria-label={getLabel()}
      >
        {getIcon()}
      </button>

      {showLabel && <span className="theme-toggle-label">{getLabel()}</span>}

      <style>{`
        .theme-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .theme-toggle-button {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-surface);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          position: relative;
          overflow: hidden;
        }

        .theme-toggle-button:hover {
          background-color: var(--color-surface-hover);
          border-color: var(--color-border-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .theme-toggle-button:active {
          transform: translateY(0);
          box-shadow: var(--shadow-sm);
        }

        .theme-toggle-button:focus {
          outline: none;
          border-color: var(--color-border-focus);
          box-shadow: 0 0 0 3px var(--color-primary-light);
        }

        .theme-toggle-button svg {
          transition: transform var(--transition-fast);
        }

        .theme-toggle-button:hover svg {
          transform: scale(1.1);
        }

        .theme-toggle-label {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          font-weight: 500;
          white-space: nowrap;
        }

        /* Animation for theme change */
        .theme-toggle-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, var(--color-primary), var(--color-secondary));
          opacity: 0;
          transition: opacity var(--transition-normal);
          border-radius: inherit;
        }

        .theme-toggle-button:hover::before {
          opacity: 0.1;
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .theme-toggle-label {
            display: none;
          }
        }

        /* Dark mode specific adjustments */
        [data-theme="dark"] .theme-toggle-button {
          box-shadow: var(--shadow-sm);
        }

        [data-theme="dark"] .theme-toggle-button:hover {
          box-shadow: var(--shadow-md);
        }
      `}</style>
    </div>
  );
};

export default ThemeToggle;
