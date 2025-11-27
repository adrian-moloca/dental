import { useState, useMemo } from 'react';
import { Row, Col, Table, Card as BsCard, Form, Modal } from 'react-bootstrap';
import { AppShell } from '../components/layout';
import { Button, Badge, KPICard } from '../components/ui';
import {
  mockSubscriptions,
  mockOrganizations as organizations,
  mockCabinets as cabinets,
  mockPlans as plans,
  getCabinetsByOrganization,
} from '../data/mockData';
import type { Subscription } from '../types';

const statusConfig: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'secondary'; label: string }> = {
  active: { variant: 'success', label: 'Active' },
  trial: { variant: 'info', label: 'Trial' },
  past_due: { variant: 'danger', label: 'Past Due' },
  cancelled: { variant: 'warning', label: 'Cancelled' },
  suspended: { variant: 'secondary', label: 'Suspended' },
};

export default function SubscriptionsPage() {
  const [subscriptionsData, setSubscriptionsData] = useState<Subscription[]>(mockSubscriptions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orgFilter, setOrgFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [formData, setFormData] = useState<Partial<Subscription>>({
    organizationId: '',
    cabinetId: '',
    planId: '',
    status: 'trial',
    billingCycle: 'monthly',
    autoRenew: true,
  });

  // Calculate stats
  const stats = useMemo(() => {
    const active = subscriptionsData.filter((s) => s.status === 'active' || s.status === 'trial').length;
    const mrr = subscriptionsData
      .filter((s) => s.status === 'active' || s.status === 'trial')
      .reduce((sum, s) => sum + s.monthlyPrice, 0);
    const trial = subscriptionsData.filter((s) => s.status === 'trial').length;
    const pastDue = subscriptionsData.filter((s) => s.status === 'past_due').length;

    return { active, mrr, trial, pastDue };
  }, [subscriptionsData]);

  // Filter subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptionsData.filter((sub) => {
      const matchesSearch =
        sub.cabinetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.planName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
      const matchesOrg = orgFilter === 'all' || sub.organizationId === orgFilter;
      return matchesSearch && matchesStatus && matchesOrg;
    });
  }, [subscriptionsData, searchTerm, statusFilter, orgFilter]);

  // Get available cabinets for selected organization
  const availableCabinets = useMemo(() => {
    if (!formData.organizationId) return [];
    return getCabinetsByOrganization(formData.organizationId);
  }, [formData.organizationId]);

  const handleOpenAdd = () => {
    setFormData({
      organizationId: '',
      cabinetId: '',
      planId: '',
      status: 'trial',
      billingCycle: 'monthly',
      autoRenew: true,
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      organizationId: subscription.organizationId,
      cabinetId: subscription.cabinetId,
      planId: subscription.planId,
      status: subscription.status,
      billingCycle: subscription.billingCycle,
      autoRenew: subscription.autoRenew,
    });
    setShowEditModal(true);
  };

  const handleSaveNew = () => {
    const org = organizations.find((o) => o.id === formData.organizationId);
    const cabinet = cabinets.find((c) => c.id === formData.cabinetId);
    const plan = plans.find((p) => p.id === formData.planId);

    if (!org || !cabinet || !plan) return;

    const newSubscription: Subscription = {
      id: `sub-${Date.now()}`,
      cabinetId: cabinet.id,
      cabinetName: cabinet.name,
      organizationId: org.id,
      organizationName: org.name,
      planId: plan.id,
      planName: plan.name,
      status: formData.status as Subscription['status'],
      startDate: new Date().toISOString().split('T')[0],
      endDate: null,
      trialEndsAt: formData.status === 'trial'
        ? new Date(Date.now() + plan.trialDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : null,
      monthlyPrice: plan.monthlyPrice,
      currency: plan.currency,
      billingCycle: formData.billingCycle as Subscription['billingCycle'],
      autoRenew: formData.autoRenew ?? true,
    };

    setSubscriptionsData([...subscriptionsData, newSubscription]);
    setShowAddModal(false);
  };

  const handleSaveEdit = () => {
    if (!editingSubscription) return;

    const plan = plans.find((p) => p.id === formData.planId);
    if (!plan) return;

    const updatedSubscriptions = subscriptionsData.map((sub) => {
      if (sub.id === editingSubscription.id) {
        return {
          ...sub,
          planId: plan.id,
          planName: plan.name,
          monthlyPrice: plan.monthlyPrice,
          status: formData.status as Subscription['status'],
          billingCycle: formData.billingCycle as Subscription['billingCycle'],
          autoRenew: formData.autoRenew ?? true,
        };
      }
      return sub;
    });

    setSubscriptionsData(updatedSubscriptions);
    setShowEditModal(false);
    setEditingSubscription(null);
  };

  const handleCancel = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this subscription?')) {
      setSubscriptionsData(
        subscriptionsData.map((sub) =>
          sub.id === id ? { ...sub, status: 'cancelled' as const, endDate: new Date().toISOString().split('T')[0] } : sub
        )
      );
    }
  };

  return (
    <AppShell
      title="Subscriptions"
      subtitle="Manage cabinet subscriptions and billing"
      breadcrumbs={[{ label: 'Billing' }, { label: 'Subscriptions' }]}
      actions={
        <Button leftIcon={<i className="ti ti-plus" />} onClick={handleOpenAdd}>
          New Subscription
        </Button>
      }
    >
      {/* KPIs */}
      <Row className="g-4 mb-4">
        <Col sm={6} xl={3}>
          <KPICard
            title="Active Subscriptions"
            value={stats.active.toString()}
            icon={<i className="ti ti-credit-card text-success fs-4" />}
            iconVariant="success"
            trend={{ value: 8.3, isPositive: true }}
          />
        </Col>
        <Col sm={6} xl={3}>
          <KPICard
            title="Monthly Recurring Revenue"
            value={`${stats.mrr.toLocaleString('ro-RO')} RON`}
            icon={<i className="ti ti-currency-dollar text-primary fs-4" />}
            iconVariant="primary"
            trend={{ value: 15.2, isPositive: true }}
          />
        </Col>
        <Col sm={6} xl={3}>
          <KPICard
            title="Active Trials"
            value={stats.trial.toString()}
            icon={<i className="ti ti-clock text-info fs-4" />}
            iconVariant="info"
            subtitle="Pending conversion"
          />
        </Col>
        <Col sm={6} xl={3}>
          <KPICard
            title="Past Due"
            value={stats.pastDue.toString()}
            icon={<i className="ti ti-alert-circle text-danger fs-4" />}
            iconVariant="danger"
            subtitle="Requires attention"
          />
        </Col>
      </Row>

      {/* Filters */}
      <BsCard className="border-0 shadow-sm mb-4">
        <BsCard.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small text-muted">Search</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="ti ti-search text-muted" />
                  </span>
                  <Form.Control
                    type="text"
                    placeholder="Search by cabinet, organization, or plan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small text-muted">Organization</Form.Label>
                <Form.Select
                  value={orgFilter}
                  onChange={(e) => setOrgFilter(e.target.value)}
                >
                  <option value="all">All Organizations</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small text-muted">Status</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="past_due">Past Due</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="suspended">Suspended</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setOrgFilter('all');
                }}
              >
                <i className="ti ti-x me-1" />
                Clear
              </Button>
            </Col>
          </Row>
        </BsCard.Body>
      </BsCard>

      {/* Subscriptions Table */}
      <BsCard className="border-0 shadow-sm">
        <BsCard.Header className="bg-white border-bottom py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="stats-icon primary">
                <i className="ti ti-credit-card" />
              </div>
              <div>
                <h5 className="mb-0">All Subscriptions</h5>
                <small className="text-muted">
                  {filteredSubscriptions.length} of {subscriptionsData.length} subscriptions
                </small>
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
                <th>Plan</th>
                <th>Billing</th>
                <th>Monthly Price</th>
                <th>Status</th>
                <th>Next Billing / Trial End</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map((sub) => (
                <tr key={sub.id}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <div className="stats-icon success" style={{ width: 36, height: 36 }}>
                        <i className="ti ti-building-hospital" />
                      </div>
                      <span className="fw-medium">{sub.cabinetName}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-muted">{sub.organizationName}</span>
                  </td>
                  <td>
                    <span className="fw-medium">{sub.planName}</span>
                  </td>
                  <td>
                    <span className="text-capitalize text-muted">{sub.billingCycle}</span>
                  </td>
                  <td>
                    <span className="fw-medium">{sub.monthlyPrice.toLocaleString('ro-RO')} {sub.currency}</span>
                  </td>
                  <td>
                    <Badge variant={statusConfig[sub.status]?.variant || 'secondary'} dot>
                      {statusConfig[sub.status]?.label || sub.status}
                    </Badge>
                  </td>
                  <td>
                    <span className="text-muted">
                      {sub.status === 'trial' && sub.trialEndsAt
                        ? `Trial ends: ${sub.trialEndsAt}`
                        : sub.endDate || 'Auto-renew'}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-1">
                      <button
                        className="btn btn-link p-2 text-primary"
                        title="Edit"
                        onClick={() => handleOpenEdit(sub)}
                      >
                        <i className="ti ti-edit" />
                      </button>
                      {sub.status !== 'cancelled' && (
                        <button
                          className="btn btn-link p-2 text-danger"
                          title="Cancel"
                          onClick={() => handleCancel(sub.id)}
                        >
                          <i className="ti ti-x" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSubscriptions.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    <i className="ti ti-inbox fs-1 d-block mb-2" />
                    No subscriptions found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </BsCard.Body>
      </BsCard>

      {/* Add Subscription Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>New Subscription</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Organization <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={formData.organizationId || ''}
                  onChange={(e) => setFormData({ ...formData, organizationId: e.target.value, cabinetId: '' })}
                >
                  <option value="">Select organization...</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Cabinet <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={formData.cabinetId || ''}
                  onChange={(e) => setFormData({ ...formData, cabinetId: e.target.value })}
                  disabled={!formData.organizationId}
                >
                  <option value="">Select cabinet...</option>
                  {availableCabinets.map((cab) => (
                    <option key={cab.id} value={cab.id}>
                      {cab.name} ({cab.code})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Plan <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={formData.planId || ''}
                  onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                >
                  <option value="">Select plan...</option>
                  {plans.filter((p) => p.isActive).map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {plan.monthlyPrice.toLocaleString('ro-RO')} {plan.currency}/mo
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={formData.status || 'trial'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Subscription['status'] })}
                >
                  <option value="trial">Trial</option>
                  <option value="active">Active</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Billing Cycle</Form.Label>
                <Form.Select
                  value={formData.billingCycle || 'monthly'}
                  onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as Subscription['billingCycle'] })}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly (Save 15%)</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mt-4">
                <Form.Check
                  type="switch"
                  id="autoRenew"
                  label="Auto-renew subscription"
                  checked={formData.autoRenew ?? true}
                  onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveNew}
            disabled={!formData.organizationId || !formData.cabinetId || !formData.planId}
          >
            Create Subscription
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Subscription Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Subscription</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingSubscription && (
            <Row className="g-3">
              <Col md={12}>
                <div className="alert alert-light">
                  <strong>Cabinet:</strong> {editingSubscription.cabinetName}<br />
                  <strong>Organization:</strong> {editingSubscription.organizationName}
                </div>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Plan <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={formData.planId || ''}
                    onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                  >
                    {plans.filter((p) => p.isActive).map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - {plan.monthlyPrice.toLocaleString('ro-RO')} {plan.currency}/mo
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Subscription['status'] })}
                  >
                    <option value="trial">Trial</option>
                    <option value="active">Active</option>
                    <option value="past_due">Past Due</option>
                    <option value="suspended">Suspended</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Billing Cycle</Form.Label>
                  <Form.Select
                    value={formData.billingCycle || 'monthly'}
                    onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as Subscription['billingCycle'] })}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly (Save 15%)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mt-4">
                  <Form.Check
                    type="switch"
                    id="autoRenewEdit"
                    label="Auto-renew subscription"
                    checked={formData.autoRenew ?? true}
                    onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
                  />
                </Form.Group>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveEdit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </AppShell>
  );
}
