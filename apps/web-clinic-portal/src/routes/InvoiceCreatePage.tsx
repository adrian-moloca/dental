/**
 * Invoice Create Page - Comprehensive Invoice Creation
 *
 * Full-featured invoice creation page with:
 * - Patient selection with autocomplete
 * - Line items with service catalog integration
 * - Discount and VAT calculation (19% Romania)
 * - Payment section with partial payments
 * - E-Factura ANAF integration (UI)
 * - Draft/Issue/Print/Email actions
 *
 * Romanian accounting terms and RON currency.
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePatients, usePatient, usePatientBalance } from '../hooks/usePatients';
import { useCreateInvoice, useIssueInvoice } from '../hooks/useBilling';
import { AppShell } from '../components/layout/AppShell';
import { Breadcrumb, type BreadcrumbItem } from '../components/ui-new/Breadcrumb';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Modal,
} from '../components/ui-new';
import toast from 'react-hot-toast';
import { debounce } from '../utils/debounce';

// ============================================================================
// Types
// ============================================================================

interface InvoiceLineItem {
  id: string;
  itemType: 'treatment' | 'product' | 'service';
  itemCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxRate: number;
  treatmentPlanItemId?: string;
}

interface PatientInfo {
  id: string;
  firstName: string;
  lastName: string;
  cnp?: string;
  address?: string;
  phone?: string;
  email?: string;
}

type PaymentMethod = 'cash' | 'card' | 'bank_transfer';
type DiscountType = 'percent' | 'fixed';

interface InvoiceFormData {
  // Header
  invoiceSeries: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;

  // Patient
  patientId: string;
  patientInfo: PatientInfo | null;

  // Line Items
  items: InvoiceLineItem[];

  // Totals
  discountType: DiscountType;
  globalDiscountPercent: number;
  globalDiscountAmount: number;
  taxRate: number;

  // Payment
  paymentMethod: PaymentMethod;
  enablePartialPayment: boolean;
  amountPaid: number;

  // Notes
  notes: string;

  // E-Factura
  sendToAnaf: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TAX_RATE = 19; // Romania VAT
const DEFAULT_INVOICE_SERIES = 'FAC';

// Mock service catalog - in production from API
const SERVICE_CATALOG = [
  { id: '1', code: 'D0120', name: 'Evaluare Orala Periodica', type: 'treatment' as const, price: 150, category: 'Diagnostic' },
  { id: '2', code: 'D0150', name: 'Evaluare Orala Completa', type: 'treatment' as const, price: 250, category: 'Diagnostic' },
  { id: '3', code: 'D0210', name: 'Radiografie Intraorala - Serie Completa', type: 'treatment' as const, price: 350, category: 'Radiologie' },
  { id: '4', code: 'D0220', name: 'Radiografie Intraorala - Periapicala', type: 'treatment' as const, price: 80, category: 'Radiologie' },
  { id: '5', code: 'D1110', name: 'Profilaxie - Adult', type: 'treatment' as const, price: 200, category: 'Preventiv' },
  { id: '6', code: 'D1120', name: 'Profilaxie - Copil', type: 'treatment' as const, price: 150, category: 'Preventiv' },
  { id: '7', code: 'D1206', name: 'Aplicare Fluor', type: 'treatment' as const, price: 100, category: 'Preventiv' },
  { id: '8', code: 'D2140', name: 'Obturatie Amalgam - O Suprafata', type: 'treatment' as const, price: 300, category: 'Restaurativ' },
  { id: '9', code: 'D2150', name: 'Obturatie Amalgam - Doua Suprafete', type: 'treatment' as const, price: 400, category: 'Restaurativ' },
  { id: '10', code: 'D2330', name: 'Obturatie Compozit - O Suprafata', type: 'treatment' as const, price: 350, category: 'Restaurativ' },
  { id: '11', code: 'D2740', name: 'Coroana Ceramica', type: 'treatment' as const, price: 2500, category: 'Restaurativ' },
  { id: '12', code: 'D3310', name: 'Tratament de Canal - Dinte Anterior', type: 'treatment' as const, price: 1500, category: 'Endodontie' },
  { id: '13', code: 'D3320', name: 'Tratament de Canal - Premolar', type: 'treatment' as const, price: 1800, category: 'Endodontie' },
  { id: '14', code: 'D4341', name: 'Chiuretaj Parodontal - Per Cadran', type: 'treatment' as const, price: 500, category: 'Parodontologie' },
  { id: '15', code: 'D7140', name: 'Extractie Simpla', type: 'treatment' as const, price: 400, category: 'Chirurgie' },
  { id: '16', code: 'D7210', name: 'Extractie Chirurgicala', type: 'treatment' as const, price: 700, category: 'Chirurgie' },
  { id: '17', code: 'P001', name: 'Periuta Electrica', type: 'product' as const, price: 120, category: 'Produse' },
  { id: '18', code: 'P002', name: 'Pasta de Dinti cu Fluor', type: 'product' as const, price: 25, category: 'Produse' },
  { id: '19', code: 'P003', name: 'Ata Dentara', type: 'product' as const, price: 15, category: 'Produse' },
  { id: '20', code: 'S001', name: 'Consultatie de Urgenta', type: 'service' as const, price: 200, category: 'Servicii' },
  { id: '21', code: 'S002', name: 'Sedare (per ora)', type: 'service' as const, price: 500, category: 'Servicii' },
];

// ============================================================================
// Utility Functions
// ============================================================================

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(5, '0');
  return `${year}-${randomPart}`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ro-RO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' RON';
}

function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

function calculateLineTotal(item: InvoiceLineItem): {
  subtotal: number;
  discount: number;
  afterDiscount: number;
  tax: number;
  total: number;
} {
  const subtotal = roundToTwo(item.quantity * item.unitPrice);
  const discountFromPercent = roundToTwo(subtotal * (item.discountPercent / 100));
  const discount = roundToTwo(discountFromPercent + item.discountAmount);
  const afterDiscount = roundToTwo(Math.max(0, subtotal - discount));
  const tax = roundToTwo(afterDiscount * (item.taxRate / 100));
  const total = roundToTwo(afterDiscount + tax);

  return { subtotal, discount, afterDiscount, tax, total };
}

// ============================================================================
// Main Component
// ============================================================================

export function InvoiceCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');

  // Form State
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceSeries: DEFAULT_INVOICE_SERIES,
    invoiceNumber: generateInvoiceNumber(),
    issueDate: today,
    dueDate: thirtyDaysLater,
    patientId: preselectedPatientId || '',
    patientInfo: null,
    items: [],
    discountType: 'percent',
    globalDiscountPercent: 0,
    globalDiscountAmount: 0,
    taxRate: DEFAULT_TAX_RATE,
    paymentMethod: 'cash',
    enablePartialPayment: false,
    amountPaid: 0,
    notes: '',
    sendToAnaf: false,
  });

  // UI State
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [debouncedPatientQuery, setDebouncedPatientQuery] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [selectedServiceCategory, setSelectedServiceCategory] = useState('all');
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const patientSearchRef = useRef<HTMLDivElement>(null);

  // API Hooks
  const { data: patientsData, isLoading: patientsLoading } = usePatients({
    search: debouncedPatientQuery,
    limit: 10,
  });
  const patients = patientsData?.data || [];

  const { data: preselectedPatientData } = usePatient(preselectedPatientId || undefined);
  const { data: patientBalanceData } = usePatientBalance(formData.patientId || undefined);

  const createInvoiceMutation = useCreateInvoice();
  const issueInvoiceMutation = useIssueInvoice();

  // Debounced patient search
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setDebouncedPatientQuery(query);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(patientSearchQuery);
  }, [patientSearchQuery, debouncedSearch]);

  // Set preselected patient
  useEffect(() => {
    if (preselectedPatientData?.data && !formData.patientInfo) {
      const patient = preselectedPatientData.data;
      setFormData((prev) => ({
        ...prev,
        patientId: patient.id,
        patientInfo: {
          id: patient.id,
          firstName: patient.firstName || patient.person?.firstName || '',
          lastName: patient.lastName || patient.person?.lastName || '',
          cnp: patient.person?.cnp,
          address: patient.address?.street
            ? `${patient.address.street}, ${patient.address.city || ''}`
            : undefined,
          phone: patient.phones?.[0]?.number,
          email: patient.emails?.[0]?.address,
        },
      }));
    }
  }, [preselectedPatientData, formData.patientInfo]);

  // Close patient dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (patientSearchRef.current && !patientSearchRef.current.contains(event.target as Node)) {
        setShowPatientDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================================================
  // Calculations
  // ============================================================================

  const totals = useMemo(() => {
    let subtotal = 0;
    let lineDiscounts = 0;
    let taxTotal = 0;

    formData.items.forEach((item) => {
      const line = calculateLineTotal(item);
      subtotal += line.subtotal;
      lineDiscounts += line.discount;
      taxTotal += line.tax;
    });

    const afterLineDiscounts = roundToTwo(subtotal - lineDiscounts);

    // Apply global discount
    let globalDiscount = 0;
    if (formData.discountType === 'percent') {
      globalDiscount = roundToTwo(afterLineDiscounts * (formData.globalDiscountPercent / 100));
    } else {
      globalDiscount = roundToTwo(formData.globalDiscountAmount);
    }

    const afterGlobalDiscount = roundToTwo(Math.max(0, afterLineDiscounts - globalDiscount));

    // Recalculate tax on discounted amount if global discount applied
    let finalTax = taxTotal;
    if (globalDiscount > 0) {
      // Proportionally reduce tax based on global discount
      const discountRatio = afterGlobalDiscount / afterLineDiscounts;
      finalTax = roundToTwo(taxTotal * discountRatio);
    }

    const totalDiscounts = roundToTwo(lineDiscounts + globalDiscount);
    const total = roundToTwo(afterGlobalDiscount + finalTax);
    const balance = roundToTwo(total - formData.amountPaid);

    return {
      subtotal,
      lineDiscounts,
      globalDiscount,
      totalDiscounts,
      taxTotal: finalTax,
      total,
      amountPaid: formData.amountPaid,
      balance: Math.max(0, balance),
    };
  }, [formData.items, formData.discountType, formData.globalDiscountPercent, formData.globalDiscountAmount, formData.amountPaid]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handlePatientSelect = (patient: any) => {
    setFormData((prev) => ({
      ...prev,
      patientId: patient.id,
      patientInfo: {
        id: patient.id,
        firstName: patient.firstName || patient.person?.firstName || '',
        lastName: patient.lastName || patient.person?.lastName || '',
        cnp: patient.person?.cnp,
        address: patient.address?.street
          ? `${patient.address.street}, ${patient.address.city || ''}`
          : undefined,
        phone: patient.phones?.[0]?.number,
        email: patient.emails?.[0]?.address,
      },
    }));
    setPatientSearchQuery('');
    setShowPatientDropdown(false);
  };

  const handleClearPatient = () => {
    setFormData((prev) => ({
      ...prev,
      patientId: '',
      patientInfo: null,
    }));
  };

  const handleAddLineItem = () => {
    const newItem: InvoiceLineItem = {
      id: crypto.randomUUID(),
      itemType: 'treatment',
      itemCode: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
      discountAmount: 0,
      taxRate: formData.taxRate,
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleAddFromCatalog = (catalogItem: typeof SERVICE_CATALOG[0]) => {
    const newItem: InvoiceLineItem = {
      id: crypto.randomUUID(),
      itemType: catalogItem.type,
      itemCode: catalogItem.code,
      description: catalogItem.name,
      quantity: 1,
      unitPrice: catalogItem.price,
      discountPercent: 0,
      discountAmount: 0,
      taxRate: formData.taxRate,
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
    setShowServiceModal(false);
  };

  const handleUpdateLineItem = (id: string, updates: Partial<InvoiceLineItem>) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }));
  };

  const handleRemoveLineItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    const newItems = [...formData.items];
    const draggedItem = newItems[draggedItemIndex];
    newItems.splice(draggedItemIndex, 1);
    newItems.splice(index, 0, draggedItem);

    setFormData((prev) => ({ ...prev, items: newItems }));
    setDraggedItemIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  const handleSaveDraft = async () => {
    if (!formData.patientId) {
      toast.error('Va rugam selectati un pacient');
      return;
    }

    if (formData.items.length === 0) {
      toast.error('Va rugam adaugati cel putin un articol');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildInvoicePayload('draft');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await createInvoiceMutation.mutateAsync(payload as any);
      toast.success('Ciorna salvata cu succes!');
      navigate(`/billing/invoices/${result.data.id}`);
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('Eroare la salvarea ciornei');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIssueInvoice = async () => {
    if (!formData.patientId) {
      toast.error('Va rugam selectati un pacient');
      return;
    }

    if (formData.items.length === 0) {
      toast.error('Va rugam adaugati cel putin un articol');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildInvoicePayload('issued');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await createInvoiceMutation.mutateAsync(payload as any);

      // Issue the invoice
      await issueInvoiceMutation.mutateAsync(result.data.id);

      toast.success('Factura emisa cu succes!');
      navigate(`/billing/invoices/${result.data.id}`);
    } catch (error) {
      console.error('Failed to issue invoice:', error);
      toast.error('Eroare la emiterea facturii');
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildInvoicePayload = (status: 'draft' | 'issued'): Record<string, unknown> => {
    // Build items array - API will assign IDs on creation
    const items = formData.items.map((item) => {
      const lineCalc = calculateLineTotal(item);
      return {
        // Note: id is omitted - will be assigned by the server
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: lineCalc.total,
        procedureCode: item.itemType === 'treatment' ? item.itemCode : undefined,
        // Extended fields for creation
        itemCode: item.itemCode,
        itemType: item.itemType,
        discountPercent: item.discountPercent,
        discountAmount: lineCalc.discount,
        taxRate: item.taxRate,
        treatmentPlanItemId: item.treatmentPlanItemId,
      };
    });

    return {
      patientId: formData.patientId,
      invoiceNumber: `${formData.invoiceSeries}-${formData.invoiceNumber}`,
      series: formData.invoiceSeries,
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      status,
      currency: 'RON',
      items,
      subtotal: totals.subtotal,
      discountAmount: totals.totalDiscounts,
      taxAmount: totals.taxTotal,
      total: totals.total,
      amountPaid: formData.amountPaid,
      balance: totals.balance,
      notes: formData.notes,
      paymentTerms: 'net_30',
      eFactura: formData.sendToAnaf
        ? {
            status: 'pending',
          }
        : undefined,
    };
  };

  const handlePrint = () => {
    toast('Functionalitatea de printare va fi disponibila in curand', { icon: 'i' });
  };

  const handleSendEmail = () => {
    toast('Functionalitatea de email va fi disponibila in curand', { icon: 'i' });
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/billing');
    }
  };

  // ============================================================================
  // Service Catalog Filter
  // ============================================================================

  const serviceCategories = useMemo(() => {
    const cats = new Set(SERVICE_CATALOG.map((item) => item.category));
    return ['all', ...Array.from(cats)];
  }, []);

  const filteredServices = useMemo(() => {
    return SERVICE_CATALOG.filter((item) => {
      const matchesSearch =
        serviceSearchQuery === '' ||
        item.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(serviceSearchQuery.toLowerCase());

      const matchesCategory =
        selectedServiceCategory === 'all' || item.category === selectedServiceCategory;

      return matchesSearch && matchesCategory;
    });
  }, [serviceSearchQuery, selectedServiceCategory]);

  // ============================================================================
  // Breadcrumb
  // ============================================================================

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: 'ti ti-home' },
    { label: 'Facturare', href: '/billing', icon: 'ti ti-file-invoice' },
    { label: 'Factura Noua', icon: 'ti ti-plus' },
  ];

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <AppShell
      title="Factura Noua"
      subtitle="Creeaza o factura pentru pacient"
      actions={
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={handleBack}>
            <i className="ti ti-arrow-left me-1"></i>
            Inapoi
          </Button>
        </div>
      }
    >
      <Breadcrumb items={breadcrumbItems} className="mb-3" />

      <div className="row g-4">
        {/* Main Content */}
        <div className="col-lg-8">
          {/* Header Section */}
          <Card className="shadow-sm mb-4">
            <CardHeader>
              <div className="d-flex align-items-center gap-2">
                <div className="avatar avatar-sm bg-primary-transparent rounded">
                  <i className="ti ti-file-invoice text-primary"></i>
                </div>
                <div>
                  <h5 className="card-title mb-0">Detalii Factura</h5>
                  <small className="text-muted">Informatii de identificare</small>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="row g-3">
                {/* Invoice Series & Number */}
                <div className="col-md-3">
                  <label className="form-label">Seria</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.invoiceSeries}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, invoiceSeries: e.target.value.toUpperCase() }))
                    }
                    placeholder="FAC"
                    maxLength={10}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Numar Factura</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, invoiceNumber: e.target.value }))}
                    placeholder="2024-00001"
                  />
                </div>

                {/* Issue Date */}
                <div className="col-md-3">
                  <label className="form-label">Data Emiterii</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.issueDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, issueDate: e.target.value }))}
                  />
                </div>

                {/* Due Date */}
                <div className="col-md-3">
                  <label className="form-label">Data Scadenta</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.dueDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Patient Selection */}
          <Card className="shadow-sm mb-4">
            <CardHeader>
              <div className="d-flex align-items-center gap-2">
                <div className="avatar avatar-sm bg-info-transparent rounded">
                  <i className="ti ti-user text-info"></i>
                </div>
                <div>
                  <h5 className="card-title mb-0">Pacient</h5>
                  <small className="text-muted">Selecteaza pacientul pentru facturare</small>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {!formData.patientInfo ? (
                <div ref={patientSearchRef} className="position-relative">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="ti ti-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Cauta pacient dupa nume, telefon sau email..."
                      value={patientSearchQuery}
                      onChange={(e) => {
                        setPatientSearchQuery(e.target.value);
                        setShowPatientDropdown(true);
                      }}
                      onFocus={() => setShowPatientDropdown(true)}
                    />
                    {patientsLoading && (
                      <span className="input-group-text">
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                      </span>
                    )}
                  </div>

                  {/* Patient Dropdown */}
                  {showPatientDropdown && patientSearchQuery && (
                    <div className="dropdown-menu show w-100 mt-1 shadow" style={{ maxHeight: 300, overflowY: 'auto' }}>
                      {patients.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                          <i className="ti ti-user-off fs-32 d-block mb-2"></i>
                          <span>Niciun pacient gasit</span>
                        </div>
                      ) : (
                        patients.map((patient: any) => (
                          <button
                            key={patient.id}
                            type="button"
                            className="dropdown-item d-flex align-items-center gap-3 py-2"
                            onClick={() => handlePatientSelect(patient)}
                          >
                            <div className="avatar avatar-sm bg-light rounded-circle">
                              <span className="avatar-text">
                                {patient.firstName?.[0]}
                                {patient.lastName?.[0]}
                              </span>
                            </div>
                            <div className="flex-grow-1">
                              <div className="fw-semibold">
                                {patient.firstName} {patient.lastName}
                              </div>
                              <small className="text-muted">
                                {patient.phones?.[0]?.number || patient.emails?.[0]?.address || 'N/A'}
                              </small>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Patient Info Card */
                <div className="d-flex align-items-start gap-3 p-3 bg-light rounded">
                  <div className="avatar avatar-lg bg-primary-transparent rounded-circle">
                    <span className="avatar-text fs-18">
                      {formData.patientInfo.firstName[0]}
                      {formData.patientInfo.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div>
                        <h6 className="mb-0 fw-bold">
                          {formData.patientInfo.firstName} {formData.patientInfo.lastName}
                        </h6>
                        {formData.patientInfo.cnp && (
                          <small className="text-muted">CNP: {formData.patientInfo.cnp}</small>
                        )}
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        {patientBalanceData?.data?.currentBalance !== undefined &&
                          patientBalanceData.data.currentBalance > 0 && (
                            <Badge variant="soft-warning">
                              <i className="ti ti-alert-triangle me-1"></i>
                              Sold restant: {formatCurrency(patientBalanceData.data.currentBalance)}
                            </Badge>
                          )}
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => navigate(`/patients/${formData.patientId}`)}
                        >
                          <i className="ti ti-external-link"></i>
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={handleClearPatient}>
                          <i className="ti ti-x"></i>
                        </Button>
                      </div>
                    </div>
                    <div className="row g-2 text-muted small">
                      {formData.patientInfo.address && (
                        <div className="col-12">
                          <i className="ti ti-map-pin me-1"></i>
                          {formData.patientInfo.address}
                        </div>
                      )}
                      {formData.patientInfo.phone && (
                        <div className="col-6">
                          <i className="ti ti-phone me-1"></i>
                          {formData.patientInfo.phone}
                        </div>
                      )}
                      {formData.patientInfo.email && (
                        <div className="col-6">
                          <i className="ti ti-mail me-1"></i>
                          {formData.patientInfo.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Line Items Section */}
          <Card className="shadow-sm mb-4">
            <CardHeader>
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <div className="avatar avatar-sm bg-success-transparent rounded">
                    <i className="ti ti-list text-success"></i>
                  </div>
                  <div>
                    <h5 className="card-title mb-0">Articole Factura</h5>
                    <small className="text-muted">{formData.items.length} articole</small>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Button variant="outline-secondary" size="sm" onClick={() => setShowServiceModal(true)}>
                    <i className="ti ti-search me-1"></i>
                    Catalog Servicii
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleAddLineItem}>
                    <i className="ti ti-plus me-1"></i>
                    Adauga Articol
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {formData.items.length === 0 ? (
                <div className="text-center py-5">
                  <div className="avatar avatar-xl bg-light rounded-circle mx-auto mb-3">
                    <i className="ti ti-file-invoice fs-32 text-muted"></i>
                  </div>
                  <h6 className="fw-semibold mb-2">Niciun articol adaugat</h6>
                  <p className="text-muted small mb-3">
                    Adaugati servicii, tratamente sau produse pentru facturare
                  </p>
                  <div className="d-flex gap-2 justify-content-center">
                    <Button variant="outline-secondary" size="sm" onClick={() => setShowServiceModal(true)}>
                      <i className="ti ti-search me-1"></i>
                      Cauta in Catalog
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleAddLineItem}>
                      <i className="ti ti-plus me-1"></i>
                      Adauga Manual
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th style={{ width: 40 }}></th>
                        <th style={{ width: 80 }}>Tip</th>
                        <th style={{ width: 100 }}>Cod</th>
                        <th>Descriere</th>
                        <th style={{ width: 70 }} className="text-center">
                          Cant.
                        </th>
                        <th style={{ width: 120 }} className="text-end">
                          Pret Unitar
                        </th>
                        <th style={{ width: 80 }} className="text-center">
                          Disc. %
                        </th>
                        <th style={{ width: 80 }} className="text-center">
                          TVA %
                        </th>
                        <th style={{ width: 120 }} className="text-end">
                          Total
                        </th>
                        <th style={{ width: 50 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => {
                        const lineCalc = calculateLineTotal(item);
                        return (
                          <tr
                            key={item.id}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={draggedItemIndex === index ? 'bg-light' : ''}
                          >
                            <td>
                              <i
                                className="ti ti-grip-vertical text-muted"
                                style={{ cursor: 'grab' }}
                              ></i>
                            </td>
                            <td>
                              <select
                                className="form-select form-select-sm"
                                value={item.itemType}
                                onChange={(e) =>
                                  handleUpdateLineItem(item.id, {
                                    itemType: e.target.value as InvoiceLineItem['itemType'],
                                  })
                                }
                              >
                                <option value="treatment">Tratament</option>
                                <option value="product">Produs</option>
                                <option value="service">Serviciu</option>
                              </select>
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Cod"
                                value={item.itemCode}
                                onChange={(e) =>
                                  handleUpdateLineItem(item.id, { itemCode: e.target.value })
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Descriere serviciu/produs"
                                value={item.description}
                                onChange={(e) =>
                                  handleUpdateLineItem(item.id, { description: e.target.value })
                                }
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm text-center"
                                min="1"
                                step="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateLineItem(item.id, {
                                    quantity: parseInt(e.target.value) || 1,
                                  })
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm text-end"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  handleUpdateLineItem(item.id, {
                                    unitPrice: parseFloat(e.target.value) || 0,
                                  })
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm text-center"
                                min="0"
                                max="100"
                                step="1"
                                value={item.discountPercent}
                                onChange={(e) =>
                                  handleUpdateLineItem(item.id, {
                                    discountPercent: parseFloat(e.target.value) || 0,
                                  })
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm text-center"
                                min="0"
                                max="100"
                                step="1"
                                value={item.taxRate}
                                onChange={(e) =>
                                  handleUpdateLineItem(item.id, {
                                    taxRate: parseFloat(e.target.value) || 0,
                                  })
                                }
                              />
                            </td>
                            <td className="text-end fw-semibold">{formatCurrency(lineCalc.total)}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-icon btn-outline-danger"
                                onClick={() => handleRemoveLineItem(item.id)}
                                title="Sterge articol"
                              >
                                <i className="ti ti-trash"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Notes Section */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="d-flex align-items-center gap-2">
                <div className="avatar avatar-sm bg-secondary-transparent rounded">
                  <i className="ti ti-notes text-secondary"></i>
                </div>
                <div>
                  <h5 className="card-title mb-0">Observatii</h5>
                  <small className="text-muted">Note aditionale pentru factura</small>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Adaugati observatii sau termeni de plata..."
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              ></textarea>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar - Totals & Actions */}
        <div className="col-lg-4">
          <div className="sticky-top" style={{ top: 90 }}>
            {/* Totals Section */}
            <Card className="shadow-sm mb-4">
              <CardHeader>
                <div className="d-flex align-items-center gap-2">
                  <div className="avatar avatar-sm bg-warning-transparent rounded">
                    <i className="ti ti-calculator text-warning"></i>
                  </div>
                  <h5 className="card-title mb-0">Totaluri</h5>
                </div>
              </CardHeader>
              <CardBody>
                {/* Subtotal */}
                <div className="d-flex justify-content-between py-2">
                  <span className="text-muted">Subtotal</span>
                  <span className="fw-medium">{formatCurrency(totals.subtotal)}</span>
                </div>

                {/* Global Discount */}
                <div className="py-2 border-top">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Discount Global</span>
                    <div className="btn-group btn-group-sm" role="group">
                      <button
                        type="button"
                        className={`btn ${formData.discountType === 'percent' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setFormData((prev) => ({ ...prev, discountType: 'percent' }))}
                      >
                        %
                      </button>
                      <button
                        type="button"
                        className={`btn ${formData.discountType === 'fixed' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setFormData((prev) => ({ ...prev, discountType: 'fixed' }))}
                      >
                        RON
                      </button>
                    </div>
                  </div>
                  <div className="input-group input-group-sm">
                    {formData.discountType === 'percent' ? (
                      <>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          max="100"
                          step="1"
                          value={formData.globalDiscountPercent}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              globalDiscountPercent: parseFloat(e.target.value) || 0,
                            }))
                          }
                        />
                        <span className="input-group-text">%</span>
                      </>
                    ) : (
                      <>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          step="0.01"
                          value={formData.globalDiscountAmount}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              globalDiscountAmount: parseFloat(e.target.value) || 0,
                            }))
                          }
                        />
                        <span className="input-group-text">RON</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Line Discounts */}
                {totals.lineDiscounts > 0 && (
                  <div className="d-flex justify-content-between py-2">
                    <span className="text-muted">Discount pe Articole</span>
                    <span className="text-danger fw-medium">-{formatCurrency(totals.lineDiscounts)}</span>
                  </div>
                )}

                {/* Total Discount */}
                {totals.totalDiscounts > 0 && (
                  <div className="d-flex justify-content-between py-2">
                    <span className="text-muted">Total Reduceri</span>
                    <span className="text-danger fw-medium">-{formatCurrency(totals.totalDiscounts)}</span>
                  </div>
                )}

                {/* TVA */}
                <div className="d-flex justify-content-between py-2 border-top">
                  <span className="text-muted">TVA ({formData.taxRate}%)</span>
                  <span className="fw-medium">{formatCurrency(totals.taxTotal)}</span>
                </div>

                {/* Total */}
                <div className="d-flex justify-content-between py-3 border-top bg-light rounded px-3 mx-n3 mb-n3 mt-2">
                  <span className="fs-18 fw-bold">Total de Plata</span>
                  <span className="fs-18 fw-bold text-primary">{formatCurrency(totals.total)}</span>
                </div>
              </CardBody>
            </Card>

            {/* Payment Section */}
            <Card className="shadow-sm mb-4">
              <CardHeader>
                <div className="d-flex align-items-center gap-2">
                  <div className="avatar avatar-sm bg-success-transparent rounded">
                    <i className="ti ti-cash text-success"></i>
                  </div>
                  <h5 className="card-title mb-0">Plata</h5>
                </div>
              </CardHeader>
              <CardBody>
                {/* Payment Method */}
                <div className="mb-3">
                  <label className="form-label">Metoda de Plata</label>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className={`btn flex-fill ${formData.paymentMethod === 'cash' ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'cash' }))}
                    >
                      <i className="ti ti-cash me-1"></i>
                      Numerar
                    </button>
                    <button
                      type="button"
                      className={`btn flex-fill ${formData.paymentMethod === 'card' ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'card' }))}
                    >
                      <i className="ti ti-credit-card me-1"></i>
                      Card
                    </button>
                    <button
                      type="button"
                      className={`btn flex-fill ${formData.paymentMethod === 'bank_transfer' ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'bank_transfer' }))}
                    >
                      <i className="ti ti-building-bank me-1"></i>
                      Transfer
                    </button>
                  </div>
                </div>

                {/* Partial Payment */}
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="partialPayment"
                      checked={formData.enablePartialPayment}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          enablePartialPayment: e.target.checked,
                          amountPaid: e.target.checked ? prev.amountPaid : 0,
                        }))
                      }
                    />
                    <label className="form-check-label" htmlFor="partialPayment">
                      Plata Partiala
                    </label>
                  </div>
                </div>

                {formData.enablePartialPayment && (
                  <>
                    {/* Amount Paid */}
                    <div className="mb-3">
                      <label className="form-label">Suma Achitata</label>
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          max={totals.total}
                          step="0.01"
                          value={formData.amountPaid}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              amountPaid: Math.min(parseFloat(e.target.value) || 0, totals.total),
                            }))
                          }
                        />
                        <span className="input-group-text">RON</span>
                      </div>
                    </div>

                    {/* Rest de Plata */}
                    <div className="d-flex justify-content-between py-2 bg-warning-transparent rounded px-3">
                      <span className="fw-semibold">Rest de Plata</span>
                      <span className="fw-bold text-warning">{formatCurrency(totals.balance)}</span>
                    </div>
                  </>
                )}
              </CardBody>
            </Card>

            {/* E-Factura Section */}
            <Card className="shadow-sm mb-4">
              <CardHeader>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div className="avatar avatar-sm bg-info-transparent rounded">
                      <i className="ti ti-cloud-upload text-info"></i>
                    </div>
                    <h5 className="card-title mb-0">E-Factura ANAF</h5>
                  </div>
                  <Badge variant={formData.sendToAnaf ? 'soft-success' : 'soft-secondary'}>
                    {formData.sendToAnaf ? 'Activ' : 'Inactiv'}
                  </Badge>
                </div>
              </CardHeader>
              <CardBody>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="sendToAnaf"
                    checked={formData.sendToAnaf}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, sendToAnaf: e.target.checked }))
                    }
                  />
                  <label className="form-check-label" htmlFor="sendToAnaf">
                    Trimite la ANAF dupa emitere
                  </label>
                </div>
                {formData.sendToAnaf && (
                  <div className="alert alert-info small mb-0 py-2">
                    <i className="ti ti-info-circle me-1"></i>
                    Factura va fi transmisa automat catre sistemul E-Factura dupa emitere.
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Action Buttons */}
            <Card className="shadow-sm">
              <CardBody>
                <div className="d-grid gap-2">
                  {/* Primary Actions */}
                  <Button
                    variant="primary"
                    block
                    onClick={handleIssueInvoice}
                    loading={isSubmitting}
                    disabled={isSubmitting || !formData.patientId || formData.items.length === 0}
                  >
                    <i className="ti ti-send me-2"></i>
                    Emite Factura
                  </Button>

                  <Button
                    variant="outline-primary"
                    block
                    onClick={handleSaveDraft}
                    loading={isSubmitting}
                    disabled={isSubmitting || !formData.patientId || formData.items.length === 0}
                  >
                    <i className="ti ti-device-floppy me-2"></i>
                    Salveaza Ciorna
                  </Button>

                  <hr className="my-2" />

                  {/* Secondary Actions */}
                  <div className="d-flex gap-2">
                    <Button variant="outline-secondary" className="flex-fill" onClick={handlePrint}>
                      <i className="ti ti-printer me-1"></i>
                      Printeaza
                    </Button>
                    <Button variant="outline-secondary" className="flex-fill" onClick={handleSendEmail}>
                      <i className="ti ti-mail me-1"></i>
                      Email
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Service Catalog Modal */}
      {showServiceModal && (
        <Modal
          open={showServiceModal}
          onClose={() => setShowServiceModal(false)}
          title="Catalog Servicii"
          size="lg"
        >
          <div className="p-3">
            {/* Search */}
            <div className="mb-3">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="ti ti-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Cauta dupa nume sau cod..."
                  value={serviceSearchQuery}
                  onChange={(e) => setServiceSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {/* Categories */}
            <div className="mb-3 d-flex gap-2 flex-wrap">
              {serviceCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`btn btn-sm ${
                    selectedServiceCategory === category ? 'btn-primary' : 'btn-outline-secondary'
                  }`}
                  onClick={() => setSelectedServiceCategory(category)}
                >
                  {category === 'all' ? 'Toate' : category}
                </button>
              ))}
            </div>

            {/* Services List */}
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {filteredServices.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="ti ti-search-off fs-32 d-block mb-2"></i>
                  <span>Niciun serviciu gasit</span>
                </div>
              ) : (
                <div className="row g-2">
                  {filteredServices.map((item) => (
                    <div key={item.id} className="col-md-6">
                      <button
                        type="button"
                        className="btn btn-outline-secondary w-100 text-start p-3"
                        onClick={() => handleAddFromCatalog(item)}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex gap-2 mb-1">
                              <Badge
                                variant={
                                  item.type === 'treatment'
                                    ? 'soft-primary'
                                    : item.type === 'product'
                                    ? 'soft-success'
                                    : 'soft-info'
                                }
                              >
                                {item.code}
                              </Badge>
                              <Badge variant="soft-secondary">{item.type}</Badge>
                            </div>
                            <div className="fw-semibold">{item.name}</div>
                            <small className="text-muted">{formatCurrency(item.price)}</small>
                          </div>
                          <i className="ti ti-plus text-primary"></i>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}

export default InvoiceCreatePage;
