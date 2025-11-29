import { useState, useMemo } from 'react';
import { Row, Col, Table, Card as BsCard, Modal, Form, Dropdown } from 'react-bootstrap';
import { AppShell } from '../components/layout';
import { Button, Badge, Input, KPICard } from '../components/ui';
import { mockOrganizations, mockCabinets } from '../data/mockData';
import type { Cabinet } from '../types';

// City code mapping for auto-generating cabinet codes
const cityCodeMap: Record<string, string> = {
  'bucuresti': 'BUC',
  'bucharest': 'BUC',
  'cluj-napoca': 'CLJ',
  'cluj': 'CLJ',
  'brasov': 'BRS',
  'sibiu': 'SIB',
  'constanta': 'CTA',
  'timisoara': 'TIM',
  'iasi': 'IAS',
  'craiova': 'CRV',
  'oradea': 'ORD',
  'arad': 'ARD',
};

// Status configuration for badges
const statusConfig: Record<string, { variant: 'success' | 'secondary'; label: string }> = {
  active: { variant: 'success', label: 'Active' },
  inactive: { variant: 'secondary', label: 'Inactive' },
};

// Form state interface
interface CabinetFormData {
  organizationId: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
}

const initialFormData: CabinetFormData = {
  organizationId: '',
  name: '',
  code: '',
  address: '',
  city: '',
  phone: '',
  email: '',
  status: 'active',
};

export default function CabinetsPage() {
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [organizationFilter, setOrganizationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // State for modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCabinet, setEditingCabinet] = useState<Cabinet | null>(null);
  const [deletingCabinet, setDeletingCabinet] = useState<Cabinet | null>(null);

  // Form state
  const [formData, setFormData] = useState<CabinetFormData>(initialFormData);

  // Generate code based on city
  const generateCode = (city: string): string => {
    const normalizedCity = city.toLowerCase().trim();
    const prefix = cityCodeMap[normalizedCity] || city.substring(0, 3).toUpperCase();
    const existingCodes = mockCabinets.filter((c) => c.code.startsWith(prefix));
    const nextNumber = existingCodes.length + 1;
    return `${prefix}-${String(nextNumber).padStart(3, '0')}`;
  };

  // Handle city change to auto-generate code
  const handleCityChange = (newCity: string) => {
    setFormData((prev) => ({
      ...prev,
      city: newCity,
      code: generateCode(newCity),
    }));
  };

  // Filtered cabinets based on search and filters
  const filteredCabinets = useMemo(() => {
    return mockCabinets.filter((cabinet) => {
      const matchesSearch =
        cabinet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cabinet.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cabinet.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cabinet.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesOrganization =
        organizationFilter === 'all' || cabinet.organizationId === organizationFilter;

      const matchesStatus = statusFilter === 'all' || cabinet.status === statusFilter;

      return matchesSearch && matchesOrganization && matchesStatus;
    });
  }, [searchQuery, organizationFilter, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredCabinets.length;
    const active = filteredCabinets.filter((c) => c.status === 'active').length;
    const withSubscription = filteredCabinets.filter((c) => c.subscriptionId !== null).length;
    const withoutSubscription = filteredCabinets.filter((c) => c.subscriptionId === null).length;

    return { total, active, withSubscription, withoutSubscription };
  }, [filteredCabinets]);

  // Handle add cabinet
  const handleAddCabinet = () => {
    setEditingCabinet(null);
    setFormData(initialFormData);
    setShowAddEditModal(true);
  };

  // Handle edit cabinet
  const handleEditCabinet = (cabinet: Cabinet) => {
    setEditingCabinet(cabinet);
    setFormData({
      organizationId: cabinet.organizationId,
      name: cabinet.name,
      code: cabinet.code,
      address: cabinet.address,
      city: cabinet.city,
      phone: cabinet.phone,
      email: cabinet.email,
      status: cabinet.status,
    });
    setShowAddEditModal(true);
  };

  // Handle delete cabinet
  const handleDeleteCabinet = (cabinet: Cabinet) => {
    setDeletingCabinet(cabinet);
    setShowDeleteModal(true);
  };

  // Handle form submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API
    console.log('Submitting cabinet:', formData);
    setShowAddEditModal(false);
    setFormData(initialFormData);
    setEditingCabinet(null);
  };

  // Handle delete confirm
  const handleDeleteConfirm = () => {
    // In a real app, this would call an API
    console.log('Deleting cabinet:', deletingCabinet?.id);
    setShowDeleteModal(false);
    setDeletingCabinet(null);
  };

  // Get selected organization name for dropdown display
  const selectedOrgName = useMemo(() => {
    if (organizationFilter === 'all') return 'All Organizations';
    const org = mockOrganizations.find((o) => o.id === organizationFilter);
    return org?.name || 'All Organizations';
  }, [organizationFilter]);

  return (
    <AppShell
      title="Cabinets"
      subtitle="Manage dental cabinets across all organizations"
      breadcrumbs={[{ label: 'Cabinets' }]}
      actions={
        <Button leftIcon={<i className="ti ti-plus" />} onClick={handleAddCabinet}>
          Add Cabinet
        </Button>
      }
    >
      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col sm={6} xl={3}>
          <KPICard
            title="Total Cabinets"
            value={stats.total}
            icon={<i className="ti ti-building-hospital text-primary fs-4" />}
            iconVariant="primary"
          />
        </Col>
        <Col sm={6} xl={3}>
          <KPICard
            title="Active Cabinets"
            value={stats.active}
            icon={<i className="ti ti-check text-success fs-4" />}
            iconVariant="success"
          />
        </Col>
        <Col sm={6} xl={3}>
          <KPICard
            title="With Subscription"
            value={stats.withSubscription}
            icon={<i className="ti ti-credit-card text-info fs-4" />}
            iconVariant="info"
          />
        </Col>
        <Col sm={6} xl={3}>
          <KPICard
            title="Without Subscription"
            value={stats.withoutSubscription}
            icon={<i className="ti ti-credit-card-off text-warning fs-4" />}
            iconVariant="warning"
          />
        </Col>
      </Row>

      {/* Filters */}
      <BsCard className="border-0 shadow-sm mb-4">
        <BsCard.Body className="p-4">
          <Row className="g-3 align-items-center">
            <Col md={4} lg={3}>
              <Input
                placeholder="Search cabinets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<i className="ti ti-search" />}
              />
            </Col>
            <Col md={4} lg={3}>
              <Form.Group className="mb-3">
                <Dropdown>
                  <Dropdown.Toggle
                    variant="outline-secondary"
                    className="w-100 text-start d-flex align-items-center justify-content-between"
                  >
                    <span className="text-truncate">{selectedOrgName}</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="w-100">
                    <Dropdown.Item
                      active={organizationFilter === 'all'}
                      onClick={() => setOrganizationFilter('all')}
                    >
                      All Organizations
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    {mockOrganizations.map((org) => (
                      <Dropdown.Item
                        key={org.id}
                        active={organizationFilter === org.id}
                        onClick={() => setOrganizationFilter(org.id)}
                      >
                        {org.name}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Form.Group>
            </Col>
            <Col md={4} lg={6}>
              <div className="d-flex gap-2 flex-wrap">
                {['all', 'active', 'inactive'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === 'all' ? 'All Status' : statusConfig[status]?.label || status}
                  </Button>
                ))}
              </div>
            </Col>
          </Row>
        </BsCard.Body>
      </BsCard>

      {/* Cabinets Table */}
      <BsCard className="border-0 shadow-sm">
        <BsCard.Header className="bg-white border-bottom py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="stats-icon primary">
                <i className="ti ti-building-hospital" />
              </div>
              <div>
                <h5 className="mb-0">Cabinets ({filteredCabinets.length})</h5>
                <small className="text-muted">Manage dental cabinets and their subscriptions</small>
              </div>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" size="sm">
                <i className="ti ti-download me-1" />
                Export
              </Button>
            </div>
          </div>
        </BsCard.Header>
        <BsCard.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Cabinet</th>
                <th>Organization</th>
                <th>Address / City</th>
                <th>Subscription Plan</th>
                <th>Users</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCabinets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <i className="ti ti-building-hospital fs-1 d-block mb-2 opacity-50" />
                    No cabinets found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredCabinets.map((cabinet) => (
                  <tr key={cabinet.id} className="cursor-pointer">
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="stats-icon primary" style={{ width: 36, height: 36 }}>
                          <i className="ti ti-building-hospital" />
                        </div>
                        <div>
                          <p className="fw-medium mb-0">{cabinet.name}</p>
                          <small className="text-muted">{cabinet.code}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted">{cabinet.organizationName}</span>
                    </td>
                    <td>
                      <div>
                        <p className="mb-0 small">{cabinet.address}</p>
                        <small className="text-muted">{cabinet.city}</small>
                      </div>
                    </td>
                    <td>
                      {cabinet.subscriptionPlan ? (
                        <Badge variant="info">{cabinet.subscriptionPlan}</Badge>
                      ) : (
                        <span className="text-muted small">No subscription</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <i className="ti ti-users text-muted" />
                        <span>{cabinet.usersCount}</span>
                      </div>
                    </td>
                    <td>
                      <Badge variant={statusConfig[cabinet.status].variant} dot>
                        {statusConfig[cabinet.status].label}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <button className="btn btn-link p-2 text-muted" title="View">
                          <i className="ti ti-eye" />
                        </button>
                        <button
                          className="btn btn-link p-2 text-muted"
                          title="Edit"
                          onClick={() => handleEditCabinet(cabinet)}
                        >
                          <i className="ti ti-edit" />
                        </button>
                        <button
                          className="btn btn-link p-2 text-danger"
                          title="Delete"
                          onClick={() => handleDeleteCabinet(cabinet)}
                        >
                          <i className="ti ti-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </BsCard.Body>
      </BsCard>

      {/* Add/Edit Cabinet Modal */}
      <Modal show={showAddEditModal} onHide={() => setShowAddEditModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title>
            <div className="d-flex align-items-center gap-2">
              <div className="stats-icon primary" style={{ width: 36, height: 36 }}>
                <i className="ti ti-building-hospital" />
              </div>
              {editingCabinet ? 'Edit Cabinet' : 'Add New Cabinet'}
            </div>
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body className="p-4">
            <Row className="g-3">
              {/* Organization Selection */}
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-body fw-medium">Organization</Form.Label>
                  <Form.Select
                    value={formData.organizationId}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, organizationId: e.target.value }))
                    }
                    required
                  >
                    <option value="">Select an organization...</option>
                    {mockOrganizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Cabinet Name */}
              <Col md={8}>
                <Input
                  label="Cabinet Name"
                  placeholder="Enter cabinet name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </Col>

              {/* Code (auto-generated) */}
              <Col md={4}>
                <Input
                  label="Code"
                  placeholder="Auto-generated"
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                  hint="Auto-generated based on city"
                />
              </Col>

              {/* Address */}
              <Col md={8}>
                <Input
                  label="Address"
                  placeholder="Enter street address"
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  required
                />
              </Col>

              {/* City */}
              <Col md={4}>
                <Input
                  label="City"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  required
                />
              </Col>

              {/* Phone */}
              <Col md={6}>
                <Input
                  label="Phone"
                  placeholder="+40 21 123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </Col>

              {/* Email */}
              <Col md={6}>
                <Input
                  label="Email"
                  type="email"
                  placeholder="cabinet@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </Col>

              {/* Status */}
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-body fw-medium">Status</Form.Label>
                  <div className="d-flex gap-3">
                    <Form.Check
                      type="radio"
                      id="status-active"
                      label="Active"
                      name="status"
                      checked={formData.status === 'active'}
                      onChange={() => setFormData((prev) => ({ ...prev, status: 'active' }))}
                    />
                    <Form.Check
                      type="radio"
                      id="status-inactive"
                      label="Inactive"
                      name="status"
                      checked={formData.status === 'inactive'}
                      onChange={() => setFormData((prev) => ({ ...prev, status: 'inactive' }))}
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-top">
            <Button variant="outline-secondary" onClick={() => setShowAddEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" leftIcon={<i className="ti ti-check" />}>
              {editingCabinet ? 'Update Cabinet' : 'Create Cabinet'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title>
            <div className="d-flex align-items-center gap-2 text-danger">
              <i className="ti ti-alert-triangle fs-4" />
              Delete Cabinet
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <p className="mb-3">
            Are you sure you want to delete the cabinet{' '}
            <strong>{deletingCabinet?.name}</strong>?
          </p>
          <div className="bg-light rounded p-3 mb-3">
            <div className="d-flex align-items-center gap-3">
              <div className="stats-icon danger" style={{ width: 36, height: 36 }}>
                <i className="ti ti-building-hospital" />
              </div>
              <div>
                <p className="fw-medium mb-0">{deletingCabinet?.name}</p>
                <small className="text-muted">
                  {deletingCabinet?.code} - {deletingCabinet?.organizationName}
                </small>
              </div>
            </div>
          </div>
          <div className="alert alert-warning d-flex align-items-start gap-2 mb-0">
            <i className="ti ti-alert-circle mt-1" />
            <div>
              <strong>Warning:</strong> This action cannot be undone. All data associated with this
              cabinet including appointments, patients, and records will be permanently deleted.
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-top">
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            <i className="ti ti-trash me-1" />
            Delete Cabinet
          </Button>
        </Modal.Footer>
      </Modal>
    </AppShell>
  );
}
