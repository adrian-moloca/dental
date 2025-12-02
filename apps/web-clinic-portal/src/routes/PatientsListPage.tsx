/**
 * Patients List Page - Preclinic-style
 *
 * Patient roster with search, filters, and data table.
 * Aligned with preclinic-template design patterns.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../hooks/usePatients';
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
  DataTableFooter,
  Pagination,
  LoadingState,
  EmptyState,
  ErrorState,
  ViewToggle,
  SortDropdown,
  ExportDropdown,
  FilterDropdown,
  QuickFilters,
  type ViewMode,
  type FilterOption,
  type QuickFilter,
} from '../components/ui-new';

// Filter Types
interface PatientFilters {
  status: string[];
  gender: string[];
  sort: string;
}

// Status options for filter
const statusOptions: FilterOption[] = [
  { value: 'active', label: 'Activ' },
  { value: 'inactive', label: 'Inactiv' },
  { value: 'at_risk', label: 'La risc' },
  { value: 'churned', label: 'Pierdut' },
];

// Gender options for filter
const genderOptions: FilterOption[] = [
  { value: 'male', label: 'Masculin' },
  { value: 'female', label: 'Feminin' },
  { value: 'other', label: 'Altul' },
];

// Sort options
const sortOptions = [
  { value: 'recent', label: 'Recent' },
  { value: 'oldest', label: 'Cel mai vechi' },
  { value: 'name_asc', label: 'Nume A-Z' },
  { value: 'name_desc', label: 'Nume Z-A' },
];

// Quick filter options
const quickFilterOptions: QuickFilter[] = [
  { value: 'all', label: 'Toti' },
  { value: 'active', label: 'Activi' },
  { value: 'new', label: 'Noi (30 zile)' },
  { value: 'at_risk', label: 'La risc' },
];

export default function PatientsListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [quickFilter, setQuickFilter] = useState<string | undefined>('all');
  const [filters, setFilters] = useState<PatientFilters>({
    status: [],
    gender: [],
    sort: 'recent',
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const pageSize = 10;

  const { data, isLoading, error, refetch } = usePatients({
    search: searchQuery || undefined,
    page: currentPage,
    limit: pageSize,
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleExport = (format: string) => {
    console.log('Export as:', format);
    // TODO: Implement export functionality
  };

  const handleClearFilters = () => {
    setFilters({
      status: [],
      gender: [],
      sort: 'recent',
    });
    setQuickFilter('all');
  };

  const totalPages = data?.total ? Math.ceil(data.total / pageSize) : 0;
  const hasActiveFilters = filters.status.length > 0 || filters.gender.length > 0;

  // Calculate age from date of birth
  const calculateAge = (dob: string | Date | null | undefined): number => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Get initials from name
  const getInitials = (firstName: string | undefined, lastName: string | undefined): string => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'PA';
  };

  // Breadcrumbs
  const breadcrumbs = [
    { label: 'Acasa', path: '/dashboard', icon: 'ti ti-home' },
    { label: 'Pacienti', path: '/patients' },
  ];


  // Loading skeleton
  if (isLoading) {
    return (
      <AppShell
        title="Pacienti"
        subtitle="Gestioneaza fisele pacientilor"
        breadcrumbs={breadcrumbs}
        actions={
          <Button variant="primary" onClick={() => navigate('/patients/new')}>
            <i className="ti ti-plus me-1" aria-hidden="true"></i>
            Adauga Pacient
          </Button>
        }
      >
        <Card className="shadow-sm">
          <CardBody>
            <LoadingState type="table" rows={10} message="Se incarca pacientii..." />
          </CardBody>
        </Card>
      </AppShell>
    );
  }

  // Error state
  if (error) {
    return (
      <AppShell
        title="Pacienti"
        subtitle="Gestioneaza fisele pacientilor"
        breadcrumbs={breadcrumbs}
      >
        <Card className="shadow-sm border-danger">
          <CardBody>
            <ErrorState
              title="Eroare la incarcarea pacientilor"
              message={(error as Error).message || 'Nu am putut incarca lista de pacienti. Va rugam incercati din nou.'}
              actions={
                <Button variant="primary" onClick={() => refetch()}>
                  <i className="ti ti-refresh me-1" aria-hidden="true"></i>
                  Reincearca
                </Button>
              }
            />
          </CardBody>
        </Card>
      </AppShell>
    );
  }

  const patients = data?.data || [];

  return (
    <AppShell
      title="Pacienti"
      subtitle="Gestioneaza fisele pacientilor"
      breadcrumbs={breadcrumbs}
      actions={
        <div className="d-flex gap-2">
          <ExportDropdown onSelect={handleExport} />
          <ViewToggle value={viewMode} onChange={setViewMode} />
          <Button variant="primary" onClick={() => navigate('/patients/new')}>
            <i className="ti ti-plus me-1" aria-hidden="true"></i>
            Pacient Nou
          </Button>
        </div>
      }
    >
      <Card className="shadow-sm">
        {/* Filter Bar */}
        <div className="d-flex align-items-center justify-content-between flex-wrap p-3 border-bottom">
          {/* Left side - Search and Quick Filters */}
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div className="search-input-wrapper" style={{ minWidth: 280 }}>
              <SearchInput
                placeholder="Cauta dupa nume, email, telefon..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onClear={() => handleSearch('')}
              />
            </div>
            <QuickFilters
              filters={quickFilterOptions}
              activeFilter={quickFilter}
              onChange={setQuickFilter}
            />
          </div>

          {/* Right side - Filter dropdown and Sort */}
          <div className="d-flex align-items-center gap-2 flex-wrap mt-2 mt-md-0">
            {/* Advanced Filters Dropdown */}
            <div className="dropdown">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="d-flex align-items-center"
                aria-expanded={showAdvancedFilters}
              >
                <i className="ti ti-filter me-1" aria-hidden="true"></i>
                Filtre
                {hasActiveFilters && (
                  <span className="badge bg-primary ms-1">{filters.status.length + filters.gender.length}</span>
                )}
              </Button>
            </div>

            {/* Sort Dropdown */}
            <SortDropdown
              options={sortOptions}
              value={filters.sort}
              onChange={(value) => setFilters({ ...filters, sort: value })}
            />
          </div>
        </div>

        {/* Advanced Filters Panel (collapsible) */}
        {showAdvancedFilters && (
          <div className="p-3 bg-light border-bottom">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label d-flex justify-content-between">
                  <span>Status</span>
                  {filters.status.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-link p-0 fs-13 text-primary"
                      onClick={() => setFilters({ ...filters, status: [] })}
                    >
                      Reset
                    </button>
                  )}
                </label>
                <FilterDropdown
                  label="Status"
                  options={statusOptions}
                  selectedValues={filters.status}
                  onChange={(values) => setFilters({ ...filters, status: values })}
                  placeholder="Selecteaza status"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label d-flex justify-content-between">
                  <span>Gen</span>
                  {filters.gender.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-link p-0 fs-13 text-primary"
                      onClick={() => setFilters({ ...filters, gender: [] })}
                    >
                      Reset
                    </button>
                  )}
                </label>
                <FilterDropdown
                  label="Gen"
                  options={genderOptions}
                  selectedValues={filters.gender}
                  onChange={(values) => setFilters({ ...filters, gender: values })}
                  placeholder="Selecteaza gen"
                />
              </div>
              <div className="col-md-6 d-flex align-items-end justify-content-end gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Sterge filtrele
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(false)}
                >
                  Aplica
                </Button>
              </div>
            </div>
          </div>
        )}

        <CardBody className="p-0">
          {patients.length === 0 ? (
            <EmptyState
              icon="ti ti-users-group"
              title={searchQuery ? 'Niciun rezultat gasit' : 'Niciun pacient inregistrat'}
              description={
                searchQuery
                  ? 'Incearca sa modifici criteriile de cautare sau sterge cautarea pentru a vedea toti pacientii.'
                  : 'Adauga primul pacient pentru a incepe gestionarea fiselor medicale.'
              }
              action={
                !searchQuery && (
                  <Button variant="primary" onClick={() => navigate('/patients/new')}>
                    <i className="ti ti-plus me-1" aria-hidden="true"></i>
                    Adauga Pacient
                  </Button>
                )
              }
            />
          ) : viewMode === 'list' ? (
            // List View (Table)
            <Table hover>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Pacient</TableHeaderCell>
                  <TableHeaderCell>Contact</TableHeaderCell>
                  <TableHeaderCell>Data Nasterii</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell style={{ width: 100 }}>Actiuni</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow
                    key={patient.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    {/* Patient Name with Avatar */}
                    <TableCell>
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar avatar-sm bg-primary-transparent rounded-circle">
                          <span className="avatar-text text-primary fw-medium">
                            {getInitials(patient.firstName, patient.lastName)}
                          </span>
                        </div>
                        <div>
                          <h6 className="mb-0 fw-semibold">
                            {patient.firstName} {patient.lastName}
                          </h6>
                          <small className="text-muted">
                            ID: {patient.id.slice(0, 8)}...
                          </small>
                        </div>
                      </div>
                    </TableCell>

                    {/* Contact Info */}
                    <TableCell>
                      <div>
                        <div className="d-flex align-items-center gap-1 text-muted">
                          <i className="ti ti-mail fs-14" aria-hidden="true"></i>
                          <span className="small">
                            {patient.emails?.[0]?.address || 'Fara email'}
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-1 text-muted">
                          <i className="ti ti-phone fs-14" aria-hidden="true"></i>
                          <span className="small">
                            {patient.phones?.[0]?.number || 'Fara telefon'}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Date of Birth & Age */}
                    <TableCell>
                      <div>
                        <span>
                          {patient.dateOfBirth
                            ? new Date(patient.dateOfBirth).toLocaleDateString('ro-RO')
                            : 'N/A'}
                        </span>
                        {patient.dateOfBirth && (
                          <small className="d-block text-muted">
                            {calculateAge(patient.dateOfBirth)} ani
                          </small>
                        )}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge variant="soft-success">
                        Activ
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <TableActions>
                        <ActionButton
                          icon="ti ti-eye"
                          actionType="view"
                          tooltip="Vezi detalii"
                          onClick={() => navigate(`/patients/${patient.id}`)}
                        />
                        <ActionButton
                          icon="ti ti-edit"
                          actionType="edit"
                          tooltip="Editeaza"
                          onClick={() => navigate(`/patients/${patient.id}/edit`)}
                        />
                        <ActionButton
                          icon="ti ti-dental"
                          actionType="default"
                          tooltip="Date Clinice"
                          onClick={() => navigate(`/clinical/${patient.id}`)}
                        />
                        <ActionButton
                          icon="ti ti-calendar-plus"
                          actionType="default"
                          tooltip="Programeaza"
                          onClick={() =>
                            navigate(`/appointments/create?patientId=${patient.id}`)
                          }
                        />
                      </TableActions>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            // Grid View (Cards)
            <div className="p-3">
              <div className="row g-3">
                {patients.map((patient) => (
                  <div key={patient.id} className="col-md-6 col-lg-4 col-xl-3">
                    <div
                      className="card border h-100 cursor-pointer hover-shadow"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      <div className="card-body text-center">
                        <div className="avatar avatar-lg bg-primary-transparent rounded-circle mx-auto mb-3">
                          <span className="avatar-text text-primary fw-medium fs-5">
                            {getInitials(patient.firstName, patient.lastName)}
                          </span>
                        </div>
                        <h6 className="fw-semibold mb-1">
                          {patient.firstName} {patient.lastName}
                        </h6>
                        <p className="text-muted small mb-2">
                          {patient.emails?.[0]?.address || 'Fara email'}
                        </p>
                        <Badge variant="soft-success" className="mb-3">Activ</Badge>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/patients/${patient.id}`);
                            }}
                            aria-label="Vezi detalii pacient"
                          >
                            <i className="ti ti-eye" aria-hidden="true"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/patients/${patient.id}/edit`);
                            }}
                            aria-label="Editeaza pacient"
                          >
                            <i className="ti ti-edit" aria-hidden="true"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/appointments/create?patientId=${patient.id}`);
                            }}
                            aria-label="Programeaza pacient"
                          >
                            <i className="ti ti-calendar-plus" aria-hidden="true"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardBody>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <DataTableFooter
            info={`Afisare ${(currentPage - 1) * pageSize + 1} - ${Math.min(
              currentPage * pageSize,
              data?.total || 0
            )} din ${data?.total} pacienti`}
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
