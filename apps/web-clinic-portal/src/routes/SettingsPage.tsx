/**
 * Settings Page
 *
 * Comprehensive settings page for DentalOS clinic configuration
 * Includes all clinic settings with tabbed navigation
 */

import { useState } from 'react';
import toast from 'react-hot-toast';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader, CardBody } from '../components/ui-new/Card';
import { Button } from '../components/ui-new/Button';
import { Input, Textarea } from '../components/ui-new/Input';
import clsx from 'clsx';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type SettingsTab =
  | 'clinic-profile'
  | 'users'
  | 'services'
  | 'working-hours'
  | 'notifications'
  | 'billing'
  | 'modules';

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

type UserRole = 'admin' | 'doctor' | 'receptionist';

interface ClinicProfileData {
  clinicName: string;
  logoUrl?: string;
  address: string;
  phone: string;
  email: string;
  cui: string;
  regComertului: string;
  workingHoursDisplay: string;
  facebook?: string;
  instagram?: string;
  website?: string;
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  permissions: string[];
}

interface ServiceData {
  id: string;
  name: string;
  code: string;
  category: string;
  duration: number;
  price: number;
  isActive: boolean;
}

interface WorkingHoursData {
  [key: string]: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface NotificationSettings {
  smsEnabled: boolean;
  emailEnabled: boolean;
  reminderTiming: '1h' | '24h' | '48h';
  smsTemplate: string;
  emailTemplate: string;
}

interface BillingSettings {
  invoiceSeries: string;
  invoicePrefix: string;
  vatRate: number;
  defaultPaymentTerms: string;
  bankName?: string;
  bankAccount?: string;
  eFacturaEnabled: boolean;
  eFacturaApiKey?: string;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  isConnected: boolean;
  apiKey?: string;
  webhookUrl?: string;
}

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Luni',
  tuesday: 'Marți',
  wednesday: 'Miercuri',
  thursday: 'Joi',
  friday: 'Vineri',
  saturday: 'Sâmbătă',
  sunday: 'Duminică',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('clinic-profile');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keyboard navigation for tabs
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    const tabKeys = tabs.map(t => t.key);
    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        newIndex = (currentIndex + 1) % tabs.length;
        setActiveTab(tabKeys[newIndex]);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
        setActiveTab(tabKeys[newIndex]);
        break;
      case 'Home':
        e.preventDefault();
        setActiveTab(tabKeys[0]);
        break;
      case 'End':
        e.preventDefault();
        setActiveTab(tabKeys[tabs.length - 1]);
        break;
    }
  };

  // ============================================================================
  // STATE: CLINIC PROFILE
  // ============================================================================
  const [clinicProfile, setClinicProfile] = useState<ClinicProfileData>({
    clinicName: 'Dental Clinic Pro',
    address: 'Str. Victoriei, nr. 123, București',
    phone: '+40 721 234 567',
    email: 'contact@dentalclinic.ro',
    cui: 'RO12345678',
    regComertului: 'J40/1234/2020',
    workingHoursDisplay: 'Luni-Vineri: 09:00-17:00',
    facebook: '',
    instagram: '',
    website: '',
  });

  // ============================================================================
  // STATE: USERS
  // ============================================================================
  const [users, setUsers] = useState<UserData[]>([
    {
      id: '1',
      firstName: 'Ion',
      lastName: 'Popescu',
      email: 'ion.popescu@clinic.ro',
      role: 'admin',
      isActive: true,
      permissions: ['all'],
    },
    {
      id: '2',
      firstName: 'Maria',
      lastName: 'Ionescu',
      email: 'maria.ionescu@clinic.ro',
      role: 'doctor',
      isActive: true,
      permissions: ['clinical', 'patients'],
    },
    {
      id: '3',
      firstName: 'Ana',
      lastName: 'Dumitrescu',
      email: 'ana.dumitrescu@clinic.ro',
      role: 'receptionist',
      isActive: true,
      permissions: ['appointments', 'patients'],
    },
  ]);

  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // ============================================================================
  // STATE: SERVICES & PRICES
  // ============================================================================
  const [services, setServices] = useState<ServiceData[]>([
    {
      id: '1',
      name: 'Consultație Generală',
      code: 'CONS-001',
      category: 'Consultații',
      duration: 30,
      price: 150,
      isActive: true,
    },
    {
      id: '2',
      name: 'Obturație Simplă',
      code: 'OBT-001',
      category: 'Tratamente',
      duration: 45,
      price: 200,
      isActive: true,
    },
    {
      id: '3',
      name: 'Detartraj',
      code: 'IGI-001',
      category: 'Igienizare',
      duration: 60,
      price: 250,
      isActive: true,
    },
  ]);

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);

  // ============================================================================
  // STATE: WORKING HOURS
  // ============================================================================
  const [workingHours, setWorkingHours] = useState<WorkingHoursData>({
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: true, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '13:00' },
    sunday: { enabled: false, start: '09:00', end: '13:00' },
  });

  const [holidays, setHolidays] = useState<string[]>([]);

  // ============================================================================
  // STATE: NOTIFICATIONS
  // ============================================================================
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    smsEnabled: true,
    emailEnabled: true,
    reminderTiming: '24h',
    smsTemplate:
      'Buna ziua {{patientName}}, va reamintim de programarea dumneavoastra de maine la ora {{appointmentTime}}.',
    emailTemplate:
      'Buna ziua {{patientName}},\n\nVa confirmam programarea dumneavoastra pentru data de {{appointmentDate}} la ora {{appointmentTime}}.\n\nVa asteptam!',
  });

  // ============================================================================
  // STATE: BILLING
  // ============================================================================
  const [billingSettings, setBillingSettings] = useState<BillingSettings>({
    invoiceSeries: 'FAC',
    invoicePrefix: 'INV',
    vatRate: 19,
    defaultPaymentTerms: 'La prezentare',
    bankName: 'Banca Transilvania',
    bankAccount: 'RO49AAAA1B31007593840000',
    eFacturaEnabled: false,
    eFacturaApiKey: '',
  });

  // ============================================================================
  // STATE: INTEGRATIONS
  // ============================================================================
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'SMS Gateway',
      description: 'Trimitere SMS-uri automate catre pacienti',
      iconUrl: '/icons/sms.svg',
      isConnected: false,
      apiKey: '',
    },
    {
      id: '2',
      name: 'Email Service',
      description: 'Sistem de trimitere email-uri',
      iconUrl: '/icons/email.svg',
      isConnected: false,
      apiKey: '',
    },
    {
      id: '3',
      name: 'E-Factura ANAF',
      description: 'Integrare cu sistemul E-Factura ANAF',
      iconUrl: '/icons/anaf.svg',
      isConnected: false,
      apiKey: '',
    },
    {
      id: '4',
      name: 'Plati Online',
      description: 'Procesare plati online prin Stripe',
      iconUrl: '/icons/stripe.svg',
      isConnected: false,
      apiKey: '',
      webhookUrl: '',
    },
  ]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleClinicProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setClinicProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleWorkingHoursChange = (
    day: DayOfWeek,
    field: 'enabled' | 'start' | 'end',
    value: boolean | string
  ) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleNotificationChange = (field: keyof NotificationSettings, value: string | boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleBillingChange = (field: keyof BillingSettings, value: string | number | boolean) => {
    setBillingSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === id
          ? { ...integration, isConnected: !integration.isConnected }
          : integration
      )
    );
  };

  const handleSaveSettings = async () => {
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log('Saving settings:', {
        clinicProfile,
        users,
        services,
        workingHours,
        notificationSettings,
        billingSettings,
        integrations,
      });

      toast.success('Setările au fost salvate cu succes');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('A apărut o eroare la salvarea setărilor');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // TAB NAVIGATION
  // ============================================================================

  const tabs: Array<{
    key: SettingsTab;
    label: string;
    labelShort: string;
    icon: string;
    description: string;
  }> = [
    {
      key: 'clinic-profile',
      label: 'Profil Clinica',
      labelShort: 'Profil',
      icon: 'ti ti-building',
      description: 'Date de bază și informații legale'
    },
    {
      key: 'users',
      label: 'Utilizatori',
      labelShort: 'Echipa',
      icon: 'ti ti-users',
      description: 'Gestionare utilizatori și permisiuni'
    },
    {
      key: 'services',
      label: 'Servicii',
      labelShort: 'Servicii',
      icon: 'ti ti-list-check',
      description: 'Nomenclator servicii și prețuri'
    },
    {
      key: 'working-hours',
      label: 'Program Lucru',
      labelShort: 'Program',
      icon: 'ti ti-clock',
      description: 'Ore de funcționare și sărbători'
    },
    {
      key: 'notifications',
      label: 'Notificari',
      labelShort: 'Notify',
      icon: 'ti ti-bell',
      description: 'Template-uri SMS și Email'
    },
    {
      key: 'billing',
      label: 'Facturare',
      labelShort: 'Billing',
      icon: 'ti ti-file-invoice',
      description: 'Configurare facturare și E-Factura'
    },
    {
      key: 'modules',
      label: 'Module',
      labelShort: 'Module',
      icon: 'ti ti-apps',
      description: 'Abonament și module activate'
    },
  ];

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <AppShell title="Setări" subtitle="Configurează setările clinicii">
      <div className="container-fluid">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/">Acasă</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">Setări</li>
            <li className="breadcrumb-item active" aria-current="page">
              {tabs.find(t => t.key === activeTab)?.label}
            </li>
          </ol>
        </nav>

        {/* Desktop: Vertical Tabs (Left) + Content (Right) */}
        <div className="row g-4">
          {/* Vertical Tab Navigation - Desktop Only */}
          <div className="col-lg-3 d-none d-lg-block">
            <Card>
              <CardBody className="p-0">
                <div className="nav flex-column nav-pills" role="tablist" aria-orientation="vertical">
                  {tabs.map((tab, index) => (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === tab.key}
                      aria-controls={`${tab.key}-panel`}
                      id={`${tab.key}-tab`}
                      tabIndex={activeTab === tab.key ? 0 : -1}
                      onClick={() => setActiveTab(tab.key)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className={clsx(
                        'nav-link text-start d-flex align-items-start gap-3 border-0 rounded-0 py-3 px-4',
                        activeTab === tab.key && 'active bg-primary text-white'
                      )}
                      style={{
                        borderLeft: activeTab === tab.key ? '4px solid var(--bs-primary)' : '4px solid transparent',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <i className={clsx(tab.icon, 'fs-5')} style={{ minWidth: '24px' }}></i>
                      <div className="flex-grow-1">
                        <div className="fw-semibold">{tab.label}</div>
                        <small className={clsx(
                          'd-block mt-1',
                          activeTab === tab.key ? 'text-white-50' : 'text-muted'
                        )}>
                          {tab.description}
                        </small>
                      </div>
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Horizontal Scrollable Tabs - Mobile/Tablet Only */}
          <div className="col-12 d-lg-none mb-3">
            <Card>
              <CardBody className="p-2">
                <div
                  className="d-flex gap-2 overflow-auto pb-2"
                  role="tablist"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {tabs.map((tab, index) => (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === tab.key}
                      aria-controls={`${tab.key}-panel`}
                      aria-label={`${tab.label}: ${tab.description}`}
                      id={`${tab.key}-tab-mobile`}
                      tabIndex={activeTab === tab.key ? 0 : -1}
                      onClick={() => setActiveTab(tab.key)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      title={tab.description}
                      className={clsx(
                        'btn d-flex flex-column align-items-center gap-2 px-3 py-2 flex-shrink-0',
                        activeTab === tab.key
                          ? 'btn-primary'
                          : 'btn-outline-secondary'
                      )}
                      style={{
                        minWidth: '90px',
                        position: 'relative'
                      }}
                    >
                      <i className={clsx(tab.icon, 'fs-4')}></i>
                      {/* Full label on tablet */}
                      <span className="d-none d-md-inline d-lg-none small text-nowrap">
                        {tab.label}
                      </span>
                      {/* Short label on mobile */}
                      <span className="d-md-none small text-nowrap">
                        {tab.labelShort}
                      </span>
                      {/* Active indicator underline */}
                      {activeTab === tab.key && (
                        <div
                          className="position-absolute bottom-0 start-0 w-100 bg-primary"
                          style={{ height: '3px' }}
                        ></div>
                      )}
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Tab Content - Takes remaining space on desktop */}
          <div className="col-lg-9 col-12">
            <div
              id={`${activeTab}-panel`}
              role="tabpanel"
              aria-labelledby={`${activeTab}-tab`}
            >
            {/* CLINIC PROFILE */}
            {activeTab === 'clinic-profile' && (
              <Card>
                <CardHeader title="Profil Clinică" icon="ti ti-building" />
                <CardBody>
                  <div className="row g-3">
                    {/* Logo Upload */}
                    <div className="col-12">
                      <label className="form-label">Logo Clinică</label>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="bg-light rounded d-flex align-items-center justify-content-center"
                          style={{ width: '100px', height: '100px' }}
                        >
                          <i className="ti ti-building" style={{ fontSize: '40px' }}></i>
                        </div>
                        <div>
                          <Button variant="outline-primary" size="sm" icon="ti ti-upload">
                            Încarcă Logo
                          </Button>
                          <small className="d-block text-muted mt-1">
                            PNG, JPG sau SVG (max. 2MB)
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="col-md-6">
                      <Input
                        label="Nume Clinică"
                        name="clinicName"
                        value={clinicProfile.clinicName}
                        onChange={handleClinicProfileChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={clinicProfile.email}
                        onChange={handleClinicProfileChange}
                        icon="ti ti-mail"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        label="Telefon"
                        type="tel"
                        name="phone"
                        value={clinicProfile.phone}
                        onChange={handleClinicProfileChange}
                        icon="ti ti-phone"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        label="Adresă"
                        name="address"
                        value={clinicProfile.address}
                        onChange={handleClinicProfileChange}
                        required
                      />
                    </div>

                    {/* Legal Info */}
                    <div className="col-md-6">
                      <Input
                        label="CUI"
                        name="cui"
                        value={clinicProfile.cui}
                        onChange={handleClinicProfileChange}
                        helperText="Cod Unic de Identificare"
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        label="Reg. Comerțului"
                        name="regComertului"
                        value={clinicProfile.regComertului}
                        onChange={handleClinicProfileChange}
                      />
                    </div>

                    {/* Working Hours Display */}
                    <div className="col-12">
                      <Input
                        label="Program Afișat"
                        name="workingHoursDisplay"
                        value={clinicProfile.workingHoursDisplay}
                        onChange={handleClinicProfileChange}
                        helperText="Text afișat pacienților (ex: Luni-Vineri: 09:00-17:00)"
                      />
                    </div>

                    {/* Social Media */}
                    <div className="col-12">
                      <h6 className="mb-3">Social Media</h6>
                    </div>
                    <div className="col-md-4">
                      <Input
                        label="Facebook"
                        name="facebook"
                        value={clinicProfile.facebook || ''}
                        onChange={handleClinicProfileChange}
                        placeholder="https://facebook.com/..."
                        icon="ti ti-brand-facebook"
                      />
                    </div>
                    <div className="col-md-4">
                      <Input
                        label="Instagram"
                        name="instagram"
                        value={clinicProfile.instagram || ''}
                        onChange={handleClinicProfileChange}
                        placeholder="https://instagram.com/..."
                        icon="ti ti-brand-instagram"
                      />
                    </div>
                    <div className="col-md-4">
                      <Input
                        label="Website"
                        name="website"
                        value={clinicProfile.website || ''}
                        onChange={handleClinicProfileChange}
                        placeholder="https://..."
                        icon="ti ti-world"
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* USERS MANAGEMENT */}
            {activeTab === 'users' && (
              <Card>
                <CardHeader
                  title="Utilizatori"
                  icon="ti ti-users"
                  actions={
                    <Button
                      variant="primary"
                      size="sm"
                      icon="ti ti-plus"
                      onClick={() => setShowUserModal(true)}
                    >
                      Adaugă Utilizator
                    </Button>
                  }
                />
                <CardBody>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Nume</th>
                          <th>Email</th>
                          <th>Rol</th>
                          <th>Status</th>
                          <th>Acțiuni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="avatar avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                                  style={{ width: '32px', height: '32px' }}
                                >
                                  {user.firstName.charAt(0)}
                                  {user.lastName.charAt(0)}
                                </div>
                                <span className="fw-medium">
                                  {user.firstName} {user.lastName}
                                </span>
                              </div>
                            </td>
                            <td>{user.email}</td>
                            <td>
                              <span
                                className={clsx('badge', {
                                  'bg-danger': user.role === 'admin',
                                  'bg-primary': user.role === 'doctor',
                                  'bg-info': user.role === 'receptionist',
                                })}
                              >
                                {user.role === 'admin' && 'Administrator'}
                                {user.role === 'doctor' && 'Doctor'}
                                {user.role === 'receptionist' && 'Recepționer'}
                              </span>
                            </td>
                            <td>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={user.isActive}
                                  onChange={() => {
                                    setUsers((prev) =>
                                      prev.map((u) =>
                                        u.id === user.id
                                          ? { ...u, isActive: !u.isActive }
                                          : u
                                      )
                                    );
                                  }}
                                />
                              </div>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowUserModal(true);
                                  }}
                                >
                                  <i className="ti ti-edit"></i>
                                </button>
                                <button className="btn btn-sm btn-outline-secondary">
                                  <i className="ti ti-key"></i>
                                </button>
                                <button className="btn btn-sm btn-outline-danger">
                                  <i className="ti ti-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Permissions Matrix */}
                  <div className="mt-4">
                    <h6 className="mb-3">Matrice Permisiuni</h6>
                    <div className="table-responsive">
                      <table className="table table-bordered table-sm">
                        <thead>
                          <tr>
                            <th>Modul</th>
                            <th className="text-center">Admin</th>
                            <th className="text-center">Doctor</th>
                            <th className="text-center">Recepționer</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Dashboard</td>
                            <td className="text-center">
                              <i className="ti ti-check text-success"></i>
                            </td>
                            <td className="text-center">
                              <i className="ti ti-check text-success"></i>
                            </td>
                            <td className="text-center">
                              <i className="ti ti-check text-success"></i>
                            </td>
                          </tr>
                          <tr>
                            <td>Pacienți</td>
                            <td className="text-center">
                              <i className="ti ti-check text-success"></i>
                            </td>
                            <td className="text-center">
                              <i className="ti ti-check text-success"></i>
                            </td>
                            <td className="text-center">
                              <i className="ti ti-check text-success"></i>
                            </td>
                          </tr>
                          <tr>
                            <td>Programări</td>
                            <td className="text-center">
                              <i className="ti ti-check text-success"></i>
                            </td>
                            <td className="text-center">
                              <i className="ti ti-check text-success"></i>
                            </td>
                            <td className="text-center">
                              <i className="ti ti-check text-success"></i>
                            </td>
                          </tr>
                          <tr>
                            <td>Date Clinice</td>
                            <td className="text-center">
                              <i className="ti ti-check text-success"></i>
                            </td>
                            <td className="text-center">
                              <i className="ti ti-check text-success"></i>
                            </td>
                            <td className="text-center">
                              <i className="ti ti-x text-danger"></i>
                            </td>
                          </tr>
                          <tr>
                            <td>Facturare</td>
                            <td className="text-center">
                              <i className="ti ti-check text-success"></i>
                            </td>
                            <td className="text-center">
                              <i className="ti ti-x text-danger"></i>
                            </td>
                            <td className="text-center">
                              <i className="ti ti-check text-success"></i>
                            </td>
                          </tr>
                          <tr>
                            <td>Rapoarte</td>
                            <td className="text-center">
                              <i className="ti ti-check text-success"></i>
                            </td>
                            <td className="text-center">
                              <i className="ti ti-check text-success"></i>
                            </td>
                            <td className="text-center">
                              <i className="ti ti-x text-danger"></i>
                            </td>
                          </tr>
                          <tr>
                            <td>Setări</td>
                            <td className="text-center">
                              <i className="ti ti-check text-success"></i>
                            </td>
                            <td className="text-center">
                              <i className="ti ti-x text-danger"></i>
                            </td>
                            <td className="text-center">
                              <i className="ti ti-x text-danger"></i>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* SERVICES & PRICES */}
            {activeTab === 'services' && (
              <Card>
                <CardHeader
                  title="Servicii & Prețuri"
                  icon="ti ti-list"
                  actions={
                    <Button
                      variant="primary"
                      size="sm"
                      icon="ti ti-plus"
                      onClick={() => setShowServiceModal(true)}
                    >
                      Adaugă Serviciu
                    </Button>
                  }
                />
                <CardBody>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Nume Serviciu</th>
                          <th>Cod</th>
                          <th>Categorie</th>
                          <th>Durată</th>
                          <th>Preț</th>
                          <th>Status</th>
                          <th>Acțiuni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.map((service) => (
                          <tr key={service.id}>
                            <td className="fw-medium">{service.name}</td>
                            <td>
                              <code>{service.code}</code>
                            </td>
                            <td>{service.category}</td>
                            <td>{service.duration} min</td>
                            <td>{service.price} RON</td>
                            <td>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={service.isActive}
                                  onChange={() => {
                                    setServices((prev) =>
                                      prev.map((s) =>
                                        s.id === service.id
                                          ? { ...s, isActive: !s.isActive }
                                          : s
                                      )
                                    );
                                  }}
                                />
                              </div>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => {
                                    setSelectedService(service);
                                    setShowServiceModal(true);
                                  }}
                                >
                                  <i className="ti ti-edit"></i>
                                </button>
                                <button className="btn btn-sm btn-outline-danger">
                                  <i className="ti ti-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Bulk Price Update */}
                  <div className="mt-4 p-3 bg-light rounded">
                    <h6 className="mb-3">Actualizare Prețuri în Masă</h6>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label">Categorie</label>
                        <select className="form-control">
                          <option value="">Toate categoriile</option>
                          <option value="consultații">Consultații</option>
                          <option value="tratamente">Tratamente</option>
                          <option value="igienizare">Igienizare</option>
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Tip Ajustare</label>
                        <select className="form-control">
                          <option value="percent">Procent (%)</option>
                          <option value="fixed">Valoare Fixă (RON)</option>
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Valoare</label>
                        <input type="number" className="form-control" placeholder="10" />
                      </div>
                      <div className="col-md-2 d-flex align-items-end">
                        <Button variant="primary" className="w-100">
                          Aplică
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* WORKING HOURS */}
            {activeTab === 'working-hours' && (
              <>
                <Card className="mb-4">
                  <CardHeader title="Program de Lucru" icon="ti ti-clock" />
                  <CardBody>
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th style={{ width: '30%' }}>Zi</th>
                            <th style={{ width: '15%' }}>Deschis</th>
                            <th style={{ width: '25%' }}>Ora Început</th>
                            <th style={{ width: '25%' }}>Ora Sfârșit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(Object.keys(workingHours) as DayOfWeek[]).map((day) => (
                            <tr key={day}>
                              <td className="align-middle">
                                <strong>{DAY_LABELS[day]}</strong>
                              </td>
                              <td className="align-middle text-center">
                                <div className="form-check d-inline-block">
                                  <input
                                    type="checkbox"
                                    id={`${day}-enabled`}
                                    className="form-check-input"
                                    checked={workingHours[day].enabled}
                                    onChange={(e) =>
                                      handleWorkingHoursChange(
                                        day,
                                        'enabled',
                                        e.target.checked
                                      )
                                    }
                                  />
                                </div>
                              </td>
                              <td>
                                <input
                                  type="time"
                                  className="form-control"
                                  value={workingHours[day].start}
                                  onChange={(e) =>
                                    handleWorkingHoursChange(day, 'start', e.target.value)
                                  }
                                  disabled={!workingHours[day].enabled}
                                />
                              </td>
                              <td>
                                <input
                                  type="time"
                                  className="form-control"
                                  value={workingHours[day].end}
                                  onChange={(e) =>
                                    handleWorkingHoursChange(day, 'end', e.target.value)
                                  }
                                  disabled={!workingHours[day].enabled}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardBody>
                </Card>

                {/* Holidays Calendar */}
                <Card>
                  <CardHeader
                    title="Sărbători și Închideri"
                    icon="ti ti-calendar-off"
                    actions={
                      <Button variant="primary" size="sm" icon="ti ti-plus">
                        Adaugă Sărbătoare
                      </Button>
                    }
                  />
                  <CardBody>
                    <div className="alert alert-info d-flex align-items-center gap-2">
                      <i className="ti ti-info-circle"></i>
                      <span>
                        Zilele configurate ca sărbători vor fi marcate automat ca închise în
                        sistemul de programări.
                      </span>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-4">
                        <div className="card border">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="mb-0">1 Ianuarie 2025</h6>
                              <button className="btn btn-sm btn-outline-danger">
                                <i className="ti ti-trash"></i>
                              </button>
                            </div>
                            <p className="text-muted mb-0 small">Anul Nou</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="card border">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="mb-0">24 Ianuarie 2025</h6>
                              <button className="btn btn-sm btn-outline-danger">
                                <i className="ti ti-trash"></i>
                              </button>
                            </div>
                            <p className="text-muted mb-0 small">Ziua Unirii</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="card border">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="mb-0">1 Mai 2025</h6>
                              <button className="btn btn-sm btn-outline-danger">
                                <i className="ti ti-trash"></i>
                              </button>
                            </div>
                            <p className="text-muted mb-0 small">Ziua Muncii</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <>
                <Card className="mb-4">
                  <CardHeader title="Setări Notificări" icon="ti ti-bell" />
                  <CardBody>
                    <div className="row g-3">
                      {/* Channel Toggle */}
                      <div className="col-md-6">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="sms-enabled"
                            checked={notificationSettings.smsEnabled}
                            onChange={(e) =>
                              handleNotificationChange('smsEnabled', e.target.checked)
                            }
                          />
                          <label className="form-check-label" htmlFor="sms-enabled">
                            <strong>Notificări SMS</strong>
                            <br />
                            <small className="text-muted">
                              Trimite SMS-uri automate către pacienți
                            </small>
                          </label>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="email-enabled"
                            checked={notificationSettings.emailEnabled}
                            onChange={(e) =>
                              handleNotificationChange('emailEnabled', e.target.checked)
                            }
                          />
                          <label className="form-check-label" htmlFor="email-enabled">
                            <strong>Notificări Email</strong>
                            <br />
                            <small className="text-muted">
                              Trimite email-uri automate către pacienți
                            </small>
                          </label>
                        </div>
                      </div>

                      {/* Reminder Timing */}
                      <div className="col-12">
                        <hr />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Timing Reminder-uri</label>
                        <select
                          className="form-control"
                          value={notificationSettings.reminderTiming}
                          onChange={(e) => handleNotificationChange('reminderTiming', e.target.value)}
                        >
                          <option value="1h">Cu 1 oră înainte</option>
                          <option value="24h">Cu 24 ore înainte</option>
                          <option value="48h">Cu 48 ore înainte</option>
                        </select>
                        <small className="text-muted">
                          Când să trimită reminder-uri pacienților
                        </small>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* SMS Template */}
                <Card className="mb-4">
                  <CardHeader title="Template SMS" icon="ti ti-message" />
                  <CardBody>
                    <Textarea
                      label="Mesaj SMS"
                      value={notificationSettings.smsTemplate}
                      onChange={(e) => handleNotificationChange('smsTemplate', e.target.value)}
                      rows={4}
                      helperText="Folosește variabile pentru personalizare"
                    />
                    <div className="mt-3">
                      <strong>Variabile disponibile:</strong>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        <code>{'{{patientName}}'}</code>
                        <code>{'{{appointmentDate}}'}</code>
                        <code>{'{{appointmentTime}}'}</code>
                        <code>{'{{doctorName}}'}</code>
                        <code>{'{{clinicName}}'}</code>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Email Template */}
                <Card>
                  <CardHeader title="Template Email" icon="ti ti-mail" />
                  <CardBody>
                    <Textarea
                      label="Conținut Email"
                      value={notificationSettings.emailTemplate}
                      onChange={(e) => handleNotificationChange('emailTemplate', e.target.value)}
                      rows={6}
                      helperText="Folosește variabile pentru personalizare"
                    />
                    <div className="mt-3">
                      <strong>Variabile disponibile:</strong>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        <code>{'{{patientName}}'}</code>
                        <code>{'{{appointmentDate}}'}</code>
                        <code>{'{{appointmentTime}}'}</code>
                        <code>{'{{doctorName}}'}</code>
                        <code>{'{{clinicName}}'}</code>
                        <code>{'{{clinicAddress}}'}</code>
                        <code>{'{{clinicPhone}}'}</code>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </>
            )}

            {/* BILLING SETTINGS */}
            {activeTab === 'billing' && (
              <>
                <Card className="mb-4">
                  <CardHeader title="Setări Facturare" icon="ti ti-receipt" />
                  <CardBody>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <Input
                          label="Serie Facturi"
                          name="invoiceSeries"
                          value={billingSettings.invoiceSeries}
                          onChange={(e) => handleBillingChange('invoiceSeries', e.target.value)}
                          helperText="ex: FAC, INV"
                        />
                      </div>
                      <div className="col-md-6">
                        <Input
                          label="Prefix Facturi"
                          name="invoicePrefix"
                          value={billingSettings.invoicePrefix}
                          onChange={(e) => handleBillingChange('invoicePrefix', e.target.value)}
                          helperText="ex: INV-2025-"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Cotă TVA</label>
                        <select
                          className="form-control"
                          value={billingSettings.vatRate}
                          onChange={(e) =>
                            handleBillingChange('vatRate', parseInt(e.target.value))
                          }
                        >
                          <option value="0">0% - Scutit</option>
                          <option value="5">5% - Redusă</option>
                          <option value="9">9% - Redusă</option>
                          <option value="19">19% - Standard</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <Input
                          label="Termeni de Plată"
                          name="defaultPaymentTerms"
                          value={billingSettings.defaultPaymentTerms}
                          onChange={(e) =>
                            handleBillingChange('defaultPaymentTerms', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Bank Account */}
                <Card className="mb-4">
                  <CardHeader title="Date Bancare" icon="ti ti-building-bank" />
                  <CardBody>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <Input
                          label="Nume Bancă"
                          name="bankName"
                          value={billingSettings.bankName || ''}
                          onChange={(e) => handleBillingChange('bankName', e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <Input
                          label="Cont IBAN"
                          name="bankAccount"
                          value={billingSettings.bankAccount || ''}
                          onChange={(e) => handleBillingChange('bankAccount', e.target.value)}
                          helperText="ex: RO49AAAA1B31007593840000"
                        />
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* E-Factura */}
                <Card>
                  <CardHeader title="E-Factura ANAF" icon="ti ti-file-invoice" />
                  <CardBody>
                    <div className="row g-3">
                      <div className="col-12">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="efactura-enabled"
                            checked={billingSettings.eFacturaEnabled}
                            onChange={(e) =>
                              handleBillingChange('eFacturaEnabled', e.target.checked)
                            }
                          />
                          <label className="form-check-label" htmlFor="efactura-enabled">
                            <strong>Activează E-Factura</strong>
                            <br />
                            <small className="text-muted">
                              Integrare cu sistemul E-Factura ANAF pentru facturare electronică
                            </small>
                          </label>
                        </div>
                      </div>

                      {billingSettings.eFacturaEnabled && (
                        <div className="col-12">
                          <Input
                            label="API Key E-Factura"
                            type="password"
                            name="eFacturaApiKey"
                            value={billingSettings.eFacturaApiKey || ''}
                            onChange={(e) =>
                              handleBillingChange('eFacturaApiKey', e.target.value)
                            }
                            helperText="Cheie API pentru integrarea cu E-Factura"
                          />
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </>
            )}

            {/* MODULES & SUBSCRIPTION */}
            {activeTab === 'modules' && (
              <>
                {/* Current Plan Overview */}
                <Card className="mb-4">
                  <CardBody>
                    <div className="d-flex align-items-start justify-content-between">
                      <div>
                        <div className="d-flex align-items-center gap-3 mb-3">
                          <div className="avatar avatar-lg bg-primary-subtle text-primary rounded">
                            <i className="ti ti-crown fs-2"></i>
                          </div>
                          <div>
                            <h5 className="mb-1">Plan Professional</h5>
                            <p className="text-muted mb-0">Abonament activ până la 31 decembrie 2025</p>
                          </div>
                        </div>

                        <div className="d-flex gap-4 mb-3">
                          <div>
                            <small className="text-muted d-block">Utilizatori</small>
                            <strong>5 / 10</strong>
                          </div>
                          <div>
                            <small className="text-muted d-block">Clinici</small>
                            <strong>1 / 3</strong>
                          </div>
                          <div>
                            <small className="text-muted d-block">Stocare</small>
                            <strong>45 GB / 100 GB</strong>
                          </div>
                        </div>
                      </div>

                      <div className="text-end">
                        <div className="h3 mb-0 text-primary">299 RON/lună</div>
                        <small className="text-muted">facturare lunară</small>
                      </div>
                    </div>

                    <div className="alert alert-info d-flex align-items-center gap-2 mb-0 mt-3">
                      <i className="ti ti-info-circle"></i>
                      <span>
                        Vrei mai multe funcționalități? <a href="/subscription/upgrade" className="alert-link fw-semibold">Upgrade la plan Enterprise</a>
                      </span>
                    </div>
                  </CardBody>
                </Card>

                {/* Active Modules */}
                <Card className="mb-4">
                  <CardHeader title="Module Active" icon="ti ti-apps" />
                  <CardBody>
                    <div className="row g-3">
                      {/* Core Modules */}
                      <div className="col-md-6">
                        <div className="card border border-success shadow-none h-100">
                          <div className="card-body">
                            <div className="d-flex gap-3">
                              <div className="avatar bg-success-subtle text-success rounded flex-shrink-0">
                                <i className="ti ti-calendar fs-4"></i>
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="mb-1">Programări & Calendar</h6>
                                <p className="text-muted small mb-2">Gestionare programări și calendar interactiv</p>
                                <span className="badge bg-success-subtle text-success">Activat</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card border border-success shadow-none h-100">
                          <div className="card-body">
                            <div className="d-flex gap-3">
                              <div className="avatar bg-success-subtle text-success rounded flex-shrink-0">
                                <i className="ti ti-users fs-4"></i>
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="mb-1">Pacienți & CRM</h6>
                                <p className="text-muted small mb-2">Gestionare pacienți și istoric complet</p>
                                <span className="badge bg-success-subtle text-success">Activat</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card border border-success shadow-none h-100">
                          <div className="card-body">
                            <div className="d-flex gap-3">
                              <div className="avatar bg-success-subtle text-success rounded flex-shrink-0">
                                <i className="ti ti-file-invoice fs-4"></i>
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="mb-1">Facturare & Plăți</h6>
                                <p className="text-muted small mb-2">Facturi, chitanțe și E-Factura ANAF</p>
                                <span className="badge bg-success-subtle text-success">Activat</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card border border-success shadow-none h-100">
                          <div className="card-body">
                            <div className="d-flex gap-3">
                              <div className="avatar bg-success-subtle text-success rounded flex-shrink-0">
                                <i className="ti ti-tooth fs-4"></i>
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="mb-1">Date Clinice</h6>
                                <p className="text-muted small mb-2">Fișe clinice, odontograme și planuri tratament</p>
                                <span className="badge bg-success-subtle text-success">Activat</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Optional Modules */}
                      <div className="col-md-6">
                        <div className="card border border-warning shadow-none h-100">
                          <div className="card-body">
                            <div className="d-flex gap-3">
                              <div className="avatar bg-warning-subtle text-warning rounded flex-shrink-0">
                                <i className="ti ti-package fs-4"></i>
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="mb-1">Stocuri & Aprovizionare</h6>
                                <p className="text-muted small mb-2">Gestionare inventar și achiziții</p>
                                <span className="badge bg-warning-subtle text-warning">Disponibil</span>
                              </div>
                            </div>
                          </div>
                          <div className="card-footer bg-light">
                            <Button variant="outline-primary" size="sm" className="w-100">
                              Activează (+49 RON/lună)
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card border border-warning shadow-none h-100">
                          <div className="card-body">
                            <div className="d-flex gap-3">
                              <div className="avatar bg-warning-subtle text-warning rounded flex-shrink-0">
                                <i className="ti ti-chart-bar fs-4"></i>
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="mb-1">Marketing & Loialitate</h6>
                                <p className="text-muted small mb-2">Campanii, segmentare și puncte loialitate</p>
                                <span className="badge bg-warning-subtle text-warning">Disponibil</span>
                              </div>
                            </div>
                          </div>
                          <div className="card-footer bg-light">
                            <Button variant="outline-primary" size="sm" className="w-100">
                              Activează (+39 RON/lună)
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Quick Link to Full Modules Page */}
                <Card>
                  <CardBody className="text-center py-5">
                    <i className="ti ti-rocket fs-1 text-primary mb-3"></i>
                    <h5>Explorează toate modulele</h5>
                    <p className="text-muted mb-4">
                      Vezi toate funcționalitățile disponibile și personalizează planul tău
                    </p>
                    <Button variant="primary" icon="ti ti-external-link">
                      Deschide pagina Module complete
                    </Button>
                  </CardBody>
                </Card>
              </>
            )}

            {/* Save Button (shown for all tabs except modules) */}
            {activeTab !== 'modules' && (
              <div className="d-flex justify-content-end gap-3 mt-4">
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() => window.location.reload()}
                  disabled={isSubmitting}
                >
                  Anulează
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  icon="ti ti-device-floppy"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  onClick={handleSaveSettings}
                >
                  Salvează Setările
                </Button>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
