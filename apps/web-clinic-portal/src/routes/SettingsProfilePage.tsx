/**
 * Settings Profile Page
 *
 * User profile settings page with sidebar navigation
 * Allows users to update personal and professional information
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader, CardBody } from '../components/ui-new/Card';
import { Button } from '../components/ui-new/Button';
import { Input, Textarea } from '../components/ui-new/Input';
import { useAuth } from '../hooks/useAuth';
import clsx from 'clsx';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'non-binary' | '';
  specialization?: string;
  licenseNumber?: string;
  bio?: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
}

type SettingsSection = 'profile' | 'security' | 'notifications' | 'preferences';

export default function SettingsProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Initialize form data with user data
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    specialization: '',
    licenseNumber: '',
    bio: '',
  });

  // Avatar file state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle avatar change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Te rugăm să selectezi un fișier de tip imagine');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imaginea nu poate depăși 5MB');
        return;
      }

      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Prenumele este obligatoriu';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Numele este obligatoriu';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email-ul este obligatoriu';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email-ul nu este valid';
    }

    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Numărul de telefon nu este valid';
    }

    if (formData.dateOfBirth) {
      const date = new Date(formData.dateOfBirth);
      const today = new Date();
      if (date > today) {
        newErrors.dateOfBirth = 'Data nașterii nu poate fi în viitor';
      }
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
      console.log('Profile update data:', formData);
      console.log('Avatar file:', avatarFile);

      toast.success('Profilul a fost actualizat cu succes');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('A apărut o eroare la actualizarea profilului');
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
    { key: 'profile', label: 'Profil', icon: 'ti ti-user' },
    { key: 'security', label: 'Securitate', icon: 'ti ti-lock', path: '/settings/security' },
    {
      key: 'notifications',
      label: 'Notificări',
      icon: 'ti ti-bell',
      path: '/settings/notifications',
    },
    {
      key: 'preferences',
      label: 'Preferințe',
      icon: 'ti ti-settings',
      path: '/settings/preferences',
    },
  ];

  const handleNavigationClick = (item: typeof navigationItems[0]) => {
    if (item.path) {
      navigate(item.path);
    } else {
      setActiveSection(item.key);
    }
  };

  // Check if user is a provider (has provider role)
  const isProvider = user?.roles?.includes('PROVIDER') || user?.roles?.includes('provider');

  return (
    <AppShell title="Setări" subtitle="Gestionează-ți contul și preferințele">
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
                  {/* Profile Photo Section */}
                  <Card className="mb-4">
                    <CardHeader title="Fotografie Profil" icon="ti ti-camera" />
                    <CardBody>
                      <div className="d-flex align-items-center gap-4">
                        <div className="position-relative">
                          <div
                            className="avatar avatar-xxl rounded-circle overflow-hidden bg-light d-flex align-items-center justify-content-center"
                            style={{ width: '120px', height: '120px' }}
                          >
                            {avatarPreview ? (
                              <img
                                src={avatarPreview}
                                alt="Avatar preview"
                                className="w-100 h-100 object-fit-cover"
                              />
                            ) : (
                              <i className="ti ti-user" style={{ fontSize: '48px' }}></i>
                            )}
                          </div>
                          <label
                            htmlFor="avatar-upload"
                            className="position-absolute bottom-0 end-0 btn btn-primary btn-sm btn-icon rounded-circle"
                            style={{ cursor: 'pointer' }}
                          >
                            <i className="ti ti-camera"></i>
                            <input
                              type="file"
                              id="avatar-upload"
                              accept="image/*"
                              onChange={handleAvatarChange}
                              className="d-none"
                            />
                          </label>
                        </div>
                        <div>
                          <h5 className="mb-1">
                            {formData.firstName} {formData.lastName}
                          </h5>
                          <p className="text-muted mb-2">{formData.email}</p>
                          <small className="text-muted">
                            Formatul acceptat: JPG, PNG, GIF (max. 5MB)
                          </small>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Personal Information */}
                  <Card className="mb-4">
                    <CardHeader title="Informații Personale" icon="ti ti-user" />
                    <CardBody>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <Input
                            label="Prenume"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            error={errors.firstName}
                            required
                            placeholder="Introduceți prenumele"
                          />
                        </div>
                        <div className="col-md-6">
                          <Input
                            label="Nume"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            error={errors.lastName}
                            required
                            placeholder="Introduceți numele"
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
                            placeholder="exemplu@email.com"
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
                            label="Data Nașterii"
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            error={errors.dateOfBirth}
                          />
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label htmlFor="gender" className="form-label">
                              Gen
                            </label>
                            <select
                              id="gender"
                              name="gender"
                              value={formData.gender}
                              onChange={handleInputChange}
                              className="form-control"
                            >
                              <option value="">Selectează</option>
                              <option value="male">Masculin</option>
                              <option value="female">Feminin</option>
                              <option value="non-binary">Non-binar</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Professional Information (only for providers) */}
                  {isProvider && (
                    <Card className="mb-4">
                      <CardHeader
                        title="Informații Profesionale"
                        icon="ti ti-certificate"
                      />
                      <CardBody>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <Input
                              label="Specializare"
                              name="specialization"
                              value={formData.specialization || ''}
                              onChange={handleInputChange}
                              placeholder="ex: Ortodonție, Chirurgie orală"
                            />
                          </div>
                          <div className="col-md-6">
                            <Input
                              label="Număr Licență"
                              name="licenseNumber"
                              value={formData.licenseNumber || ''}
                              onChange={handleInputChange}
                              placeholder="ex: 12345"
                            />
                          </div>
                          <div className="col-12">
                            <Textarea
                              label="Biografie / Descriere"
                              name="bio"
                              value={formData.bio || ''}
                              onChange={handleInputChange}
                              rows={4}
                              placeholder="Scrie o scurtă descriere despre tine și experiența ta profesională..."
                              helperText="Această informație va fi vizibilă pacienților"
                            />
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  )}

                  {/* Save Button */}
                  <div className="d-flex justify-content-end gap-3">
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => {
                        // Reset form
                        setFormData({
                          firstName: user?.firstName || '',
                          lastName: user?.lastName || '',
                          email: user?.email || '',
                          phone: '',
                          dateOfBirth: '',
                          gender: '',
                          specialization: '',
                          licenseNumber: '',
                          bio: '',
                        });
                        setAvatarFile(null);
                        setAvatarPreview(null);
                        setErrors({});
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
