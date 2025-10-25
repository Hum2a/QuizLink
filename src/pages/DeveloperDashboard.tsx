import React, { useState } from 'react';
import {
  FaCode,
  FaUsers,
  FaChartBar,
  FaCog,
  FaDatabase,
  FaTerminal,
  FaShieldAlt,
} from 'react-icons/fa';
import { DeveloperOnly } from '../components/ProtectedRoute';
import RoleManagement from '../components/RoleManagement';

const DeveloperDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartBar },
    { id: 'roles', label: 'Role Management', icon: FaUsers },
    { id: 'analytics', label: 'Analytics', icon: FaChartBar },
    { id: 'logs', label: 'System Logs', icon: FaTerminal },
    { id: 'database', label: 'Database', icon: FaDatabase },
    { id: 'settings', label: 'Settings', icon: FaCog },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="developer-overview">
            <h2>Developer Dashboard</h2>
            <div className="overview-grid">
              <div className="overview-card">
                <FaCode className="card-icon" />
                <h3>System Status</h3>
                <p>All systems operational</p>
                <div className="status-indicator online"></div>
              </div>

              <div className="overview-card">
                <FaUsers className="card-icon" />
                <h3>Active Users</h3>
                <p>Loading...</p>
                <div className="status-indicator loading"></div>
              </div>

              <div className="overview-card">
                <FaDatabase className="card-icon" />
                <h3>Database</h3>
                <p>Connected</p>
                <div className="status-indicator online"></div>
              </div>

              <div className="overview-card">
                <FaShieldAlt className="card-icon" />
                <h3>Security</h3>
                <p>All checks passed</p>
                <div className="status-indicator online"></div>
              </div>
            </div>
          </div>
        );

      case 'roles':
        return <RoleManagement />;

      case 'analytics':
        return (
          <div className="analytics-section">
            <h2>System Analytics</h2>
            <p>Analytics dashboard coming soon...</p>
          </div>
        );

      case 'logs':
        return (
          <div className="logs-section">
            <h2>System Logs</h2>
            <p>Log viewer coming soon...</p>
          </div>
        );

      case 'database':
        return (
          <div className="database-section">
            <h2>Database Management</h2>
            <p>Database tools coming soon...</p>
          </div>
        );

      case 'settings':
        return (
          <div className="settings-section">
            <h2>Developer Settings</h2>
            <p>Settings panel coming soon...</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DeveloperOnly>
      <div className="developer-dashboard">
        <div className="dashboard-header">
          <h1>
            <FaCode /> Developer Dashboard
          </h1>
          <p>Advanced tools and system management</p>
        </div>

        <div className="dashboard-content">
          <div className="dashboard-sidebar">
            <nav className="tab-nav">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`tab-button ${
                      activeTab === tab.id ? 'active' : ''
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="dashboard-main">{renderTabContent()}</div>
        </div>
      </div>
    </DeveloperOnly>
  );
};

export default DeveloperDashboard;
