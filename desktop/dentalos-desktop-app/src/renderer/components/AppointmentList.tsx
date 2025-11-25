import React, { useState, useEffect } from 'react';
import { getDatabase } from '../../localdb/indexeddb';

export const AppointmentList: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, [selectedDate]);

  const loadAppointments = async () => {
    try {
      const db = getDatabase();
      const deviceInfo = await window.dentalos.device.getInfo();

      if (!deviceInfo) {
        return;
      }

      const date = new Date(selectedDate);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const results = await db.appointments
        .where('tenantId')
        .equals(deviceInfo.tenantId)
        .and(apt => apt.startTime >= startOfDay && apt.startTime <= endOfDay)
        .toArray();

      setAppointments(results);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading appointments...</div>;
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Appointments (Offline Cache)</h2>
          <p className="muted" style={{ margin: 0 }}>Showing cached visits for selected day.</p>
        </div>
      </div>

      <div className="date-picker">
        <label>Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <div className="appointment-list">
        {appointments.length === 0 ? (
          <p className="empty-state">No appointments for this date</p>
        ) : (
          appointments.map((apt) => (
            <div key={apt.appointmentId} className="appointment-card">
              <div className="time">
                {new Date(apt.startTime).toLocaleTimeString()} – {new Date(apt.endTime).toLocaleTimeString()}
              </div>
              <div className="patient muted">Patient ID: {apt.patientId}</div>
              <div className="provider muted">Provider ID: {apt.providerId}</div>
              <div className={`status status-${apt.status.toLowerCase()}`}>
                {apt.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
