import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChevronRight, FaHome } from 'react-icons/fa';
import { getBreadcrumbs } from '../navigation';

interface BreadcrumbProps {
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ className = '' }) => {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  // Don't show breadcrumbs on the main dashboard
  if (location.pathname === '/dashboard' || location.pathname === '/') {
    return null;
  }

  return (
    <nav className={`breadcrumb ${className}`} aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.path} className="breadcrumb-item">
            {index === breadcrumbs.length - 1 ? (
              <span className="breadcrumb-current" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <>
                <Link to={crumb.path} className="breadcrumb-link">
                  {index === 0 && <FaHome className="breadcrumb-icon" />}
                  {crumb.label}
                </Link>
                <FaChevronRight className="breadcrumb-separator" />
              </>
            )}
          </li>
        ))}
      </ol>

      <style>{`
        .breadcrumb {
          padding: 0.75rem 0;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .breadcrumb-list {
          display: flex;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .breadcrumb-item {
          display: flex;
          align-items: center;
          font-size: 0.875rem;
        }

        .breadcrumb-link {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #6b7280;
          text-decoration: none;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          transition: all 0.2s;
        }

        .breadcrumb-link:hover {
          color: #3b82f6;
          background: #eff6ff;
        }

        .breadcrumb-icon {
          font-size: 0.75rem;
        }

        .breadcrumb-separator {
          color: #9ca3af;
          font-size: 0.75rem;
          margin: 0 0.5rem;
        }

        .breadcrumb-current {
          color: #374151;
          font-weight: 500;
          padding: 0.25rem 0.5rem;
        }

        @media (max-width: 640px) {
          .breadcrumb-list {
            padding: 0 0.5rem;
          }

          .breadcrumb-link,
          .breadcrumb-current {
            padding: 0.125rem 0.25rem;
          }

          .breadcrumb-separator {
            margin: 0 0.25rem;
          }
        }
      `}</style>
    </nav>
  );
};

export default Breadcrumb;
