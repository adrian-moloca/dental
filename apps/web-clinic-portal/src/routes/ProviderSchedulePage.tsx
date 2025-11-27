/**
 * Provider Schedule Management Page
 *
 * Comprehensive schedule management for dental providers including:
 * - Provider selection with photo and quick stats
 * - Weekly calendar view with appointments
 * - Working hours configuration (multiple blocks per day)
 * - Time off management (vacation, sick days, recurring exceptions)
 * - Availability exceptions (overrides, extended hours)
 * - Appointment types configuration per provider
 * - Utilization statistics
 *
 * Design: Bootstrap 5, Romanian localization
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  addMinutes,
  differenceInMinutes,
  parseISO,
  setHours,
  setMinutes,
  addWeeks,
  subWeeks,
  isAfter,
  isBefore,
  eachDayOfInterval,
} from 'date-fns';
import { ro } from 'date-fns/locale';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader, CardBody } from '../components/ui-new/Card';
import { Button } from '../components/ui-new/Button';
import { Input } from '../components/ui-new/Input';
import { Modal, ConfirmModal } from '../components/ui-new/Modal';
import { Badge } from '../components/ui-new/Badge';
import { CompactStats } from '../components/ui-new/StatsCard';

// =============================================================================
// TYPES
// =============================================================================

interface Provider {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  photoUrl?: string;
  color: string;
  isActive: boolean;
}

interface TimeBlock {
  id: string;
  start: string; // HH:mm format
  end: string;   // HH:mm format
  isBreak?: boolean;
  label?: string;
}

interface DaySchedule {
  enabled: boolean;
  timeBlocks: TimeBlock[];
}

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface TimeOff {
  id: string;
  providerId: string;
  type: 'vacation' | 'sick' | 'personal' | 'training' | 'other';
  startDate: string; // ISO date
  endDate: string;   // ISO date
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  isRecurring?: boolean;
  recurrencePattern?: string; // e.g., "every Wednesday"
}

interface AvailabilityException {
  id: string;
  providerId: string;
  date: string; // ISO date
  type: 'blocked' | 'extended' | 'modified';
  reason?: string;
  timeBlocks?: TimeBlock[]; // For modified/extended hours
}

interface AppointmentType {
  id: string;
  code: string;
  name: string;
  duration: number; // minutes
  color: string;
  isEnabled: boolean;
  bufferBefore: number; // minutes
  bufferAfter: number;  // minutes
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  providerId: string;
  appointmentTypeId: string;
  appointmentTypeName: string;
  startTime: string; // ISO datetime
  endTime: string;   // ISO datetime
  status: 'scheduled' | 'confirmed' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
}

interface ProviderStats {
  appointmentsThisWeek: number;
  revenueThisWeek: number;
  utilizationPercent: number;
  averageAppointmentsPerDay: number;
  busiestDay: string;
  busiestHour: string;
  noShowRate: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Luni',
  tuesday: 'Marti',
  wednesday: 'Miercuri',
  thursday: 'Joi',
  friday: 'Vineri',
  saturday: 'Sambata',
  sunday: 'Duminica',
};

const DAY_LABELS_SHORT: Record<DayOfWeek, string> = {
  monday: 'Lun',
  tuesday: 'Mar',
  wednesday: 'Mie',
  thursday: 'Joi',
  friday: 'Vin',
  saturday: 'Sam',
  sunday: 'Dum',
};

const DAYS_ORDER: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const TIME_OFF_TYPE_LABELS: Record<TimeOff['type'], string> = {
  vacation: 'Concediu',
  sick: 'Medical',
  personal: 'Personal',
  training: 'Training',
  other: 'Altele',
};

type BadgeVariant = 'soft-info' | 'soft-danger' | 'soft-warning' | 'soft-primary' | 'soft-secondary';

const TIME_OFF_TYPE_COLORS: Record<TimeOff['type'], string> = {
  vacation: 'info',
  sick: 'danger',
  personal: 'warning',
  training: 'primary',
  other: 'secondary',
};

const TIME_OFF_BADGE_VARIANTS: Record<TimeOff['type'], BadgeVariant> = {
  vacation: 'soft-info',
  sick: 'soft-danger',
  personal: 'soft-warning',
  training: 'soft-primary',
  other: 'soft-secondary',
};

type AppointmentBadgeVariant = 'soft-secondary' | 'soft-primary' | 'soft-info' | 'soft-warning' | 'soft-success' | 'soft-danger' | 'dark';

const APPOINTMENT_STATUS_COLORS: Record<Appointment['status'], string> = {
  scheduled: 'secondary',
  confirmed: 'primary',
  checked_in: 'info',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'danger',
  no_show: 'dark',
};

const APPOINTMENT_STATUS_BADGE_VARIANTS: Record<Appointment['status'], AppointmentBadgeVariant> = {
  scheduled: 'soft-secondary',
  confirmed: 'soft-primary',
  checked_in: 'soft-info',
  in_progress: 'soft-warning',
  completed: 'soft-success',
  cancelled: 'soft-danger',
  no_show: 'dark',
};

const APPOINTMENT_STATUS_LABELS: Record<Appointment['status'], string> = {
  scheduled: 'Programat',
  confirmed: 'Confirmat',
  checked_in: 'Check-in',
  in_progress: 'In desfasurare',
  completed: 'Finalizat',
  cancelled: 'Anulat',
  no_show: 'Absent',
};

const SLOT_HEIGHT = 48; // pixels per 30 min slot
const SLOT_DURATION = 30; // minutes
const START_HOUR = 7;
const END_HOUR = 21;

// =============================================================================
// MOCK DATA
// =============================================================================

const mockProviders: Provider[] = [
  {
    id: 'prov-1',
    firstName: 'Maria',
    lastName: 'Popescu',
    email: 'maria.popescu@clinica.ro',
    phone: '+40 721 123 456',
    specialty: 'Stomatologie Generala',
    photoUrl: undefined,
    color: '#4F46E5',
    isActive: true,
  },
  {
    id: 'prov-2',
    firstName: 'Ion',
    lastName: 'Ionescu',
    email: 'ion.ionescu@clinica.ro',
    phone: '+40 722 234 567',
    specialty: 'Ortodontie',
    photoUrl: undefined,
    color: '#059669',
    isActive: true,
  },
  {
    id: 'prov-3',
    firstName: 'Elena',
    lastName: 'Dumitrescu',
    email: 'elena.dumitrescu@clinica.ro',
    phone: '+40 723 345 678',
    specialty: 'Endodontie',
    photoUrl: undefined,
    color: '#DC2626',
    isActive: true,
  },
];

const defaultWorkingHours: WorkingHours = {
  monday: {
    enabled: true,
    timeBlocks: [
      { id: 'mon-1', start: '09:00', end: '13:00' },
      { id: 'mon-break', start: '13:00', end: '14:00', isBreak: true, label: 'Pauza pranz' },
      { id: 'mon-2', start: '14:00', end: '18:00' },
    ],
  },
  tuesday: {
    enabled: true,
    timeBlocks: [
      { id: 'tue-1', start: '09:00', end: '13:00' },
      { id: 'tue-break', start: '13:00', end: '14:00', isBreak: true, label: 'Pauza pranz' },
      { id: 'tue-2', start: '14:00', end: '18:00' },
    ],
  },
  wednesday: {
    enabled: true,
    timeBlocks: [
      { id: 'wed-1', start: '09:00', end: '13:00' },
      { id: 'wed-break', start: '13:00', end: '14:00', isBreak: true, label: 'Pauza pranz' },
      { id: 'wed-2', start: '14:00', end: '18:00' },
    ],
  },
  thursday: {
    enabled: true,
    timeBlocks: [
      { id: 'thu-1', start: '09:00', end: '13:00' },
      { id: 'thu-break', start: '13:00', end: '14:00', isBreak: true, label: 'Pauza pranz' },
      { id: 'thu-2', start: '14:00', end: '18:00' },
    ],
  },
  friday: {
    enabled: true,
    timeBlocks: [
      { id: 'fri-1', start: '09:00', end: '13:00' },
      { id: 'fri-break', start: '13:00', end: '14:00', isBreak: true, label: 'Pauza pranz' },
      { id: 'fri-2', start: '14:00', end: '17:00' },
    ],
  },
  saturday: {
    enabled: false,
    timeBlocks: [],
  },
  sunday: {
    enabled: false,
    timeBlocks: [],
  },
};

const mockAppointmentTypes: AppointmentType[] = [
  { id: 'type-1', code: 'CONS', name: 'Consultatie', duration: 30, color: '#3B82F6', isEnabled: true, bufferBefore: 0, bufferAfter: 5 },
  { id: 'type-2', code: 'DETA', name: 'Detartraj', duration: 45, color: '#10B981', isEnabled: true, bufferBefore: 5, bufferAfter: 10 },
  { id: 'type-3', code: 'OBTU', name: 'Obturatie', duration: 60, color: '#F59E0B', isEnabled: true, bufferBefore: 5, bufferAfter: 10 },
  { id: 'type-4', code: 'EXTR', name: 'Extractie', duration: 45, color: '#EF4444', isEnabled: true, bufferBefore: 10, bufferAfter: 15 },
  { id: 'type-5', code: 'TRAT', name: 'Tratament Canal', duration: 90, color: '#8B5CF6', isEnabled: true, bufferBefore: 10, bufferAfter: 15 },
  { id: 'type-6', code: 'CORO', name: 'Coroana', duration: 60, color: '#EC4899', isEnabled: false, bufferBefore: 5, bufferAfter: 10 },
];

const mockTimeOffs: TimeOff[] = [
  {
    id: 'to-1',
    providerId: 'prov-1',
    type: 'vacation',
    startDate: '2024-12-23',
    endDate: '2024-12-27',
    reason: 'Vacanta de Craciun',
    status: 'approved',
  },
  {
    id: 'to-2',
    providerId: 'prov-1',
    type: 'training',
    startDate: '2024-12-10',
    endDate: '2024-12-10',
    reason: 'Conferinta Stomatologie',
    status: 'approved',
  },
];

const mockExceptions: AvailabilityException[] = [
  {
    id: 'exc-1',
    providerId: 'prov-1',
    date: '2024-12-15',
    type: 'extended',
    reason: 'Program prelungit pentru urgente',
    timeBlocks: [
      { id: 'exc-1-1', start: '09:00', end: '20:00' },
    ],
  },
];

// Generate mock appointments for the current week
function generateMockAppointments(providerId: string, weekStart: Date): Appointment[] {
  const appointments: Appointment[] = [];
  const types = mockAppointmentTypes.filter((t) => t.isEnabled);

  for (let day = 0; day < 5; day++) {
    const date = addDays(weekStart, day);
    const appointmentCount = Math.floor(Math.random() * 5) + 3;

    let currentHour = 9;
    for (let i = 0; i < appointmentCount && currentHour < 17; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const startTime = setMinutes(setHours(date, currentHour), Math.random() > 0.5 ? 30 : 0);
      const endTime = addMinutes(startTime, type.duration);

      const statuses: Appointment['status'][] = ['scheduled', 'confirmed', 'completed'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      appointments.push({
        id: `appt-${providerId}-${day}-${i}`,
        patientId: `pat-${i}`,
        patientName: ['Ana Maria', 'Ion Popescu', 'Elena Georgescu', 'Mihai Ionescu', 'Cristina Popa'][i % 5],
        providerId,
        appointmentTypeId: type.id,
        appointmentTypeName: type.name,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        status,
      });

      currentHour = endTime.getHours() + (endTime.getMinutes() > 0 ? 1 : 0);
    }
  }

  return appointments;
}

const mockStats: ProviderStats = {
  appointmentsThisWeek: 24,
  revenueThisWeek: 12500,
  utilizationPercent: 78,
  averageAppointmentsPerDay: 4.8,
  busiestDay: 'Marti',
  busiestHour: '10:00 - 11:00',
  noShowRate: 5.2,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function formatCurrency(amount: number, currency: string = 'RON'): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getProviderInitials(provider: Provider): string {
  return `${provider.firstName[0]}${provider.lastName[0]}`;
}

function getDayOfWeekFromDate(date: Date): DayOfWeek {
  const dayIndex = date.getDay();
  // JavaScript: 0 = Sunday, 1 = Monday, etc.
  const dayMap: Record<number, DayOfWeek> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };
  return dayMap[dayIndex];
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// =============================================================================
// COMPONENTS
// =============================================================================

// Provider Avatar Component
function ProviderAvatar({ provider, size = 'md' }: { provider: Provider; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClasses = {
    sm: 'avatar-sm',
    md: '',
    lg: 'avatar-lg',
    xl: 'avatar-xl',
  };

  if (provider.photoUrl) {
    return (
      <div className={`avatar ${sizeClasses[size]}`}>
        <img src={provider.photoUrl} alt={`${provider.firstName} ${provider.lastName}`} className="rounded-circle" />
      </div>
    );
  }

  return (
    <div
      className={`avatar ${sizeClasses[size]} rounded-circle d-flex align-items-center justify-content-center text-white fw-bold`}
      style={{ backgroundColor: provider.color }}
    >
      {getProviderInitials(provider)}
    </div>
  );
}

// Provider Selection Header
function ProviderSelectionHeader({
  providers,
  selectedProviderId,
  onSelectProvider,
  stats,
}: {
  providers: Provider[];
  selectedProviderId: string;
  onSelectProvider: (id: string) => void;
  stats: ProviderStats;
}) {
  const selectedProvider = providers.find((p) => p.id === selectedProviderId);

  return (
    <Card className="mb-4">
      <CardBody>
        <div className="row align-items-center">
          {/* Provider Selector */}
          <div className="col-lg-6 col-md-12 mb-3 mb-lg-0">
            <div className="d-flex align-items-center gap-3">
              {/* Provider Tabs */}
              <div className="d-flex gap-2 flex-wrap">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    className={clsx(
                      'btn d-flex align-items-center gap-2 px-3 py-2',
                      selectedProviderId === provider.id ? 'btn-primary' : 'btn-outline-secondary'
                    )}
                    onClick={() => onSelectProvider(provider.id)}
                  >
                    <ProviderAvatar provider={provider} size="sm" />
                    <span className="d-none d-md-inline">
                      Dr. {provider.lastName}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Provider Info & Stats */}
          {selectedProvider && (
            <div className="col-lg-6 col-md-12">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                {/* Provider Details */}
                <div className="d-flex align-items-center gap-3">
                  <ProviderAvatar provider={selectedProvider} size="lg" />
                  <div>
                    <h5 className="mb-0 fw-bold">
                      Dr. {selectedProvider.firstName} {selectedProvider.lastName}
                    </h5>
                    <p className="text-muted mb-0 small">{selectedProvider.specialty}</p>
                    <Badge variant="soft-success" className="mt-1">
                      <i className="ti ti-circle-check me-1"></i>
                      Activ
                    </Badge>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="d-flex gap-4">
                  <div className="text-center">
                    <h4 className="mb-0 fw-bold text-primary">{stats.appointmentsThisWeek}</h4>
                    <small className="text-muted">Programari</small>
                  </div>
                  <div className="text-center">
                    <h4 className="mb-0 fw-bold text-success">{formatCurrency(stats.revenueThisWeek)}</h4>
                    <small className="text-muted">Venituri</small>
                  </div>
                  <div className="text-center">
                    <h4 className="mb-0 fw-bold text-info">{stats.utilizationPercent}%</h4>
                    <small className="text-muted">Utilizare</small>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// Weekly Calendar Grid
function WeeklyCalendarView({
  currentWeekStart,
  onWeekChange,
  appointments,
  workingHours,
  timeOffs,
  exceptions,
  onAppointmentClick,
  onSlotClick,
  onAppointmentDrag,
}: {
  currentWeekStart: Date;
  onWeekChange: (date: Date) => void;
  appointments: Appointment[];
  workingHours: WorkingHours;
  timeOffs: TimeOff[];
  exceptions: AvailabilityException[];
  onAppointmentClick: (appointment: Appointment) => void;
  onSlotClick: (date: Date, time: string) => void;
  onAppointmentDrag: (appointmentId: string, newDate: Date, newTime: string) => void;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ date: Date; time: string } | null>(null);

  // Generate time slots
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
      for (let minute = 0; minute < 60; minute += SLOT_DURATION) {
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    return slots;
  }, []);

  // Generate days of the week
  const weekDays = useMemo(() => {
    return eachDayOfInterval({
      start: currentWeekStart,
      end: addDays(currentWeekStart, 6),
    });
  }, [currentWeekStart]);

  // Scroll to current time on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      if (currentHour >= START_HOUR && currentHour < END_HOUR) {
        const scrollPosition = ((currentHour - START_HOUR) * 2 * SLOT_HEIGHT) - 100;
        scrollContainerRef.current.scrollTop = Math.max(0, scrollPosition);
      }
    }
  }, []);

  // Check if a time slot is within working hours
  const isWorkingHour = useCallback((date: Date, time: string): boolean => {
    const dayOfWeek = getDayOfWeekFromDate(date);
    const daySchedule = workingHours[dayOfWeek];

    if (!daySchedule.enabled) return false;

    const timeMinutes = timeToMinutes(time);

    return daySchedule.timeBlocks.some((block) => {
      if (block.isBreak) return false;
      const blockStart = timeToMinutes(block.start);
      const blockEnd = timeToMinutes(block.end);
      return timeMinutes >= blockStart && timeMinutes < blockEnd;
    });
  }, [workingHours]);

  // Check if a date is blocked (time off or exception)
  const isDateBlocked = useCallback((date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');

    // Check time offs
    const hasTimeOff = timeOffs.some((to) => {
      if (to.status !== 'approved') return false;
      return dateStr >= to.startDate && dateStr <= to.endDate;
    });

    if (hasTimeOff) return true;

    // Check exceptions
    const hasBlockedException = exceptions.some(
      (exc) => exc.date === dateStr && exc.type === 'blocked'
    );

    return hasBlockedException;
  }, [timeOffs, exceptions]);

  // Check if a time slot is a break
  const isBreakTime = useCallback((date: Date, time: string): boolean => {
    const dayOfWeek = getDayOfWeekFromDate(date);
    const daySchedule = workingHours[dayOfWeek];

    if (!daySchedule.enabled) return false;

    const timeMinutes = timeToMinutes(time);

    return daySchedule.timeBlocks.some((block) => {
      if (!block.isBreak) return false;
      const blockStart = timeToMinutes(block.start);
      const blockEnd = timeToMinutes(block.end);
      return timeMinutes >= blockStart && timeMinutes < blockEnd;
    });
  }, [workingHours]);

  // Get appointments for a specific day
  const getAppointmentsForDay = useCallback((date: Date): Appointment[] => {
    return appointments.filter((appt) => {
      const apptDate = parseISO(appt.startTime);
      return isSameDay(apptDate, date);
    });
  }, [appointments]);

  // Calculate appointment position and height
  const getAppointmentStyle = (appointment: Appointment) => {
    const start = parseISO(appointment.startTime);
    const end = parseISO(appointment.endTime);

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const slotStartMinutes = START_HOUR * 60;

    const top = ((startMinutes - slotStartMinutes) / SLOT_DURATION) * SLOT_HEIGHT;
    const height = Math.max(SLOT_HEIGHT / 2, ((endMinutes - startMinutes) / SLOT_DURATION) * SLOT_HEIGHT);

    return { top, height };
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, appointment: Appointment) => {
    setDraggedAppointment(appointment);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, date: Date, time: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot({ date, time });
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, date: Date, time: string) => {
    e.preventDefault();
    setDragOverSlot(null);

    if (draggedAppointment) {
      onAppointmentDrag(draggedAppointment.id, date, time);
      setDraggedAppointment(null);
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedAppointment(null);
    setDragOverSlot(null);
  };

  // Navigation handlers
  const goToPreviousWeek = () => onWeekChange(subWeeks(currentWeekStart, 1));
  const goToNextWeek = () => onWeekChange(addWeeks(currentWeekStart, 1));
  const goToToday = () => onWeekChange(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Header title
  const headerTitle = `${format(currentWeekStart, 'd MMM', { locale: ro })} - ${format(addDays(currentWeekStart, 6), 'd MMM yyyy', { locale: ro })}`;

  return (
    <Card>
      <CardHeader>
        <div className="d-flex align-items-center justify-content-between w-100">
          <div className="d-flex align-items-center gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              iconOnly
              icon="ti ti-chevron-left"
              onClick={goToPreviousWeek}
              aria-label="Saptamana anterioara"
            />
            <Button
              variant="outline-secondary"
              size="sm"
              iconOnly
              icon="ti ti-chevron-right"
              onClick={goToNextWeek}
              aria-label="Saptamana urmatoare"
            />
            <Button variant="outline-primary" size="sm" onClick={goToToday}>
              Azi
            </Button>
          </div>
          <h5 className="mb-0 fw-bold">{headerTitle}</h5>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success-transparent text-success">
              <i className="ti ti-circle-filled me-1" style={{ fontSize: 8 }}></i>
              Program activ
            </span>
            <span className="badge bg-secondary-transparent text-secondary">
              <i className="ti ti-circle-filled me-1" style={{ fontSize: 8 }}></i>
              Inactiv
            </span>
            <span className="badge bg-warning-transparent text-warning">
              <i className="ti ti-circle-filled me-1" style={{ fontSize: 8 }}></i>
              Pauza
            </span>
          </div>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        <div className="schedule-grid-container" ref={scrollContainerRef} style={{ maxHeight: 600, overflowY: 'auto' }}>
          <div className="schedule-grid">
            {/* Header Row */}
            <div className="schedule-header d-flex border-bottom sticky-top bg-white" style={{ zIndex: 10 }}>
              <div className="schedule-time-header" style={{ width: 70, minWidth: 70 }}></div>
              {weekDays.map((day) => {
                const dayOfWeek = getDayOfWeekFromDate(day);
                const isToday = isSameDay(day, new Date());
                const blocked = isDateBlocked(day);

                return (
                  <div
                    key={day.toISOString()}
                    className={clsx(
                      'schedule-day-header flex-fill text-center py-2 border-start',
                      isToday && 'bg-primary-transparent',
                      blocked && 'bg-danger-transparent'
                    )}
                  >
                    <div className="fw-semibold">{DAY_LABELS_SHORT[dayOfWeek]}</div>
                    <div className={clsx('fs-5 fw-bold', isToday && 'text-primary')}>
                      {format(day, 'd')}
                    </div>
                    {blocked && (
                      <Badge variant="soft-danger" className="mt-1">
                        Indisponibil
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Time Slots */}
            {timeSlots.map((time, slotIndex) => (
              <div key={time} className="schedule-row d-flex" style={{ height: SLOT_HEIGHT }}>
                {/* Time Label */}
                <div
                  className="schedule-time-label d-flex align-items-start justify-content-end pe-2 text-muted small"
                  style={{ width: 70, minWidth: 70 }}
                >
                  {time.endsWith(':00') && time}
                </div>

                {/* Day Columns */}
                {weekDays.map((day) => {
                  const isWorking = isWorkingHour(day, time);
                  const blocked = isDateBlocked(day);
                  const isBreak = isBreakTime(day, time);
                  const isToday = isSameDay(day, new Date());
                  const isDragOver = dragOverSlot?.date &&
                    isSameDay(dragOverSlot.date, day) &&
                    dragOverSlot.time === time;

                  // Get appointments that start at this time slot
                  const dayAppointments = slotIndex === 0 ? getAppointmentsForDay(day) : [];

                  return (
                    <div
                      key={`${day.toISOString()}-${time}`}
                      className={clsx(
                        'schedule-slot flex-fill border-start border-top position-relative',
                        isWorking && !blocked && 'bg-success-transparent',
                        !isWorking && !blocked && !isBreak && 'bg-light',
                        blocked && 'bg-danger-transparent',
                        isBreak && 'bg-warning-transparent',
                        isToday && 'schedule-slot-today',
                        isDragOver && 'schedule-slot-drag-over'
                      )}
                      style={{ cursor: isWorking && !blocked ? 'pointer' : 'not-allowed' }}
                      onClick={() => isWorking && !blocked && onSlotClick(day, time)}
                      onDragOver={(e) => isWorking && !blocked && handleDragOver(e, day, time)}
                      onDrop={(e) => isWorking && !blocked && handleDrop(e, day, time)}
                    >
                      {/* Render appointments for this day (only on first slot to avoid duplication) */}
                      {slotIndex === 0 && dayAppointments.map((appt) => {
                        const style = getAppointmentStyle(appt);
                        const statusColor = APPOINTMENT_STATUS_COLORS[appt.status];

                        return (
                          <div
                            key={appt.id}
                            className={clsx(
                              'schedule-appointment position-absolute rounded-2 p-1 px-2 shadow-sm',
                              `bg-${statusColor}-transparent`,
                              `border-start border-3 border-${statusColor}`,
                              draggedAppointment?.id === appt.id && 'opacity-50'
                            )}
                            style={{
                              top: style.top,
                              height: style.height,
                              left: 4,
                              right: 4,
                              zIndex: 5,
                              overflow: 'hidden',
                              cursor: 'grab',
                            }}
                            draggable
                            onDragStart={(e) => handleDragStart(e, appt)}
                            onDragEnd={handleDragEnd}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAppointmentClick(appt);
                            }}
                          >
                            <div className="d-flex flex-column h-100">
                              <div className="fw-semibold small text-truncate">
                                {appt.patientName}
                              </div>
                              <div className="text-muted small text-truncate">
                                {format(parseISO(appt.startTime), 'HH:mm')} - {appt.appointmentTypeName}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// Working Hours Configuration
function WorkingHoursConfig({
  workingHours,
  onUpdate,
}: {
  workingHours: WorkingHours;
  onUpdate: (hours: WorkingHours) => void;
}) {
  const [editingDay, setEditingDay] = useState<DayOfWeek | null>(null);
  const [editBlocks, setEditBlocks] = useState<TimeBlock[]>([]);

  const handleDayToggle = (day: DayOfWeek, enabled: boolean) => {
    onUpdate({
      ...workingHours,
      [day]: {
        ...workingHours[day],
        enabled,
      },
    });
  };

  const openDayEditor = (day: DayOfWeek) => {
    setEditingDay(day);
    setEditBlocks([...workingHours[day].timeBlocks]);
  };

  const addTimeBlock = () => {
    setEditBlocks([
      ...editBlocks,
      { id: generateId(), start: '09:00', end: '17:00' },
    ]);
  };

  const addBreakBlock = () => {
    setEditBlocks([
      ...editBlocks,
      { id: generateId(), start: '13:00', end: '14:00', isBreak: true, label: 'Pauza' },
    ]);
  };

  const updateTimeBlock = (blockId: string, field: 'start' | 'end' | 'label', value: string) => {
    setEditBlocks(
      editBlocks.map((block) =>
        block.id === blockId ? { ...block, [field]: value } : block
      )
    );
  };

  const removeTimeBlock = (blockId: string) => {
    setEditBlocks(editBlocks.filter((block) => block.id !== blockId));
  };

  const saveChanges = () => {
    if (!editingDay) return;

    // Sort blocks by start time
    const sortedBlocks = [...editBlocks].sort(
      (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start)
    );

    onUpdate({
      ...workingHours,
      [editingDay]: {
        ...workingHours[editingDay],
        timeBlocks: sortedBlocks,
      },
    });

    setEditingDay(null);
    toast.success('Programul a fost actualizat');
  };

  const copyToOtherDays = (sourceDay: DayOfWeek) => {
    const sourceSchedule = workingHours[sourceDay];
    const updates: Partial<WorkingHours> = {};

    DAYS_ORDER.forEach((day) => {
      if (day !== sourceDay && workingHours[day].enabled) {
        updates[day] = {
          ...sourceSchedule,
          timeBlocks: sourceSchedule.timeBlocks.map((block) => ({
            ...block,
            id: generateId(),
          })),
        };
      }
    });

    onUpdate({ ...workingHours, ...updates });
    toast.success('Programul a fost copiat');
  };

  return (
    <>
      <Card className="mb-4">
        <CardHeader title="Program de Lucru" icon="ti ti-clock" />
        <CardBody>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th style={{ width: 120 }}>Zi</th>
                  <th style={{ width: 80 }}>Activ</th>
                  <th>Intervale Orare</th>
                  <th style={{ width: 120 }}>Actiuni</th>
                </tr>
              </thead>
              <tbody>
                {DAYS_ORDER.map((day) => {
                  const schedule = workingHours[day];
                  const workBlocks = schedule.timeBlocks.filter((b) => !b.isBreak);
                  const breakBlocks = schedule.timeBlocks.filter((b) => b.isBreak);

                  return (
                    <tr key={day}>
                      <td className="align-middle fw-semibold">{DAY_LABELS[day]}</td>
                      <td className="align-middle">
                        <div className="form-check form-switch">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={schedule.enabled}
                            onChange={(e) => handleDayToggle(day, e.target.checked)}
                            id={`day-toggle-${day}`}
                          />
                        </div>
                      </td>
                      <td className="align-middle">
                        {schedule.enabled ? (
                          <div className="d-flex flex-wrap gap-2">
                            {workBlocks.map((block) => (
                              <Badge key={block.id} variant="soft-success">
                                {block.start} - {block.end}
                              </Badge>
                            ))}
                            {breakBlocks.map((block) => (
                              <Badge key={block.id} variant="soft-warning">
                                <i className="ti ti-coffee me-1"></i>
                                {block.start} - {block.end}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted">Zi libera</span>
                        )}
                      </td>
                      <td className="align-middle">
                        <div className="d-flex gap-1">
                          <Button
                            variant="soft-primary"
                            size="sm"
                            iconOnly
                            icon="ti ti-pencil"
                            onClick={() => openDayEditor(day)}
                            aria-label="Editeaza"
                            disabled={!schedule.enabled}
                          />
                          <Button
                            variant="soft-secondary"
                            size="sm"
                            iconOnly
                            icon="ti ti-copy"
                            onClick={() => copyToOtherDays(day)}
                            aria-label="Copiaza la alte zile"
                            disabled={!schedule.enabled}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Edit Day Modal */}
      <Modal
        open={editingDay !== null}
        onClose={() => setEditingDay(null)}
        title={editingDay ? `Editeaza Program - ${DAY_LABELS[editingDay]}` : ''}
        icon="ti ti-clock"
        size="md"
        footer={
          <div className="d-flex gap-2 justify-content-end">
            <Button variant="light" onClick={() => setEditingDay(null)}>
              Anuleaza
            </Button>
            <Button variant="primary" onClick={saveChanges}>
              Salveaza
            </Button>
          </div>
        }
      >
        <div className="mb-3">
          <div className="d-flex gap-2 mb-3">
            <Button variant="outline-success" size="sm" icon="ti ti-plus" onClick={addTimeBlock}>
              Adauga Interval
            </Button>
            <Button variant="outline-warning" size="sm" icon="ti ti-coffee" onClick={addBreakBlock}>
              Adauga Pauza
            </Button>
          </div>

          {editBlocks.length === 0 && (
            <div className="text-center py-4 text-muted">
              <i className="ti ti-calendar-off fs-48 mb-2"></i>
              <p>Nu exista intervale orare configurate</p>
            </div>
          )}

          {editBlocks
            .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
            .map((block) => (
              <div
                key={block.id}
                className={clsx(
                  'border rounded-2 p-3 mb-2',
                  block.isBreak ? 'bg-warning-transparent' : 'bg-success-transparent'
                )}
              >
                <div className="row align-items-center g-2">
                  <div className="col-auto">
                    <i className={clsx('ti fs-24', block.isBreak ? 'ti-coffee text-warning' : 'ti-clock text-success')}></i>
                  </div>
                  <div className="col">
                    <div className="row g-2">
                      <div className="col-md-4">
                        <label className="form-label small mb-1">Inceput</label>
                        <input
                          type="time"
                          className="form-control form-control-sm"
                          value={block.start}
                          onChange={(e) => updateTimeBlock(block.id, 'start', e.target.value)}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small mb-1">Sfarsit</label>
                        <input
                          type="time"
                          className="form-control form-control-sm"
                          value={block.end}
                          onChange={(e) => updateTimeBlock(block.id, 'end', e.target.value)}
                        />
                      </div>
                      {block.isBreak && (
                        <div className="col-md-4">
                          <label className="form-label small mb-1">Eticheta</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={block.label || ''}
                            onChange={(e) => updateTimeBlock(block.id, 'label', e.target.value)}
                            placeholder="ex: Pauza pranz"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-auto">
                    <Button
                      variant="soft-danger"
                      size="sm"
                      iconOnly
                      icon="ti ti-trash"
                      onClick={() => removeTimeBlock(block.id)}
                      aria-label="Sterge"
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Modal>
    </>
  );
}

// Time Off Management
function TimeOffManagement({
  timeOffs,
  onAdd,
  onCancel,
}: {
  timeOffs: TimeOff[];
  onAdd: (timeOff: Omit<TimeOff, 'id' | 'providerId' | 'status'>) => void;
  onCancel: (id: string) => void;
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);
  const [newTimeOff, setNewTimeOff] = useState<{
    type: TimeOff['type'];
    startDate: string;
    endDate: string;
    reason: string;
    isRecurring: boolean;
  }>({
    type: 'vacation',
    startDate: '',
    endDate: '',
    reason: '',
    isRecurring: false,
  });

  const handleSubmit = () => {
    if (!newTimeOff.startDate || !newTimeOff.endDate) {
      toast.error('Te rog completeaza datele');
      return;
    }

    onAdd({
      type: newTimeOff.type,
      startDate: newTimeOff.startDate,
      endDate: newTimeOff.endDate,
      reason: newTimeOff.reason,
      isRecurring: newTimeOff.isRecurring,
    });

    setShowAddModal(false);
    setNewTimeOff({
      type: 'vacation',
      startDate: '',
      endDate: '',
      reason: '',
      isRecurring: false,
    });
  };

  // Filter upcoming time offs
  const upcomingTimeOffs = timeOffs.filter(
    (to) => to.status !== 'rejected' && isAfter(parseISO(to.endDate), new Date())
  );

  const pastTimeOffs = timeOffs.filter(
    (to) => isBefore(parseISO(to.endDate), new Date())
  );

  return (
    <>
      <Card className="mb-4">
        <CardHeader
          title="Zile Libere"
          icon="ti ti-calendar-off"
          actions={
            <Button variant="primary" size="sm" icon="ti ti-plus" onClick={() => setShowAddModal(true)}>
              Adauga
            </Button>
          }
        />
        <CardBody>
          {upcomingTimeOffs.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="ti ti-beach fs-48 mb-2"></i>
              <p className="mb-0">Nicio zi libera programata</p>
            </div>
          ) : (
            <div className="time-off-list">
              {upcomingTimeOffs.map((to) => (
                <div key={to.id} className="d-flex align-items-center justify-content-between border-bottom py-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className={`avatar bg-${TIME_OFF_TYPE_COLORS[to.type]}-transparent rounded-circle`}>
                      <i className={clsx(
                        'ti',
                        to.type === 'vacation' && 'ti-beach',
                        to.type === 'sick' && 'ti-virus',
                        to.type === 'personal' && 'ti-user',
                        to.type === 'training' && 'ti-school',
                        to.type === 'other' && 'ti-dots',
                        `text-${TIME_OFF_TYPE_COLORS[to.type]}`
                      )}></i>
                    </div>
                    <div>
                      <div className="fw-semibold">{TIME_OFF_TYPE_LABELS[to.type]}</div>
                      <div className="text-muted small">
                        {format(parseISO(to.startDate), 'd MMM yyyy', { locale: ro })}
                        {to.startDate !== to.endDate && (
                          <> - {format(parseISO(to.endDate), 'd MMM yyyy', { locale: ro })}</>
                        )}
                      </div>
                      {to.reason && <div className="text-muted small">{to.reason}</div>}
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Badge
                      variant={
                        to.status === 'approved'
                          ? 'soft-success'
                          : to.status === 'pending'
                          ? 'soft-warning'
                          : 'soft-danger'
                      }
                    >
                      {to.status === 'approved' ? 'Aprobat' : to.status === 'pending' ? 'In asteptare' : 'Respins'}
                    </Badge>
                    <Button
                      variant="soft-danger"
                      size="sm"
                      iconOnly
                      icon="ti ti-x"
                      onClick={() => setConfirmCancel(to.id)}
                      aria-label="Anuleaza"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {pastTimeOffs.length > 0 && (
            <details className="mt-3">
              <summary className="text-muted small cursor-pointer">
                Vezi istoricul ({pastTimeOffs.length} inregistrari)
              </summary>
              <div className="mt-2">
                {pastTimeOffs.slice(0, 5).map((to) => (
                  <div key={to.id} className="d-flex align-items-center gap-2 py-2 text-muted small">
                    <Badge variant={TIME_OFF_BADGE_VARIANTS[to.type]}>
                      {TIME_OFF_TYPE_LABELS[to.type].substring(0, 3)}
                    </Badge>
                    <span>
                      {format(parseISO(to.startDate), 'd MMM', { locale: ro })}
                      {to.startDate !== to.endDate && (
                        <> - {format(parseISO(to.endDate), 'd MMM', { locale: ro })}</>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </CardBody>
      </Card>

      {/* Add Time Off Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Adauga Zi Libera"
        icon="ti ti-calendar-off"
        size="md"
        footer={
          <div className="d-flex gap-2 justify-content-end">
            <Button variant="light" onClick={() => setShowAddModal(false)}>
              Anuleaza
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Salveaza
            </Button>
          </div>
        }
      >
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label">Tip</label>
            <select
              className="form-select"
              value={newTimeOff.type}
              onChange={(e) => setNewTimeOff({ ...newTimeOff, type: e.target.value as TimeOff['type'] })}
            >
              <option value="vacation">Concediu</option>
              <option value="sick">Medical</option>
              <option value="personal">Personal</option>
              <option value="training">Training</option>
              <option value="other">Altele</option>
            </select>
          </div>
          <div className="col-md-6">
            <Input
              label="Data Inceput"
              type="date"
              value={newTimeOff.startDate}
              onChange={(e) => setNewTimeOff({ ...newTimeOff, startDate: e.target.value })}
              required
            />
          </div>
          <div className="col-md-6">
            <Input
              label="Data Sfarsit"
              type="date"
              value={newTimeOff.endDate}
              onChange={(e) => setNewTimeOff({ ...newTimeOff, endDate: e.target.value })}
              required
            />
          </div>
          <div className="col-12">
            <Input
              label="Motiv (optional)"
              value={newTimeOff.reason}
              onChange={(e) => setNewTimeOff({ ...newTimeOff, reason: e.target.value })}
              placeholder="ex: Vacanta de vara"
            />
          </div>
          <div className="col-12">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="recurring"
                checked={newTimeOff.isRecurring}
                onChange={(e) => setNewTimeOff({ ...newTimeOff, isRecurring: e.target.checked })}
              />
              <label className="form-check-label" htmlFor="recurring">
                Recurent (ex: in fiecare saptamana)
              </label>
            </div>
          </div>
        </div>
      </Modal>

      {/* Confirm Cancel Modal */}
      <ConfirmModal
        open={confirmCancel !== null}
        onClose={() => setConfirmCancel(null)}
        onConfirm={() => {
          if (confirmCancel) {
            onCancel(confirmCancel);
            setConfirmCancel(null);
          }
        }}
        title="Anuleaza Zi Libera"
        message="Esti sigur ca vrei sa anulezi aceasta zi libera?"
        type="warning"
        confirmText="Anuleaza"
        cancelText="Renunta"
      />
    </>
  );
}

// Availability Exceptions
function AvailabilityExceptions({
  exceptions,
  onAdd,
  onRemove,
}: {
  exceptions: AvailabilityException[];
  onAdd: (exception: Omit<AvailabilityException, 'id' | 'providerId'>) => void;
  onRemove: (id: string) => void;
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newException, setNewException] = useState<{
    date: string;
    type: AvailabilityException['type'];
    reason: string;
    extendedStart: string;
    extendedEnd: string;
  }>({
    date: '',
    type: 'blocked',
    reason: '',
    extendedStart: '08:00',
    extendedEnd: '20:00',
  });

  const handleSubmit = () => {
    if (!newException.date) {
      toast.error('Te rog selecteaza data');
      return;
    }

    const exception: Omit<AvailabilityException, 'id' | 'providerId'> = {
      date: newException.date,
      type: newException.type,
      reason: newException.reason,
    };

    if (newException.type === 'extended' || newException.type === 'modified') {
      exception.timeBlocks = [
        { id: generateId(), start: newException.extendedStart, end: newException.extendedEnd },
      ];
    }

    onAdd(exception);
    setShowAddModal(false);
    setNewException({
      date: '',
      type: 'blocked',
      reason: '',
      extendedStart: '08:00',
      extendedEnd: '20:00',
    });
  };

  const futureExceptions = exceptions.filter(
    (exc) => isAfter(parseISO(exc.date), subWeeks(new Date(), 1))
  );

  return (
    <>
      <Card className="mb-4">
        <CardHeader
          title="Exceptii Disponibilitate"
          icon="ti ti-calendar-event"
          actions={
            <Button variant="primary" size="sm" icon="ti ti-plus" onClick={() => setShowAddModal(true)}>
              Adauga
            </Button>
          }
        />
        <CardBody>
          {futureExceptions.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="ti ti-calendar-check fs-48 mb-2"></i>
              <p className="mb-0">Nicio exceptie configurata</p>
            </div>
          ) : (
            <div className="exceptions-list">
              {futureExceptions.map((exc) => (
                <div key={exc.id} className="d-flex align-items-center justify-content-between border-bottom py-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className={clsx(
                      'avatar rounded-circle',
                      exc.type === 'blocked' && 'bg-danger-transparent',
                      exc.type === 'extended' && 'bg-success-transparent',
                      exc.type === 'modified' && 'bg-info-transparent'
                    )}>
                      <i className={clsx(
                        'ti',
                        exc.type === 'blocked' && 'ti-calendar-off text-danger',
                        exc.type === 'extended' && 'ti-clock-plus text-success',
                        exc.type === 'modified' && 'ti-clock-edit text-info'
                      )}></i>
                    </div>
                    <div>
                      <div className="fw-semibold">
                        {format(parseISO(exc.date), 'd MMMM yyyy', { locale: ro })}
                      </div>
                      <div className="text-muted small">
                        {exc.type === 'blocked' && 'Zi blocata'}
                        {exc.type === 'extended' && `Program prelungit: ${exc.timeBlocks?.[0]?.start} - ${exc.timeBlocks?.[0]?.end}`}
                        {exc.type === 'modified' && `Program modificat: ${exc.timeBlocks?.[0]?.start} - ${exc.timeBlocks?.[0]?.end}`}
                      </div>
                      {exc.reason && <div className="text-muted small">{exc.reason}</div>}
                    </div>
                  </div>
                  <Button
                    variant="soft-danger"
                    size="sm"
                    iconOnly
                    icon="ti ti-x"
                    onClick={() => onRemove(exc.id)}
                    aria-label="Sterge"
                  />
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add Exception Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Adauga Exceptie"
        icon="ti ti-calendar-event"
        size="md"
        footer={
          <div className="d-flex gap-2 justify-content-end">
            <Button variant="light" onClick={() => setShowAddModal(false)}>
              Anuleaza
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Salveaza
            </Button>
          </div>
        }
      >
        <div className="row g-3">
          <div className="col-12">
            <Input
              label="Data"
              type="date"
              value={newException.date}
              onChange={(e) => setNewException({ ...newException, date: e.target.value })}
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label">Tip Exceptie</label>
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className={clsx(
                  'btn',
                  newException.type === 'blocked' ? 'btn-danger' : 'btn-outline-danger'
                )}
                onClick={() => setNewException({ ...newException, type: 'blocked' })}
              >
                <i className="ti ti-calendar-off me-1"></i>
                Blocare Zi
              </button>
              <button
                type="button"
                className={clsx(
                  'btn',
                  newException.type === 'extended' ? 'btn-success' : 'btn-outline-success'
                )}
                onClick={() => setNewException({ ...newException, type: 'extended' })}
              >
                <i className="ti ti-clock-plus me-1"></i>
                Program Prelungit
              </button>
              <button
                type="button"
                className={clsx(
                  'btn',
                  newException.type === 'modified' ? 'btn-info' : 'btn-outline-info'
                )}
                onClick={() => setNewException({ ...newException, type: 'modified' })}
              >
                <i className="ti ti-clock-edit me-1"></i>
                Program Modificat
              </button>
            </div>
          </div>

          {(newException.type === 'extended' || newException.type === 'modified') && (
            <>
              <div className="col-md-6">
                <Input
                  label="Ora Inceput"
                  type="time"
                  value={newException.extendedStart}
                  onChange={(e) => setNewException({ ...newException, extendedStart: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <Input
                  label="Ora Sfarsit"
                  type="time"
                  value={newException.extendedEnd}
                  onChange={(e) => setNewException({ ...newException, extendedEnd: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="col-12">
            <Input
              label="Motiv (optional)"
              value={newException.reason}
              onChange={(e) => setNewException({ ...newException, reason: e.target.value })}
              placeholder="ex: Urgente, Sedinta, Training"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}

// Appointment Types Configuration
function AppointmentTypesConfig({
  appointmentTypes,
  onToggle,
  onUpdateBuffer,
}: {
  appointmentTypes: AppointmentType[];
  onToggle: (id: string, enabled: boolean) => void;
  onUpdateBuffer: (id: string, bufferBefore: number, bufferAfter: number) => void;
}) {
  const [editingType, setEditingType] = useState<AppointmentType | null>(null);
  const [bufferBefore, setBufferBefore] = useState(0);
  const [bufferAfter, setBufferAfter] = useState(0);

  const openEditor = (type: AppointmentType) => {
    setEditingType(type);
    setBufferBefore(type.bufferBefore);
    setBufferAfter(type.bufferAfter);
  };

  const saveBuffer = () => {
    if (editingType) {
      onUpdateBuffer(editingType.id, bufferBefore, bufferAfter);
      setEditingType(null);
      toast.success('Setarile au fost actualizate');
    }
  };

  return (
    <>
      <Card className="mb-4">
        <CardHeader title="Tipuri de Programari" icon="ti ti-list-check" />
        <CardBody>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Procedura</th>
                  <th>Durata</th>
                  <th>Buffer</th>
                  <th style={{ width: 100 }}>Activ</th>
                  <th style={{ width: 80 }}>Actiuni</th>
                </tr>
              </thead>
              <tbody>
                {appointmentTypes.map((type) => (
                  <tr key={type.id} className={!type.isEnabled ? 'opacity-50' : ''}>
                    <td className="align-middle">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle"
                          style={{ width: 12, height: 12, backgroundColor: type.color }}
                        ></div>
                        <div>
                          <div className="fw-semibold">{type.name}</div>
                          <div className="text-muted small">{type.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="align-middle">{type.duration} min</td>
                    <td className="align-middle">
                      <span className="text-muted small">
                        {type.bufferBefore > 0 && <>{type.bufferBefore}m inainte</>}
                        {type.bufferBefore > 0 && type.bufferAfter > 0 && ' / '}
                        {type.bufferAfter > 0 && <>{type.bufferAfter}m dupa</>}
                        {type.bufferBefore === 0 && type.bufferAfter === 0 && '-'}
                      </span>
                    </td>
                    <td className="align-middle">
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={type.isEnabled}
                          onChange={(e) => onToggle(type.id, e.target.checked)}
                          id={`type-toggle-${type.id}`}
                        />
                      </div>
                    </td>
                    <td className="align-middle">
                      <Button
                        variant="soft-primary"
                        size="sm"
                        iconOnly
                        icon="ti ti-settings"
                        onClick={() => openEditor(type)}
                        aria-label="Configureaza"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Edit Buffer Modal */}
      <Modal
        open={editingType !== null}
        onClose={() => setEditingType(null)}
        title={editingType ? `Configureaza - ${editingType.name}` : ''}
        icon="ti ti-settings"
        size="sm"
        footer={
          <div className="d-flex gap-2 justify-content-end">
            <Button variant="light" onClick={() => setEditingType(null)}>
              Anuleaza
            </Button>
            <Button variant="primary" onClick={saveBuffer}>
              Salveaza
            </Button>
          </div>
        }
      >
        {editingType && (
          <div className="row g-3">
            <div className="col-12">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div
                  className="rounded-circle"
                  style={{ width: 16, height: 16, backgroundColor: editingType.color }}
                ></div>
                <span className="fw-semibold">{editingType.name}</span>
                <Badge variant="soft-secondary">{editingType.duration} min</Badge>
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label">Buffer Inainte (min)</label>
              <input
                type="number"
                className="form-control"
                value={bufferBefore}
                onChange={(e) => setBufferBefore(parseInt(e.target.value) || 0)}
                min={0}
                max={60}
              />
              <small className="text-muted">Timp pregatire inainte</small>
            </div>
            <div className="col-md-6">
              <label className="form-label">Buffer Dupa (min)</label>
              <input
                type="number"
                className="form-control"
                value={bufferAfter}
                onChange={(e) => setBufferAfter(parseInt(e.target.value) || 0)}
                min={0}
                max={60}
              />
              <small className="text-muted">Timp curatenie dupa</small>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

// Stats Section
function StatsSection({ stats }: { stats: ProviderStats }) {
  return (
    <Card className="mb-4">
      <CardHeader title="Statistici Saptamana" icon="ti ti-chart-bar" />
      <CardBody>
        <div className="row g-4">
          <div className="col-md-4 col-6">
            <CompactStats
              value={`${stats.utilizationPercent}%`}
              label="Rata Utilizare"
              icon="ti ti-chart-pie"
              color="primary"
            />
            <div className="progress mt-2" style={{ height: 6 }}>
              <div
                className="progress-bar bg-primary"
                style={{ width: `${stats.utilizationPercent}%` }}
              ></div>
            </div>
          </div>
          <div className="col-md-4 col-6">
            <CompactStats
              value={stats.averageAppointmentsPerDay.toFixed(1)}
              label="Medie Zilnica"
              icon="ti ti-calendar-stats"
              color="success"
            />
          </div>
          <div className="col-md-4 col-6">
            <CompactStats
              value={`${stats.noShowRate}%`}
              label="Rata Absente"
              icon="ti ti-user-off"
              color={stats.noShowRate > 10 ? 'danger' : 'warning'}
            />
          </div>
          <div className="col-md-6">
            <div className="border rounded-2 p-3 bg-light">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="ti ti-calendar-event text-info"></i>
                <span className="fw-semibold">Cea Mai Aglomerata Zi</span>
              </div>
              <h5 className="mb-0">{stats.busiestDay}</h5>
            </div>
          </div>
          <div className="col-md-6">
            <div className="border rounded-2 p-3 bg-light">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="ti ti-clock text-info"></i>
                <span className="fw-semibold">Ora de Varf</span>
              </div>
              <h5 className="mb-0">{stats.busiestHour}</h5>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// Appointment Detail Modal
function AppointmentDetailModal({
  appointment,
  onClose,
}: {
  appointment: Appointment | null;
  onClose: () => void;
}) {
  if (!appointment) return null;

  return (
    <Modal
      open={appointment !== null}
      onClose={onClose}
      title="Detalii Programare"
      icon="ti ti-calendar-event"
      size="md"
      footer={
        <div className="d-flex gap-2 justify-content-end">
          <Button variant="light" onClick={onClose}>
            Inchide
          </Button>
          <Button variant="primary" icon="ti ti-pencil">
            Editeaza
          </Button>
        </div>
      }
    >
      <div className="row g-3">
        <div className="col-12">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="avatar avatar-lg bg-primary-transparent rounded-circle">
              <span className="avatar-text">
                {appointment.patientName.split(' ').map((n) => n[0]).join('')}
              </span>
            </div>
            <div>
              <h5 className="mb-0">{appointment.patientName}</h5>
              <Badge variant={APPOINTMENT_STATUS_BADGE_VARIANTS[appointment.status]}>
                {APPOINTMENT_STATUS_LABELS[appointment.status]}
              </Badge>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <label className="form-label text-muted small">Data si Ora</label>
          <div className="fw-semibold">
            {format(parseISO(appointment.startTime), 'EEEE, d MMMM yyyy', { locale: ro })}
          </div>
          <div>
            {format(parseISO(appointment.startTime), 'HH:mm')} - {format(parseISO(appointment.endTime), 'HH:mm')}
          </div>
        </div>
        <div className="col-md-6">
          <label className="form-label text-muted small">Procedura</label>
          <div className="fw-semibold">{appointment.appointmentTypeName}</div>
          <div className="text-muted small">
            Durata: {differenceInMinutes(parseISO(appointment.endTime), parseISO(appointment.startTime))} minute
          </div>
        </div>
        {appointment.notes && (
          <div className="col-12">
            <label className="form-label text-muted small">Note</label>
            <div className="border rounded-2 p-2 bg-light">{appointment.notes}</div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ProviderSchedulePage() {
  // State
  const [selectedProviderId, setSelectedProviderId] = useState(mockProviders[0].id);
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [workingHours, setWorkingHours] = useState<WorkingHours>(defaultWorkingHours);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>(mockAppointmentTypes);
  const [timeOffs, setTimeOffs] = useState<TimeOff[]>(mockTimeOffs);
  const [exceptions, setExceptions] = useState<AvailabilityException[]>(mockExceptions);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'settings'>('calendar');

  // Generate appointments for selected provider and week
  const appointments = useMemo(
    () => generateMockAppointments(selectedProviderId, currentWeekStart),
    [selectedProviderId, currentWeekStart]
  );

  // Filter time offs and exceptions for selected provider
  const providerTimeOffs = timeOffs.filter((to) => to.providerId === selectedProviderId);
  const providerExceptions = exceptions.filter((exc) => exc.providerId === selectedProviderId);

  // Handlers
  const handleAddTimeOff = (newTimeOff: Omit<TimeOff, 'id' | 'providerId' | 'status'>) => {
    const timeOff: TimeOff = {
      ...newTimeOff,
      id: generateId(),
      providerId: selectedProviderId,
      status: 'pending',
    };
    setTimeOffs([...timeOffs, timeOff]);
    toast.success('Cerere zi libera adaugata');
  };

  const handleCancelTimeOff = (id: string) => {
    setTimeOffs(timeOffs.filter((to) => to.id !== id));
    toast.success('Zi libera anulata');
  };

  const handleAddException = (newException: Omit<AvailabilityException, 'id' | 'providerId'>) => {
    const exception: AvailabilityException = {
      ...newException,
      id: generateId(),
      providerId: selectedProviderId,
    };
    setExceptions([...exceptions, exception]);
    toast.success('Exceptie adaugata');
  };

  const handleRemoveException = (id: string) => {
    setExceptions(exceptions.filter((exc) => exc.id !== id));
    toast.success('Exceptie stearsa');
  };

  const handleToggleAppointmentType = (id: string, enabled: boolean) => {
    setAppointmentTypes(
      appointmentTypes.map((type) =>
        type.id === id ? { ...type, isEnabled: enabled } : type
      )
    );
  };

  const handleUpdateBuffer = (id: string, bufferBefore: number, bufferAfter: number) => {
    setAppointmentTypes(
      appointmentTypes.map((type) =>
        type.id === id ? { ...type, bufferBefore, bufferAfter } : type
      )
    );
  };

  const handleSlotClick = (date: Date, time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const selectedDateTime = setMinutes(setHours(date, hours), minutes);
    toast(`Slot selectat: ${format(selectedDateTime, 'd MMM HH:mm', { locale: ro })}`, { icon: 'ℹ️' });
    // TODO: Open create appointment modal
  };

  const handleAppointmentDrag = (appointmentId: string, newDate: Date, newTime: string) => {
    // UI-only drag feedback for now
    toast(`Programare mutata la ${format(newDate, 'd MMM', { locale: ro })} ${newTime}`, { icon: 'ℹ️' });
  };

  return (
    <AppShell
      title="Program Furnizor"
      subtitle="Gestioneaza programul si disponibilitatea medicilor"
      actions={
        <div className="d-flex gap-2">
          <Button
            variant={activeTab === 'calendar' ? 'primary' : 'outline-secondary'}
            icon="ti ti-calendar"
            onClick={() => setActiveTab('calendar')}
          >
            Calendar
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'primary' : 'outline-secondary'}
            icon="ti ti-settings"
            onClick={() => setActiveTab('settings')}
          >
            Setari
          </Button>
        </div>
      }
    >
      <div className="container-fluid">
        {/* Provider Selection Header */}
        <ProviderSelectionHeader
          providers={mockProviders}
          selectedProviderId={selectedProviderId}
          onSelectProvider={setSelectedProviderId}
          stats={mockStats}
        />

        {activeTab === 'calendar' ? (
          <div className="row">
            {/* Main Calendar */}
            <div className="col-lg-9 col-md-12 mb-4">
              <WeeklyCalendarView
                currentWeekStart={currentWeekStart}
                onWeekChange={setCurrentWeekStart}
                appointments={appointments}
                workingHours={workingHours}
                timeOffs={providerTimeOffs}
                exceptions={providerExceptions}
                onAppointmentClick={setSelectedAppointment}
                onSlotClick={handleSlotClick}
                onAppointmentDrag={handleAppointmentDrag}
              />
            </div>

            {/* Sidebar */}
            <div className="col-lg-3 col-md-12">
              {/* Quick Stats */}
              <StatsSection stats={mockStats} />

              {/* Time Off - Compact View */}
              <Card className="mb-4">
                <CardHeader
                  title="Zile Libere"
                  icon="ti ti-calendar-off"
                  actions={
                    <Button variant="soft-primary" size="sm" iconOnly icon="ti ti-plus" aria-label="Adauga" />
                  }
                />
                <CardBody className="py-2">
                  {providerTimeOffs.length === 0 ? (
                    <div className="text-center py-3 text-muted small">
                      Nicio zi libera programata
                    </div>
                  ) : (
                    providerTimeOffs.slice(0, 3).map((to) => (
                      <div key={to.id} className="d-flex align-items-center gap-2 py-2 border-bottom">
                        <Badge variant={TIME_OFF_BADGE_VARIANTS[to.type]}>
                          {TIME_OFF_TYPE_LABELS[to.type].substring(0, 3)}
                        </Badge>
                        <span className="small">
                          {format(parseISO(to.startDate), 'd MMM', { locale: ro })}
                        </span>
                      </div>
                    ))
                  )}
                </CardBody>
              </Card>

              {/* Today's Schedule Summary */}
              <Card>
                <CardHeader title="Azi" icon="ti ti-calendar-event" />
                <CardBody className="py-2">
                  {appointments
                    .filter((appt) => isSameDay(parseISO(appt.startTime), new Date()))
                    .slice(0, 5)
                    .map((appt) => (
                      <div
                        key={appt.id}
                        className="d-flex align-items-center gap-2 py-2 border-bottom cursor-pointer"
                        onClick={() => setSelectedAppointment(appt)}
                      >
                        <Badge variant={APPOINTMENT_STATUS_BADGE_VARIANTS[appt.status]}>
                          {format(parseISO(appt.startTime), 'HH:mm')}
                        </Badge>
                        <span className="small text-truncate">{appt.patientName}</span>
                      </div>
                    ))}
                  {appointments.filter((appt) => isSameDay(parseISO(appt.startTime), new Date())).length === 0 && (
                    <div className="text-center py-3 text-muted small">
                      Nicio programare azi
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          </div>
        ) : (
          <div className="row">
            {/* Settings - Working Hours */}
            <div className="col-lg-8 col-md-12">
              <WorkingHoursConfig
                workingHours={workingHours}
                onUpdate={setWorkingHours}
              />

              <AppointmentTypesConfig
                appointmentTypes={appointmentTypes}
                onToggle={handleToggleAppointmentType}
                onUpdateBuffer={handleUpdateBuffer}
              />
            </div>

            {/* Settings - Time Off & Exceptions */}
            <div className="col-lg-4 col-md-12">
              <TimeOffManagement
                timeOffs={providerTimeOffs}
                onAdd={handleAddTimeOff}
                onCancel={handleCancelTimeOff}
              />

              <AvailabilityExceptions
                exceptions={providerExceptions}
                onAdd={handleAddException}
                onRemove={handleRemoveException}
              />

              <StatsSection stats={mockStats} />
            </div>
          </div>
        )}
      </div>

      {/* Appointment Detail Modal */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />

      {/* Custom Styles */}
      <style>{`
        .schedule-grid-container {
          position: relative;
        }

        .schedule-grid {
          min-width: 800px;
        }

        .schedule-slot {
          transition: background-color 0.15s ease;
        }

        .schedule-slot:hover {
          filter: brightness(0.95);
        }

        .schedule-slot-today {
          background-color: rgba(79, 70, 229, 0.05) !important;
        }

        .schedule-slot-drag-over {
          background-color: rgba(79, 70, 229, 0.2) !important;
          outline: 2px dashed #4F46E5;
          outline-offset: -2px;
        }

        .schedule-appointment {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .schedule-appointment:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }

        .schedule-appointment:active {
          cursor: grabbing;
        }

        .cursor-pointer {
          cursor: pointer;
        }

        .avatar-text {
          font-size: 14px;
        }

        .avatar-sm .avatar-text {
          font-size: 12px;
        }

        .avatar-lg .avatar-text {
          font-size: 18px;
        }

        .avatar-xl .avatar-text {
          font-size: 24px;
        }

        .bg-primary-transparent { background-color: rgba(79, 70, 229, 0.1) !important; }
        .bg-success-transparent { background-color: rgba(16, 185, 129, 0.1) !important; }
        .bg-warning-transparent { background-color: rgba(245, 158, 11, 0.1) !important; }
        .bg-danger-transparent { background-color: rgba(239, 68, 68, 0.1) !important; }
        .bg-info-transparent { background-color: rgba(59, 130, 246, 0.1) !important; }
        .bg-secondary-transparent { background-color: rgba(107, 114, 128, 0.1) !important; }

        .text-primary { color: #4F46E5 !important; }
        .text-success { color: #10B981 !important; }
        .text-warning { color: #F59E0B !important; }
        .text-danger { color: #EF4444 !important; }
        .text-info { color: #3B82F6 !important; }

        .border-primary { border-color: #4F46E5 !important; }
        .border-success { border-color: #10B981 !important; }
        .border-warning { border-color: #F59E0B !important; }
        .border-danger { border-color: #EF4444 !important; }
        .border-info { border-color: #3B82F6 !important; }
        .border-secondary { border-color: #6B7280 !important; }
        .border-dark { border-color: #1F2937 !important; }

        details summary {
          list-style: none;
        }

        details summary::-webkit-details-marker {
          display: none;
        }

        details summary::before {
          content: '+ ';
        }

        details[open] summary::before {
          content: '- ';
        }
      `}</style>
    </AppShell>
  );
}
