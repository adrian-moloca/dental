/**
 * Calendar Demo Component
 *
 * Demonstration page showing the Calendar component with sample data
 * Useful for testing and showcasing calendar features
 */

import React, { useState, useMemo } from 'react';
import { Calendar } from './index';
import type { CalendarEvent, Resource } from './index';
import { addDays, addHours, setHours, setMinutes } from 'date-fns';

export const CalendarDemo: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Sample resources (providers/chairs)
  const resources: Resource[] = [
    { id: 'dr-maria', title: 'Dr. Maria Ionescu' },
    { id: 'dr-andrei', title: 'Dr. Andrei Popa' },
    { id: 'dr-elena', title: 'Dr. Elena Stanescu' },
  ];

  // Generate sample events
  const events = useMemo<CalendarEvent[]>(() => {
    const today = new Date();
    const baseDate = setMinutes(setHours(today, 0), 0);

    return [
      // Today - Dr. Maria
      {
        id: '1',
        title: 'Consultatie Initiala',
        start: setHours(setMinutes(baseDate, 0), 9),
        end: setHours(setMinutes(baseDate, 30), 9),
        resourceId: 'dr-maria',
        status: 'confirmed' as const,
        patientName: 'Ion Popescu',
        providerName: 'Dr. Maria Ionescu',
      },
      {
        id: '2',
        title: 'Detartraj & Periaj',
        start: setHours(setMinutes(baseDate, 0), 10),
        end: setHours(setMinutes(baseDate, 0), 11),
        resourceId: 'dr-maria',
        status: 'in_progress' as const,
        patientName: 'Ana Marinescu',
        providerName: 'Dr. Maria Ionescu',
      },
      {
        id: '3',
        title: 'Plomba',
        start: setHours(setMinutes(baseDate, 0), 11),
        end: setHours(setMinutes(baseDate, 30), 11),
        resourceId: 'dr-maria',
        status: 'scheduled' as const,
        patientName: 'George Vasilescu',
        providerName: 'Dr. Maria Ionescu',
      },
      {
        id: '4',
        title: 'Extractie',
        start: setHours(setMinutes(baseDate, 0), 14),
        end: setHours(setMinutes(baseDate, 0), 15),
        resourceId: 'dr-maria',
        status: 'confirmed' as const,
        patientName: 'Maria Dumitrescu',
        providerName: 'Dr. Maria Ionescu',
      },

      // Today - Dr. Andrei
      {
        id: '5',
        title: 'Control Post-Tratament',
        start: setHours(setMinutes(baseDate, 0), 9),
        end: setHours(setMinutes(baseDate, 30), 9),
        resourceId: 'dr-andrei',
        status: 'completed' as const,
        patientName: 'Cristian Munteanu',
        providerName: 'Dr. Andrei Popa',
      },
      {
        id: '6',
        title: 'Implant Dentar',
        start: setHours(setMinutes(baseDate, 0), 10),
        end: setHours(setMinutes(baseDate, 0), 12),
        resourceId: 'dr-andrei',
        status: 'confirmed' as const,
        patientName: 'Elena Radu',
        providerName: 'Dr. Andrei Popa',
      },
      {
        id: '7',
        title: 'Consultatie',
        start: setHours(setMinutes(baseDate, 0), 13),
        end: setHours(setMinutes(baseDate, 30), 13),
        resourceId: 'dr-andrei',
        status: 'cancelled' as const,
        patientName: 'Mihai Constantinescu',
        providerName: 'Dr. Andrei Popa',
      },
      {
        id: '8',
        title: 'Tratament Canal',
        start: setHours(setMinutes(baseDate, 0), 15),
        end: setHours(setMinutes(baseDate, 30), 16),
        resourceId: 'dr-andrei',
        status: 'scheduled' as const,
        patientName: 'Ioana Gheorghe',
        providerName: 'Dr. Andrei Popa',
      },

      // Today - Dr. Elena
      {
        id: '9',
        title: 'Albire Dentara',
        start: setHours(setMinutes(baseDate, 30), 9),
        end: setHours(setMinutes(baseDate, 30), 10),
        resourceId: 'dr-elena',
        status: 'confirmed' as const,
        patientName: 'Andreea Stan',
        providerName: 'Dr. Elena Stanescu',
      },
      {
        id: '10',
        title: 'Fatete Dentare',
        start: setHours(setMinutes(baseDate, 0), 11),
        end: setHours(setMinutes(baseDate, 0), 13),
        resourceId: 'dr-elena',
        status: 'scheduled' as const,
        patientName: 'Victor Moldovan',
        providerName: 'Dr. Elena Stanescu',
      },
      {
        id: '11',
        title: 'Urgenta',
        start: setHours(setMinutes(baseDate, 0), 16),
        end: setHours(setMinutes(baseDate, 30), 16),
        resourceId: 'dr-elena',
        status: 'no_show' as const,
        patientName: 'Laura Nistor',
        providerName: 'Dr. Elena Stanescu',
      },

      // Tomorrow
      {
        id: '12',
        title: 'Consultatie',
        start: addDays(setHours(setMinutes(baseDate, 0), 9), 1),
        end: addDays(setHours(setMinutes(baseDate, 30), 9), 1),
        resourceId: 'dr-maria',
        status: 'confirmed' as const,
        patientName: 'Dan Popescu',
        providerName: 'Dr. Maria Ionescu',
      },
      {
        id: '13',
        title: 'Detartraj',
        start: addDays(setHours(setMinutes(baseDate, 0), 10), 1),
        end: addDays(setHours(setMinutes(baseDate, 30), 10), 1),
        resourceId: 'dr-andrei',
        status: 'scheduled' as const,
        patientName: 'Sofia Badea',
        providerName: 'Dr. Andrei Popa',
      },

      // This week - various days
      {
        id: '14',
        title: 'Corona Dentara',
        start: addDays(setHours(setMinutes(baseDate, 0), 14), 2),
        end: addDays(setHours(setMinutes(baseDate, 30), 15), 2),
        resourceId: 'dr-elena',
        status: 'confirmed' as const,
        patientName: 'Robert Matei',
        providerName: 'Dr. Elena Stanescu',
      },
      {
        id: '15',
        title: 'Ortodontie',
        start: addDays(setHours(setMinutes(baseDate, 0), 11), 3),
        end: addDays(setHours(setMinutes(baseDate, 0), 12), 3),
        resourceId: 'dr-maria',
        status: 'scheduled' as const,
        patientName: 'Alexandra Stoica',
        providerName: 'Dr. Maria Ionescu',
      },
      {
        id: '16',
        title: 'Chirurgie Orala',
        start: addDays(setHours(setMinutes(baseDate, 0), 10), 4),
        end: addDays(setHours(setMinutes(baseDate, 0), 12), 4),
        resourceId: 'dr-andrei',
        status: 'confirmed' as const,
        patientName: 'Gabriel Serban',
        providerName: 'Dr. Andrei Popa',
      },
    ];
  }, []);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    console.log('Event clicked:', event);
  };

  const handleSlotClick = (date: Date, resourceId?: string) => {
    console.log('Slot clicked:', date, 'Resource:', resourceId);
    alert(`Creare programare noua la ${date.toLocaleString('ro-RO')} pentru ${resourceId || 'default'}`);
  };

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h1 className="mb-2">Calendar Demo</h1>
          <p className="text-muted">
            Demonstratie completa a componentei Calendar cu date de test
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <Calendar
              events={events}
              resources={resources}
              initialView="week"
              onEventClick={handleEventClick}
              onSlotClick={handleSlotClick}
              onDateChange={(date) => console.log('Date changed:', date)}
              onViewChange={(view) => console.log('View changed:', view)}
            />
          </div>
        </div>
      </div>

      {/* Event Details Card */}
      {selectedEvent && (
        <div className="row mt-4">
          <div className="col-md-6 mx-auto">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Detalii Programare</h5>
              </div>
              <div className="card-body">
                <dl className="row mb-0">
                  <dt className="col-sm-4">Titlu:</dt>
                  <dd className="col-sm-8">{selectedEvent.title}</dd>

                  <dt className="col-sm-4">Pacient:</dt>
                  <dd className="col-sm-8">{selectedEvent.patientName || 'N/A'}</dd>

                  <dt className="col-sm-4">Doctor:</dt>
                  <dd className="col-sm-8">{selectedEvent.providerName || 'N/A'}</dd>

                  <dt className="col-sm-4">Data:</dt>
                  <dd className="col-sm-8">
                    {selectedEvent.start.toLocaleDateString('ro-RO')}
                  </dd>

                  <dt className="col-sm-4">Ora:</dt>
                  <dd className="col-sm-8">
                    {selectedEvent.start.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })} -{' '}
                    {selectedEvent.end.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                  </dd>

                  <dt className="col-sm-4">Status:</dt>
                  <dd className="col-sm-8">
                    <span className={`badge bg-${getStatusColor(selectedEvent.status || 'scheduled')}`}>
                      {getStatusLabel(selectedEvent.status || 'scheduled')}
                    </span>
                  </dd>
                </dl>

                <div className="mt-3">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setSelectedEvent(null)}
                  >
                    Inchide
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="mb-3">Legenda Statusuri</h6>
              <div className="d-flex flex-wrap gap-3">
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: 20, height: 20, background: 'var(--gray-transparent)', border: '3px solid var(--gray-500)', borderRadius: 4 }}></div>
                  <span className="small">Programat</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: 20, height: 20, background: 'var(--success-transparent)', border: '3px solid var(--success)', borderRadius: 4 }}></div>
                  <span className="small">Confirmat</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: 20, height: 20, background: 'var(--info-transparent)', border: '3px solid var(--info)', borderRadius: 4 }}></div>
                  <span className="small">In desfasurare</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: 20, height: 20, background: 'var(--light-300)', border: '3px solid var(--gray-400)', borderRadius: 4 }}></div>
                  <span className="small">Finalizat</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: 20, height: 20, background: 'var(--danger-transparent)', border: '3px solid var(--danger)', borderRadius: 4 }}></div>
                  <span className="small">Anulat</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: 20, height: 20, background: 'var(--warning-transparent)', border: '3px solid var(--warning)', borderRadius: 4 }}></div>
                  <span className="small">Absent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    scheduled: 'secondary',
    confirmed: 'success',
    in_progress: 'info',
    completed: 'light',
    cancelled: 'danger',
    no_show: 'warning',
  };
  return colors[status] || 'secondary';
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    scheduled: 'Programat',
    confirmed: 'Confirmat',
    in_progress: 'In desfasurare',
    completed: 'Finalizat',
    cancelled: 'Anulat',
    no_show: 'Absent',
  };
  return labels[status] || status;
}
