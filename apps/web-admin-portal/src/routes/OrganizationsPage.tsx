import { useState } from 'react';
import { Row, Col, Table, Card as BsCard, Modal, Form } from 'react-bootstrap';
import { AppShell } from '../components/layout';
import { Button, Badge, Input, KPICard } from '../components/ui';
import { mockOrganizations, mockCabinets } from '../data/mockData';
import type { Organization } from '../types';

// Status configuration for badges
const statusConfig: Record<
  Organization['status'],
  { variant: 'success' | 'info' | 'warning' | 'secondary'; label: string }
> = {
  active: { variant: 'success', label: 'Active' },
  trial: { variant: 'info', label: 'Trial' },
  suspended: { variant: 'warning', label: 'Suspended' },
  inactive: { variant: 'secondary', label: 'Inactive' },
};

// Empty form state for new organization
const emptyFormState: Omit<Organization, 'id' | 'createdAt' | 'cabinetsCount' | 'usersCount'> = {
  name: '',
  legalName: '',
  taxId: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: 'Romania',
  status: 'trial',
};

export default function OrganizationsPage() {
  // State for filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // State for modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // State for selected organization
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  // Form state
  const [formData, setFormData] = useState(emptyFormState);

  // Calculate stats
  const stats = {
    total: mockOrganizations.length,
    active: mockOrganizations.filter((o) => o.status === 'active').length,
    trial: mockOrganizations.filter((o) => o.status === 'trial').length,
    suspended: mockOrganizations.filter((o) => o.status === 'suspended').length,
  };

  // Filter organizations
  const filteredOrgs = mockOrganizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.taxId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || org.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get cabinets for an organization
  const getOrgCabinets = (orgId: string) => {
    return mockCabinets.filter((cab) => cab.organizationId === orgId);
  };

  // Handlers for modal actions
  const handleAddClick = () => {
    setFormData(emptyFormState);
    setShowAddModal(true);
  };

  const handleEditClick = (org: Organization, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      legalName: org.legalName,
      taxId: org.taxId,
      email: org.email,
      phone: org.phone,
      address: org.address,
      city: org.city,
      country: org.country,
      status: org.status,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (org: Organization, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOrg(org);
    setShowDeleteModal(true);
  };

  const handleViewClick = (org: Organization, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedOrg(org);
    setShowViewModal(true);
  };

  const handleRowClick = (org: Organization) => {
    handleViewClick(org);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would make an API call
    console.log('Adding organization:', formData);
    setShowAddModal(false);
    setFormData(emptyFormState);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would make an API call
    console.log('Updating organization:', selectedOrg?.id, formData);
    setShowEditModal(false);
    setSelectedOrg(null);
  };

  const handleDeleteConfirm = () => {
    // In a real app, this would make an API call
    console.log('Deleting organization:', selectedOrg?.id);
    setShowDeleteModal(false);
    setSelectedOrg(null);
  };

  const closeAllModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowViewModal(false);
    setSelectedOrg(null);
  };

  // Organization form component (used in both Add and Edit modals)
  const renderOrganizationForm = () => (
    <>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium">Organization Name *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="e.g., Clinica Dentara Dr. Popescu"
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium">Legal Name *</Form.Label>
            <Form.Control
              type="text"
              name="legalName"
              value={formData.legalName}
              onChange={handleFormChange}
              placeholder="e.g., Dr. Popescu SRL"
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium">Tax ID (CUI) *</Form.Label>
            <Form.Control
              type="text"
              name="taxId"
              value={formData.taxId}
              onChange={handleFormChange}
              placeholder="e.g., RO12345678"
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium">Status</Form.Label>
            <Form.Select name="status" value={formData.status} onChange={handleFormChange}>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium">Email *</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              placeholder="e.g., contact@company.ro"
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium">Phone</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
              placeholder="e.g., +40 721 123 456"
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label className="fw-medium">Address</Form.Label>
        <Form.Control
          type="text"
          name="address"
          value={formData.address}
          onChange={handleFormChange}
          placeholder="e.g., Str. Libertatii 45"
        />
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium">City</Form.Label>
            <Form.Control
              type="text"
              name="city"
              value={formData.city}
              onChange={handleFormChange}
              placeholder="e.g., Bucuresti"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium">Country</Form.Label>
            <Form.Control
              type="text"
              name="country"
              value={formData.country}
              onChange={handleFormChange}
              placeholder="e.g., Romania"
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  );

  return (
    <AppShell
      title="Organizations"
      subtitle="Manage all registered organizations"
      breadcrumbs={[{ label: 'Organizations' }]}
      actions={
        <Button leftIcon={<i className="ti ti-plus" />} onClick={handleAddClick}>
          Add Organization
        </Button>
      }
    >
      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col sm={6} xl={3}>
          <KPICard
            title="Total Organizations"
            value={stats.total}
            icon={<i className="ti ti-building text-primary fs-4" />}
            iconVariant="primary"
          />
        </Col>
        <Col sm={6} xl={3}>
          <KPICard
            title="Active"
            value={stats.active}
            icon={<i className="ti ti-circle-check text-success fs-4" />}
            iconVariant="success"
            trend={{ value: 12.5, isPositive: true }}
          />
        </Col>
        <Col sm={6} xl={3}>
          <KPICard
            title="Trial"
            value={stats.trial}
            icon={<i className="ti ti-clock text-info fs-4" />}
            iconVariant="info"
          />
        </Col>
        <Col sm={6} xl={3}>
          <KPICard
            title="Suspended"
            value={stats.suspended}
            icon={<i className="ti ti-alert-circle text-warning fs-4" />}
            iconVariant="warning"
          />
        </Col>
      </Row>

      {/* Filters */}
      <BsCard className="border-0 shadow-sm mb-4">
        <BsCard.Body className="p-4">
          <Row className="g-3 align-items-center">
            <Col md={6} lg={4}>
              <Input
                placeholder="Search organizations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<i className="ti ti-search" />}
              />
            </Col>
            <Col md={6} lg={8}>
              <div className="d-flex gap-2 flex-wrap">
                {['all', 'active', 'trial', 'suspended', 'inactive'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === 'all' ? 'All' : statusConfig[status as Organization['status']]?.label || status}
                  </Button>
                ))}
              </div>
            </Col>
          </Row>
        </BsCard.Body>
      </BsCard>

      {/* Organizations Table */}
      <BsCard className="border-0 shadow-sm">
        <BsCard.Header className="bg-white border-bottom py-3">
          <div className="d-flex align-items-center gap-3">
            <div className="stats-icon primary">
              <i className="ti ti-building" />
            </div>
            <div>
              <h5 className="mb-0">Organizations ({filteredOrgs.length})</h5>
              <small className="text-muted">Manage all registered organizations</small>
            </div>
          </div>
        </BsCard.Header>
        <BsCard.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Organization</th>
                <th>Legal Name</th>
                <th>Tax ID</th>
                <th>Cabinets</th>
                <th>Users</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrgs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <i className="ti ti-building-off fs-1 d-block mb-2" />
                    No organizations found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrgs.map((org) => (
                  <tr
                    key={org.id}
                    className="cursor-pointer"
                    onClick={() => handleRowClick(org)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="stats-icon primary" style={{ width: 36, height: 36 }}>
                          <i className="ti ti-building" />
                        </div>
                        <div>
                          <p className="fw-medium mb-0">{org.name}</p>
                          <small className="text-muted">{org.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted">{org.legalName}</span>
                    </td>
                    <td>
                      <code className="bg-light px-2 py-1 rounded">{org.taxId}</code>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <i className="ti ti-building-hospital text-muted" />
                        <span>{org.cabinetsCount}</span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <i className="ti ti-users text-muted" />
                        <span>{org.usersCount}</span>
                      </div>
                    </td>
                    <td>
                      <Badge variant={statusConfig[org.status].variant} dot>
                        {statusConfig[org.status].label}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <button
                          className="btn btn-link p-2 text-muted"
                          onClick={(e) => handleViewClick(org, e)}
                          title="View details"
                        >
                          <i className="ti ti-eye" />
                        </button>
                        <button
                          className="btn btn-link p-2 text-muted"
                          onClick={(e) => handleEditClick(org, e)}
                          title="Edit organization"
                        >
                          <i className="ti ti-edit" />
                        </button>
                        <button
                          className="btn btn-link p-2 text-danger"
                          onClick={(e) => handleDeleteClick(org, e)}
                          title="Delete organization"
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

      {/* Add Organization Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title>
            <div className="d-flex align-items-center gap-3">
              <div className="stats-icon primary">
                <i className="ti ti-building-plus" />
              </div>
              <div>
                <h5 className="mb-0">Add Organization</h5>
                <small className="text-muted fw-normal">Create a new organization account</small>
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddSubmit}>
          <Modal.Body className="pt-4">{renderOrganizationForm()}</Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="outline-secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" leftIcon={<i className="ti ti-check" />}>
              Create Organization
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Organization Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title>
            <div className="d-flex align-items-center gap-3">
              <div className="stats-icon warning">
                <i className="ti ti-edit" />
              </div>
              <div>
                <h5 className="mb-0">Edit Organization</h5>
                <small className="text-muted fw-normal">{selectedOrg?.name}</small>
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body className="pt-4">{renderOrganizationForm()}</Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="outline-secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" leftIcon={<i className="ti ti-check" />}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title>
            <div className="d-flex align-items-center gap-3">
              <div className="stats-icon danger">
                <i className="ti ti-trash" />
              </div>
              <div>
                <h5 className="mb-0">Delete Organization</h5>
                <small className="text-muted fw-normal">This action cannot be undone</small>
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">
            Are you sure you want to delete <strong>{selectedOrg?.name}</strong>?
          </p>
          <p className="text-muted small mb-0">
            This will permanently remove the organization and all associated data including{' '}
            <strong>{selectedOrg?.cabinetsCount} cabinet(s)</strong> and{' '}
            <strong>{selectedOrg?.usersCount} user(s)</strong>.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm} leftIcon={<i className="ti ti-trash" />}>
            Delete Organization
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Organization Details Modal */}
      <Modal show={showViewModal} onHide={closeAllModals} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title>
            <div className="d-flex align-items-center gap-3">
              <div className="stats-icon primary">
                <i className="ti ti-building" />
              </div>
              <div>
                <h5 className="mb-0">{selectedOrg?.name}</h5>
                <small className="text-muted fw-normal">{selectedOrg?.legalName}</small>
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrg && (
            <>
              {/* Organization Info */}
              <div className="mb-4">
                <h6 className="text-uppercase text-muted small mb-3">Organization Details</h6>
                <Row className="g-3">
                  <Col md={6}>
                    <div className="p-3 bg-light rounded">
                      <small className="text-muted d-block">Tax ID (CUI)</small>
                      <span className="fw-medium">{selectedOrg.taxId}</span>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="p-3 bg-light rounded">
                      <small className="text-muted d-block">Status</small>
                      <Badge variant={statusConfig[selectedOrg.status].variant} dot>
                        {statusConfig[selectedOrg.status].label}
                      </Badge>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="p-3 bg-light rounded">
                      <small className="text-muted d-block">Email</small>
                      <span className="fw-medium">{selectedOrg.email}</span>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="p-3 bg-light rounded">
                      <small className="text-muted d-block">Phone</small>
                      <span className="fw-medium">{selectedOrg.phone || '-'}</span>
                    </div>
                  </Col>
                  <Col md={12}>
                    <div className="p-3 bg-light rounded">
                      <small className="text-muted d-block">Address</small>
                      <span className="fw-medium">
                        {selectedOrg.address}, {selectedOrg.city}, {selectedOrg.country}
                      </span>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="p-3 bg-light rounded">
                      <small className="text-muted d-block">Cabinets</small>
                      <span className="fw-medium fs-5">{selectedOrg.cabinetsCount}</span>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="p-3 bg-light rounded">
                      <small className="text-muted d-block">Users</small>
                      <span className="fw-medium fs-5">{selectedOrg.usersCount}</span>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Cabinets List */}
              <div>
                <h6 className="text-uppercase text-muted small mb-3">
                  Cabinets ({getOrgCabinets(selectedOrg.id).length})
                </h6>
                {getOrgCabinets(selectedOrg.id).length === 0 ? (
                  <div className="text-center py-4 text-muted bg-light rounded">
                    <i className="ti ti-building-hospital fs-3 d-block mb-2" />
                    No cabinets registered yet.
                  </div>
                ) : (
                  <Table responsive size="sm" className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Cabinet</th>
                        <th>Code</th>
                        <th>City</th>
                        <th>Plan</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getOrgCabinets(selectedOrg.id).map((cabinet) => (
                        <tr key={cabinet.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <i className="ti ti-building-hospital text-muted" />
                              <span className="fw-medium">{cabinet.name}</span>
                            </div>
                          </td>
                          <td>
                            <code className="bg-light px-2 py-1 rounded">{cabinet.code}</code>
                          </td>
                          <td>{cabinet.city}</td>
                          <td>
                            {cabinet.subscriptionPlan ? (
                              <Badge variant="primary">{cabinet.subscriptionPlan}</Badge>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <Badge
                              variant={cabinet.status === 'active' ? 'success' : 'secondary'}
                              dot
                            >
                              {cabinet.status === 'active' ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={closeAllModals}>
            Close
          </Button>
          <Button
            variant="outline-primary"
            onClick={(e) => {
              setShowViewModal(false);
              if (selectedOrg) handleEditClick(selectedOrg, e as unknown as React.MouseEvent);
            }}
            leftIcon={<i className="ti ti-edit" />}
          >
            Edit Organization
          </Button>
        </Modal.Footer>
      </Modal>
    </AppShell>
  );
}
