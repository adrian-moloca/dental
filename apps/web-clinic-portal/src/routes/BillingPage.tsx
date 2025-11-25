/**
 * Billing Page - Invoice and payment management
 */

import { useState } from 'react';
import { useInvoices } from '../hooks/useBilling';
import { Icon } from '../components/ui/Icon';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  draft: 'bg-gray-500/20 text-gray-300',
  issued: 'bg-blue-500/20 text-blue-300',
  sent: 'bg-cyan-500/20 text-cyan-300',
  partially_paid: 'bg-yellow-500/20 text-yellow-300',
  paid: 'bg-green-500/20 text-green-300',
  overdue: 'bg-red-500/20 text-red-300',
  cancelled: 'bg-gray-500/20 text-gray-400',
};

export function BillingPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error } = useInvoices({
    status: statusFilter || undefined,
  });

  const invoices = data?.data?.data || [];

  const filteredInvoices = invoices.filter((invoice) =>
    searchQuery
      ? invoice.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const stats = {
    totalInvoiced: invoices.reduce((sum, inv) => sum + inv.total, 0),
    totalPaid: invoices.reduce((sum, inv) => sum + inv.amountPaid, 0),
    outstanding: invoices.reduce((sum, inv) => sum + inv.balance, 0),
    overdue: invoices.filter((inv) => inv.status === 'overdue').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing & Invoices</h1>
          <p className="text-sm text-foreground/60 mt-1">
            Manage invoices, payments, and patient balances
          </p>
        </div>
        <button
          onClick={() => navigate('/billing/invoices/new')}
          className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors font-medium"
        >
          <Icon name="plus" className="w-5 h-5" />
          New Invoice
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Invoiced"
          value={`$${stats.totalInvoiced.toFixed(2)}`}
          icon="document"
          color="bg-blue-500/20 text-blue-300"
        />
        <StatCard
          label="Total Paid"
          value={`$${stats.totalPaid.toFixed(2)}`}
          icon="check"
          color="bg-green-500/20 text-green-300"
        />
        <StatCard
          label="Outstanding"
          value={`$${stats.outstanding.toFixed(2)}`}
          icon="cash"
          color="bg-yellow-500/20 text-yellow-300"
        />
        <StatCard
          label="Overdue"
          value={stats.overdue.toString()}
          icon="exclamation"
          color="bg-red-500/20 text-red-300"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center p-4 bg-surface rounded-lg border border-white/10">
        {/* Search */}
        <div className="flex-1 relative">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            placeholder="Search by patient name or invoice number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-hover border border-white/10 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-surface-hover border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="issued">Issued</option>
          <option value="sent">Sent</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Invoice List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Icon name="loading" className="w-8 h-8 text-brand animate-spin" />
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-400">
          Failed to load invoices. Please try again.
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="p-12 text-center">
          <Icon name="document" className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground/60 mb-2">No invoices found</h3>
          <p className="text-sm text-foreground/40">
            {searchQuery || statusFilter
              ? 'Try adjusting your filters'
              : 'Create your first invoice to get started'}
          </p>
        </div>
      ) : (
        <div className="bg-surface rounded-lg border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-hover border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="hover:bg-surface-hover transition-colors cursor-pointer"
                  onClick={() => navigate(`/billing/invoices/${invoice.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-foreground">{invoice.invoiceNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-foreground">{invoice.patientName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-foreground/70">
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[invoice.status]
                      }`}
                    >
                      {invoice.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-medium text-foreground">
                      ${invoice.total.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className={`text-sm font-medium ${invoice.balance > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                      ${invoice.balance.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/billing/invoices/${invoice.id}`);
                      }}
                      className="text-brand hover:text-brand/80 text-sm font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className="p-6 bg-surface rounded-lg border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-foreground/60">{label}</span>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon name={icon as any} className="w-5 h-5" />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}
