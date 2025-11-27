/**
 * Procedure Consumption Modal
 *
 * Modal shown when completing a procedure to confirm product consumption.
 * Pre-filled with default products from intervention template.
 * Allows staff to adjust quantities, add/remove products before deducting from inventory.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Modal, Badge, Button } from '../ui-new';
import toast from 'react-hot-toast';

// Types
interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  uom: string;
  unitCost: number;
  stockQty: number;
  minQty: number;
}

interface ConsumedProduct {
  productId: string;
  quantityUsed: number;
  isOptional: boolean;
}

interface Intervention {
  id: string;
  code: string;
  name: string;
  products: Array<{
    productId: string;
    quantity: number;
    isOptional: boolean;
  }>;
}

interface ProcedureConsumptionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (consumedProducts: ConsumedProduct[]) => void;
  intervention: Intervention | null;
  availableProducts: Product[];
  patientName?: string;
  appointmentDate?: string;
}

export function ProcedureConsumptionModal({
  open,
  onClose,
  onConfirm,
  intervention,
  availableProducts,
  patientName,
  appointmentDate,
}: ProcedureConsumptionModalProps) {
  const [consumedProducts, setConsumedProducts] = useState<ConsumedProduct[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize consumed products from intervention template
  useEffect(() => {
    if (open && intervention) {
      setConsumedProducts(
        intervention.products.map((p) => ({
          productId: p.productId,
          quantityUsed: p.quantity,
          isOptional: p.isOptional,
        }))
      );
    }
  }, [open, intervention]);

  // Get product details
  const getProduct = useCallback(
    (productId: string) => {
      return availableProducts.find((p) => p.id === productId);
    },
    [availableProducts]
  );

  // Filter available products to add
  const availableToAdd = useMemo(() => {
    const addedIds = new Set(consumedProducts.map((p) => p.productId));
    return availableProducts.filter((p) => !addedIds.has(p.id));
  }, [availableProducts, consumedProducts]);

  // Filter products for selection
  const filteredProducts = useMemo(() => {
    return availableToAdd.filter((product) =>
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableToAdd, searchTerm]);

  // Check if product has sufficient stock
  const hasStockWarning = useCallback(
    (productId: string, quantity: number) => {
      const product = getProduct(productId);
      if (!product) return false;
      return product.stockQty < quantity;
    },
    [getProduct]
  );

  // Update quantity
  const handleQuantityChange = useCallback((index: number, quantity: number) => {
    setConsumedProducts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantityUsed: quantity };
      return updated;
    });
  }, []);

  // Remove product
  const handleRemove = useCallback((index: number) => {
    setConsumedProducts((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Add new product
  const handleAddProduct = useCallback((productId: string) => {
    setConsumedProducts((prev) => [
      ...prev,
      {
        productId,
        quantityUsed: 1,
        isOptional: false,
      },
    ]);
    setShowAddModal(false);
    setSearchTerm('');
  }, []);

  // Validate and confirm
  const handleConfirm = useCallback(async () => {
    // Validation
    const hasInsufficientStock = consumedProducts.some((item) => {
      const product = getProduct(item.productId);
      return product && product.stockQty < item.quantityUsed;
    });

    if (hasInsufficientStock) {
      const confirmed = window.confirm(
        'Unele produse nu au stoc suficient. Vrei sa continui oricum?'
      );
      if (!confirmed) return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Call parent callback
      onConfirm(consumedProducts);

      toast.success('Consumul a fost inregistrat cu succes');
      onClose();
    } catch (error) {
      toast.error('Eroare la inregistrarea consumului');
    } finally {
      setLoading(false);
    }
  }, [consumedProducts, getProduct, onConfirm, onClose]);

  // Calculate totals
  const { totalCost, itemsCount, hasWarnings } = useMemo(() => {
    let cost = 0;
    let warnings = false;

    consumedProducts.forEach((item) => {
      const product = getProduct(item.productId);
      if (product) {
        cost += product.unitCost * item.quantityUsed;
        if (hasStockWarning(item.productId, item.quantityUsed)) {
          warnings = true;
        }
      }
    });

    return {
      totalCost: cost,
      itemsCount: consumedProducts.length,
      hasWarnings: warnings,
    };
  }, [consumedProducts, getProduct, hasStockWarning]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (!intervention) return null;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Confirma Consumul Materiale"
        icon="ti ti-clipboard-check"
        size="xl"
        closeOnOverlay={false}
        footer={
          <>
            <Button variant="light" onClick={onClose} disabled={loading}>
              Anuleaza
            </Button>
            <Button variant="primary" onClick={handleConfirm} loading={loading}>
              <i className="ti ti-check me-2"></i>
              Confirma si Deduce din Stoc
            </Button>
          </>
        }
      >
        {/* Procedure Info */}
        <div className="alert alert-info d-flex align-items-start gap-3 mb-4">
          <i className="ti ti-info-circle fs-24"></i>
          <div className="flex-grow-1">
            <h6 className="fw-semibold mb-2">Informatii Procedura</h6>
            <div className="row g-2">
              <div className="col-md-6">
                <small className="text-muted">Interventie:</small>
                <div className="fw-medium">{intervention.name}</div>
              </div>
              {patientName && (
                <div className="col-md-6">
                  <small className="text-muted">Pacient:</small>
                  <div className="fw-medium">{patientName}</div>
                </div>
              )}
              {appointmentDate && (
                <div className="col-md-6">
                  <small className="text-muted">Data:</small>
                  <div className="fw-medium">{appointmentDate}</div>
                </div>
              )}
              <div className="col-md-6">
                <small className="text-muted">Cod:</small>
                <div className="fw-medium">{intervention.code}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Warnings */}
        {hasWarnings && (
          <div className="alert alert-warning d-flex align-items-start gap-3 mb-4">
            <i className="ti ti-alert-triangle fs-24"></i>
            <div>
              <h6 className="fw-semibold mb-1">Atentie - Stoc insuficient!</h6>
              <p className="mb-0 small">
                Unele produse nu au stoc suficient. Verifica cantitatile inainte de a continua.
              </p>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6 className="fw-semibold mb-0">
              Materiale Consumate ({itemsCount})
            </h6>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => setShowAddModal(true)}
            >
              <i className="ti ti-plus me-2"></i>
              Adauga Produs
            </button>
          </div>

          {consumedProducts.length === 0 ? (
            <div className="card bg-light border-0">
              <div className="card-body text-center py-5">
                <i className="ti ti-package-off fs-48 text-muted mb-3"></i>
                <h6 className="fw-semibold mb-2">Niciun produs</h6>
                <p className="text-muted mb-3">
                  Adauga produsele consumate pentru aceasta procedura
                </p>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => setShowAddModal(true)}
                >
                  <i className="ti ti-plus me-2"></i>
                  Adauga Produs
                </button>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Produs</th>
                    <th>Stoc Actual</th>
                    <th style={{ width: '150px' }}>Cantitate Folosita</th>
                    <th style={{ width: '100px' }}>Cost Unit.</th>
                    <th style={{ width: '100px' }}>Cost Total</th>
                    <th style={{ width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {consumedProducts.map((item, index) => {
                    const product = getProduct(item.productId);
                    if (!product) return null;

                    const itemTotal = product.unitCost * item.quantityUsed;
                    const insufficientStock = hasStockWarning(item.productId, item.quantityUsed);
                    const willBeLowStock =
                      product.stockQty - item.quantityUsed < product.minQty;

                    return (
                      <tr key={`${item.productId}-${index}`}>
                        <td>
                          <div className="d-flex flex-column">
                            <div className="fw-medium">{product.name}</div>
                            <div className="d-flex align-items-center gap-2">
                              <small className="text-muted">{product.code}</small>
                              {item.isOptional && (
                                <Badge variant="soft-secondary" size="sm">
                                  Optional
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span
                              className={
                                insufficientStock
                                  ? 'text-danger fw-semibold'
                                  : willBeLowStock
                                  ? 'text-warning'
                                  : ''
                              }
                            >
                              {product.stockQty} {product.uom}
                            </span>
                            {insufficientStock && (
                              <Badge variant="soft-danger" size="sm">
                                <i className="ti ti-alert-circle"></i> Insuficient
                              </Badge>
                            )}
                            {!insufficientStock && willBeLowStock && (
                              <Badge variant="soft-warning" size="sm">
                                <i className="ti ti-alert-triangle"></i> Va fi scazut
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="input-group input-group-sm">
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() =>
                                handleQuantityChange(
                                  index,
                                  Math.max(0.1, item.quantityUsed - 0.5)
                                )
                              }
                            >
                              <i className="ti ti-minus"></i>
                            </button>
                            <input
                              type="number"
                              className="form-control text-center"
                              value={item.quantityUsed}
                              onChange={(e) =>
                                handleQuantityChange(index, parseFloat(e.target.value) || 0)
                              }
                              min="0.1"
                              step="0.5"
                              style={{ maxWidth: '70px' }}
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() =>
                                handleQuantityChange(index, item.quantityUsed + 0.5)
                              }
                            >
                              <i className="ti ti-plus"></i>
                            </button>
                          </div>
                        </td>
                        <td className="text-muted small">
                          {formatCurrency(product.unitCost)}
                        </td>
                        <td className="fw-semibold">{formatCurrency(itemTotal)}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-soft-danger"
                            onClick={() => handleRemove(index)}
                            title="Sterge"
                          >
                            <i className="ti ti-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="table-light">
                  <tr>
                    <td colSpan={4} className="text-end fw-semibold">
                      Cost Total Materiale:
                    </td>
                    <td colSpan={2} className="fw-bold text-warning">
                      {formatCurrency(totalCost)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="alert alert-light border mb-0">
          <h6 className="fw-semibold mb-2">
            <i className="ti ti-info-circle me-2"></i>
            Instructiuni
          </h6>
          <ul className="mb-0 ps-3 small">
            <li>Verifica cantitatile folosite pentru fiecare produs</li>
            <li>Poti adauga produse suplimentare sau sterge produse nefolosite</li>
            <li>Ajusteaza cantitatile daca au fost folosite mai mult sau mai putin</li>
            <li>La confirmare, produsele vor fi deduse automat din stoc</li>
          </ul>
        </div>
      </Modal>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay show" onClick={() => setShowAddModal(false)}>
          <div
            className="modal modal-lg"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-product-title"
          >
            <div className="modal-header">
              <h5 id="add-product-title" className="modal-title">
                <i className="ti ti-package me-2"></i>
                Adauga Produs Suplimentar
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowAddModal(false)}
                aria-label="Inchide"
              ></button>
            </div>

            <div className="modal-body">
              {/* Search */}
              <div className="mb-4">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="ti ti-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Cauta produs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Products List */}
              <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th>Cod</th>
                      <th>Produs</th>
                      <th>Stoc</th>
                      <th>Pret</th>
                      <th className="text-end">Actiune</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4">
                          <i className="ti ti-package-off fs-48 text-muted mb-2"></i>
                          <div className="text-muted">
                            {availableToAdd.length === 0
                              ? 'Toate produsele au fost adaugate'
                              : 'Niciun produs gasit'}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => {
                        const isLowStock = product.stockQty < product.minQty;

                        return (
                          <tr key={product.id}>
                            <td>
                              <Badge variant="soft-secondary" size="sm">
                                {product.code}
                              </Badge>
                            </td>
                            <td>
                              <div className="fw-medium">{product.name}</div>
                              <small className="text-muted">{product.category}</small>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <span className={isLowStock ? 'text-warning' : ''}>
                                  {product.stockQty} {product.uom}
                                </span>
                                {isLowStock && (
                                  <i className="ti ti-alert-triangle text-warning"></i>
                                )}
                              </div>
                            </td>
                            <td className="fw-medium">{formatCurrency(product.unitCost)}</td>
                            <td className="text-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={() => handleAddProduct(product.id)}
                              >
                                <i className="ti ti-plus me-1"></i>
                                Adauga
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setShowAddModal(false);
                  setSearchTerm('');
                }}
              >
                Inchide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProcedureConsumptionModal;
