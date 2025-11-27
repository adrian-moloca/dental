import { useState, useMemo, useEffect } from 'react';
import { Row, Col, Table, Card as BsCard, Modal, Form } from 'react-bootstrap';
import { AppShell } from '../components/layout';
import { Button, Badge, Input, KPICard } from '../components/ui';
import { mockUsers, mockOrganizations, mockCabinets } from '../data/mockData';
import type { User, UserRole, UserStatus } from '../types';

// Role configuration with colors (using available Badge variants)
const roleConfig: Record<UserRole, { variant: 'primary' | 'info' | 'success' | 'warning' | 'secondary' | 'danger'; label: string }> = {
  SUPER_ADMIN: { variant: 'primary', label: 'Super Admin' },
  ADMIN: { variant: 'info', label: 'Admin' },
  CLINIC_ADMIN: { variant: 'success', label: 'Clinic Admin' },
  PROVIDER: { variant: 'warning', label: 'Provider' },
  STAFF: { variant: 'secondary', label: 'Staff' },
  SUPPORT: { variant: 'danger', label: 'Support' },
};

// Status configuration with colors
const statusConfig: Record<UserStatus, { variant: 'success' | 'danger' | 'warning' | 'secondary'; label: string }> = {
  active: { variant: 'success', label: 'Active' },
  suspended: { variant: 'danger', label: 'Suspended' },
  pending: { variant: 'warning', label: 'Pending' },
  inactive: { variant: 'secondary', label: 'Inactive' },
};

// All available roles for filtering/selection
const allRoles: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'CLINIC_ADMIN', 'PROVIDER', 'STAFF', 'SUPPORT'];
const allStatuses: UserStatus[] = ['active', 'suspended', 'pending', 'inactive'];

// Empty user form state
const emptyUserForm: Omit<User, 'id' | 'createdAt' | 'lastLoginAt'> = {
  firstName: '',
  lastName: '',
  email: '',
  role: 'STAFF',
  status: 'pending',
  organizationId: null,
  organizationName: null,
  cabinetId: null,
  cabinetName: null,
};

export default function UsersPage() {
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [organizationFilter, setOrganizationFilter] = useState<string>('all');
  const [cabinetFilter, setCabinetFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Form state
  const [formData, setFormData] = useState(emptyUserForm);

  // Users state (for CRUD operations)
  const [users, setUsers] = useState<User[]>(mockUsers);

  // Get filtered cabinets based on selected organization
  const filteredCabinetsForDropdown = useMemo(() => {
    if (organizationFilter === 'all') {
      return mockCabinets;
    }
    return mockCabinets.filter((cab) => cab.organizationId === organizationFilter);
  }, [organizationFilter]);

  // Get filtered cabinets for form based on form's organizationId
  const filteredCabinetsForForm = useMemo(() => {
    if (!formData.organizationId) {
      return [];
    }
    return mockCabinets.filter((cab) => cab.organizationId === formData.organizationId);
  }, [formData.organizationId]);

  // Reset cabinet filter when organization changes
  useEffect(() => {
    setCabinetFilter('all');
  }, [organizationFilter]);

  // Filter users based on all criteria
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower);

      // Organization filter
      const matchesOrganization =
        organizationFilter === 'all' || user.organizationId === organizationFilter;

      // Cabinet filter
      const matchesCabinet =
        cabinetFilter === 'all' || user.cabinetId === cabinetFilter;

      // Role filter
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      // Status filter
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

      return matchesSearch && matchesOrganization && matchesCabinet && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, organizationFilter, cabinetFilter, roleFilter, statusFilter]);

  // Stats calculations
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === 'active').length;
    const admins = users.filter((u) => u.role === 'SUPER_ADMIN' || u.role === 'ADMIN').length;
    const staff = users.filter((u) => u.role === 'STAFF' || u.role === 'PROVIDER' || u.role === 'CLINIC_ADMIN').length;
    return { total, active, admins, staff };
  }, [users]);

  // Format last login date
  const formatLastLogin = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  // Handle opening add modal
  const handleAddUser = () => {
    setEditingUser(null);
    setFormData(emptyUserForm);
    setShowAddEditModal(true);
  };

  // Handle opening edit modal
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
      organizationId: user.organizationId,
      organizationName: user.organizationName,
      cabinetId: user.cabinetId,
      cabinetName: user.cabinetName,
    });
    setShowAddEditModal(true);
  };

  // Handle opening delete modal
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // Handle form field change
  const handleFormChange = (field: string, value: string | null) => {
    if (field === 'organizationId') {
      const org = mockOrganizations.find((o) => o.id === value);
      setFormData((prev) => ({
        ...prev,
        organizationId: value,
        organizationName: org?.name || null,
        cabinetId: null,
        cabinetName: null,
      }));
    } else if (field === 'cabinetId') {
      const cab = mockCabinets.find((c) => c.id === value);
      setFormData((prev) => ({
        ...prev,
        cabinetId: value,
        cabinetName: cab?.name || null,
      }));
    } else if (field === 'role') {
      // If role is SUPER_ADMIN, clear organization and cabinet
      if (value === 'SUPER_ADMIN') {
        setFormData((prev) => ({
          ...prev,
          role: value as UserRole,
          organizationId: null,
          organizationName: null,
          cabinetId: null,
          cabinetName: null,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          role: value as UserRole,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Handle save user (add or edit)
  const handleSaveUser = () => {
    if (editingUser) {
      // Update existing user
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                ...formData,
              }
            : u
        )
      );
    } else {
      // Add new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        ...formData,
        lastLoginAt: null,
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, newUser]);
    }
    setShowAddEditModal(false);
  };

  // Handle delete user
  const handleDeleteUser = () => {
    if (userToDelete) {
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  return (
    <AppShell
      title="Users"
      subtitle="Manage platform administrators and staff"
      breadcrumbs={[{ label: 'Users' }]}
      actions={
        <Button leftIcon={<i className="ti ti-user-plus" />} onClick={handleAddUser}>
          Add User
        </Button>
      }
    >
      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col sm={6} xl={3}>
          <KPICard
            title="Total Users"
            value={stats.total}
            icon={<i className="ti ti-users fs-4" />}
            iconVariant="primary"
          />
        </Col>
        <Col sm={6} xl={3}>
          <KPICard
            title="Active Users"
            value={stats.active}
            icon={<i className="ti ti-user-check fs-4" />}
            iconVariant="success"
          />
        </Col>
        <Col sm={6} xl={3}>
          <KPICard
            title="Admins"
            value={stats.admins}
            icon={<i className="ti ti-shield fs-4" />}
            iconVariant="info"
          />
        </Col>
        <Col sm={6} xl={3}>
          <KPICard
            title="Staff"
            value={stats.staff}
            icon={<i className="ti ti-stethoscope fs-4" />}
            iconVariant="warning"
          />
        </Col>
      </Row>

      {/* Filters */}
      <BsCard className="border-0 shadow-sm mb-4">
        <BsCard.Body className="p-4">
          <Row className="g-3">
            {/* Organization Filter */}
            <Col md={6} lg={2}>
              <Form.Group>
                <Form.Label className="small text-muted mb-1">Organization</Form.Label>
                <Form.Select
                  size="sm"
                  value={organizationFilter}
                  onChange={(e) => setOrganizationFilter(e.target.value)}
                >
                  <option value="all">All Organizations</option>
                  {mockOrganizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Cabinet Filter */}
            <Col md={6} lg={2}>
              <Form.Group>
                <Form.Label className="small text-muted mb-1">Cabinet</Form.Label>
                <Form.Select
                  size="sm"
                  value={cabinetFilter}
                  onChange={(e) => setCabinetFilter(e.target.value)}
                  disabled={filteredCabinetsForDropdown.length === 0}
                >
                  <option value="all">All Cabinets</option>
                  {filteredCabinetsForDropdown.map((cab) => (
                    <option key={cab.id} value={cab.id}>
                      {cab.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Role Filter */}
            <Col md={6} lg={2}>
              <Form.Group>
                <Form.Label className="small text-muted mb-1">Role</Form.Label>
                <Form.Select
                  size="sm"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  {allRoles.map((role) => (
                    <option key={role} value={role}>
                      {roleConfig[role].label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Status Filter */}
            <Col md={6} lg={2}>
              <Form.Group>
                <Form.Label className="small text-muted mb-1">Status</Form.Label>
                <Form.Select
                  size="sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  {allStatuses.map((status) => (
                    <option key={status} value={status}>
                      {statusConfig[status].label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Search */}
            <Col md={12} lg={4}>
              <Form.Group>
                <Form.Label className="small text-muted mb-1">Search</Form.Label>
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<i className="ti ti-search" />}
                  className="mb-0"
                />
              </Form.Group>
            </Col>
          </Row>
        </BsCard.Body>
      </BsCard>

      {/* Users Table */}
      <BsCard className="border-0 shadow-sm">
        <BsCard.Header className="bg-white border-bottom py-3">
          <div className="d-flex align-items-center gap-3">
            <div className="stats-icon primary">
              <i className="ti ti-users" />
            </div>
            <div>
              <h5 className="mb-0">Users ({filteredUsers.length})</h5>
              <small className="text-muted">Platform administrators and staff</small>
            </div>
          </div>
        </BsCard.Header>
        <BsCard.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>User</th>
                <th>Organization</th>
                <th>Cabinet</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <i className="ti ti-users-minus fs-1 d-block mb-2" />
                    No users found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-medium"
                          style={{ width: 40, height: 40, fontSize: '0.875rem' }}
                        >
                          {getInitials(user.firstName, user.lastName)}
                        </div>
                        <div>
                          <p className="fw-medium mb-0">
                            {user.firstName} {user.lastName}
                          </p>
                          <small className="text-muted">{user.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted">
                        {user.organizationName || <em className="text-secondary">Platform</em>}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted">
                        {user.cabinetName || <em className="text-secondary">-</em>}
                      </span>
                    </td>
                    <td>
                      <Badge variant={roleConfig[user.role]?.variant || 'secondary'}>
                        {roleConfig[user.role]?.label || user.role}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={statusConfig[user.status]?.variant || 'secondary'} dot>
                        {statusConfig[user.status]?.label || user.status}
                      </Badge>
                    </td>
                    <td>
                      <span className="text-muted">{formatLastLogin(user.lastLoginAt)}</span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <button
                          className="btn btn-link p-2 text-muted"
                          title="View"
                          onClick={() => handleEditUser(user)}
                        >
                          <i className="ti ti-eye" />
                        </button>
                        <button
                          className="btn btn-link p-2 text-muted"
                          title="Edit"
                          onClick={() => handleEditUser(user)}
                        >
                          <i className="ti ti-edit" />
                        </button>
                        <button
                          className="btn btn-link p-2 text-danger"
                          title="Delete"
                          onClick={() => handleDeleteClick(user)}
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

      {/* Add/Edit User Modal */}
      <Modal show={showAddEditModal} onHide={() => setShowAddEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingUser ? 'Edit User' : 'Add New User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleFormChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleFormChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                placeholder="Enter email address"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={formData.role}
                onChange={(e) => handleFormChange('role', e.target.value)}
              >
                {allRoles.map((role) => (
                  <option key={role} value={role}>
                    {roleConfig[role].label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {formData.role !== 'SUPER_ADMIN' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Organization</Form.Label>
                  <Form.Select
                    value={formData.organizationId || ''}
                    onChange={(e) =>
                      handleFormChange('organizationId', e.target.value || null)
                    }
                  >
                    <option value="">Select organization</option>
                    {mockOrganizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Required for non-platform roles
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Cabinet</Form.Label>
                  <Form.Select
                    value={formData.cabinetId || ''}
                    onChange={(e) =>
                      handleFormChange('cabinetId', e.target.value || null)
                    }
                    disabled={!formData.organizationId}
                  >
                    <option value="">Select cabinet (optional)</option>
                    {filteredCabinetsForForm.map((cab) => (
                      <option key={cab.id} value={cab.id}>
                        {cab.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    {!formData.organizationId
                      ? 'Select an organization first'
                      : 'Optional - assign to specific cabinet'}
                  </Form.Text>
                </Form.Group>
              </>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={formData.status}
                onChange={(e) => handleFormChange('status', e.target.value)}
              >
                {allStatuses.map((status) => (
                  <option key={status} value={status}>
                    {statusConfig[status].label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowAddEditModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveUser}>
            {editingUser ? 'Save Changes' : 'Add User'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userToDelete && (
            <p>
              Are you sure you want to delete{' '}
              <strong>
                {userToDelete.firstName} {userToDelete.lastName}
              </strong>{' '}
              ({userToDelete.email})?
            </p>
          )}
          <p className="text-muted mb-0">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    </AppShell>
  );
}
