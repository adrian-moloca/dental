import React from 'react';

interface NavigationDrawerProps {
  activeView: string;
  onViewChange: (view: 'sync' | 'patients' | 'appointments') => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  activeView,
  onViewChange
}) => {
  return (
    <nav className="sidebar">
      <div className="section-label">Navigation</div>
      <div className="nav-items">
        <button
          className={activeView === 'sync' ? 'active' : ''}
          onClick={() => onViewChange('sync')}
        >
          🔄 Sync Status
        </button>
        <button
          className={activeView === 'patients' ? 'active' : ''}
          onClick={() => onViewChange('patients')}
        >
          👤 Patients
        </button>
        <button
          className={activeView === 'appointments' ? 'active' : ''}
          onClick={() => onViewChange('appointments')}
        >
          📅 Appointments
        </button>
      </div>
    </nav>
  );
};
