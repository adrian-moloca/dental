import { useState, useMemo } from 'react';
import {
  Row,
  Col,
  Card as BsCard,
  Modal,
  Form,
  ListGroup,
} from 'react-bootstrap';
import { AppShell } from '../components/layout';
import { Button, Badge, Input } from '../components/ui';
import type { Plan, Module } from '../types';
import { mockPlans, mockModules, getModulesByIds } from '../data/mockData';

type PlanCurrency = 'EUR' | 'RON' | 'USD';

interface PlanFormData {
  name: string;
  code: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: PlanCurrency;
  trialDays: number;
  maxUsers: number | null;
  maxCabinets: number | null;
  isActive: boolean;
  isDefault: boolean;
  moduleIds: string[];
  features: string[];
}

const initialFormData: PlanFormData = {
  name: '',
  code: '',
  description: '',
  monthlyPrice: 0,
  yearlyPrice: 0,
  currency: 'EUR',
  trialDays: 14,
  maxUsers: null,
  maxCabinets: null,
  isActive: true,
  isDefault: false,
  moduleIds: [],
  features: [],
};

const currencySymbols: Record<PlanCurrency, string> = {
  EUR: '\u20AC',
  RON: 'RON',
  USD: '$',
};

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>(mockPlans);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(initialFormData);
  const [newFeature, setNewFeature] = useState('');

  // Stats
  const stats = useMemo(() => {
    const activePlans = plans.filter((p) => p.isActive).length;
    const totalSubscribers = plans.reduce((sum, p) => sum + p.subscribersCount, 0);
    const totalMRR = plans.reduce(
      (sum, p) => sum + p.monthlyPrice * p.subscribersCount,
      0
    );
    return { activePlans, totalSubscribers, totalMRR };
  }, [plans]);

  // Handlers
  const handleOpenAddModal = () => {
    setEditingPlan(null);
    setFormData(initialFormData);
    setNewFeature('');
    setShowModal(true);
  };

  const handleOpenEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      code: plan.code,
      description: plan.description,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      currency: plan.currency as PlanCurrency,
      trialDays: plan.trialDays,
      maxUsers: plan.maxUsers,
      maxCabinets: plan.maxCabinets,
      isActive: plan.isActive,
      isDefault: plan.isDefault,
      moduleIds: plan.includedModules,
      features: plan.features,
    });
    setNewFeature('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlan(null);
    setFormData(initialFormData);
    setNewFeature('');
  };

  const handleOpenDeleteModal = (plan: Plan) => {
    setDeletingPlan(plan);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingPlan(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: value === '' ? null : Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleModuleToggle = (moduleId: string) => {
    setFormData((prev) => ({
      ...prev,
      moduleIds: prev.moduleIds.includes(moduleId)
        ? prev.moduleIds.filter((id) => id !== moduleId)
        : [...prev.moduleIds, moduleId],
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPlan) {
      // Update existing plan
      setPlans((prev) =>
        prev.map((p) =>
          p.id === editingPlan.id
            ? {
                ...p,
                name: formData.name,
                code: formData.code,
                description: formData.description,
                monthlyPrice: formData.monthlyPrice,
                yearlyPrice: formData.yearlyPrice,
                currency: formData.currency,
                trialDays: formData.trialDays,
                maxUsers: formData.maxUsers,
                maxCabinets: formData.maxCabinets,
                isActive: formData.isActive,
                isDefault: formData.isDefault,
                includedModules: formData.moduleIds,
                features: formData.features,
              }
            : // If this plan is set as default, remove default from others
              formData.isDefault && p.isDefault
            ? { ...p, isDefault: false }
            : p
        )
      );
    } else {
      // Create new plan
      const newPlan: Plan = {
        id: `plan-${Date.now()}`,
        name: formData.name,
        code: formData.code,
        description: formData.description,
        monthlyPrice: formData.monthlyPrice,
        yearlyPrice: formData.yearlyPrice,
        currency: formData.currency,
        trialDays: formData.trialDays,
        maxUsers: formData.maxUsers,
        maxCabinets: formData.maxCabinets,
        isActive: formData.isActive,
        isDefault: formData.isDefault,
        includedModules: formData.moduleIds,
        features: formData.features,
        subscribersCount: 0,
        createdAt: new Date().toISOString(),
      };

      setPlans((prev) =>
        formData.isDefault
          ? [...prev.map((p) => ({ ...p, isDefault: false })), newPlan]
          : [...prev, newPlan]
      );
    }

    handleCloseModal();
  };

  const handleDelete = () => {
    if (deletingPlan) {
      setPlans((prev) => prev.filter((p) => p.id !== deletingPlan.id));
      handleCloseDeleteModal();
    }
  };

  const getModulesForPlan = (plan: Plan): Module[] => {
    return getModulesByIds(plan.includedModules);
  };

  const formatPrice = (price: number, currency: string) => {
    const symbol = currencySymbols[currency as PlanCurrency] || currency;
    return `${symbol}${price.toLocaleString()}`;
  };

  return (
    <AppShell
      title="Subscription Plans"
      subtitle="Manage pricing plans and their included modules"
      breadcrumbs={[{ label: 'Plans' }]}
      actions={
        <Button leftIcon={<i className="ti ti-plus" />} onClick={handleOpenAddModal}>
          Add Plan
        </Button>
      }
    >
      {/* Stats Row */}
      <Row className="g-4 mb-4">
        <Col sm={6} xl={3}>
          <BsCard className="border-0 shadow-sm text-center">
            <BsCard.Body className="p-4">
              <h3 className="mb-0 fw-bold">{plans.length}</h3>
              <small className="text-muted">Total Plans</small>
            </BsCard.Body>
          </BsCard>
        </Col>
        <Col sm={6} xl={3}>
          <BsCard className="border-0 shadow-sm text-center">
            <BsCard.Body className="p-4">
              <h3 className="mb-0 fw-bold text-success">{stats.activePlans}</h3>
              <small className="text-muted">Active Plans</small>
            </BsCard.Body>
          </BsCard>
        </Col>
        <Col sm={6} xl={3}>
          <BsCard className="border-0 shadow-sm text-center">
            <BsCard.Body className="p-4">
              <h3 className="mb-0 fw-bold text-primary">{stats.totalSubscribers}</h3>
              <small className="text-muted">Total Subscribers</small>
            </BsCard.Body>
          </BsCard>
        </Col>
        <Col sm={6} xl={3}>
          <BsCard className="border-0 shadow-sm text-center">
            <BsCard.Body className="p-4">
              <h3 className="mb-0 fw-bold text-warning">
                {currencySymbols.EUR}
                {stats.totalMRR.toLocaleString()}
              </h3>
              <small className="text-muted">Est. Monthly Revenue</small>
            </BsCard.Body>
          </BsCard>
        </Col>
      </Row>

      {/* Plans Grid */}
      <Row className="g-4">
        {plans.map((plan) => {
          const planModules = getModulesForPlan(plan);
          const isDefault = plan.isDefault;

          return (
            <Col key={plan.id} md={6} xl={4}>
              <BsCard
                className={`border-0 shadow-sm h-100 ${
                  isDefault ? 'border-start border-primary border-4' : ''
                }`}
              >
                <BsCard.Body className="p-4">
                  {/* Header */}
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div>
                      <h5 className="fw-semibold mb-1">{plan.name}</h5>
                      <code className="small text-muted">{plan.code}</code>
                    </div>
                    <div className="d-flex flex-column align-items-end gap-1">
                      {isDefault && (
                        <Badge variant="primary" size="sm">
                          Default
                        </Badge>
                      )}
                      <Badge
                        variant={plan.isActive ? 'success' : 'danger'}
                        size="sm"
                        dot
                      >
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted small mb-3">{plan.description}</p>

                  {/* Pricing */}
                  <div className="mb-3 pb-3 border-bottom">
                    <div className="d-flex align-items-baseline gap-2">
                      <span className="fs-2 fw-bold text-primary">
                        {formatPrice(plan.monthlyPrice, plan.currency)}
                      </span>
                      <span className="text-muted">/month</span>
                    </div>
                    <small className="text-muted">
                      or {formatPrice(plan.yearlyPrice, plan.currency)}/year (save{' '}
                      {Math.round(
                        ((plan.monthlyPrice * 12 - plan.yearlyPrice) /
                          (plan.monthlyPrice * 12)) *
                          100
                      )}
                      %)
                    </small>
                  </div>

                  {/* Subscribers & Limits */}
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <Badge variant="info" size="sm">
                      <i className="ti ti-users me-1" />
                      {plan.subscribersCount} subscribers
                    </Badge>
                    <Badge variant="secondary" size="sm">
                      <i className="ti ti-clock me-1" />
                      {plan.trialDays} days trial
                    </Badge>
                  </div>

                  {/* Limits */}
                  <div className="mb-3 pb-3 border-bottom">
                    <small className="text-muted d-block mb-2">Limits:</small>
                    <div className="d-flex flex-wrap gap-3">
                      <div className="d-flex align-items-center gap-1">
                        <i className="ti ti-user text-muted" />
                        <span className="small">
                          {plan.maxUsers === null ? 'Unlimited' : plan.maxUsers} users
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <i className="ti ti-building text-muted" />
                        <span className="small">
                          {plan.maxCabinets === null ? 'Unlimited' : plan.maxCabinets}{' '}
                          cabinets
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Included Modules */}
                  <div className="mb-3">
                    <small className="text-muted d-block mb-2">
                      Included Modules ({planModules.length}):
                    </small>
                    <ListGroup variant="flush" className="small">
                      {planModules.slice(0, 4).map((module) => (
                        <ListGroup.Item
                          key={module.id}
                          className="px-0 py-1 border-0 d-flex align-items-center gap-2"
                        >
                          <i className="ti ti-check text-success" />
                          <span>{module.name}</span>
                          {module.isCore && (
                            <Badge variant="secondary" size="sm">
                              Core
                            </Badge>
                          )}
                        </ListGroup.Item>
                      ))}
                      {planModules.length > 4 && (
                        <ListGroup.Item className="px-0 py-1 border-0 text-muted">
                          +{planModules.length - 4} more modules
                        </ListGroup.Item>
                      )}
                    </ListGroup>
                  </div>

                  {/* Actions */}
                  <div className="d-flex gap-2 pt-3 border-top">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="flex-fill"
                      onClick={() => handleOpenEditModal(plan)}
                    >
                      <i className="ti ti-edit me-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleOpenDeleteModal(plan)}
                      disabled={plan.subscribersCount > 0}
                    >
                      <i className="ti ti-trash" />
                    </Button>
                  </div>
                </BsCard.Body>
              </BsCard>
            </Col>
          );
        })}
      </Row>

      {/* Add/Edit Plan Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingPlan ? 'Edit Plan' : 'Add New Plan'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              {/* Basic Info */}
              <Col md={6}>
                <Input
                  label="Plan Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Professional"
                  required
                />
              </Col>
              <Col md={6}>
                <Input
                  label="Plan Code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., professional"
                  required
                />
              </Col>
              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-body fw-medium">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of the plan..."
                  />
                </Form.Group>
              </Col>

              {/* Pricing */}
              <Col md={4}>
                <Input
                  label="Monthly Price"
                  name="monthlyPrice"
                  type="number"
                  value={formData.monthlyPrice.toString()}
                  onChange={handleInputChange}
                  required
                />
              </Col>
              <Col md={4}>
                <Input
                  label="Yearly Price"
                  name="yearlyPrice"
                  type="number"
                  value={formData.yearlyPrice.toString()}
                  onChange={handleInputChange}
                  required
                />
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-body fw-medium">Currency</Form.Label>
                  <Form.Select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                  >
                    <option value="EUR">EUR</option>
                    <option value="RON">RON</option>
                    <option value="USD">USD</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Limits */}
              <Col md={4}>
                <Input
                  label="Trial Days"
                  name="trialDays"
                  type="number"
                  value={formData.trialDays.toString()}
                  onChange={handleInputChange}
                  hint="Number of free trial days"
                />
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-body fw-medium">Max Users</Form.Label>
                  <Form.Control
                    type="number"
                    name="maxUsers"
                    value={formData.maxUsers === null ? '' : formData.maxUsers}
                    onChange={handleInputChange}
                    placeholder="Leave empty for unlimited"
                  />
                  <Form.Text className="text-muted">Leave empty for unlimited</Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-body fw-medium">Max Cabinets</Form.Label>
                  <Form.Control
                    type="number"
                    name="maxCabinets"
                    value={formData.maxCabinets === null ? '' : formData.maxCabinets}
                    onChange={handleInputChange}
                    placeholder="Leave empty for unlimited"
                  />
                  <Form.Text className="text-muted">Leave empty for unlimited</Form.Text>
                </Form.Group>
              </Col>

              {/* Toggles */}
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="isActive"
                    name="isActive"
                    label="Active"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <Form.Text className="text-muted">
                    Inactive plans are not available for new subscriptions
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="isDefault"
                    name="isDefault"
                    label="Default Plan"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                  />
                  <Form.Text className="text-muted">
                    Default plan is pre-selected for new customers
                  </Form.Text>
                </Form.Group>
              </Col>

              {/* Modules */}
              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-body fw-medium">
                    Included Modules
                  </Form.Label>
                  <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    <Row className="g-2">
                      {mockModules.map((module) => (
                        <Col key={module.id} md={6}>
                          <Form.Check
                            type="checkbox"
                            id={`module-${module.id}`}
                            label={
                              <span>
                                {module.name}
                                {module.isCore && (
                                  <Badge variant="secondary" size="sm" className="ms-2">
                                    Core
                                  </Badge>
                                )}
                              </span>
                            }
                            checked={formData.moduleIds.includes(module.id)}
                            onChange={() => handleModuleToggle(module.id)}
                          />
                        </Col>
                      ))}
                    </Row>
                  </div>
                </Form.Group>
              </Col>

              {/* Features */}
              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-body fw-medium">
                    Features List
                  </Form.Label>
                  <div className="d-flex gap-2 mb-2">
                    <Form.Control
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Add a feature..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                    />
                    <Button
                      variant="outline-primary"
                      type="button"
                      onClick={handleAddFeature}
                    >
                      <i className="ti ti-plus" />
                    </Button>
                  </div>
                  {formData.features.length > 0 && (
                    <ListGroup>
                      {formData.features.map((feature, index) => (
                        <ListGroup.Item
                          key={index}
                          className="d-flex justify-content-between align-items-center py-2"
                        >
                          <span className="small">{feature}</span>
                          <button
                            type="button"
                            className="btn btn-link p-0 text-danger"
                            onClick={() => handleRemoveFeature(index)}
                          >
                            <i className="ti ti-x" />
                          </button>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Plan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deletingPlan && (
            <div>
              <p>
                Are you sure you want to delete the plan{' '}
                <strong>{deletingPlan.name}</strong>?
              </p>
              {deletingPlan.subscribersCount > 0 && (
                <div className="alert alert-warning mb-0">
                  <i className="ti ti-alert-triangle me-2" />
                  This plan has {deletingPlan.subscribersCount} active subscribers and
                  cannot be deleted.
                </div>
              )}
              {deletingPlan.subscribersCount === 0 && (
                <p className="text-muted mb-0">
                  This action cannot be undone.
                </p>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={!!(deletingPlan?.subscribersCount && deletingPlan.subscribersCount > 0)}
          >
            Delete Plan
          </Button>
        </Modal.Footer>
      </Modal>
    </AppShell>
  );
}
