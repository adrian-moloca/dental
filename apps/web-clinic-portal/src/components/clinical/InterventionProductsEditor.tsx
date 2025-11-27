/**
 * Intervention Products Editor
 *
 * Reusable component for selecting and configuring products for interventions.
 * Supports drag-drop reordering, quantity editing, and product selection.
 */

import { useState, useMemo, useCallback } from 'react';
import { Badge } from '../ui-new';

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

interface InterventionProductsEditorProps {
  products: InterventionProduct[];
  onChange: (products: InterventionProduct[]) => void;
  availableProducts: Product[];
}

export function InterventionProductsEditor({
  products,
  onChange,
  availableProducts,
}: InterventionProductsEditorProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(availableProducts.map((p) => p.category));
    return Array.from(cats).sort();
  }, [availableProducts]);

  // Filter available products (exclude already added ones)
  const availableToAdd = useMemo(() => {
    const addedIds = new Set(products.map((p) => p.productId));
    return availableProducts.filter((p) => !addedIds.has(p.id));
  }, [availableProducts, products]);

  // Filter products for selection
  const filteredProducts = useMemo(() => {
    return availableToAdd.filter((product) => {
      const matchesSearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [availableToAdd, searchTerm, selectedCategory]);

  // Get product details
  const getProduct = useCallback(
    (productId: string) => {
      return availableProducts.find((p) => p.id === productId);
    },
    [availableProducts]
  );

  // Add product
  const handleAddProduct = useCallback(
    (productId: string) => {
      const newProduct: InterventionProduct = {
        productId,
        quantity: 1,
        isOptional: false,
      };
      onChange([...products, newProduct]);
    },
    [products, onChange]
  );

  // Remove product
  const handleRemove = useCallback(
    (index: number) => {
      onChange(products.filter((_, i) => i !== index));
    },
    [products, onChange]
  );

  // Update quantity
  const handleQuantityChange = useCallback(
    (index: number, quantity: number) => {
      const updated = [...products];
      updated[index] = { ...updated[index], quantity };
      onChange(updated);
    },
    [products, onChange]
  );

  // Toggle optional
  const handleToggleOptional = useCallback(
    (index: number) => {
      const updated = [...products];
      updated[index] = { ...updated[index], isOptional: !updated[index].isOptional };
      onChange(updated);
    },
    [products, onChange]
  );

  // Drag and drop handlers
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...products];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);
    onChange(updated);
    setDraggedIndex(index);
  }, [draggedIndex, products, onChange]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate total cost
  const totalCost = useMemo(() => {
    return products.reduce((sum, item) => {
      const product = getProduct(item.productId);
      return sum + (product ? product.unitCost * item.quantity : 0);
    }, 0);
  }, [products, getProduct]);

  return (
    <div className="intervention-products-editor">
      {/* Selected Products List */}
      <div className="card bg-light border-0 mb-3">
        <div className="card-body">
          {products.length === 0 ? (
            <div className="text-center py-4">
              <div className="avatar avatar-lg bg-white rounded-circle mx-auto mb-3">
                <i className="ti ti-package fs-32 text-muted"></i>
              </div>
              <h6 className="fw-semibold mb-2">Niciun produs adaugat</h6>
              <p className="text-muted small mb-3">
                Adauga produsele necesare pentru aceasta interventie
              </p>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                <i className="ti ti-plus me-2"></i>
                Adauga Primul Produs
              </button>
            </div>
          ) : (
            <>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-semibold mb-0">
                  Produse Selectate ({products.length})
                </h6>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => setShowAddModal(true)}
                >
                  <i className="ti ti-plus me-2"></i>
                  Adauga Produs
                </button>
              </div>

              <div className="table-responsive">
                <table className="table table-sm table-hover bg-white mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: '30px' }}></th>
                      <th>Produs</th>
                      <th style={{ width: '120px' }}>Cantitate</th>
                      <th style={{ width: '100px' }}>Cost Unit.</th>
                      <th style={{ width: '100px' }}>Cost Total</th>
                      <th style={{ width: '80px' }}>Optional</th>
                      <th style={{ width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((item, index) => {
                      const product = getProduct(item.productId);
                      if (!product) return null;

                      const itemTotal = product.unitCost * item.quantity;
                      const isLowStock = product.stockQty < product.minQty;

                      return (
                        <tr
                          key={`${item.productId}-${index}`}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                          className={draggedIndex === index ? 'opacity-50' : ''}
                          style={{ cursor: 'move' }}
                        >
                          <td>
                            <i className="ti ti-grip-vertical text-muted"></i>
                          </td>
                          <td>
                            <div className="d-flex flex-column">
                              <span className="fw-medium">{product.name}</span>
                              <div className="d-flex align-items-center gap-2">
                                <small className="text-muted">{product.code}</small>
                                {isLowStock && (
                                  <Badge variant="soft-warning" size="sm">
                                    <i className="ti ti-alert-triangle"></i> Stoc scazut
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="input-group input-group-sm">
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                  handleQuantityChange(index, Math.max(0.1, item.quantity - 0.5))
                                }
                              >
                                <i className="ti ti-minus"></i>
                              </button>
                              <input
                                type="number"
                                className="form-control text-center"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(index, parseFloat(e.target.value) || 0)
                                }
                                min="0.1"
                                step="0.5"
                                style={{ maxWidth: '60px' }}
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => handleQuantityChange(index, item.quantity + 0.5)}
                              >
                                <i className="ti ti-plus"></i>
                              </button>
                            </div>
                          </td>
                          <td className="text-muted small">
                            {formatCurrency(product.unitCost)}
                            <div className="text-muted" style={{ fontSize: '10px' }}>
                              / {product.uom}
                            </div>
                          </td>
                          <td className="fw-semibold">{formatCurrency(itemTotal)}</td>
                          <td>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={item.isOptional}
                                onChange={() => handleToggleOptional(index)}
                                id={`optional-${index}`}
                              />
                              <label className="form-check-label" htmlFor={`optional-${index}`}>
                                <span className="visually-hidden">Optional</span>
                              </label>
                            </div>
                          </td>
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
                      <td colSpan={3} className="fw-bold text-warning">
                        {formatCurrency(totalCost)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

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
                Adauga Produs
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowAddModal(false)}
                aria-label="Inchide"
              ></button>
            </div>

            <div className="modal-body">
              {/* Filters */}
              <div className="row g-3 mb-4">
                <div className="col-md-8">
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
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Toate Categoriile</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Products List */}
              <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th>Cod</th>
                      <th>Produs</th>
                      <th>Categorie</th>
                      <th>Stoc</th>
                      <th>Pret</th>
                      <th className="text-end">Actiune</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          <i className="ti ti-package-off fs-48 text-muted mb-2"></i>
                          <div className="text-muted">Niciun produs disponibil</div>
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
                              <div className="d-flex flex-column">
                                <span className="fw-medium">{product.name}</span>
                                {product.manufacturer && (
                                  <small className="text-muted">{product.manufacturer}</small>
                                )}
                              </div>
                            </td>
                            <td>
                              <Badge variant="soft-info" size="sm">
                                {product.category}
                              </Badge>
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
                                onClick={() => {
                                  handleAddProduct(product.id);
                                  setShowAddModal(false);
                                  setSearchTerm('');
                                  setSelectedCategory('');
                                }}
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
                  setSelectedCategory('');
                }}
              >
                Inchide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InterventionProductsEditor;
