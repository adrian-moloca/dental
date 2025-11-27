/**
 * Quick Actions Bar Component
 *
 * Provides quick access to common reception actions.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Button } from '../ui-new';
import toast from 'react-hot-toast';

interface QuickActionsBarProps {
  onWalkInClick: () => void;
  onEmergencyClick: () => void;
}

export function QuickActionsBar({ onWalkInClick, onEmergencyClick }: QuickActionsBarProps) {
  const navigate = useNavigate();

  const handlePrintSchedule = () => {
    toast.success('Imprimare program zilnic in curs...');
    window.print();
  };

  const handleBulkReminders = () => {
    toast.success('Trimitere reminder-uri in curs...');
  };

  return (
    <Card className="shadow-sm mb-4">
      <CardBody className="py-3">
        <div className="d-flex flex-wrap gap-2 justify-content-center">
          {/* Walk-in Patient */}
          <Button variant="primary" onClick={onWalkInClick}>
            <i className="ti ti-user-plus me-2"></i>
            Pacient Walk-in
          </Button>

          {/* Emergency */}
          <Button variant="danger" onClick={onEmergencyClick}>
            <i className="ti ti-urgent me-2"></i>
            Urgenta
          </Button>

          {/* New Appointment */}
          <Button variant="info" onClick={() => navigate('/appointments/create')}>
            <i className="ti ti-calendar-plus me-2"></i>
            Programare Noua
          </Button>

          {/* Bulk Reminders */}
          <Button variant="outline-secondary" onClick={handleBulkReminders}>
            <i className="ti ti-message-circle me-2"></i>
            Trimitere Reminder-uri
          </Button>

          {/* Print Schedule */}
          <Button variant="outline-secondary" onClick={handlePrintSchedule}>
            <i className="ti ti-printer me-2"></i>
            Printeaza Program
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
