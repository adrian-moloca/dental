import React, { useState, useEffect } from 'react';
import { getDatabase } from '../../localdb/indexeddb';

export const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, [searchQuery]);

  const loadPatients = async () => {
    try {
      const db = getDatabase();
      const deviceInfo = await window.dentalos.device.getInfo();

      if (!deviceInfo) {
        return;
      }

      let results;
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        results = await db.patients
          .where('tenantId')
          .equals(deviceInfo.tenantId)
          .filter(p => {
            const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
            return fullName.includes(lowerQuery);
          })
          .limit(50)
          .toArray();
      } else {
        results = await db.patients
          .where('tenantId')
          .equals(deviceInfo.tenantId)
          .limit(50)
          .toArray();
      }

      setPatients(results);
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading patients...</div>;
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Patients (Offline Cache)</h2>
          <p className="muted" style={{ margin: 0 }}>Local copy limited to 50 recent records.</p>
        </div>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search patients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="patient-list">
        {patients.length === 0 ? (
          <p className="empty-state">No patients found</p>
        ) : (
          patients.map((patient) => (
            <div key={patient.patientId} className="patient-card">
              <h3>{patient.firstName} {patient.lastName}</h3>
              <p className="muted">Email: {patient.email || 'N/A'}</p>
              <p className="muted">Phone: {patient.phone || 'N/A'}</p>
              <p className="muted">
                Updated: {new Date(patient.updatedAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
