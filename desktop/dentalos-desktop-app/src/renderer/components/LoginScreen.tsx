import React, { useState } from 'react';

export const LoginScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    deviceName: '',
    tenantId: '',
    organizationId: '',
    clinicId: '',
    userId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await window.dentalos.device.register({
        deviceName: formData.deviceName,
        tenantId: formData.tenantId,
        organizationId: formData.organizationId,
        clinicId: formData.clinicId || undefined,
        userId: formData.userId
      });

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <h2>Device Registration</h2>
        <p className="subtitle">Register this device with DentalOS</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Device Name</label>
            <input
              type="text"
              value={formData.deviceName}
              onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
              placeholder="Front Desk - Computer 1"
              required
            />
          </div>

          <div className="form-group">
            <label>Tenant ID</label>
            <input
              type="text"
              value={formData.tenantId}
              onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
              placeholder="tenant-uuid"
              required
            />
          </div>

          <div className="form-group">
            <label>Organization ID</label>
            <input
              type="text"
              value={formData.organizationId}
              onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
              placeholder="organization-uuid"
              required
            />
          </div>

          <div className="form-group">
            <label>Clinic ID (Optional)</label>
            <input
              type="text"
              value={formData.clinicId}
              onChange={(e) => setFormData({ ...formData, clinicId: e.target.value })}
              placeholder="clinic-uuid"
            />
          </div>

          <div className="form-group">
            <label>User ID</label>
            <input
              type="text"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              placeholder="user-uuid"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-button"
            aria-busy={loading}
          >
            {loading ? 'Registering...' : 'Register Device'}
          </button>
        </form>
      </div>
    </div>
  );
};
