/**
 * Invoice Details Page - Preclinic-style
 *
 * View invoice details, line items, payments, and record new payments.
 */

import { useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useInvoice, usePayments, useRecordPaymentBatch, useDownloadInvoicePdf } from '../hooks/useBilling';
import { AppShell } from '../components/layout/AppShell';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  StatusBadge,
} from '../components/ui-new';
import { PaymentRecorderModal, type PaymentSubmission } from '../components/billing/PaymentRecorderModal';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import toast from 'react-hot-toast';

type InvoiceStatus = 'draft' | 'issued' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export function InvoiceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const openPaymentModal = searchParams.get('payment') === 'true';

  const [showPaymentModal, setShowPaymentModal] = useState(openPaymentModal);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/billing');
    }
  };

  const { data: invoice, isLoading, error, refetch } = useInvoice(id!);
  const { data: payments, isLoading: paymentsLoading } = usePayments(id!);
  const recordPaymentMutation = useRecordPaymentBatch();
  const downloadPdf = useDownloadInvoicePdf();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Status badge helper
  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'draft':
        return <Badge variant="soft-secondary">Ciorna</Badge>;
      case 'issued':
        return <Badge variant="soft-info">Emisa</Badge>;
      case 'sent':
        return <Badge variant="soft-primary">Trimisa</Badge>;
      case 'partially_paid':
        return <Badge variant="soft-warning">Partial achitata</Badge>;
      case 'paid':
        return <StatusBadge status="completed">Achitata</StatusBadge>;
      case 'overdue':
        return <Badge variant="soft-danger">Restanta</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Anulata</Badge>;
      default:
        return <Badge variant="soft-secondary">{status}</Badge>;
    }
  };

  // Payment status badge helper
  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return <Badge variant="soft-success">Finalizata</Badge>;
      case 'pending':
        return <Badge variant="soft-warning">In asteptare</Badge>;
      case 'failed':
        return <Badge variant="soft-danger">Esuata</Badge>;
      case 'refunded':
        return <Badge variant="soft-secondary">Rambursata</Badge>;
      default:
        return <Badge variant="soft-secondary">{status}</Badge>;
    }
  };

  // Payment method label
  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Numerar',
      card: 'Card',
      bank_transfer: 'Transfer bancar',
      online: 'Online',
    };
    return labels[method] || method;
  };

  // Handle payment submission
  const handleSubmitPayment = useCallback(async (submission: PaymentSubmission) => {
    if (!invoice) return;

    try {
      await recordPaymentMutation.mutateAsync({
        invoiceId: id!,
        patientId: invoice.data.patientId,
        totalAmount: submission.totalAmount,
        payments: submission.payments,
        notes: submission.notes,
      });
      setShowPaymentModal(false);
      toast.success('Plata inregistrata cu succes!');
      refetch();
    } catch {
      toast.error('Eroare la inregistrarea platii');
    }
  }, [invoice, recordPaymentMutation, id, refetch]);

  // Handle PDF download
  const handleDownloadPdf = () => {
    downloadPdf.mutate(id!, {
      onSuccess: () => {
        toast.success('PDF descarcat cu succes!');
      },
      onError: () => {
        toast.error('Eroare la descarcarea PDF-ului');
      },
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <AppShell
        title="Detalii Factura"
        subtitle="Se incarca..."
        actions={
          <Button variant="outline-secondary" onClick={handleBack}>
            <i className="ti ti-arrow-left me-1"></i>
            Inapoi
          </Button>
        }
      >
        <div className="row g-4">
          <div className="col-lg-8">
            <Card className="shadow-sm">
              <CardBody>
                <div className="placeholder-glow">
                  <div className="d-flex justify-content-between mb-4">
                    <span className="placeholder col-3"></span>
                    <span className="placeholder col-2"></span>
                  </div>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="d-flex gap-3 py-3 border-bottom">
                      <span className="placeholder col-4"></span>
                      <span className="placeholder col-2"></span>
                      <span className="placeholder col-2"></span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
          <div className="col-lg-4">
            <Card className="shadow-sm">
              <CardBody>
                <div className="placeholder-glow">
                  <span className="placeholder col-6 mb-3"></span>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="py-2">
                      <span className="placeholder col-8"></span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </AppShell>
    );
  }

  // Error state
  if (error || !invoice?.data) {
    return (
      <AppShell
        title="Detalii Factura"
        subtitle="Eroare"
        actions={
          <Button variant="outline-secondary" onClick={handleBack}>
            <i className="ti ti-arrow-left me-1"></i>
            Inapoi
          </Button>
        }
      >
        <Card className="shadow-sm border-danger">
          <CardBody className="text-center py-5">
            <div className="avatar avatar-xl bg-danger-transparent rounded-circle mx-auto mb-3">
              <i className="ti ti-file-alert fs-32 text-danger"></i>
            </div>
            <h5 className="fw-bold mb-2">Factura nu a fost gasita</h5>
            <p className="text-muted mb-4">
              {error ? (error as Error).message : 'Factura solicitata nu exista sau a fost stearsa.'}
            </p>
            <Button variant="primary" onClick={handleBack}>
              <i className="ti ti-arrow-left me-1"></i>
              Inapoi
            </Button>
          </CardBody>
        </Card>
      </AppShell>
    );
  }

  const inv = invoice.data;
  const paymentList = payments?.data || [];

  return (
    <AppShell
      title={inv.invoiceNumber}
      subtitle={`Factura pentru ${inv.patientName || 'N/A'}`}
      actions={
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={handleBack}>
            <i className="ti ti-arrow-left me-1"></i>
            Inapoi
          </Button>
          <Button
            variant="outline-secondary"
            onClick={handleDownloadPdf}
            loading={downloadPdf.isPending}
          >
            <i className="ti ti-file-download me-1"></i>
            Descarca PDF
          </Button>
          {inv.balance > 0 && inv.status !== 'cancelled' && (
            <Button variant="primary" onClick={() => setShowPaymentModal(true)}>
              <i className="ti ti-cash me-1"></i>
              Inregistreaza Plata
            </Button>
          )}
        </div>
      }
    >
      {/* Payment Modal */}
      {invoice?.data && (
        <PaymentRecorderModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          invoice={inv}
          onSubmit={handleSubmitPayment}
          isSubmitting={recordPaymentMutation.isPending}
        />
      )}

      <div className="row g-4">
        {/* Main Content */}
        <div className="col-lg-8">
          {/* Invoice Header Card */}
          <Card className="shadow-sm mb-4">
            <CardHeader>
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar avatar-md bg-primary-transparent rounded">
                    <i className="ti ti-file-invoice text-primary fs-20"></i>
                  </div>
                  <div>
                    <h5 className="card-title mb-0">{inv.invoiceNumber}</h5>
                    <small className="text-muted">ID: {inv.id}</small>
                  </div>
                </div>
                {getStatusBadge(inv.status)}
              </div>
            </CardHeader>
            <CardBody>
              <div className="row g-4">
                {/* Patient Info */}
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-3 p-3 bg-light rounded">
                    <div className="avatar avatar-sm bg-info-transparent rounded">
                      <i className="ti ti-user text-info"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Pacient</small>
                      <span className="fw-semibold">{inv.patientName || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="col-md-3">
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted d-block">Data emiterii</small>
                    <span className="fw-semibold">
                      {format(new Date(inv.issueDate), 'dd MMM yyyy', { locale: ro })}
                    </span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted d-block">Data scadenta</small>
                    <span className={`fw-semibold ${new Date(inv.dueDate) < new Date() && inv.balance > 0 ? 'text-danger' : ''}`}>
                      {format(new Date(inv.dueDate), 'dd MMM yyyy', { locale: ro })}
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Line Items Card */}
          <Card className="shadow-sm mb-4">
            <CardHeader>
              <div className="d-flex align-items-center gap-2">
                <div className="avatar avatar-sm bg-success-transparent rounded">
                  <i className="ti ti-list text-success"></i>
                </div>
                <div>
                  <h5 className="card-title mb-0">Articole Factura</h5>
                  <small className="text-muted">{inv.items?.length || 0} articole</small>
                </div>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0">Descriere</th>
                      <th className="border-0 text-center" style={{ width: 80 }}>Cant.</th>
                      <th className="border-0 text-end" style={{ width: 120 }}>Pret unitar</th>
                      <th className="border-0 text-end" style={{ width: 120 }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inv.items?.map((item, index) => (
                      <tr key={item.id || index}>
                        <td>
                          <div>
                            {item.procedureCode && (
                              <small className="text-muted d-block">{item.procedureCode}</small>
                            )}
                            <span className="fw-medium">{item.description}</span>
                          </div>
                        </td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end">{formatCurrency(item.unitPrice)}</td>
                        <td className="text-end fw-semibold">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          {/* Totals Card */}
          <Card className="shadow-sm">
            <CardBody>
              <div className="row justify-content-end">
                <div className="col-md-6">
                  <div className="d-flex justify-content-between py-2">
                    <span className="text-muted">Subtotal</span>
                    <span className="fw-medium">{formatCurrency(inv.subtotal)}</span>
                  </div>

                  {inv.discountAmount > 0 && (
                    <div className="d-flex justify-content-between py-2">
                      <span className="text-muted">Discount</span>
                      <span className="text-danger fw-medium">-{formatCurrency(inv.discountAmount)}</span>
                    </div>
                  )}

                  <div className="d-flex justify-content-between py-2">
                    <span className="text-muted">TVA (19%)</span>
                    <span className="fw-medium">{formatCurrency(inv.taxAmount)}</span>
                  </div>

                  <hr className="my-2" />

                  <div className="d-flex justify-content-between py-2">
                    <span className="fw-bold fs-16">Total</span>
                    <span className="fw-bold fs-16 text-primary">{formatCurrency(inv.total)}</span>
                  </div>

                  <div className="d-flex justify-content-between py-2">
                    <span className="text-muted">Suma achitata</span>
                    <span className="text-success fw-semibold">{formatCurrency(inv.amountPaid)}</span>
                  </div>

                  <div className="d-flex justify-content-between py-2 bg-light rounded px-3 mx-n3">
                    <span className="fw-bold fs-18">Rest de plata</span>
                    <span className={`fw-bold fs-18 ${inv.balance > 0 ? 'text-warning' : 'text-success'}`}>
                      {formatCurrency(inv.balance)}
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar - Payment History */}
        <div className="col-lg-4">
          <div className="sticky-top" style={{ top: 90 }}>
            {/* Payment History Card */}
            <Card className="shadow-sm mb-4">
              <CardHeader>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div className="avatar avatar-sm bg-warning-transparent rounded">
                      <i className="ti ti-receipt text-warning"></i>
                    </div>
                    <h6 className="card-title mb-0">Istoric Plati</h6>
                  </div>
                  <Badge variant="soft-secondary">{paymentList.length}</Badge>
                </div>
              </CardHeader>
              <CardBody>
                {paymentsLoading ? (
                  <div className="placeholder-glow">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="py-2">
                        <span className="placeholder col-8"></span>
                      </div>
                    ))}
                  </div>
                ) : paymentList.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="avatar avatar-lg bg-light rounded-circle mx-auto mb-3">
                      <i className="ti ti-receipt-off fs-24 text-muted"></i>
                    </div>
                    <p className="text-muted small mb-0">Nicio plata inregistrata</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {paymentList.map((payment) => (
                      <div key={payment.id} className="p-3 bg-light rounded">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span className="fw-bold text-primary">
                            {formatCurrency(payment.amount)}
                          </span>
                          {getPaymentStatusBadge(payment.status)}
                        </div>
                        <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                          <i className="ti ti-credit-card"></i>
                          <span>{getPaymentMethodLabel(payment.paymentMethod)}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2 text-muted small">
                          <i className="ti ti-calendar"></i>
                          <span>
                            {payment.recordedAt ? format(new Date(payment.recordedAt), 'dd MMM yyyy, HH:mm', { locale: ro }) : 'N/A'}
                          </span>
                        </div>
                        {payment.reference && (
                          <div className="d-flex align-items-center gap-2 text-muted small mt-1">
                            <i className="ti ti-hash"></i>
                            <span>Ref: {payment.reference}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Quick Actions Card */}
            <Card className="shadow-sm">
              <CardHeader>
                <div className="d-flex align-items-center gap-2">
                  <div className="avatar avatar-sm bg-info-transparent rounded">
                    <i className="ti ti-bolt text-info"></i>
                  </div>
                  <h6 className="card-title mb-0">Actiuni Rapide</h6>
                </div>
              </CardHeader>
              <CardBody>
                <div className="d-grid gap-2">
                  <Button
                    variant="outline-secondary"
                    className="justify-content-start"
                    onClick={handleDownloadPdf}
                    loading={downloadPdf.isPending}
                  >
                    <i className="ti ti-file-download me-2"></i>
                    Descarca PDF
                  </Button>
                  <Button
                    variant="outline-secondary"
                    className="justify-content-start"
                    onClick={() => {}}
                  >
                    <i className="ti ti-mail me-2"></i>
                    Trimite pe Email
                  </Button>
                  <Button
                    variant="outline-secondary"
                    className="justify-content-start"
                    onClick={() => {}}
                  >
                    <i className="ti ti-printer me-2"></i>
                    Printeaza
                  </Button>
                  {inv.status === 'draft' && (
                    <Button
                      variant="outline-secondary"
                      className="justify-content-start"
                      onClick={() => navigate(`/billing/invoices/${id}/edit`)}
                    >
                      <i className="ti ti-edit me-2"></i>
                      Editeaza Factura
                    </Button>
                  )}
                  {inv.status !== 'cancelled' && inv.status !== 'paid' && (
                    <Button
                      variant="outline-secondary"
                      className="justify-content-start text-danger"
                      onClick={() => {}}
                    >
                      <i className="ti ti-x me-2"></i>
                      Anuleaza Factura
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default InvoiceDetailsPage;
