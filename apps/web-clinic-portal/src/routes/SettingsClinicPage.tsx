/**
 * Settings Clinic Page
 *
 * Clinic settings page with sidebar navigation
 * Allows users to configure clinic information, working hours, fiscal settings, and notifications
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader, CardBody } from '../components/ui-new/Card';
import { Button } from '../components/ui-new/Button';
import { Input } from '../components/ui-new/Input';
import clsx from 'clsx';

interface ClinicFormData {
  // Clinic Information
  clinicName: string;
  legalName: string;
  taxId: string;
  street: string;
  city: string;
  postalCode: string;
  county: string;
  phone: string;
  email: string;
  website: string;

  // Fiscal Settings
  invoiceSeriesPrefix: string;
  vatRate: string;
  defaultPaymentTerms: string;
  eFacturaEnabled: boolean;
  anafSpvEnabled: boolean;

  // Notification Settings
  appointmentReminders: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
  reminderTimeBefore: string;
}

interface WorkingHoursData {
  monday: { enabled: boolean; start: string; end: string };
  tuesday: { enabled: boolean; start: string; end: string };
  wednesday: { enabled: boolean; start: string; end: string };
  thursday: { enabled: boolean; start: string; end: string };
  friday: { enabled: boolean; start: string; end: string };
  saturday: { enabled: boolean; start: string; end: string };
  sunday: { enabled: boolean; start: string; end: string };
}

interface FormErrors {
  clinicName?: string;
  email?: string;
  phone?: string;
  taxId?: string;
}

type SettingsSection = 'profile' | 'security' | 'clinic' | 'notifications';
type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Luni',
  tuesday: 'Marți',
  wednesday: 'Miercuri',
  thursday: 'Joi',
  friday: 'Vineri',
  saturday: 'Sâmbătă',
  sunday: 'Duminică',
};

export default function SettingsClinicPage() {
  const navigate = useNavigate();
  const [activeSection] = useState<SettingsSection>('clinic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Initialize form data
  const [formData, setFormData] = useState<ClinicFormData>({
    clinicName: '',
    legalName: '',
    taxId: '',
    street: '',
    city: '',
    postalCode: '',
    county: '',
    phone: '',
    email: '',
    website: '',
    invoiceSeriesPrefix: 'INV',
    vatRate: '19',
    defaultPaymentTerms: 'due_on_receipt',
    eFacturaEnabled: false,
    anafSpvEnabled: false,
    appointmentReminders: true,
    smsNotifications: true,
    emailNotifications: true,
    reminderTimeBefore: '24',
  });

  // Initialize working hours
  const [workingHours, setWorkingHours] = useState<WorkingHoursData>({
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: true, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '13:00' },
    sunday: { enabled: false, start: '09:00', end: '13:00' },
  });

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle working hours change
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

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.clinicName.trim()) {
      newErrors.clinicName = 'Numele clinicii este obligatoriu';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email-ul este obligatoriu';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email-ul nu este valid';
    }

    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Numărul de telefon nu este valid';
    }

    if (formData.taxId && !/^[A-Z0-9]+$/.test(formData.taxId.replace(/\s/g, ''))) {
      newErrors.taxId = 'CUI-ul nu este valid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Te rugăm să corectezi erorile din formular');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate success
      console.log('Clinic settings data:', formData);
      console.log('Working hours:', workingHours);

      toast.success('Setările clinicii au fost actualizate cu succes');
    } catch (error) {
      console.error('Error updating clinic settings:', error);
      toast.error('A apărut o eroare la actualizarea setărilor');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigation items
  const navigationItems: Array<{
    key: SettingsSection;
    label: string;
    icon: string;
    path?: string;
  }> = [
    { key: 'profile', label: 'Profil', icon: 'ti ti-user', path: '/settings/profile' },
    { key: 'security', label: 'Securitate', icon: 'ti ti-lock', path: '/settings/security' },
    { key: 'clinic', label: 'Clinica', icon: 'ti ti-building' },
    {
      key: 'notifications',
      label: 'Notificări',
      icon: 'ti ti-bell',
      path: '/settings/notifications',
    },
  ];

  const handleNavigationClick = (item: typeof navigationItems[0]) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <AppShell title="Setări Clinică" subtitle="Configurează informațiile și setările clinicii">
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar Navigation */}
          <div className="col-lg-3 col-md-4 mb-4">
            <Card>
              <CardBody>
                <nav className="settings-nav">
                  <ul className="list-unstyled mb-0">
                    {navigationItems.map((item) => (
                      <li key={item.key} className="mb-2">
                        <button
                          type="button"
                          onClick={() => handleNavigationClick(item)}
                          className={clsx(
                            'btn btn-block text-start d-flex align-items-center gap-2',
                            activeSection === item.key
                              ? 'btn-primary'
                              : 'btn-outline-light text-dark'
                          )}
                        >
                          <i className={item.icon}></i>
                          <span>{item.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </CardBody>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-lg-9 col-md-8">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-12">
                  {/* Clinic Information Card */}
                  <Card className="mb-4">
                    <CardHeader title="Informații Clinică" icon="ti ti-building" />
                    <CardBody>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <Input
                            label="Nume Clinică"
                            name="clinicName"
                            value={formData.clinicName}
                            onChange={handleInputChange}
                            error={errors.clinicName}
                            required
                            placeholder="ex: Dental Clinic Pro"
                          />
                        </div>
                        <div className="col-md-6">
                          <Input
                            label="Denumire Legală"
                            name="legalName"
                            value={formData.legalName}
                            onChange={handleInputChange}
                            placeholder="ex: SC Dental Pro SRL"
                          />
                        </div>
                        <div className="col-md-6">
                          <Input
                            label="CUI (Cod Unic de Identificare)"
                            name="taxId"
                            value={formData.taxId}
                            onChange={handleInputChange}
                            error={errors.taxId}
                            placeholder="ex: RO12345678"
                          />
                        </div>
                        <div className="col-md-6">
                          <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            error={errors.email}
                            required
                            placeholder="contact@clinica.ro"
                            icon="ti ti-mail"
                          />
                        </div>
                        <div className="col-12">
                          <Input
                            label="Adresă Stradă"
                            name="street"
                            value={formData.street}
                            onChange={handleInputChange}
                            placeholder="ex: Str. Victoriei, nr. 123, bl. A1, sc. B, ap. 45"
                          />
                        </div>
                        <div className="col-md-4">
                          <Input
                            label="Oraș"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="ex: București"
                          />
                        </div>
                        <div className="col-md-4">
                          <Input
                            label="Cod Poștal"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            placeholder="ex: 010101"
                          />
                        </div>
                        <div className="col-md-4">
                          <Input
                            label="Județ"
                            name="county"
                            value={formData.county}
                            onChange={handleInputChange}
                            placeholder="ex: București"
                          />
                        </div>
                        <div className="col-md-6">
                          <Input
                            label="Telefon"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            error={errors.phone}
                            placeholder="+40 xxx xxx xxx"
                            icon="ti ti-phone"
                          />
                        </div>
                        <div className="col-md-6">
                          <Input
                            label="Website"
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            placeholder="https://www.clinica.ro"
                            icon="ti ti-world"
                          />
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Working Hours Card */}
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
                                        handleWorkingHoursChange(day, 'enabled', e.target.checked)
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

                  {/* Fiscal Settings Card */}
                  <Card className="mb-4">
                    <CardHeader title="Setări Fiscale" icon="ti ti-receipt" />
                    <CardBody>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <Input
                            label="Prefix Serie Facturi"
                            name="invoiceSeriesPrefix"
                            value={formData.invoiceSeriesPrefix}
                            onChange={handleInputChange}
                            placeholder="ex: INV, FAC"
                            helperText="Serie utilizată pentru numerotarea facturilor"
                          />
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="vatRate" className="form-label">
                              Cotă TVA
                            </label>
                            <select
                              id="vatRate"
                              name="vatRate"
                              value={formData.vatRate}
                              onChange={handleInputChange}
                              className="form-control"
                            >
                              <option value="0">0% - Scutit</option>
                              <option value="5">5% - Redusă</option>
                              <option value="9">9% - Redusă</option>
                              <option value="19">19% - Standard</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="defaultPaymentTerms" className="form-label">
                              Termeni de Plată Impliciti
                            </label>
                            <select
                              id="defaultPaymentTerms"
                              name="defaultPaymentTerms"
                              value={formData.defaultPaymentTerms}
                              onChange={handleInputChange}
                              className="form-control"
                            >
                              <option value="due_on_receipt">La prezentare</option>
                              <option value="net_15">Net 15 zile</option>
                              <option value="net_30">Net 30 zile</option>
                              <option value="net_45">Net 45 zile</option>
                              <option value="net_60">Net 60 zile</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-12">
                          <hr className="my-3" />
                        </div>
                        <div className="col-md-6">
                          <div className="form-check form-switch">
                            <input
                              type="checkbox"
                              id="eFacturaEnabled"
                              name="eFacturaEnabled"
                              className="form-check-input"
                              checked={formData.eFacturaEnabled}
                              onChange={handleInputChange}
                            />
                            <label htmlFor="eFacturaEnabled" className="form-check-label">
                              <strong>E-Factura (ANAF)</strong>
                              <br />
                              <small className="text-muted">
                                Activează integrarea cu sistemul E-Factura ANAF pentru facturare
                                electronică
                              </small>
                            </label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-check form-switch">
                            <input
                              type="checkbox"
                              id="anafSpvEnabled"
                              name="anafSpvEnabled"
                              className="form-check-input"
                              checked={formData.anafSpvEnabled}
                              onChange={handleInputChange}
                            />
                            <label htmlFor="anafSpvEnabled" className="form-check-label">
                              <strong>ANAF SPV</strong>
                              <br />
                              <small className="text-muted">
                                Activează integrarea cu sistemul SPV pentru transmitere date
                              </small>
                            </label>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Notification Settings Card */}
                  <Card className="mb-4">
                    <CardHeader title="Setări Notificări" icon="ti ti-bell" />
                    <CardBody>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="form-check form-switch">
                            <input
                              type="checkbox"
                              id="appointmentReminders"
                              name="appointmentReminders"
                              className="form-check-input"
                              checked={formData.appointmentReminders}
                              onChange={handleInputChange}
                            />
                            <label htmlFor="appointmentReminders" className="form-check-label">
                              <strong>Reminder-uri Programări</strong>
                              <br />
                              <small className="text-muted">
                                Trimite automat reminder-uri pacienților pentru programări
                              </small>
                            </label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="reminderTimeBefore" className="form-label">
                              Timp Înainte de Programare
                            </label>
                            <select
                              id="reminderTimeBefore"
                              name="reminderTimeBefore"
                              value={formData.reminderTimeBefore}
                              onChange={handleInputChange}
                              className="form-control"
                              disabled={!formData.appointmentReminders}
                            >
                              <option value="1">1 oră înainte</option>
                              <option value="2">2 ore înainte</option>
                              <option value="24">24 ore înainte</option>
                              <option value="48">48 ore înainte</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-12">
                          <hr className="my-3" />
                          <h6 className="mb-3">Canale de Notificare</h6>
                        </div>
                        <div className="col-md-6">
                          <div className="form-check form-switch">
                            <input
                              type="checkbox"
                              id="smsNotifications"
                              name="smsNotifications"
                              className="form-check-input"
                              checked={formData.smsNotifications}
                              onChange={handleInputChange}
                            />
                            <label htmlFor="smsNotifications" className="form-check-label">
                              <strong>Notificări SMS</strong>
                              <br />
                              <small className="text-muted">
                                Trimite notificări prin SMS către pacienți
                              </small>
                            </label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-check form-switch">
                            <input
                              type="checkbox"
                              id="emailNotifications"
                              name="emailNotifications"
                              className="form-check-input"
                              checked={formData.emailNotifications}
                              onChange={handleInputChange}
                            />
                            <label htmlFor="emailNotifications" className="form-check-label">
                              <strong>Notificări Email</strong>
                              <br />
                              <small className="text-muted">
                                Trimite notificări prin email către pacienți
                              </small>
                            </label>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Save Button */}
                  <div className="d-flex justify-content-end gap-3">
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => {
                        // Reset form
                        window.location.reload();
                      }}
                      disabled={isSubmitting}
                    >
                      Anulează
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      icon="ti ti-device-floppy"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      Salvează Modificările
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
