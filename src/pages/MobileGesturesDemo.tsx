import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaMobile,
  FaHandPaper,
  FaArrowRight,
  FaArrowLeft,
  FaHandPointUp,
} from 'react-icons/fa';
import { useMobileDetection } from '../hooks/useMobileDetection';

const MobileGesturesDemo: React.FC = () => {
  const { isMobile, isTablet, touchSupport } = useMobileDetection();

  return (
    <div className="mobile-gestures-demo">
      <div className="demo-header">
        <h1>
          <FaMobile /> Mobile Gestures Demo
        </h1>
        <p>Experience QuizLink's intuitive mobile interface</p>
      </div>

      <div className="device-info">
        <div className="info-card">
          <h3>Device Detection</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Mobile:</span>
              <span className={`value ${isMobile ? 'yes' : 'no'}`}>
                {isMobile ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Tablet:</span>
              <span className={`value ${isTablet ? 'yes' : 'no'}`}>
                {isTablet ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Touch Support:</span>
              <span className={`value ${touchSupport ? 'yes' : 'no'}`}>
                {touchSupport ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="gestures-section">
        <h2>Available Gestures</h2>

        <div className="gesture-grid">
          <div className="gesture-card">
            <div className="gesture-icon">
              <FaArrowLeft />
            </div>
            <h3>Swipe Right</h3>
            <p>Navigate to previous question</p>
            <div className="gesture-demo">
              <div className="swipe-indicator left">
                <FaArrowLeft />
              </div>
            </div>
          </div>

          <div className="gesture-card">
            <div className="gesture-icon">
              <FaArrowRight />
            </div>
            <h3>Swipe Left</h3>
            <p>Navigate to next question</p>
            <div className="gesture-demo">
              <div className="swipe-indicator right">
                <FaArrowRight />
              </div>
            </div>
          </div>

          <div className="gesture-card">
            <div className="gesture-icon">
              <FaHandPointUp />
            </div>
            <h3>Tap</h3>
            <p>Select answer options</p>
            <div className="gesture-demo">
              <div className="tap-indicator">
                <FaHandPointUp />
              </div>
            </div>
          </div>

          <div className="gesture-card">
            <div className="gesture-icon">
              <FaHandPaper />
            </div>
            <h3>Long Press</h3>
            <p>Access additional options</p>
            <div className="gesture-demo">
              <div className="longpress-indicator">
                <FaHandPaper />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h2>Try It Out</h2>
        <div className="demo-actions">
          <Link to="/mobile/browse" className="demo-btn primary">
            <FaMobile /> Mobile Quiz Browser
          </Link>
          <Link to="/browse-quizzes" className="demo-btn secondary">
            <FaHandPointUp /> Regular Browser
          </Link>
        </div>
      </div>

      <div className="features-section">
        <h2>Mobile Features</h2>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">📱</div>
            <h3>Touch Optimized</h3>
            <p>Large touch targets and intuitive gestures</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <h3>Fast Navigation</h3>
            <p>Swipe between questions effortlessly</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🎯</div>
            <h3>Precise Selection</h3>
            <p>Tap to select answers with visual feedback</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔄</div>
            <h3>Auto-Detection</h3>
            <p>Automatically adapts to your device</p>
          </div>
        </div>
      </div>

      <style>{`
        .mobile-gestures-demo {
          min-height: 100vh;
          background: var(--color-background);
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .demo-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .demo-header h1 {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 1rem 0;
        }

        .demo-header p {
          color: var(--color-text-secondary);
          font-size: 1.125rem;
          margin: 0;
        }

        .device-info {
          margin-bottom: 3rem;
        }

        .info-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 2rem;
          box-shadow: var(--shadow-sm);
        }

        .info-card h3 {
          margin: 0 0 1.5rem 0;
          color: var(--color-text-primary);
          font-size: 1.25rem;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: var(--color-background-secondary);
          border-radius: var(--radius-md);
        }

        .info-item .label {
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .info-item .value {
          font-weight: 600;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.875rem;
        }

        .info-item .value.yes {
          background: var(--color-success-light);
          color: var(--color-success);
        }

        .info-item .value.no {
          background: var(--color-error-light);
          color: var(--color-error);
        }

        .gestures-section {
          margin-bottom: 3rem;
        }

        .gestures-section h2 {
          text-align: center;
          margin: 0 0 2rem 0;
          color: var(--color-text-primary);
          font-size: 2rem;
        }

        .gesture-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .gesture-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 2rem;
          text-align: center;
          transition: all var(--transition-normal);
        }

        .gesture-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .gesture-icon {
          font-size: 2rem;
          color: var(--color-primary);
          margin-bottom: 1rem;
        }

        .gesture-card h3 {
          margin: 0 0 0.5rem 0;
          color: var(--color-text-primary);
          font-size: 1.25rem;
        }

        .gesture-card p {
          color: var(--color-text-secondary);
          margin: 0 0 1.5rem 0;
        }

        .gesture-demo {
          height: 4rem;
          background: var(--color-background-secondary);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .swipe-indicator {
          font-size: 1.5rem;
          color: var(--color-primary);
          animation: swipeAnimation 2s infinite;
        }

        .tap-indicator {
          font-size: 1.5rem;
          color: var(--color-success);
          animation: tapAnimation 2s infinite;
        }

        .longpress-indicator {
          font-size: 1.5rem;
          color: var(--color-warning);
          animation: pulse 2s infinite;
        }

        .demo-section {
          text-align: center;
          margin-bottom: 3rem;
        }

        .demo-section h2 {
          margin: 0 0 2rem 0;
          color: var(--color-text-primary);
          font-size: 2rem;
        }

        .demo-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .demo-btn {
          padding: 1rem 2rem;
          border-radius: var(--radius-lg);
          font-weight: 600;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all var(--transition-fast);
        }

        .demo-btn.primary {
          background: var(--color-primary);
          color: var(--color-text-inverse);
        }

        .demo-btn.primary:hover {
          background: var(--color-primary-hover);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .demo-btn.secondary {
          background: var(--color-surface);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border);
        }

        .demo-btn.secondary:hover {
          background: var(--color-surface-hover);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .features-section h2 {
          text-align: center;
          margin: 0 0 2rem 0;
          color: var(--color-text-primary);
          font-size: 2rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .feature-item {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 2rem;
          text-align: center;
          transition: all var(--transition-normal);
        }

        .feature-item:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .feature-item h3 {
          margin: 0 0 0.5rem 0;
          color: var(--color-text-primary);
          font-size: 1.125rem;
        }

        .feature-item p {
          color: var(--color-text-secondary);
          margin: 0;
          line-height: 1.5;
        }

        @keyframes swipeAnimation {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(20px);
          }
        }

        @keyframes tapAnimation {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        @media (max-width: 768px) {
          .mobile-gestures-demo {
            padding: 1rem;
          }

          .demo-header h1 {
            font-size: 2rem;
          }

          .gesture-grid,
          .features-grid {
            grid-template-columns: 1fr;
          }

          .demo-actions {
            flex-direction: column;
            align-items: center;
          }

          .demo-btn {
            width: 100%;
            max-width: 300px;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default MobileGesturesDemo;
