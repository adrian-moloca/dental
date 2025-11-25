/**
 * Patients List Page
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePatients } from '../hooks/usePatients';
import { AppShell } from '../components/layout/AppShell';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Table, type Column } from '../components/data/Table';
import { Pagination } from '../components/ui/Pagination';
import { SkeletonCard, SkeletonTable } from '../components/ui/Skeleton';
import { Icon } from '../components/ui/Icon';

export default function PatientsListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error } = usePatients({
    query: searchQuery || undefined,
    page: currentPage,
    limit: pageSize,
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  if (error) {
    return (
      <AppShell title="Patients" subtitle="Clinic roster">
        <Card tone="glass" padding="lg" className="text-red-300 border border-red-500/30">
          <h3 className="font-semibold mb-2">Error loading patients</h3>
          <p className="text-sm">{(error as Error).message}</p>
        </Card>
      </AppShell>
    );
  }

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  return (
    <AppShell
      title="Patients"
      subtitle="Personalized, high-velocity chairside experience."
      actions={
        <Button as={Link} to="/patients/new">
          <Icon name="plus" className="w-4 h-4 mr-1" aria-hidden={true} />
          Add New Patient
        </Button>
      }
    >
      <div className="space-y-6">
        <Card tone="glass" padding="lg">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <Input
                type="search"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                fullWidth
                aria-label="Search patients"
              />
            </div>
            <div className="text-sm text-slate-400" aria-live="polite" aria-atomic="true">
              {data ? `${data.total} patient${data.total !== 1 ? 's' : ''} total` : ''}
            </div>
          </div>
        </Card>

        {isLoading ? (
          <Card tone="glass" padding="lg">
            <div className="space-y-4" role="status" aria-label="Loading patients">
              <SkeletonTable rows={pageSize} columns={5} />
              <span className="sr-only">Loading patients data...</span>
            </div>
          </Card>
        ) : (
          <>
            <PatientsTable
              rows={data?.data ?? []}
              searchQuery={searchQuery}
              total={data?.total}
              pageSize={pageSize}
            />

            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

type PatientRow = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | Date;
  emails?: { address?: string }[];
  phones?: { number?: string }[];
};

function PatientsTable({
  rows,
  searchQuery,
  total,
  pageSize,
}: {
  rows: PatientRow[];
  searchQuery: string;
  total?: number;
  pageSize?: number;
}) {
  const columns: Column<PatientRow>[] = [
    {
      id: 'name',
      header: 'Patient',
      accessor: (row) => (
        <Link to={`/patients/${row.id}`} className="text-white font-semibold hover:text-brand-200">
          {row.firstName} {row.lastName}
        </Link>
      ),
    },
    {
      id: 'contact',
      header: 'Contact',
      accessor: (row) => (
        <div className="text-slate-300">
          <div>{row.emails?.[0]?.address ?? 'No email'}</div>
          <div className="text-xs text-slate-500">{row.phones?.[0]?.number ?? 'No phone'}</div>
        </div>
      ),
    },
    {
      id: 'dob',
      header: 'DOB',
      accessor: (row) => (
        <span className="text-slate-300">
          {new Date(row.dateOfBirth).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: () => <Badge tone="neutral">Active</Badge>,
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (row) => (
        <Link to={`/patients/${row.id}`}>
          <Button variant="ghost" size="sm">
            View Details
          </Button>
        </Link>
      ),
    },
  ];

  if (rows.length === 0) {
    return (
      <Card tone="glass" padding="lg">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 p-4 rounded-full bg-brand-500/10 border border-brand-500/20">
            <Icon name="users" className="w-12 h-12 text-brand-400" aria-hidden={true} />
          </div>
          <h3 className="text-slate-200 text-lg font-semibold mb-2">No patients found</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-md">
            {searchQuery
              ? 'Try adjusting your search criteria or clear the search to see all patients'
              : 'Get started by adding your first patient to the system'}
          </p>
          <Button as={Link} to="/patients/new">
            <Icon name="plus" className="w-4 h-4 mr-1" aria-hidden={true} />
            Add New Patient
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card tone="glass" padding="md">
      <Table
        data={rows}
        columns={columns}
        total={total}
        pageSize={pageSize}
        ariaLabel="Patients"
      />
    </Card>
  );
}
