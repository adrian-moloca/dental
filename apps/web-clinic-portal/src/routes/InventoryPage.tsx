/**
 * Inventory Page - Preclinic-style
 *
 * Product catalog and stock management with stats, filters, and table view.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts, useDeductStock, useRestockItem } from '../hooks/useInventory';
import { AppShell } from '../components/layout/AppShell';
import {
  Card,
  CardBody,
  Button,
  Badge,
  SearchInput,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  TableActions,
  ActionButton,
  TableEmpty,
  DataTableHeader,
  StatsCard,
  Modal,
  Input,
} from '../components/ui-new';

type ProductStatus = 'active' | 'inactive' | 'discontinued';
type StockStatus = 'normal' | 'low' | 'out' | 'expiring';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description?: string;
  unitPrice: number;
  currency: string;
  stock: {
    current: number;
    available: number;
    reserved: number;
    reorderLevel: number;
  };
  status: ProductStatus;
  expiryDate?: string;
}

export function InventoryPage() {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [stockStatusFilter, setStockStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Stock adjustment modal state
  const [adjustmentModal, setAdjustmentModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');
  const [adjustmentQty, setAdjustmentQty] = useState('');
  const [adjustmentNotes, setAdjustmentNotes] = useState('');

  const { data, isLoading, error, refetch } = useProducts({
    category: categoryFilter || undefined,
    search: searchQuery || undefined,
  });

  const deductStock = useDeductStock();
  const restockItem = useRestockItem();

  const products: Product[] = data?.data?.data || [];

  // Calculate stats
  const totalProducts = products.length;
  const stockValue = products.reduce((sum, p) => sum + p.unitPrice * p.stock.current, 0);
  const lowStockCount = products.filter((p) => p.stock.available <= p.stock.reorderLevel && p.stock.available > 0).length;
  const outOfStockCount = products.filter((p) => p.stock.available === 0).length;
  const expiringCount = products.filter((p) => {
    if (!p.expiryDate) return false;
    const daysUntilExpiry = Math.floor(
      (new Date(p.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
  }).length;

  // Get stock status for a product
  const getStockStatus = (product: Product): StockStatus => {
    if (product.stock.available === 0) return 'out';
    if (product.stock.available <= product.stock.reorderLevel) return 'low';
    if (product.expiryDate) {
      const daysUntilExpiry = Math.floor(
        (new Date(product.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilExpiry >= 0 && daysUntilExpiry <= 30) return 'expiring';
    }
    return 'normal';
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Category filter
    if (categoryFilter && product.category !== categoryFilter) return false;

    // Stock status filter
    if (stockStatusFilter) {
      const status = getStockStatus(product);
      if (stockStatusFilter === 'low' && status !== 'low') return false;
      if (stockStatusFilter === 'out' && status !== 'out') return false;
      if (stockStatusFilter === 'expiring' && status !== 'expiring') return false;
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Stock status badge helper
  const getStockStatusBadge = (product: Product) => {
    const status = getStockStatus(product);

    switch (status) {
      case 'out':
        return (
          <Badge variant="soft-danger">
            Epuizat
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="soft-warning">
            Stoc Scazut
          </Badge>
        );
      case 'expiring':
        return (
          <Badge variant="soft-warning">
            Expira Curand
          </Badge>
        );
      default:
        return (
          <Badge variant="soft-success">
            Normal
          </Badge>
        );
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'RON') => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Handle stock adjustment
  const handleOpenAdjustment = (product: Product, type: 'add' | 'remove') => {
    setSelectedProduct(product);
    setAdjustmentType(type);
    setAdjustmentQty('');
    setAdjustmentNotes('');
    setAdjustmentModal(true);
  };

  const handleSubmitAdjustment = async () => {
    if (!selectedProduct || !adjustmentQty) return;

    const qty = parseInt(adjustmentQty);
    if (isNaN(qty) || qty <= 0) return;

    try {
      if (adjustmentType === 'add') {
        await restockItem.mutateAsync({
          productId: selectedProduct.id,
          quantity: qty,
          locationId: 'default',
          reason: adjustmentNotes || undefined,
        });
      } else {
        await deductStock.mutateAsync({
          items: [{
            productId: selectedProduct.id,
            quantity: qty,
          }],
          reference: adjustmentNotes || undefined,
        });
      }
      setAdjustmentModal(false);
      setSelectedProduct(null);
    } catch {
      // Error handled by mutation
    }
  };

  // Stock status filter buttons
  const stockFilters = [
    { key: '', label: 'Toate', icon: 'ti ti-box', count: totalProducts },
    { key: 'low', label: 'Stoc Scazut', icon: 'ti ti-alert-triangle', count: lowStockCount },
    { key: 'out', label: 'Epuizat', icon: 'ti ti-circle-x', count: outOfStockCount },
    { key: 'expiring', label: 'Expira Curand', icon: 'ti ti-clock-alert', count: expiringCount },
  ];

  // Categories (in a real app, this would come from API)
  const categories = [
    { value: '', label: 'Toate Categoriile' },
    { value: 'materials', label: 'Materiale Dentare' },
    { value: 'instruments', label: 'Instrumente' },
    { value: 'equipment', label: 'Echipamente' },
    { value: 'supplies', label: 'Consumabile' },
    { value: 'drugs', label: 'Medicamente' },
  ];

  // Loading state
  if (isLoading) {
    return (
      <AppShell
        title="Inventar"
        subtitle="Gestioneaza produse si stocuri"
        actions={
          <Button variant="primary" onClick={() => navigate('/inventory/products/new')}>
            <i className="ti ti-plus me-1"></i>
            Produs Nou
          </Button>
        }
      >
        <Card className="shadow-sm">
          <CardBody>
            <div className="placeholder-glow">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="d-flex gap-3 py-3 border-bottom">
                  <span className="placeholder col-2"></span>
                  <span className="placeholder col-3"></span>
                  <span className="placeholder col-2"></span>
                  <span className="placeholder col-2"></span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </AppShell>
    );
  }

  // Error state
  if (error) {
    return (
      <AppShell title="Inventar" subtitle="Gestioneaza produse si stocuri">
        <Card className="shadow-sm border-danger">
          <CardBody className="text-center py-5">
            <div className="avatar avatar-xl bg-danger-transparent rounded-circle mx-auto mb-3">
              <i className="ti ti-alert-circle fs-32 text-danger"></i>
            </div>
            <h5 className="fw-bold mb-2">Eroare la incarcarea produselor</h5>
            <p className="text-muted mb-4">{(error as Error).message}</p>
            <Button variant="primary" onClick={() => refetch()}>
              <i className="ti ti-refresh me-1"></i>
              Reincearca
            </Button>
          </CardBody>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Inventar"
      subtitle="Gestioneaza produse si stocuri"
      actions={
        <Button variant="primary" onClick={() => navigate('/inventory/products/new')}>
          <i className="ti ti-plus me-1"></i>
          Produs Nou
        </Button>
      }
    >
      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            label="Total Produse"
            value={totalProducts.toString()}
            icon="ti ti-box"
            iconColor="primary"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            label="Valoare Stoc"
            value={formatCurrency(stockValue)}
            icon="ti ti-currency-lei"
            iconColor="success"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            label="Stoc Scazut"
            value={lowStockCount.toString()}
            icon="ti ti-alert-triangle"
            iconColor="warning"
            footer={<small className="text-muted">{lowStockCount > 0 ? 'Necesita reaprovizionare' : 'Niveluri normale'}</small>}
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            label="Expirate/Aproape"
            value={expiringCount.toString()}
            icon="ti ti-clock-alert"
            iconColor="danger"
            footer={<small className="text-muted">{expiringCount > 0 ? 'Sub 30 de zile' : 'Nicio expirare'}</small>}
          />
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-sm mb-4">
        <CardBody className="py-3">
          <div className="row g-3 align-items-center">
            {/* Stock Status Filters */}
            <div className="col-12 col-lg-auto">
              <div className="d-flex flex-wrap gap-2">
                {stockFilters.map((filter) => (
                  <Button
                    key={filter.key}
                    variant={stockStatusFilter === filter.key ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setStockStatusFilter(filter.key)}
                  >
                    <i className={`ti ${filter.icon} me-1`}></i>
                    {filter.label}
                    {filter.count > 0 && (
                      <span className="badge bg-white text-primary ms-2">{filter.count}</span>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="col-12 col-md-6 col-lg-auto ms-lg-auto">
              <select
                className="form-select form-select-sm"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="col-12 col-md-6 col-lg-auto">
              <SearchInput
                placeholder="Cauta produs sau cod..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                style={{ minWidth: 240 }}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Products Table */}
      <Card className="shadow-sm">
        <DataTableHeader
          title="Lista Produse"
          subtitle={`${filteredProducts.length} produse`}
          actions={
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" size="sm">
                <i className="ti ti-download me-1"></i>
                Export
              </Button>
              <Button variant="outline-secondary" size="sm">
                <i className="ti ti-file-invoice me-1"></i>
                Comenzi Cumparare
              </Button>
            </div>
          }
        />

        <CardBody className="p-0">
          {filteredProducts.length === 0 ? (
            <TableEmpty
              icon="ti ti-box-off"
              title={
                searchQuery || categoryFilter || stockStatusFilter
                  ? 'Niciun produs gasit'
                  : 'Niciun produs inregistrat'
              }
              description={
                searchQuery || categoryFilter || stockStatusFilter
                  ? 'Incearca sa modifici filtrele sau cautarea'
                  : 'Adauga primul produs pentru a incepe'
              }
              action={
                !searchQuery && !categoryFilter && !stockStatusFilter && (
                  <Button variant="primary" onClick={() => navigate('/inventory/products/new')}>
                    <i className="ti ti-plus me-1"></i>
                    Adauga Produs
                  </Button>
                )
              }
            />
          ) : (
            <Table hover>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Produs</TableHeaderCell>
                  <TableHeaderCell>Categorie</TableHeaderCell>
                  <TableHeaderCell className="text-end">Cantitate</TableHeaderCell>
                  <TableHeaderCell className="text-end">Nivel Minim</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell className="text-end">Pret Unitar</TableHeaderCell>
                  <TableHeaderCell style={{ width: 140 }}>Actiuni</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/inventory/products/${product.id}`)}
                  >
                    {/* Product Name */}
                    <TableCell>
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar avatar-sm bg-primary-transparent rounded">
                          <i className="ti ti-box text-primary"></i>
                        </div>
                        <div>
                          <h6 className="mb-0 fw-semibold">{product.name}</h6>
                          <small className="text-muted">Cod: {product.sku}</small>
                        </div>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <span className="text-capitalize">
                        {categories.find((c) => c.value === product.category)?.label || product.category}
                      </span>
                    </TableCell>

                    {/* Quantity on Hand */}
                    <TableCell className="text-end">
                      <div>
                        <span
                          className={`fw-semibold ${
                            product.stock.available <= product.stock.reorderLevel
                              ? product.stock.available === 0
                                ? 'text-danger'
                                : 'text-warning'
                              : 'text-dark'
                          }`}
                        >
                          {product.stock.available}
                        </span>
                        {product.stock.reserved > 0 && (
                          <small className="d-block text-muted">{product.stock.reserved} rezervat</small>
                        )}
                      </div>
                    </TableCell>

                    {/* Min Quantity */}
                    <TableCell className="text-end">
                      <span className="text-muted">{product.stock.reorderLevel}</span>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>{getStockStatusBadge(product)}</TableCell>

                    {/* Unit Price */}
                    <TableCell className="text-end">
                      <span className="fw-semibold">{formatCurrency(product.unitPrice, product.currency)}</span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <TableActions>
                        <ActionButton
                          icon="ti ti-eye"
                          actionType="view"
                          tooltip="Vezi detalii"
                          onClick={() => navigate(`/inventory/products/${product.id}`)}
                        />
                        <ActionButton
                          icon="ti ti-plus"
                          actionType="default"
                          tooltip="Adauga stoc"
                          onClick={() => handleOpenAdjustment(product, 'add')}
                        />
                        <ActionButton
                          icon="ti ti-minus"
                          actionType="default"
                          tooltip="Scade stoc"
                          onClick={() => handleOpenAdjustment(product, 'remove')}
                        />
                        <ActionButton
                          icon="ti ti-edit"
                          actionType="edit"
                          tooltip="Editeaza"
                          onClick={() => navigate(`/inventory/products/${product.id}/edit`)}
                        />
                      </TableActions>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Stock Adjustment Modal */}
      <Modal
        open={adjustmentModal}
        onClose={() => setAdjustmentModal(false)}
        title={adjustmentType === 'add' ? 'Adauga Stoc' : 'Scade Stoc'}
        icon={adjustmentType === 'add' ? 'ti ti-plus' : 'ti ti-minus'}
        size="md"
        footer={
          <div className="d-flex gap-2 justify-content-end">
            <Button variant="light" onClick={() => setAdjustmentModal(false)}>
              Anuleaza
            </Button>
            <Button
              variant={adjustmentType === 'add' ? 'success' : 'warning'}
              onClick={handleSubmitAdjustment}
              disabled={!adjustmentQty || parseInt(adjustmentQty) <= 0}
            >
              <i className={`ti ti-${adjustmentType === 'add' ? 'check' : 'minus'} me-1`}></i>
              {adjustmentType === 'add' ? 'Adauga' : 'Scade'}
            </Button>
          </div>
        }
      >
        {selectedProduct && (
          <div className="space-y-4">
            {/* Product Info */}
            <div className="bg-light rounded p-3">
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="avatar avatar-sm bg-primary-transparent rounded">
                  <i className="ti ti-box text-primary"></i>
                </div>
                <div>
                  <h6 className="mb-0 fw-semibold">{selectedProduct.name}</h6>
                  <small className="text-muted">Cod: {selectedProduct.sku}</small>
                </div>
              </div>
              <div className="row g-2 mt-2">
                <div className="col-6">
                  <small className="text-muted d-block">Stoc Curent</small>
                  <span className="fw-bold">{selectedProduct.stock.available}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Nivel Minim</small>
                  <span className="fw-bold">{selectedProduct.stock.reorderLevel}</span>
                </div>
              </div>
            </div>

            {/* Adjustment Type */}
            <div>
              <label className="form-label fw-semibold">Tip Ajustare</label>
              <div className="d-flex gap-2">
                <Button
                  variant={adjustmentType === 'add' ? 'success' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setAdjustmentType('add')}
                  className="flex-1"
                >
                  <i className="ti ti-plus me-1"></i>
                  Adauga Stoc
                </Button>
                <Button
                  variant={adjustmentType === 'remove' ? 'warning' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setAdjustmentType('remove')}
                  className="flex-1"
                >
                  <i className="ti ti-minus me-1"></i>
                  Scade Stoc
                </Button>
              </div>
            </div>

            {/* Quantity Input */}
            <Input
              label="Cantitate"
              type="number"
              min="1"
              placeholder="Introdu cantitatea"
              value={adjustmentQty}
              onChange={(e) => setAdjustmentQty(e.target.value)}
              required
              helperText={
                adjustmentQty && parseInt(adjustmentQty) > 0
                  ? `Stoc nou: ${
                      adjustmentType === 'add'
                        ? selectedProduct.stock.available + parseInt(adjustmentQty)
                        : selectedProduct.stock.available - parseInt(adjustmentQty)
                    }`
                  : undefined
              }
            />

            {/* Notes */}
            <div className="form-group">
              <label htmlFor="adjustment-notes" className="form-label">
                Motiv/Notite
              </label>
              <textarea
                id="adjustment-notes"
                className="form-control"
                rows={3}
                placeholder="Adauga o notita despre aceasta ajustare (optional)"
                value={adjustmentNotes}
                onChange={(e) => setAdjustmentNotes(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}

export default InventoryPage;
