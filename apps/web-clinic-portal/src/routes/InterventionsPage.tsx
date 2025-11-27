/**
 * Interventions Page
 *
 * Manage intervention templates with product consumption configuration.
 * Allows clinic owners/doctors/nurses to define default products for each procedure.
 */

import { useState, useMemo, useCallback } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader, CardBody, Button, Badge, Modal } from '../components/ui-new';
import { InterventionProductsEditor } from '../components/clinical/InterventionProductsEditor';
import toast from 'react-hot-toast';

// Types
interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  manufacturer?: string;
  uom: string;
  unitCost: number;
  stockQty: number;
  minQty: number;
}

interface InterventionProduct {
  productId: string;
  quantity: number;
  isOptional: boolean;
}

interface Intervention {
  id: string;
  code: string;
  name: string;
  category: string;
  duration: number; // minutes
  price: number;
  products: InterventionProduct[];
  estimatedCost: number;
  isActive: boolean;
}

// Mock data for demo
const MOCK_CATEGORIES = [
  'Preventie',
  'Conservativa',
  'Endodontie',
  'Chirurgie',
  'Parodontologie',
  'Protetică',
  'Ortodontie',
  'Implantologie',
];

const MOCK_PRODUCTS: Product[] = [
  { id: '1', code: 'COMP-A2', name: 'Compozit A2', category: 'Materiale Restaurare', manufacturer: '3M', uom: 'bucata', unitCost: 45, stockQty: 12, minQty: 5 },
  { id: '2', code: 'ANEST-LID', name: 'Anestezic Lidocaina 2%', category: 'Anestezice', manufacturer: 'Septodont', uom: 'fiola', unitCost: 3.5, stockQty: 50, minQty: 20 },
  { id: '3', code: 'GLOVES-M', name: 'Manusi latex M', category: 'Consumabile', uom: 'cutie', unitCost: 25, stockQty: 8, minQty: 3 },
  { id: '4', code: 'MASK-SURG', name: 'Masca chirurgicala', category: 'Consumabile', uom: 'cutie', unitCost: 15, stockQty: 15, minQty: 5 },
  { id: '5', code: 'BUR-DIAM', name: 'Freza diamantata', category: 'Instrumente', uom: 'bucata', unitCost: 12, stockQty: 25, minQty: 10 },
  { id: '6', code: 'BONDING', name: 'Agent de adeziune', category: 'Materiale Restaurare', manufacturer: 'Ivoclar', uom: 'flacon', unitCost: 80, stockQty: 5, minQty: 2 },
  { id: '7', code: 'ACID-37', name: 'Acid ortofosforic 37%', category: 'Materiale Restaurare', uom: 'flacon', unitCost: 35, stockQty: 8, minQty: 3 },
  { id: '8', code: 'COTTON-R', name: 'Role bumbac', category: 'Consumabile', uom: 'pachet', unitCost: 8, stockQty: 30, minQty: 10 },
  { id: '9', code: 'FILE-ENDO', name: 'Lima endodontica', category: 'Instrumente', uom: 'bucata', unitCost: 5, stockQty: 40, minQty: 15 },
  { id: '10', code: 'SEALANT', name: 'Material obturat canale', category: 'Endodontie', manufacturer: 'Dentsply', uom: 'tub', unitCost: 65, stockQty: 6, minQty: 2 },
];

const MOCK_INTERVENTIONS: Intervention[] = [
  {
    id: '1',
    code: 'OBT-001',
    name: 'Obturatie compozit simpla',
    category: 'Conservativa',
    duration: 30,
    price: 200,
    products: [
      { productId: '1', quantity: 1, isOptional: false },
      { productId: '2', quantity: 1, isOptional: false },
      { productId: '3', quantity: 2, isOptional: false },
      { productId: '6', quantity: 0.5, isOptional: false },
      { productId: '7', quantity: 0.5, isOptional: false },
    ],
    estimatedCost: 95.5,
    isActive: true,
  },
  {
    id: '2',
    code: 'ENDO-001',
    name: 'Tratament endodontic monoradicular',
    category: 'Endodontie',
    duration: 60,
    price: 400,
    products: [
      { productId: '2', quantity: 2, isOptional: false },
      { productId: '3', quantity: 2, isOptional: false },
      { productId: '9', quantity: 3, isOptional: false },
      { productId: '10', quantity: 1, isOptional: false },
      { productId: '8', quantity: 1, isOptional: false },
    ],
    estimatedCost: 98,
    isActive: true,
  },
  {
    id: '3',
    code: 'PREV-001',
    name: 'Detartraj si periaj profesional',
    category: 'Preventie',
    duration: 45,
    price: 150,
    products: [
      { productId: '3', quantity: 2, isOptional: false },
      { productId: '4', quantity: 1, isOptional: false },
      { productId: '8', quantity: 1, isOptional: false },
    ],
    estimatedCost: 58,
    isActive: true,
  },
  {
    id: '4',
    code: 'OBT-002',
    name: 'Obturatie compozit complexa',
    category: 'Conservativa',
    duration: 45,
    price: 300,
    products: [
      { productId: '1', quantity: 2, isOptional: false },
      { productId: '2', quantity: 1, isOptional: false },
      { productId: '3', quantity: 2, isOptional: false },
      { productId: '5', quantity: 2, isOptional: false },
      { productId: '6', quantity: 1, isOptional: false },
      { productId: '7', quantity: 1, isOptional: false },
    ],
    estimatedCost: 180.5,
    isActive: true,
  },
];

export function InterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>(MOCK_INTERVENTIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingIntervention, setEditingIntervention] = useState<Intervention | null>(null);

  // Modal form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: '',
    duration: 30,
    price: 0,
  });
  const [formProducts, setFormProducts] = useState<InterventionProduct[]>([]);

  // Filter interventions
  const filteredInterventions = useMemo(() => {
    return interventions.filter((intervention) => {
      const matchesSearch =
        !searchTerm ||
        intervention.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intervention.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || intervention.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [interventions, searchTerm, selectedCategory]);

  // Calculate estimated cost from products
  const calculateEstimatedCost = useCallback((products: InterventionProduct[]) => {
    return products.reduce((total, item) => {
      const product = MOCK_PRODUCTS.find((p) => p.id === item.productId);
      return total + (product ? product.unitCost * item.quantity : 0);
    }, 0);
  }, []);

  // Open modal for new intervention
  const handleAddNew = useCallback(() => {
    setEditingIntervention(null);
    setFormData({
      code: '',
      name: '',
      category: '',
      duration: 30,
      price: 0,
    });
    setFormProducts([]);
    setShowModal(true);
  }, []);

  // Open modal for editing
  const handleEdit = useCallback((intervention: Intervention) => {
    setEditingIntervention(intervention);
    setFormData({
      code: intervention.code,
      name: intervention.name,
      category: intervention.category,
      duration: intervention.duration,
      price: intervention.price,
    });
    setFormProducts(intervention.products);
    setShowModal(true);
  }, []);

  // Save intervention
  const handleSave = useCallback(() => {
    if (!formData.code || !formData.name || !formData.category) {
      toast.error('Te rog completeaza toate campurile obligatorii');
      return;
    }

    const estimatedCost = calculateEstimatedCost(formProducts);

    if (editingIntervention) {
      // Update existing
      setInterventions((prev) =>
        prev.map((item) =>
          item.id === editingIntervention.id
            ? {
                ...item,
                ...formData,
                products: formProducts,
                estimatedCost,
              }
            : item
        )
      );
      toast.success('Interventie actualizata cu succes');
    } else {
      // Create new
      const newIntervention: Intervention = {
        id: Date.now().toString(),
        ...formData,
        products: formProducts,
        estimatedCost,
        isActive: true,
      };
      setInterventions((prev) => [...prev, newIntervention]);
      toast.success('Interventie adaugata cu succes');
    }

    setShowModal(false);
  }, [formData, formProducts, editingIntervention, calculateEstimatedCost]);

  // Delete intervention
  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Sigur vrei sa stergi aceasta interventie?')) {
      setInterventions((prev) => prev.filter((item) => item.id !== id));
      toast.success('Interventie stearsa cu succes');
    }
  }, []);

  // Toggle active status
  const handleToggleActive = useCallback((id: string) => {
    setInterventions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    );
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <AppShell
      title="Interventii si Proceduri"
      subtitle="Configureaza interventiile cu produsele necesare pentru deducere automata din stoc"
    >
      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><a href="/dashboard">Acasa</a></li>
              <li className="breadcrumb-item"><a href="/clinical">Date Clinice</a></li>
              <li className="breadcrumb-item active" aria-current="page">Interventii</li>
            </ol>
          </nav>
        </div>
        <Button variant="primary" onClick={handleAddNew}>
          <i className="ti ti-plus me-2"></i>
          Interventie Noua
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="shadow-sm mb-4">
        <CardBody>
          <div className="row g-3">
            {/* Search */}
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="ti ti-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Cauta dupa nume sau cod..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="col-md-4">
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Toate Categoriile</option>
                {MOCK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="col-md-2">
              <Button
                variant="outline-secondary"
                block
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
              >
                <i className="ti ti-x me-2"></i>
                Reseteaza
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Interventions List */}
      <Card className="shadow-sm">
        <CardHeader>
          <h5 className="fw-bold mb-0">
            Interventii ({filteredInterventions.length})
          </h5>
        </CardHeader>
        <CardBody>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Cod</th>
                  <th>Nume Interventie</th>
                  <th>Categorie</th>
                  <th>Durata</th>
                  <th>Pret</th>
                  <th>Produse</th>
                  <th>Cost Material</th>
                  <th>Marja</th>
                  <th>Status</th>
                  <th className="text-end">Actiuni</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterventions.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-5">
                      <div className="avatar avatar-xl bg-light rounded-circle mx-auto mb-3">
                        <i className="ti ti-clipboard-off fs-48 text-muted"></i>
                      </div>
                      <h6 className="fw-semibold mb-2">Nicio interventie gasita</h6>
                      <p className="text-muted mb-0">
                        Adauga prima interventie pentru a incepe configurarea
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredInterventions.map((intervention) => {
                    const margin = intervention.price - intervention.estimatedCost;
                    const marginPercent =
                      intervention.price > 0
                        ? ((margin / intervention.price) * 100).toFixed(1)
                        : '0';
                    const hasLowStock = intervention.products.some((ip) => {
                      const product = MOCK_PRODUCTS.find((p) => p.id === ip.productId);
                      return product && product.stockQty < product.minQty;
                    });

                    return (
                      <tr key={intervention.id}>
                        <td>
                          <span className="badge badge-soft-primary">{intervention.code}</span>
                        </td>
                        <td>
                          <div className="fw-medium">{intervention.name}</div>
                        </td>
                        <td>
                          <Badge variant="soft-info" size="sm">
                            {intervention.category}
                          </Badge>
                        </td>
                        <td>{intervention.duration} min</td>
                        <td className="fw-semibold text-success">
                          {formatCurrency(intervention.price)}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <Badge variant="soft-secondary">
                              {intervention.products.length} produse
                            </Badge>
                            {hasLowStock && (
                              <Badge variant="soft-warning" size="sm">
                                <i className="ti ti-alert-triangle"></i> Stoc scazut
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="text-warning fw-medium">
                          {formatCurrency(intervention.estimatedCost)}
                        </td>
                        <td>
                          <span
                            className={`fw-semibold ${
                              parseFloat(marginPercent) > 50
                                ? 'text-success'
                                : parseFloat(marginPercent) > 25
                                ? 'text-info'
                                : 'text-warning'
                            }`}
                          >
                            {marginPercent}%
                          </span>
                        </td>
                        <td>
                          {intervention.isActive ? (
                            <Badge variant="soft-success">Activ</Badge>
                          ) : (
                            <Badge variant="soft-secondary">Inactiv</Badge>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-1 justify-content-end">
                            <button
                              className="btn btn-sm btn-soft-primary"
                              onClick={() => handleEdit(intervention)}
                              title="Editeaza"
                            >
                              <i className="ti ti-edit"></i>
                            </button>
                            <button
                              className={`btn btn-sm ${
                                intervention.isActive ? 'btn-soft-warning' : 'btn-soft-success'
                              }`}
                              onClick={() => handleToggleActive(intervention.id)}
                              title={intervention.isActive ? 'Dezactiveaza' : 'Activeaza'}
                            >
                              <i
                                className={`ti ${
                                  intervention.isActive ? 'ti-eye-off' : 'ti-eye'
                                }`}
                              ></i>
                            </button>
                            <button
                              className="btn btn-sm btn-soft-danger"
                              onClick={() => handleDelete(intervention.id)}
                              title="Sterge"
                            >
                              <i className="ti ti-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingIntervention ? 'Editeaza Interventie' : 'Interventie Noua'}
        icon="ti ti-clipboard-plus"
        size="xl"
        footer={
          <>
            <Button variant="light" onClick={() => setShowModal(false)}>
              Anuleaza
            </Button>
            <Button variant="primary" onClick={handleSave}>
              <i className="ti ti-check me-2"></i>
              Salveaza
            </Button>
          </>
        }
      >
        <div className="row g-3">
          {/* Basic Info */}
          <div className="col-12">
            <h6 className="fw-semibold mb-3">Informatii de baza</h6>
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Cod Interventie <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="Ex: OBT-001"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Categorie <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Selecteaza categorie</option>
              {MOCK_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12">
            <label className="form-label">
              Nume Interventie <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Obturatie compozit simpla"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Durata (minute)</label>
            <input
              type="number"
              className="form-control"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })
              }
              min="5"
              step="5"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Pret (RON)</label>
            <input
              type="number"
              className="form-control"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
              }
              min="0"
              step="0.01"
            />
          </div>

          {/* Products Editor */}
          <div className="col-12">
            <hr className="my-3" />
            <h6 className="fw-semibold mb-3">Materiale si Consumabile</h6>
            <InterventionProductsEditor
              products={formProducts}
              onChange={setFormProducts}
              availableProducts={MOCK_PRODUCTS}
            />
          </div>

          {/* Summary */}
          <div className="col-12">
            <hr className="my-3" />
            <div className="row g-3">
              <div className="col-md-4">
                <div className="card bg-light border-0">
                  <div className="card-body">
                    <div className="text-muted small">Cost Materiale Total</div>
                    <div className="h5 mb-0 mt-1 text-warning">
                      {formatCurrency(calculateEstimatedCost(formProducts))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-light border-0">
                  <div className="card-body">
                    <div className="text-muted small">Pret Interventie</div>
                    <div className="h5 mb-0 mt-1 text-success">
                      {formatCurrency(formData.price)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-light border-0">
                  <div className="card-body">
                    <div className="text-muted small">Marja Profit</div>
                    <div className="h5 mb-0 mt-1 text-primary">
                      {formData.price > 0
                        ? (
                            ((formData.price - calculateEstimatedCost(formProducts)) /
                              formData.price) *
                            100
                          ).toFixed(1)
                        : '0'}
                      %
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}

export default InterventionsPage;
