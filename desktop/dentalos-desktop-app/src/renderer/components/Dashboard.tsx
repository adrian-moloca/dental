import React, { useState } from 'react';
import { SyncStatus } from './SyncStatus';
import { PatientList } from './PatientList';
import { AppointmentList } from './AppointmentList';
import { NavigationDrawer } from './NavigationDrawer';

type View = 'sync' | 'patients' | 'appointments';

export const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('sync');

  return (
    <div className="dashboard">
      <NavigationDrawer activeView={activeView} onViewChange={setActiveView} />

      <div className="main-content">
        {activeView === 'sync' && <SyncStatus />}
        {activeView === 'patients' && <PatientList />}
        {activeView === 'appointments' && <AppointmentList />}
      </div>
    </div>
  );
};
