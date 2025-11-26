/**
 * Billing Page - Preclinic-style
 *
 * Invoice and payment management with stats, filters, and table view.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoices } from '../hooks/useBilling';
import { AppShell } from '../components/layout/AppShell';
import {
  Card,
  CardBody,
  Button,
  Badge,
  StatusBadge,
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
  DataTableFooter,
  Pagination,
  StatsCard,
} from '../components/ui-new';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

type InvoiceStatus = 'draft' | 'issued' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

export function BillingPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error, refetch } = useInvoices({
    status: statusFilter || undefined,
    page: currentPage,
    limit: pageSize,
  });

  const invoices = data?.data?.data || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  // Filter by search
  const filteredInvoices = invoices.filter((invoice) =>
    searchQuery
      ? invoice.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  // Calculate stats
  const stats = {
    totalInvoiced: invoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
    totalPaid: invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0),
    outstanding: invoices.reduce((sum, inv) => sum + (inv.balance || 0), 0),
    overdue: invoices.filter((inv) => inv.status === 'overdue').length,
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

  // Filter buttons
  const statusFilters = [
    { key: '', label: 'Toate', icon: 'ti-file-invoice' },
    { key: 'draft', label: 'Ciorne', icon: 'ti-file-pencil' },
    { key: 'issued', label: 'Emise', icon: 'ti-file-check' },
    { key: 'paid', label: 'Achitate', icon: 'ti-check-circle' },
    { key: 'overdue', label: 'Restante', icon: 'ti-alert-triangle' },
  ];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Loading state
  if (isLoading) {
    return (
      <AppShell
        title="Facturare"
        subtitle="Gestioneaza facturi si plati"
        actions={
          <Button variant="primary" onClick={() => navigate('/billing/invoices/new')}>
            <i className="ti ti-plus me-1"></i>
            Factura Noua
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
      <AppShell title="Facturare" subtitle="Gestioneaza facturi si plati">
        <Card className="shadow-sm border-danger">
          <CardBody className="text-center py-5">
            <div className="avatar avatar-xl bg-danger-transparent rounded-circle mx-auto mb-3">
              <i className="ti ti-alert-circle fs-32 text-danger"></i>
            </div>
            <h5 className="fw-bold mb-2">Eroare la incarcarea facturilor</h5>
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
      title="Facturare"
      subtitle="Gestioneaza facturi si plati"
      actions={
        <Button variant="primary" onClick={() => navigate('/billing/invoices/new')}>
          <i className="ti ti-plus me-1"></i>
          Factura Noua
        </Button>
      }
    >
      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            label="Total Facturat"
            value={formatCurrency(stats.totalInvoiced)}
            icon="ti ti-file-invoice"
            iconColor="primary"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            label="Total Incasat"
            value={formatCurrency(stats.totalPaid)}
            icon="ti ti-check"
            iconColor="success"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            label="De Incasat"
            value={formatCurrency(stats.outstanding)}
            icon="ti ti-currency-lei"
            iconColor="warning"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            label="Restante"
            value={stats.overdue.toString()}
            icon="ti ti-alert-triangle"
            iconColor="danger"
            footer={<small className="text-muted">{stats.overdue > 0 ? 'Necesita atentie' : 'Nicio restanta'}</small>}
          />
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-sm mb-4">
        <CardBody className="py-3">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            {/* Status Filters */}
            <div className="d-flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <Button
                  key={filter.key}
                  variant={statusFilter === filter.key ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => {
                    setStatusFilter(filter.key);
                    setCurrentPage(1);
                  }}
                >
                  <i className={`ti ${filter.icon} me-1`}></i>
                  {filter.label}
                </Button>
              ))}
            </div>

            {/* Search */}
            <SearchInput
              placeholder="Cauta pacient sau numar factura..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              style={{ minWidth: 280 }}
            />
          </div>
        </CardBody>
      </Card>

      {/* Invoices Table */}
      <Card className="shadow-sm">
        <DataTableHeader
          title="Lista Facturi"
          subtitle={`${total} facturi in total`}
          actions={
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" size="sm">
                <i className="ti ti-download me-1"></i>
                Export
              </Button>
            </div>
          }
        />

        <CardBody className="p-0">
          {filteredInvoices.length === 0 ? (
            <TableEmpty
              icon="ti ti-file-invoice"
              title={searchQuery || statusFilter ? 'Nicio factura gasita' : 'Nicio factura inregistrata'}
              description={
                searchQuery || statusFilter
                  ? 'Incearca sa modifici filtrele sau cautarea'
                  : 'Creeaza prima factura pentru a incepe'
              }
              action={
                !searchQuery && !statusFilter && (
                  <Button variant="primary" onClick={() => navigate('/billing/invoices/new')}>
                    <i className="ti ti-plus me-1"></i>
                    Creeaza Factura
                  </Button>
                )
              }
            />
          ) : (
            <Table hover>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Factura</TableHeaderCell>
                  <TableHeaderCell>Pacient</TableHeaderCell>
                  <TableHeaderCell>Data</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell className="text-end">Total</TableHeaderCell>
                  <TableHeaderCell className="text-end">De Plata</TableHeaderCell>
                  <TableHeaderCell style={{ width: 100 }}>Actiuni</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/billing/invoices/${invoice.id}`)}
                  >
                    {/* Invoice Number */}
                    <TableCell>
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar avatar-sm bg-primary-transparent rounded">
                          <i className="ti ti-file-invoice text-primary"></i>
                        </div>
                        <div>
                          <h6 className="mb-0 fw-semibold">{invoice.invoiceNumber}</h6>
                          <small className="text-muted">ID: {invoice.id.slice(0, 8)}...</small>
                        </div>
                      </div>
                    </TableCell>

                    {/* Patient */}
                    <TableCell>
                      <span>{invoice.patientName || 'N/A'}</span>
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <div>
                        <span>{format(new Date(invoice.issueDate), 'dd MMM yyyy', { locale: ro })}</span>
                        <small className="d-block text-muted">
                          Scadenta: {format(new Date(invoice.dueDate), 'dd MMM', { locale: ro })}
                        </small>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>

                    {/* Total */}
                    <TableCell className="text-end">
                      <span className="fw-semibold">{formatCurrency(invoice.total)}</span>
                    </TableCell>

                    {/* Balance */}
                    <TableCell className="text-end">
                      <span className={`fw-semibold ${invoice.balance > 0 ? 'text-warning' : 'text-success'}`}>
                        {formatCurrency(invoice.balance)}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <TableActions>
                        <ActionButton
                          icon="ti ti-eye"
                          actionType="view"
                          tooltip="Vezi detalii"
                          onClick={() => navigate(`/billing/invoices/${invoice.id}`)}
                        />
                        {invoice.balance > 0 && invoice.status !== 'cancelled' && (
                          <ActionButton
                            icon="ti ti-cash"
                            actionType="default"
                            tooltip="Inregistreaza plata"
                            onClick={() => navigate(`/billing/invoices/${invoice.id}?payment=true`)}
                          />
                        )}
                        <ActionButton
                          icon="ti ti-file-download"
                          actionType="default"
                          tooltip="Descarca PDF"
                          onClick={() => {}}
                        />
                      </TableActions>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>

        {/* Pagination */}
        {totalPages > 1 && (
          <DataTableFooter
            info={`Afisare ${(currentPage - 1) * pageSize + 1} - ${Math.min(
              currentPage * pageSize,
              total
            )} din ${total} facturi`}
          >
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </DataTableFooter>
        )}
      </Card>
    </AppShell>
  );
}

export default BillingPage;
