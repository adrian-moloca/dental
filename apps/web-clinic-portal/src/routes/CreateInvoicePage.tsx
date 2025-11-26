/**
 * Create Invoice Page - Preclinic-style
 *
 * Wizard for creating new patient invoices with line items,
 * tax calculation, and payment terms.
 */

import { useNavigate } from 'react-router-dom';
import { useCreateInvoice } from '../hooks/useBilling';
import { AppShell } from '../components/layout/AppShell';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
} from '../components/ui-new';
import { InvoiceFormWizard } from '../components/billing/InvoiceFormWizard';
import toast from 'react-hot-toast';

export function CreateInvoicePage() {
  const navigate = useNavigate();
  const createInvoiceMutation = useCreateInvoice();

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      const result = await createInvoiceMutation.mutateAsync(data);
      const invoiceId = result.data.id;
      toast.success('Factura creata cu succes!');
      navigate(`/billing/invoices/${invoiceId}`);
    } catch (error) {
      console.error('Failed to create invoice:', error);
      toast.error('Eroare la crearea facturii');
    }
  };

  const handleCancel = () => {
    navigate('/billing');
  };

  return (
    <AppShell
      title="Factura Noua"
      subtitle="Creeaza o factura pentru pacient"
      actions={
        <Button variant="outline-secondary" onClick={handleCancel}>
          <i className="ti ti-arrow-left me-1"></i>
          Inapoi la Facturare
        </Button>
      }
    >
      <Card className="shadow-sm">
        <CardHeader>
          <div className="d-flex align-items-center gap-2">
            <div className="avatar avatar-sm bg-primary-transparent rounded">
              <i className="ti ti-file-invoice text-primary"></i>
            </div>
            <div>
              <h5 className="card-title mb-0">Detalii Factura</h5>
              <small className="text-muted">Completeaza informatiile pentru a genera factura</small>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <InvoiceFormWizard
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={createInvoiceMutation.isPending}
          />
        </CardBody>
      </Card>
    </AppShell>
  );
}

export default CreateInvoicePage;
