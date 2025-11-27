import { useState, useMemo } from 'react';
import {
  Row,
  Col,
  Card as BsCard,
  Modal,
  Form,
  ListGroup,
  Tab,
  Nav,
} from 'react-bootstrap';
import { AppShell } from '../components/layout';
import { Button, Badge, Input } from '../components/ui';
import type { Module, ModuleFunctionality, ModuleCategory, ModuleStatus } from '../types';
import { mockModules } from '../data/mockData';

// Category configuration for badges and filtering
const categoryConfig: Record<ModuleCategory, { label: string; variant: 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'secondary' }> = {
  core: { label: 'Core', variant: 'primary' },
  clinical: { label: 'Clinical', variant: 'success' },
  management: { label: 'Management', variant: 'warning' },
  marketing: { label: 'Marketing', variant: 'info' },
  ai: { label: 'AI/ML', variant: 'danger' },
  integration: { label: 'Integration', variant: 'secondary' },
};

// Status configuration for badges
const statusConfig: Record<ModuleStatus, { label: string; variant: 'success' | 'warning' | 'secondary' }> = {
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'warning' },
  coming_soon: { label: 'Coming Soon', variant: 'secondary' },
};

// Available Tabler icons for selection
const availableIcons = [
  'ti-calendar',
  'ti-stethoscope',
  'ti-receipt',
  'ti-package',
  'ti-speakerphone',
  'ti-brain',
  'ti-photo',
  'ti-user-circle',
  'ti-droplet',
  'ti-flask',
  'ti-brand-whatsapp',
  'ti-building',
  'ti-chart-bar',
  'ti-message',
  'ti-settings',
  'ti-shield',
  'ti-clock',
  'ti-file-text',
  'ti-credit-card',
  'ti-users',
];

// Empty module template for creating new modules
const emptyModule: Module = {
  id: '',
  code: '',
  name: '',
  description: '',
  category: 'core',
  isCore: false,
  basePrice: 0,
  currency: 'EUR',
  icon: 'ti-package',
  color: '#3b82f6',
  status: 'inactive',
  functionalities: [],
  benefits: [],
  plansCount: 0,
};

// Empty functionality template
const emptyFunctionality: ModuleFunctionality = {
  id: '',
  name: '',
  description: '',
  isIncluded: true,
  isPremium: false,
};

export default function ModulesPage() {
  // State for modules list
  const [modules, setModules] = useState<Module[]>(mockModules);

  // State for filtering
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [activeTab, setActiveTab] = useState('general');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [editingModule, setEditingModule] = useState<Module>(emptyModule);

  // State for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null);

  // State for functionality editing
  const [editingFunctionality, setEditingFunctionality] = useState<ModuleFunctionality | null>(null);
  const [showFunctionalityForm, setShowFunctionalityForm] = useState(false);

  // State for new benefit input
  const [newBenefit, setNewBenefit] = useState('');

  // Computed stats
  const stats = useMemo(() => {
    return {
      total: modules.length,
      core: modules.filter((m) => m.isCore).length,
      addOn: modules.filter((m) => !m.isCore && m.status !== 'coming_soon').length,
      comingSoon: modules.filter((m) => m.status === 'coming_soon').length,
    };
  }, [modules]);

  // Filtered modules
  const filteredModules = useMemo(() => {
    return modules.filter((module) => {
      const matchesCategory = categoryFilter === 'all' || module.category === categoryFilter;
      const matchesSearch =
        module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [modules, categoryFilter, searchQuery]);

  // Handler functions
  const handleOpenModal = (module: Module | null, mode: 'view' | 'edit' | 'create') => {
    setModalMode(mode);
    setSelectedModule(module);
    setEditingModule(module ? { ...module } : { ...emptyModule, id: `mod-${Date.now()}` });
    setActiveTab('general');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedModule(null);
    setEditingModule(emptyModule);
    setShowFunctionalityForm(false);
    setEditingFunctionality(null);
  };

  const handleSaveModule = () => {
    if (modalMode === 'create') {
      setModules([...modules, editingModule]);
    } else {
      setModules(modules.map((m) => (m.id === editingModule.id ? editingModule : m)));
    }
    handleCloseModal();
  };

  const handleDeleteClick = (module: Module) => {
    if (module.isCore) {
      return; // Core modules cannot be deleted
    }
    setModuleToDelete(module);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (moduleToDelete) {
      setModules(modules.filter((m) => m.id !== moduleToDelete.id));
      setShowDeleteModal(false);
      setModuleToDelete(null);
    }
  };

  // Functionality CRUD handlers
  const handleAddFunctionality = () => {
    setEditingFunctionality({ ...emptyFunctionality, id: `f-${Date.now()}` });
    setShowFunctionalityForm(true);
  };

  const handleEditFunctionality = (functionality: ModuleFunctionality) => {
    setEditingFunctionality({ ...functionality });
    setShowFunctionalityForm(true);
  };

  const handleSaveFunctionality = () => {
    if (!editingFunctionality) return;

    const existingIndex = editingModule.functionalities.findIndex(
      (f) => f.id === editingFunctionality.id
    );

    if (existingIndex >= 0) {
      // Update existing
      const updated = [...editingModule.functionalities];
      updated[existingIndex] = editingFunctionality;
      setEditingModule({ ...editingModule, functionalities: updated });
    } else {
      // Add new
      setEditingModule({
        ...editingModule,
        functionalities: [...editingModule.functionalities, editingFunctionality],
      });
    }

    setShowFunctionalityForm(false);
    setEditingFunctionality(null);
  };

  const handleDeleteFunctionality = (functionalityId: string) => {
    setEditingModule({
      ...editingModule,
      functionalities: editingModule.functionalities.filter((f) => f.id !== functionalityId),
    });
  };

  // Benefit handlers
  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setEditingModule({
        ...editingModule,
        benefits: [...editingModule.benefits, newBenefit.trim()],
      });
      setNewBenefit('');
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setEditingModule({
      ...editingModule,
      benefits: editingModule.benefits.filter((_, i) => i !== index),
    });
  };

  return (
    <AppShell
      title="Modules"
      subtitle="Manage platform features and modules"
      breadcrumbs={[{ label: 'Modules' }]}
      actions={
        <Button leftIcon={<i className="ti ti-plus" />} onClick={() => handleOpenModal(null, 'create')}>
          Add Module
        </Button>
      }
    >
      {/* Stats Row */}
      <Row className="g-4 mb-4">
        <Col sm={6} xl={3}>
          <BsCard className="border-0 shadow-sm text-center h-100">
            <BsCard.Body className="p-4">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="stats-icon primary">
                  <i className="ti ti-apps" />
                </div>
              </div>
              <h3 className="mb-0 fw-bold">{stats.total}</h3>
              <small className="text-muted">Total Modules</small>
            </BsCard.Body>
          </BsCard>
        </Col>
        <Col sm={6} xl={3}>
          <BsCard className="border-0 shadow-sm text-center h-100">
            <BsCard.Body className="p-4">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="stats-icon success">
                  <i className="ti ti-star" />
                </div>
              </div>
              <h3 className="mb-0 fw-bold">{stats.core}</h3>
              <small className="text-muted">Core Modules</small>
            </BsCard.Body>
          </BsCard>
        </Col>
        <Col sm={6} xl={3}>
          <BsCard className="border-0 shadow-sm text-center h-100">
            <BsCard.Body className="p-4">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="stats-icon warning">
                  <i className="ti ti-puzzle" />
                </div>
              </div>
              <h3 className="mb-0 fw-bold">{stats.addOn}</h3>
              <small className="text-muted">Add-on Modules</small>
            </BsCard.Body>
          </BsCard>
        </Col>
        <Col sm={6} xl={3}>
          <BsCard className="border-0 shadow-sm text-center h-100">
            <BsCard.Body className="p-4">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="stats-icon info">
                  <i className="ti ti-clock" />
                </div>
              </div>
              <h3 className="mb-0 fw-bold">{stats.comingSoon}</h3>
              <small className="text-muted">Coming Soon</small>
            </BsCard.Body>
          </BsCard>
        </Col>
      </Row>

      {/* Filters */}
      <BsCard className="border-0 shadow-sm mb-4">
        <BsCard.Body className="p-4">
          <Row className="g-3 align-items-center">
            <Col md={6} lg={4}>
              <Input
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<i className="ti ti-search" />}
              />
            </Col>
            <Col md={6} lg={8}>
              <div className="d-flex gap-2 flex-wrap">
                <Button
                  variant={categoryFilter === 'all' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setCategoryFilter('all')}
                >
                  All
                </Button>
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <Button
                    key={key}
                    variant={categoryFilter === key ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setCategoryFilter(key)}
                  >
                    {config.label}
                  </Button>
                ))}
              </div>
            </Col>
          </Row>
        </BsCard.Body>
      </BsCard>

      {/* Modules Grid */}
      <Row className="g-4">
        {filteredModules.map((module) => (
          <Col key={module.id} md={6} xl={4}>
            <BsCard className="border-0 shadow-sm h-100 card-hover">
              <BsCard.Body className="p-4">
                {/* Header with icon and badges */}
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor: `${module.color}20`,
                      color: module.color,
                    }}
                  >
                    <i className={`ti ${module.icon} fs-4`} />
                  </div>
                  <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
                    <Badge variant={categoryConfig[module.category].variant} size="sm">
                      {categoryConfig[module.category].label}
                    </Badge>
                    {module.isCore && (
                      <Badge variant="primary" size="sm">
                        Core
                      </Badge>
                    )}
                    <Badge variant={statusConfig[module.status].variant} size="sm" dot>
                      {statusConfig[module.status].label}
                    </Badge>
                  </div>
                </div>

                {/* Module name and description */}
                <h5 className="fw-semibold mb-1">{module.name}</h5>
                <p className="text-muted small mb-3" style={{ minHeight: '40px' }}>
                  {module.description.length > 100
                    ? `${module.description.substring(0, 100)}...`
                    : module.description}
                </p>

                {/* Price and plans count */}
                <div className="d-flex align-items-center justify-content-between pt-3 border-top">
                  <div>
                    {module.isCore ? (
                      <span className="text-success fw-medium">Included</span>
                    ) : (
                      <span className="fw-bold">
                        {module.currency === 'EUR' ? '\u20AC' : '$'}
                        {module.basePrice}
                        <span className="text-muted small fw-normal">/mo</span>
                      </span>
                    )}
                  </div>
                  <div className="d-flex align-items-center gap-1 text-muted small">
                    <i className="ti ti-file-text" />
                    <span>{module.plansCount} plans</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="d-flex gap-2 mt-3 pt-3 border-top">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="flex-fill"
                    onClick={() => handleOpenModal(module, 'view')}
                  >
                    <i className="ti ti-eye me-1" />
                    View
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="flex-fill"
                    onClick={() => handleOpenModal(module, 'edit')}
                  >
                    <i className="ti ti-edit me-1" />
                    Edit
                  </Button>
                  {!module.isCore && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteClick(module)}
                    >
                      <i className="ti ti-trash" />
                    </Button>
                  )}
                </div>
              </BsCard.Body>
            </BsCard>
          </Col>
        ))}

        {filteredModules.length === 0 && (
          <Col xs={12}>
            <BsCard className="border-0 shadow-sm">
              <BsCard.Body className="p-5 text-center">
                <i className="ti ti-package-off fs-1 text-muted mb-3 d-block" />
                <h5 className="text-muted">No modules found</h5>
                <p className="text-muted mb-0">
                  Try adjusting your search or filter criteria
                </p>
              </BsCard.Body>
            </BsCard>
          </Col>
        )}
      </Row>

      {/* View/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title>
            {modalMode === 'create' && 'Create New Module'}
            {modalMode === 'edit' && `Edit: ${selectedModule?.name}`}
            {modalMode === 'view' && selectedModule?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'general')}>
            <Nav variant="tabs" className="px-3 pt-3">
              <Nav.Item>
                <Nav.Link eventKey="general">
                  <i className="ti ti-info-circle me-2" />
                  General Info
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="functionalities">
                  <i className="ti ti-list-check me-2" />
                  Functionalities
                  <span className="badge bg-secondary ms-2">{editingModule.functionalities.length}</span>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="benefits">
                  <i className="ti ti-star me-2" />
                  Benefits
                  <span className="badge bg-secondary ms-2">{editingModule.benefits.length}</span>
                </Nav.Link>
              </Nav.Item>
            </Nav>
            <Tab.Content className="p-4">
              {/* General Info Tab */}
              <Tab.Pane eventKey="general">
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium">Module Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={editingModule.name}
                        onChange={(e) => setEditingModule({ ...editingModule, name: e.target.value })}
                        disabled={modalMode === 'view'}
                        placeholder="e.g., Inventory Management"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium">Module Code</Form.Label>
                      <Form.Control
                        type="text"
                        value={editingModule.code}
                        onChange={(e) =>
                          setEditingModule({ ...editingModule, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })
                        }
                        disabled={modalMode === 'view'}
                        placeholder="e.g., inventory_management"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label className="fw-medium">Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={editingModule.description}
                        onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                        disabled={modalMode === 'view'}
                        placeholder="Describe what this module does..."
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium">Category</Form.Label>
                      <Form.Select
                        value={editingModule.category}
                        onChange={(e) =>
                          setEditingModule({ ...editingModule, category: e.target.value as ModuleCategory })
                        }
                        disabled={modalMode === 'view'}
                      >
                        {Object.entries(categoryConfig).map(([key, config]) => (
                          <option key={key} value={key}>
                            {config.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium">Status</Form.Label>
                      <Form.Select
                        value={editingModule.status}
                        onChange={(e) =>
                          setEditingModule({ ...editingModule, status: e.target.value as ModuleStatus })
                        }
                        disabled={modalMode === 'view'}
                      >
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <option key={key} value={key}>
                            {config.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium">Icon</Form.Label>
                      <Form.Select
                        value={editingModule.icon}
                        onChange={(e) => setEditingModule({ ...editingModule, icon: e.target.value })}
                        disabled={modalMode === 'view'}
                      >
                        {availableIcons.map((icon) => (
                          <option key={icon} value={icon}>
                            {icon.replace('ti-', '')}
                          </option>
                        ))}
                      </Form.Select>
                      <div className="mt-2">
                        <span className="text-muted small">Preview: </span>
                        <i className={`ti ${editingModule.icon} fs-5`} style={{ color: editingModule.color }} />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium">Icon Color</Form.Label>
                      <div className="d-flex gap-2 align-items-center">
                        <Form.Control
                          type="color"
                          value={editingModule.color}
                          onChange={(e) => setEditingModule({ ...editingModule, color: e.target.value })}
                          disabled={modalMode === 'view'}
                          style={{ width: 50, height: 38 }}
                        />
                        <Form.Control
                          type="text"
                          value={editingModule.color}
                          onChange={(e) => setEditingModule({ ...editingModule, color: e.target.value })}
                          disabled={modalMode === 'view'}
                          placeholder="#3b82f6"
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-medium">Base Price</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text">{editingModule.currency === 'EUR' ? '\u20AC' : '$'}</span>
                        <Form.Control
                          type="number"
                          min="0"
                          value={editingModule.basePrice}
                          onChange={(e) =>
                            setEditingModule({ ...editingModule, basePrice: parseFloat(e.target.value) || 0 })
                          }
                          disabled={modalMode === 'view' || editingModule.isCore}
                        />
                        <span className="input-group-text">/mo</span>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-medium">Currency</Form.Label>
                      <Form.Select
                        value={editingModule.currency}
                        onChange={(e) => setEditingModule({ ...editingModule, currency: e.target.value })}
                        disabled={modalMode === 'view'}
                      >
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                        <option value="RON">RON</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-medium">Core Module</Form.Label>
                      <div className="pt-2">
                        <Form.Check
                          type="switch"
                          id="isCore"
                          label={editingModule.isCore ? 'Yes (always included)' : 'No (add-on)'}
                          checked={editingModule.isCore}
                          onChange={(e) =>
                            setEditingModule({
                              ...editingModule,
                              isCore: e.target.checked,
                              basePrice: e.target.checked ? 0 : editingModule.basePrice,
                            })
                          }
                          disabled={modalMode === 'view'}
                        />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Functionalities Tab */}
              <Tab.Pane eventKey="functionalities">
                {modalMode !== 'view' && !showFunctionalityForm && (
                  <div className="mb-3">
                    <Button variant="outline-primary" size="sm" onClick={handleAddFunctionality}>
                      <i className="ti ti-plus me-1" />
                      Add Functionality
                    </Button>
                  </div>
                )}

                {/* Functionality Form */}
                {showFunctionalityForm && editingFunctionality && (
                  <BsCard className="border mb-3">
                    <BsCard.Body>
                      <h6 className="mb-3">
                        {editingModule.functionalities.find((f) => f.id === editingFunctionality.id)
                          ? 'Edit Functionality'
                          : 'New Functionality'}
                      </h6>
                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-medium small">Name</Form.Label>
                            <Form.Control
                              type="text"
                              size="sm"
                              value={editingFunctionality.name}
                              onChange={(e) =>
                                setEditingFunctionality({ ...editingFunctionality, name: e.target.value })
                              }
                              placeholder="e.g., Stock Tracking"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-medium small">Description</Form.Label>
                            <Form.Control
                              type="text"
                              size="sm"
                              value={editingFunctionality.description}
                              onChange={(e) =>
                                setEditingFunctionality({ ...editingFunctionality, description: e.target.value })
                              }
                              placeholder="Brief description..."
                            />
                          </Form.Group>
                        </Col>
                        <Col xs={12}>
                          <div className="d-flex gap-4">
                            <Form.Check
                              type="checkbox"
                              id="isIncluded"
                              label="Included by default"
                              checked={editingFunctionality.isIncluded}
                              onChange={(e) =>
                                setEditingFunctionality({ ...editingFunctionality, isIncluded: e.target.checked })
                              }
                            />
                            <Form.Check
                              type="checkbox"
                              id="isPremium"
                              label="Premium feature"
                              checked={editingFunctionality.isPremium}
                              onChange={(e) =>
                                setEditingFunctionality({ ...editingFunctionality, isPremium: e.target.checked })
                              }
                            />
                          </div>
                        </Col>
                        <Col xs={12}>
                          <div className="d-flex gap-2">
                            <Button variant="primary" size="sm" onClick={handleSaveFunctionality}>
                              Save
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => {
                                setShowFunctionalityForm(false);
                                setEditingFunctionality(null);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </BsCard.Body>
                  </BsCard>
                )}

                {/* Functionalities List */}
                {editingModule.functionalities.length > 0 ? (
                  <ListGroup variant="flush">
                    {editingModule.functionalities.map((func) => (
                      <ListGroup.Item key={func.id} className="px-0 py-3">
                        <div className="d-flex align-items-start justify-content-between">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <h6 className="mb-0">{func.name}</h6>
                              {func.isIncluded && (
                                <Badge variant="success" size="sm">
                                  Included
                                </Badge>
                              )}
                              {func.isPremium && (
                                <Badge variant="warning" size="sm">
                                  Premium
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted small mb-0">{func.description}</p>
                          </div>
                          {modalMode !== 'view' && (
                            <div className="d-flex gap-1 ms-3">
                              <button
                                className="btn btn-link p-1 text-muted"
                                onClick={() => handleEditFunctionality(func)}
                              >
                                <i className="ti ti-edit" />
                              </button>
                              <button
                                className="btn btn-link p-1 text-danger"
                                onClick={() => handleDeleteFunctionality(func.id)}
                              >
                                <i className="ti ti-trash" />
                              </button>
                            </div>
                          )}
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <div className="text-center py-4 text-muted">
                    <i className="ti ti-list-check fs-1 mb-2 d-block opacity-50" />
                    <p className="mb-0">No functionalities defined yet</p>
                  </div>
                )}
              </Tab.Pane>

              {/* Benefits Tab */}
              <Tab.Pane eventKey="benefits">
                {modalMode !== 'view' && (
                  <div className="mb-3">
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="text"
                        value={newBenefit}
                        onChange={(e) => setNewBenefit(e.target.value)}
                        placeholder="Enter a benefit..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddBenefit();
                          }
                        }}
                      />
                      <Button variant="outline-primary" onClick={handleAddBenefit}>
                        <i className="ti ti-plus" />
                      </Button>
                    </div>
                  </div>
                )}

                {editingModule.benefits.length > 0 ? (
                  <ListGroup variant="flush">
                    {editingModule.benefits.map((benefit, index) => (
                      <ListGroup.Item key={index} className="px-0 py-2">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-2">
                            <i className="ti ti-check text-success" />
                            <span>{benefit}</span>
                          </div>
                          {modalMode !== 'view' && (
                            <button
                              className="btn btn-link p-1 text-danger"
                              onClick={() => handleRemoveBenefit(index)}
                            >
                              <i className="ti ti-x" />
                            </button>
                          )}
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <div className="text-center py-4 text-muted">
                    <i className="ti ti-star fs-1 mb-2 d-block opacity-50" />
                    <p className="mb-0">No benefits defined yet</p>
                  </div>
                )}
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Modal.Body>
        <Modal.Footer className="border-top">
          <Button variant="outline-secondary" onClick={handleCloseModal}>
            {modalMode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {modalMode !== 'view' && (
            <Button variant="primary" onClick={handleSaveModule}>
              <i className="ti ti-check me-1" />
              {modalMode === 'create' ? 'Create Module' : 'Save Changes'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title>Delete Module</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center py-3">
            <div className="mb-3">
              <i className="ti ti-alert-triangle text-danger" style={{ fontSize: '3rem' }} />
            </div>
            <h5>Are you sure you want to delete this module?</h5>
            <p className="text-muted mb-0">
              <strong>{moduleToDelete?.name}</strong> will be permanently removed. This action cannot be undone.
            </p>
            {moduleToDelete && moduleToDelete.plansCount > 0 && (
              <div className="alert alert-warning mt-3 mb-0">
                <i className="ti ti-alert-circle me-2" />
                This module is used in {moduleToDelete.plansCount} plan(s). Removing it may affect those plans.
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer className="border-top">
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            <i className="ti ti-trash me-1" />
            Delete Module
          </Button>
        </Modal.Footer>
      </Modal>
    </AppShell>
  );
}
