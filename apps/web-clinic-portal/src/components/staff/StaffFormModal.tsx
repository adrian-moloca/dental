/**
 * StaffFormModal Component
 *
 * Modal for adding and editing staff members.
 * Includes personal info, role selection, specializations,
 * schedule assignment, and access level configuration.
 */

import { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Badge } from '../ui-new';
import type { StaffMember } from '../../routes/StaffPage';

interface RoleConfig {
  label: string;
  color: string;
  icon: string;
}

// Role permissions preview
const rolePermissions: Record<StaffMember['role'], string[]> = {
  doctor: [
    'Vizualizare pacienti',
    'Editare fise clinice',
    'Creare planuri tratament',
    'Vizualizare programari proprii',
    'Acces imagistica',
  ],
  asistent: [
    'Vizualizare pacienti',
    'Vizualizare fise clinice',
    'Pregatire cabinet',
    'Sterilizare instrumente',
    'Asistenta proceduri',
  ],
  receptioner: [
    'Gestionare programari',
    'Inregistrare pacienti',
    'Facturare de baza',
    'Comunicare pacienti',
    'Rapoarte zilnice',
  ],
  admin: [
    'Acces complet sistem',
    'Gestionare utilizatori',
    'Configurari clinica',
    'Rapoarte avansate',
    'Setari securitate',
  ],
  manager: [
    'Vizualizare rapoarte',
    'Gestionare personal',
    'Aprobari financiare',
    'Statistici clinica',
    'Configurari operationale',
  ],
};

// Available specializations by role
const specializationOptions: Record<StaffMember['role'], string[]> = {
  doctor: [
    'Stomatologie Generala',
    'Endodontie',
    'Protetice',
    'Ortodontie',
    'Pedodontie',
    'Chirurgie Orala',
    'Implantologie',
    'Parodontologie',
    'Estetica Dentara',
    'Albire',
  ],
  asistent: [
    'Asistenta Dentara',
    'Sterilizare',
    'Radiologie',
    'Pedodontie',
    'Chirurgie',
    'Profilaxie',
  ],
  receptioner: [
    'Programari',
    'Relatii Pacienti',
    'Facturare',
    'Asigurari',
  ],
  admin: [
    'Management',
    'Financiar',
    'IT',
    'HR',
    'Juridic',
  ],
  manager: [
    'Management Clinic',
    'HR',
    'Financiar',
    'Marketing',
    'Operatiuni',
  ],
};

// Working days
const weekDays = [
  { key: 'monday', label: 'Luni' },
  { key: 'tuesday', label: 'Marti' },
  { key: 'wednesday', label: 'Miercuri' },
  { key: 'thursday', label: 'Joi' },
  { key: 'friday', label: 'Vineri' },
  { key: 'saturday', label: 'Sambata' },
  { key: 'sunday', label: 'Duminica' },
] as const;

type WeekDay = (typeof weekDays)[number]['key'];

export interface StaffFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<StaffMember>) => void | Promise<void>;
  staff: StaffMember | null;
  roleConfig: Record<StaffMember['role'], RoleConfig>;
  departments: string[];
  isLoading?: boolean;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: StaffMember['role'];
  department: string;
  specializations: string[];
  status: StaffMember['status'];
  hireDate: string;
  schedule: Record<WeekDay, { enabled: boolean; start: string; end: string }>;
}

const defaultSchedule: FormData['schedule'] = {
  monday: { enabled: true, start: '09:00', end: '17:00' },
  tuesday: { enabled: true, start: '09:00', end: '17:00' },
  wednesday: { enabled: true, start: '09:00', end: '17:00' },
  thursday: { enabled: true, start: '09:00', end: '17:00' },
  friday: { enabled: true, start: '09:00', end: '17:00' },
  saturday: { enabled: false, start: '09:00', end: '13:00' },
  sunday: { enabled: false, start: '', end: '' },
};

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'doctor',
  department: '',
  specializations: [],
  status: 'activ',
  hireDate: new Date().toISOString().split('T')[0],
  schedule: defaultSchedule,
};

export function StaffFormModal({
  open,
  onClose,
  onSubmit,
  staff,
  roleConfig,
  departments,
}: StaffFormModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [activeTab, setActiveTab] = useState<'personal' | 'role' | 'schedule'>('personal');
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const isEditing = !!staff;

  // Reset form when modal opens/closes or staff changes
  useEffect(() => {
    if (open) {
      if (staff) {
        setFormData({
          firstName: staff.firstName,
          lastName: staff.lastName,
          email: staff.email,
          phone: staff.phone,
          role: staff.role,
          department: staff.department,
          specializations: staff.specializations,
          status: staff.status,
          hireDate: staff.hireDate,
          schedule: staff.schedule
            ? Object.fromEntries(
                weekDays.map((day) => [
                  day.key,
                  {
                    enabled: !!staff.schedule?.[day.key],
                    start: staff.schedule?.[day.key]?.split('-')[0] || '09:00',
                    end: staff.schedule?.[day.key]?.split('-')[1] || '17:00',
                  },
                ])
              ) as FormData['schedule']
            : defaultSchedule,
        });
      } else {
        setFormData(initialFormData);
      }
      setActiveTab('personal');
      setErrors({});
    }
  }, [open, staff]);

  // Form field change handler
  const handleChange = useCallback(
    (field: keyof FormData, value: FormData[keyof FormData]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error when field changes
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors]
  );

  // Schedule change handler
  const handleScheduleChange = useCallback(
    (day: WeekDay, field: 'enabled' | 'start' | 'end', value: boolean | string) => {
      setFormData((prev) => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          [day]: {
            ...prev.schedule[day],
            [field]: value,
          },
        },
      }));
    },
    []
  );

  // Toggle specialization
  const toggleSpecialization = useCallback((spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  }, []);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Prenumele este obligatoriu';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Numele este obligatoriu';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email-ul este obligatoriu';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefonul este obligatoriu';
    }
    if (!formData.department.trim()) {
      newErrors.department = 'Departamentul este obligatoriu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Submit handler
  const handleSubmit = useCallback(() => {
    if (!validateForm()) {
      setActiveTab('personal');
      return;
    }

    // Convert schedule to string format
    const scheduleData: StaffMember['schedule'] = {};
    weekDays.forEach((day) => {
      const daySchedule = formData.schedule[day.key];
      if (daySchedule.enabled && daySchedule.start && daySchedule.end) {
        scheduleData[day.key] = `${daySchedule.start}-${daySchedule.end}`;
      }
    });

    onSubmit({
      ...formData,
      schedule: scheduleData,
    });
  }, [formData, validateForm, onSubmit]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Editeaza Angajat' : 'Angajat Nou'}
      icon={isEditing ? 'ti ti-user-edit' : 'ti ti-user-plus'}
      size="lg"
      footer={
        <div className="d-flex justify-content-between w-100">
          <Button variant="light" onClick={onClose}>
            Anuleaza
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            <i className="ti ti-check me-1"></i>
            {isEditing ? 'Salveaza Modificari' : 'Adauga Angajat'}
          </Button>
        </div>
      }
    >
      {/* Tabs */}
      <ul className="nav nav-tabs nav-tabs-line mb-4">
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <i className="ti ti-user me-2"></i>
            Informatii Personale
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link ${activeTab === 'role' ? 'active' : ''}`}
            onClick={() => setActiveTab('role')}
          >
            <i className="ti ti-shield me-2"></i>
            Rol si Competente
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            <i className="ti ti-calendar me-2"></i>
            Program Lucru
          </button>
        </li>
      </ul>

      {/* Personal Info Tab */}
      {activeTab === 'personal' && (
        <div className="row g-3">
          {/* Photo Upload */}
          <div className="col-12 text-center mb-3">
            <div
              className="avatar avatar-xl bg-primary-transparent rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center"
              style={{ width: 100, height: 100, cursor: 'pointer' }}
            >
              <i className="ti ti-camera-plus fs-1 text-primary"></i>
            </div>
            <small className="text-muted">Click pentru a incarca fotografie</small>
          </div>

          {/* First Name */}
          <div className="col-md-6">
            <label className="form-label">
              Prenume <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
              placeholder="Introduceti prenumele"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
            />
            {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
          </div>

          {/* Last Name */}
          <div className="col-md-6">
            <label className="form-label">
              Nume <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
              placeholder="Introduceti numele"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
            />
            {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
          </div>

          {/* Email */}
          <div className="col-md-6">
            <label className="form-label">
              Email <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="ti ti-mail"></i>
              </span>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="email@clinica.ro"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
          </div>

          {/* Phone */}
          <div className="col-md-6">
            <label className="form-label">
              Telefon <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="ti ti-phone"></i>
              </span>
              <input
                type="tel"
                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                placeholder="+40 7XX XXX XXX"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
              {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
            </div>
          </div>

          {/* Department */}
          <div className="col-md-6">
            <label className="form-label">
              Departament <span className="text-danger">*</span>
            </label>
            <select
              className={`form-select ${errors.department ? 'is-invalid' : ''}`}
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
            >
              <option value="">Selecteaza departament</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
              <option value="__new__">+ Adauga departament nou</option>
            </select>
            {errors.department && <div className="invalid-feedback">{errors.department}</div>}
          </div>

          {/* Hire Date */}
          <div className="col-md-6">
            <label className="form-label">Data Angajarii</label>
            <input
              type="date"
              className="form-control"
              value={formData.hireDate}
              onChange={(e) => handleChange('hireDate', e.target.value)}
            />
          </div>

          {/* Status */}
          <div className="col-12">
            <label className="form-label">Status</label>
            <div className="d-flex gap-3 flex-wrap">
              {(['activ', 'inactiv', 'concediu', 'suspendat'] as const).map((status) => (
                <div className="form-check" key={status}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="status"
                    id={`status-${status}`}
                    checked={formData.status === status}
                    onChange={() => handleChange('status', status)}
                  />
                  <label className="form-check-label" htmlFor={`status-${status}`}>
                    {status === 'activ' && 'Activ'}
                    {status === 'inactiv' && 'Inactiv'}
                    {status === 'concediu' && 'In Concediu'}
                    {status === 'suspendat' && 'Suspendat'}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Role & Competencies Tab */}
      {activeTab === 'role' && (
        <div className="row g-4">
          {/* Role Selection */}
          <div className="col-12">
            <label className="form-label fw-semibold">Selecteaza Rolul</label>
            <div className="row g-3">
              {(Object.keys(roleConfig) as StaffMember['role'][]).map((role) => (
                <div className="col-6 col-md-4" key={role}>
                  <div
                    className={`card h-100 cursor-pointer border-2 ${
                      formData.role === role ? 'border-primary' : ''
                    }`}
                    onClick={() => {
                      handleChange('role', role);
                      handleChange('specializations', []);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-body text-center p-3">
                      <div
                        className={`avatar avatar-md bg-${roleConfig[role].color.replace('soft-', '')}-transparent rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center`}
                      >
                        <i
                          className={`${roleConfig[role].icon} text-${roleConfig[role].color.replace('soft-', '')}`}
                        ></i>
                      </div>
                      <h6 className="mb-0">{roleConfig[role].label}</h6>
                      {formData.role === role && (
                        <i className="ti ti-circle-check-filled text-primary position-absolute top-0 end-0 m-2"></i>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Permissions Preview */}
          <div className="col-12">
            <label className="form-label fw-semibold">Permisiuni {roleConfig[formData.role].label}</label>
            <div className="card bg-light border-0">
              <div className="card-body">
                <ul className="list-unstyled mb-0">
                  {rolePermissions[formData.role].map((perm, idx) => (
                    <li key={idx} className="d-flex align-items-center gap-2 py-1">
                      <i className="ti ti-check text-success"></i>
                      <span>{perm}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Specializations */}
          <div className="col-12">
            <label className="form-label fw-semibold">Specializari / Competente</label>
            <div className="d-flex flex-wrap gap-2">
              {specializationOptions[formData.role].map((spec) => (
                <Badge
                  key={spec}
                  variant={
                    formData.specializations.includes(spec) ? 'primary' : 'soft-secondary'
                  }
                  className="cursor-pointer py-2 px-3"
                  onClick={() => toggleSpecialization(spec)}
                  style={{ cursor: 'pointer' }}
                >
                  {formData.specializations.includes(spec) && (
                    <i className="ti ti-check me-1"></i>
                  )}
                  {spec}
                </Badge>
              ))}
            </div>
            <small className="text-muted mt-2 d-block">
              Click pe o specializare pentru a o selecta sau deselecta
            </small>
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="row g-3">
          <div className="col-12">
            <div className="alert alert-info d-flex align-items-center" role="alert">
              <i className="ti ti-info-circle me-2 fs-5"></i>
              <div>
                Configurati programul de lucru saptamanal. Acest program va fi folosit pentru
                gestionarea programarilor.
              </div>
            </div>
          </div>

          {weekDays.map((day) => (
            <div className="col-12" key={day.key}>
              <div className="card border mb-0">
                <div className="card-body py-2 px-3">
                  <div className="row align-items-center g-2">
                    {/* Day Toggle */}
                    <div className="col-auto">
                      <div className="form-check form-switch mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id={`day-${day.key}`}
                          checked={formData.schedule[day.key].enabled}
                          onChange={(e) =>
                            handleScheduleChange(day.key, 'enabled', e.target.checked)
                          }
                        />
                      </div>
                    </div>

                    {/* Day Label */}
                    <div className="col" style={{ minWidth: 100 }}>
                      <label
                        className={`form-check-label fw-medium mb-0 ${
                          !formData.schedule[day.key].enabled ? 'text-muted' : ''
                        }`}
                        htmlFor={`day-${day.key}`}
                      >
                        {day.label}
                      </label>
                    </div>

                    {/* Time Inputs */}
                    {formData.schedule[day.key].enabled ? (
                      <>
                        <div className="col-auto">
                          <div className="d-flex align-items-center gap-2">
                            <input
                              type="time"
                              className="form-control form-control-sm"
                              value={formData.schedule[day.key].start}
                              onChange={(e) =>
                                handleScheduleChange(day.key, 'start', e.target.value)
                              }
                              style={{ width: 110 }}
                            />
                            <span className="text-muted">-</span>
                            <input
                              type="time"
                              className="form-control form-control-sm"
                              value={formData.schedule[day.key].end}
                              onChange={(e) =>
                                handleScheduleChange(day.key, 'end', e.target.value)
                              }
                              style={{ width: 110 }}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="col-auto">
                        <span className="text-muted small">Zi libera</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Quick Presets */}
          <div className="col-12 mt-3">
            <label className="form-label text-muted small">Setari rapide:</label>
            <div className="d-flex gap-2 flex-wrap">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  weekDays.forEach((day) => {
                    if (day.key !== 'saturday' && day.key !== 'sunday') {
                      handleScheduleChange(day.key, 'enabled', true);
                      handleScheduleChange(day.key, 'start', '09:00');
                      handleScheduleChange(day.key, 'end', '17:00');
                    } else {
                      handleScheduleChange(day.key, 'enabled', false);
                    }
                  });
                }}
              >
                Luni-Vineri (09:00-17:00)
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  weekDays.forEach((day) => {
                    if (day.key !== 'sunday') {
                      handleScheduleChange(day.key, 'enabled', true);
                      handleScheduleChange(day.key, 'start', '08:00');
                      handleScheduleChange(day.key, 'end', '16:00');
                    } else {
                      handleScheduleChange(day.key, 'enabled', false);
                    }
                  });
                }}
              >
                Luni-Sambata (08:00-16:00)
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  weekDays.forEach((day) => {
                    handleScheduleChange(day.key, 'enabled', false);
                  });
                }}
              >
                Sterge Program
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default StaffFormModal;
