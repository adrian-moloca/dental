import { useState, useMemo } from 'react';
import { Row, Col, Table, Card as BsCard, Modal, Form, Dropdown } from 'react-bootstrap';
import { AppShell } from '../components/layout';
import { Button, Badge, Input, KPICard } from '../components/ui';
import type { Cabinet, Organization } from '../types';

// Mock Organizations Data
const mockOrganizations: Organization[] = [
  {
    id: 'org-1',
    name: 'Clinica Dentara Dr. Popescu',
    legalName: 'Dr. Popescu SRL',
    taxId: 'RO12345678',
    email: 'contact@drpopescu.ro',
    phone: '+40 21 123 4567',
    address: 'Str. Victoriei 45',
    city: 'Bucuresti',
    country: 'Romania',
    status: 'active',
    createdAt: '2024-01-15',
    cabinetsCount: 3,
    usersCount: 12,
  },
  {
    id: 'org-2',
    name: 'Dental Excellence Center',
    legalName: 'Dental Excellence SRL',
    taxId: 'RO87654321',
    email: 'office@dentalexcellence.ro',
    phone: '+40 21 234 5678',
    address: 'Bd. Unirii 100',
    city: 'Bucuresti',
    country: 'Romania',
    status: 'trial',
    createdAt: '2024-11-01',
    cabinetsCount: 1,
    usersCount: 5,
  },
  {
    id: 'org-3',
    name: 'SmileFirst Dental Group',
    legalName: 'SmileFirst Group SA',
    taxId: 'RO11223344',
    email: 'admin@smilefirst.ro',
    phone: '+40 21 345 6789',
    address: 'Calea Floreasca 50',
    city: 'Bucuresti',
    country: 'Romania',
    status: 'active',
    createdAt: '2023-06-20',
    cabinetsCount: 5,
    usersCount: 28,
  },
  {
    id: 'org-4',
    name: 'City Dental Practice',
    legalName: 'City Dental SRL',
    taxId: 'RO55667788',
    email: 'info@citydental.ro',
    phone: '+40 264 123 456',
    address: 'Str. Napoca 25',
    city: 'Cluj-Napoca',
    country: 'Romania',
    status: 'active',
    createdAt: '2023-09-10',
    cabinetsCount: 2,
    usersCount: 8,
  },
];

// Mock Cabinets Data
const mockCabinets: Cabinet[] = [
  {
    id: 'cab-1',
    organizationId: 'org-1',
    organizationName: 'Clinica Dentara Dr. Popescu',
    name: 'Cabinet Central',
    code: 'BUC-001',
    address: 'Str. Victoriei 45',
    city: 'Bucuresti',
    phone: '+40 21 123 4567',
    email: 'central@drpopescu.ro',
    status: 'active',
    subscriptionId: 'sub-1',
    subscriptionPlan: 'Professional',
    usersCount: 5,
    createdAt: '2024-01-15',
  },
  {
    id: 'cab-2',
    organizationId: 'org-1',
    organizationName: 'Clinica Dentara Dr. Popescu',
    name: 'Cabinet Nord',
    code: 'BUC-002',
    address: 'Bd. Expozitiei 10',
    city: 'Bucuresti',
    phone: '+40 21 234 5678',
    email: 'nord@drpopescu.ro',
    status: 'active',
    subscriptionId: 'sub-2',
    subscriptionPlan: 'Professional',
    usersCount: 4,
    createdAt: '2024-02-20',
  },
  {
    id: 'cab-3',
    organizationId: 'org-1',
    organizationName: 'Clinica Dentara Dr. Popescu',
    name: 'Cabinet Sud',
    code: 'BUC-003',
    address: 'Str. Giurgiului 100',
    city: 'Bucuresti',
    phone: '+40 21 345 6789',
    email: 'sud@drpopescu.ro',
    status: 'inactive',
    subscriptionId: null,
    subscriptionPlan: null,
    usersCount: 3,
    createdAt: '2024-03-10',
  },
  {
    id: 'cab-4',
    organizationId: 'org-2',
    organizationName: 'Dental Excellence Center',
    name: 'Excellence Main',
    code: 'BUC-004',
    address: 'Bd. Unirii 100',
    city: 'Bucuresti',
    phone: '+40 21 456 7890',
    email: 'main@dentalexcellence.ro',
    status: 'active',
    subscriptionId: 'sub-3',
    subscriptionPlan: 'Enterprise',
    usersCount: 5,
    createdAt: '2024-11-01',
  },
  {
    id: 'cab-5',
    organizationId: 'org-3',
    organizationName: 'SmileFirst Dental Group',
    name: 'SmileFirst Floreasca',
    code: 'BUC-005',
    address: 'Calea Floreasca 50',
    city: 'Bucuresti',
    phone: '+40 21 567 8901',
    email: 'floreasca@smilefirst.ro',
    status: 'active',
    subscriptionId: 'sub-4',
    subscriptionPlan: 'Enterprise',
    usersCount: 8,
    createdAt: '2023-06-20',
  },
  {
    id: 'cab-6',
    organizationId: 'org-3',
    organizationName: 'SmileFirst Dental Group',
    name: 'SmileFirst Pipera',
    code: 'BUC-006',
    address: 'Bd. Pipera 200',
    city: 'Bucuresti',
    phone: '+40 21 678 9012',
    email: 'pipera@smilefirst.ro',
    status: 'active',
    subscriptionId: 'sub-5',
    subscriptionPlan: 'Enterprise',
    usersCount: 6,
    createdAt: '2023-08-15',
  },
  {
    id: 'cab-7',
    organizationId: 'org-3',
    organizationName: 'SmileFirst Dental Group',
    name: 'SmileFirst Brasov',
    code: 'BRS-001',
    address: 'Str. Republicii 30',
    city: 'Brasov',
    phone: '+40 268 123 456',
    email: 'brasov@smilefirst.ro',
    status: 'active',
    subscriptionId: 'sub-6',
    subscriptionPlan: 'Professional',
    usersCount: 5,
    createdAt: '2023-10-01',
  },
  {
    id: 'cab-8',
    organizationId: 'org-3',
    organizationName: 'SmileFirst Dental Group',
    name: 'SmileFirst Sibiu',
    code: 'SIB-001',
    address: 'Piata Mare 15',
    city: 'Sibiu',
    phone: '+40 269 234 567',
    email: 'sibiu@smilefirst.ro',
    status: 'inactive',
    subscriptionId: null,
    subscriptionPlan: null,
    usersCount: 4,
    createdAt: '2024-01-10',
  },
  {
    id: 'cab-9',
    organizationId: 'org-3',
    organizationName: 'SmileFirst Dental Group',
    name: 'SmileFirst Constanta',
    code: 'CTA-001',
    address: 'Bd. Mamaia 50',
    city: 'Constanta',
    phone: '+40 241 345 678',
    email: 'constanta@smilefirst.ro',
    status: 'active',
    subscriptionId: 'sub-7',
    subscriptionPlan: 'Professional',
    usersCount: 5,
    createdAt: '2024-02-01',
  },
  {
    id: 'cab-10',
    organizationId: 'org-4',
    organizationName: 'City Dental Practice',
    name: 'City Dental Cluj Central',
    code: 'CLJ-001',
    address: 'Str. Napoca 25',
    city: 'Cluj-Napoca',
    phone: '+40 264 123 456',
    email: 'central@citydental.ro',
    status: 'active',
    subscriptionId: 'sub-8',
    subscriptionPlan: 'Professional',
    usersCount: 5,
    createdAt: '2023-09-10',
  },
  {
    id: 'cab-11',
    organizationId: 'org-4',
    organizationName: 'City Dental Practice',
    name: 'City Dental Cluj Marasti',
    code: 'CLJ-002',
    address: 'Str. Aurel Vlaicu 100',
    city: 'Cluj-Napoca',
    phone: '+40 264 234 567',
    email: 'marasti@citydental.ro',
    status: 'inactive',
    subscriptionId: null,
    subscriptionPlan: null,
    usersCount: 3,
    createdAt: '2024-05-01',
  },
];

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
