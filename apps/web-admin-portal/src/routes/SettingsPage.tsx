import { Row, Col, Form, Card as BsCard } from 'react-bootstrap';
import { AppShell } from '../components/layout';
import { Button, Input } from '../components/ui';

export default function SettingsPage() {
  return (
    <AppShell
      title="Settings"
      subtitle="Platform configuration and preferences"
      breadcrumbs={[{ label: 'Settings' }]}
    >
      <Row className="g-4">
        {/* Main Settings */}
        <Col xl={8}>
          <div className="d-flex flex-column gap-4">
            {/* General Settings */}
            <BsCard className="border-0 shadow-sm">
              <BsCard.Header className="bg-white border-bottom py-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="stats-icon primary">
                    <i className="ti ti-settings" />
                  </div>
                  <div>
                    <h5 className="mb-0">General Settings</h5>
                    <small className="text-muted">Basic platform configuration</small>
                  </div>
                </div>
              </BsCard.Header>
              <BsCard.Body className="p-4">
                <div className="d-flex flex-column gap-3">
                  <Input
                    label="Platform Name"
                    placeholder="DentalOS"
                    hint="The name displayed across the platform"
                  />
                  <Input
                    label="Support Email"
                    type="email"
                    placeholder="support@dentalos.ro"
                  />
                  <Input
                    label="Default Timezone"
                    placeholder="Europe/Bucharest"
                  />
                  <div className="pt-2">
                    <Button variant="primary">Save Changes</Button>
                  </div>
                </div>
              </BsCard.Body>
            </BsCard>

            {/* Trial Settings */}
            <BsCard className="border-0 shadow-sm">
              <BsCard.Header className="bg-white border-bottom py-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="stats-icon warning">
                    <i className="ti ti-clock" />
                  </div>
                  <div>
                    <h5 className="mb-0">Trial Settings</h5>
                    <small className="text-muted">Configure trial period for new organizations</small>
                  </div>
                </div>
              </BsCard.Header>
              <BsCard.Body className="p-4">
                <div className="d-flex flex-column gap-3">
                  <Input
                    label="Trial Duration (days)"
                    type="number"
                    placeholder="14"
                  />
                  <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
                    <div>
                      <p className="fw-medium mb-0">Auto-extend trials</p>
                      <small className="text-muted">Automatically extend trials for engaged users</small>
                    </div>
                    <Form.Check
                      type="switch"
                      id="auto-extend-trials"
                      defaultChecked
                    />
                  </div>
                  <div className="pt-2">
                    <Button variant="primary">Save Changes</Button>
                  </div>
                </div>
              </BsCard.Body>
            </BsCard>

            {/* Email Settings */}
            <BsCard className="border-0 shadow-sm">
              <BsCard.Header className="bg-white border-bottom py-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="stats-icon info">
                    <i className="ti ti-mail" />
                  </div>
                  <div>
                    <h5 className="mb-0">Email Configuration</h5>
                    <small className="text-muted">SMTP settings for transactional emails</small>
                  </div>
                </div>
              </BsCard.Header>
              <BsCard.Body className="p-4">
                <div className="d-flex flex-column gap-3">
                  <Row className="g-3">
                    <Col md={6}>
                      <Input
                        label="SMTP Host"
                        placeholder="smtp.sendgrid.net"
                      />
                    </Col>
                    <Col md={6}>
                      <Input
                        label="SMTP Port"
                        type="number"
                        placeholder="587"
                      />
                    </Col>
                  </Row>
                  <Input
                    label="From Email"
                    type="email"
                    placeholder="noreply@dentalos.ro"
                  />
                  <Input
                    label="From Name"
                    placeholder="DentalOS Platform"
                  />
                  <div className="pt-2 d-flex gap-3">
                    <Button variant="primary">Save Changes</Button>
                    <Button variant="outline-secondary">Test Connection</Button>
                  </div>
                </div>
              </BsCard.Body>
            </BsCard>
          </div>
        </Col>

        {/* Sidebar */}
        <Col xl={4}>
          <div className="d-flex flex-column gap-4">
            {/* Quick Actions */}
            <BsCard className="border-0 shadow-sm">
              <BsCard.Header className="bg-white border-bottom py-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="stats-icon secondary">
                    <i className="ti ti-bolt" />
                  </div>
                  <h5 className="mb-0">Quick Actions</h5>
                </div>
              </BsCard.Header>
              <BsCard.Body className="p-3">
                <div className="d-flex flex-column gap-2">
                  <button className="w-100 d-flex align-items-center gap-3 p-3 rounded bg-light border-0 text-start">
                    <div className="stats-icon primary" style={{ width: 40, height: 40 }}>
                      <i className="ti ti-refresh" />
                    </div>
                    <div>
                      <p className="fw-medium mb-0">Clear Cache</p>
                      <small className="text-muted">Clear platform cache</small>
                    </div>
                  </button>
                  <button className="w-100 d-flex align-items-center gap-3 p-3 rounded bg-light border-0 text-start">
                    <div className="stats-icon success" style={{ width: 40, height: 40 }}>
                      <i className="ti ti-database" />
                    </div>
                    <div>
                      <p className="fw-medium mb-0">Backup Database</p>
                      <small className="text-muted">Create manual backup</small>
                    </div>
                  </button>
                  <button className="w-100 d-flex align-items-center gap-3 p-3 rounded bg-light border-0 text-start">
                    <div className="stats-icon warning" style={{ width: 40, height: 40 }}>
                      <i className="ti ti-file-export" />
                    </div>
                    <div>
                      <p className="fw-medium mb-0">Export Logs</p>
                      <small className="text-muted">Download system logs</small>
                    </div>
                  </button>
                </div>
              </BsCard.Body>
            </BsCard>

            {/* System Info */}
            <BsCard className="border-0 shadow-sm">
              <BsCard.Header className="bg-white border-bottom py-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="stats-icon info">
                    <i className="ti ti-info-circle" />
                  </div>
                  <h5 className="mb-0">System Info</h5>
                </div>
              </BsCard.Header>
              <BsCard.Body className="p-4">
                <div className="d-flex flex-column gap-3 small">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Version</span>
                    <span className="fw-medium">1.0.0</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Environment</span>
                    <span className="text-success fw-medium">Production</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Last Deploy</span>
                    <span>Nov 27, 2024</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Node.js</span>
                    <span>v22.0.0</span>
                  </div>
                </div>
              </BsCard.Body>
            </BsCard>

            {/* Danger Zone */}
            <BsCard className="border-0 shadow-sm border-danger">
              <BsCard.Header className="bg-white border-bottom py-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="stats-icon danger">
                    <i className="ti ti-alert-triangle" />
                  </div>
                  <h5 className="mb-0">Danger Zone</h5>
                </div>
              </BsCard.Header>
              <BsCard.Body className="p-4">
                <p className="text-muted small mb-3">
                  These actions are irreversible. Please be careful.
                </p>
                <Button variant="danger" className="w-100">
                  <i className="ti ti-trash me-2" />
                  Purge Deleted Data
                </Button>
              </BsCard.Body>
            </BsCard>
          </div>
        </Col>
      </Row>
    </AppShell>
  );
}
