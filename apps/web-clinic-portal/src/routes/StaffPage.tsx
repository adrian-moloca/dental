/**
 * Staff Management Page
 *
 * Comprehensive staff/employee management with KPI cards,
 * filters, list/grid views, and CRUD operations.
 * Integrated with real backend API.
 */

import { useState, useMemo, useCallback } from 'react';
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
  DataTableFooter,
  Pagination,
  StatsCard,
} from '../components/ui-new';
import { StaffCard } from '../components/staff/StaffCard';
import { StaffFormModal } from '../components/staff/StaffFormModal';
import { StaffDetailsDrawer } from '../components/staff/StaffDetailsDrawer';
import {
  useStaff,
  useStaffStats,
  useCreateStaff,
  useUpdateStaff,
  useBulkActivateStaff,
  useBulkDeactivateStaff,
} from '../hooks/useStaff';
import {
  staffDtoToMember,
  mapDisplayRoleToApi,
  mapDisplayStatusToUser,
  type StaffMember,
  type StaffRole,
  type StaffDisplayStatus,
  type CreateStaffDto,
  type UpdateStaffDto,
  type UserStatus,
} from '../types/staff.types';
import toast from 'react-hot-toast';

// Role configuration
const roleConfig: Record<StaffRole, { label: string; color: string; icon: string }> = {
  doctor: { label: 'Doctor', color: 'soft-primary', icon: 'ti ti-stethoscope' },
  asistent: { label: 'Asistent', color: 'soft-info', icon: 'ti ti-heart-handshake' },
  receptioner: { label: 'Receptioner', color: 'soft-warning', icon: 'ti ti-headset' },
  admin: { label: 'Administrator', color: 'soft-danger', icon: 'ti ti-shield-check' },
  manager: { label: 'Manager', color: 'soft-purple', icon: 'ti ti-briefcase' },
};

// Status configuration
const statusConfig: Record<StaffDisplayStatus, { label: string; color: string }> = {
  activ: { label: 'Activ', color: 'soft-success' },
  inactiv: { label: 'Inactiv', color: 'soft-secondary' },
  concediu: { label: 'In Concediu', color: 'soft-warning' },
  suspendat: { label: 'Suspendat', color: 'soft-danger' },
};

// Map display status to API status for filtering
const displayStatusToApiStatus: Record<string, UserStatus | undefined> = {
  all: undefined,
  activ: 'ACTIVE',
  inactiv: 'INACTIVE',
  suspendat: 'BLOCKED',
  concediu: 'INACTIVE', // No direct mapping
};

// Map display role to API role for filtering
const displayRoleToApiRole: Record<string, string | undefined> = {
  all: undefined,
  doctor: 'DENTIST',
  asistent: 'ASSISTANT',
  receptioner: 'RECEPTIONIST',
  admin: 'CLINIC_ADMIN',
  manager: 'MANAGER',
};

type ViewMode = 'list' | 'grid';

export function StaffPage() {
  // Local UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStaff, setSelectedStaff] = useState<Set<string>>(new Set());
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [viewingStaff, setViewingStaff] = useState<StaffMember | null>(null);

  const pageSize = 10;

  // Build API query params
  const apiQuery = useMemo(() => ({
    status: displayStatusToApiStatus[statusFilter],
    role: displayRoleToApiRole[roleFilter],
    search: searchQuery || undefined,
    page: currentPage,
    limit: pageSize,
  }), [statusFilter, roleFilter, searchQuery, currentPage]);

  // Fetch staff data
  const { data: staffResponse, isLoading: staffLoading, error: staffError } = useStaff(apiQuery);
  const { data: statsData } = useStaffStats();

  // Mutations
  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const bulkActivateMutation = useBulkActivateStaff();
  const bulkDeactivateMutation = useBulkDeactivateStaff();

  // Transform API data to display format
  const staffData = useMemo(() => {
    if (!staffResponse?.data) return [];
    return staffResponse.data.map(staffDtoToMember);
  }, [staffResponse]);

  // Apply client-side department filter (department not stored in API)
  const filteredStaff = useMemo(() => {
    if (departmentFilter === 'all') return staffData;
    return staffData.filter((s) => s.department === departmentFilter);
  }, [staffData, departmentFilter]);

  // Get unique departments from current data
  const departments = useMemo(() => {
    const depts = new Set(staffData.map((s) => s.department));
    return Array.from(depts).sort();
  }, [staffData]);

  // Pagination info
  const total = staffResponse?.total ?? 0;
  const totalPages = staffResponse?.totalPages ?? 1;

  // KPI calculations from stats endpoint or fallback to local calc
  const kpiData = useMemo(() => {
    if (statsData) {
      return {
        total: statsData.total,
        activeToday: statsData.active, // Approximation
        onLeave: 0, // Not tracked in current API
        newThisMonth: 0, // Would need date filter
      };
    }

    // Fallback to local calculation
    const activeToday = staffData.filter(
      (s) =>
        s.status === 'activ' &&
        s.lastActive &&
        new Date(s.lastActive).toDateString() === new Date().toDateString()
    ).length;

    return {
      total,
      activeToday,
      onLeave: staffData.filter((s) => s.status === 'concediu').length,
      newThisMonth: 0,
    };
  }, [statsData, staffData, total]);

  // Handlers
  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handleRoleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleStatusFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleDepartmentFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setDepartmentFilter(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleSelectStaff = useCallback((id: string, checked: boolean) => {
    setSelectedStaff((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedStaff(new Set(filteredStaff.map((s) => s.id)));
      } else {
        setSelectedStaff(new Set());
      }
    },
    [filteredStaff]
  );

  const handleViewStaff = useCallback((staff: StaffMember) => {
    setViewingStaff(staff);
    setIsDrawerOpen(true);
  }, []);

  const handleEditStaff = useCallback((staff: StaffMember) => {
    setEditingStaff(staff);
    setIsFormModalOpen(true);
  }, []);

  const handleAddStaff = useCallback(() => {
    setEditingStaff(null);
    setIsFormModalOpen(true);
  }, []);

  const handleCloseFormModal = useCallback(() => {
    setIsFormModalOpen(false);
    setEditingStaff(null);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setViewingStaff(null);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: Partial<StaffMember>) => {
      try {
        if (editingStaff) {
          // Update existing staff
          const updateData: UpdateStaffDto = {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            roles: data.role ? mapDisplayRoleToApi(data.role) : undefined,
            status: data.status ? mapDisplayStatusToUser(data.status) : undefined,
          };

          await updateMutation.mutateAsync({ id: editingStaff.id, data: updateData });
          toast.success('Angajat actualizat cu succes!');
        } else {
          // Create new staff - need password for new users
          if (!data.email || !data.firstName || !data.lastName) {
            toast.error('Va rugam completati toate campurile obligatorii');
            return;
          }

          const createData: CreateStaffDto = {
            email: data.email,
            password: 'TempPass123!', // Temporary password - user should reset
            firstName: data.firstName,
            lastName: data.lastName,
            roles: data.role ? mapDisplayRoleToApi(data.role) : ['STAFF'],
            status: data.status ? mapDisplayStatusToUser(data.status) : 'ACTIVE',
          };

          await createMutation.mutateAsync(createData);
          toast.success('Angajat creat cu succes! Un email de activare a fost trimis.');
        }

        setIsFormModalOpen(false);
        setEditingStaff(null);
      } catch (error) {
        console.error('Error saving staff:', error);
        toast.error('Eroare la salvarea angajatului');
      }
    },
    [editingStaff, updateMutation, createMutation]
  );

  const handleBulkActivate = useCallback(async () => {
    if (selectedStaff.size === 0) return;

    try {
      await bulkActivateMutation.mutateAsync(Array.from(selectedStaff));
      toast.success(`${selectedStaff.size} angajati activati cu succes!`);
      setSelectedStaff(new Set());
    } catch (error) {
      console.error('Bulk activate error:', error);
      toast.error('Eroare la activarea angajatilor');
    }
  }, [selectedStaff, bulkActivateMutation]);

  const handleBulkDeactivate = useCallback(async () => {
    if (selectedStaff.size === 0) return;

    try {
      await bulkDeactivateMutation.mutateAsync(Array.from(selectedStaff));
      toast.success(`${selectedStaff.size} angajati dezactivati cu succes!`);
      setSelectedStaff(new Set());
    } catch (error) {
      console.error('Bulk deactivate error:', error);
      toast.error('Eroare la dezactivarea angajatilor');
    }
  }, [selectedStaff, bulkDeactivateMutation]);

  const handleExport = useCallback(() => {
    // Export as CSV
    const headers = ['Nume', 'Prenume', 'Email', 'Rol', 'Status', 'Data Angajare'];
    const rows = staffData.map((s) => [
      s.lastName,
      s.firstName,
      s.email,
      roleConfig[s.role].label,
      statusConfig[s.status].label,
      s.hireDate,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personal_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Export realizat cu succes!');
  }, [staffData]);

  // Helper functions
  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const isAllSelected =
    filteredStaff.length > 0 && filteredStaff.every((s) => selectedStaff.has(s.id));
  const isSomeSelected = selectedStaff.size > 0;
  const isLoading = staffLoading;
  const isBulkActionPending = bulkActivateMutation.isPending || bulkDeactivateMutation.isPending;

  return (
    <AppShell
      title="Echipa"
      subtitle="Gestioneaza personalul clinicii"
      actions={
        <Button variant="primary" onClick={handleAddStaff}>
          <i className="ti ti-plus me-1"></i>
          Angajat Nou
        </Button>
      }
    >
      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard
            value={kpiData.total}
            label="Total Personal"
            icon="ti ti-users"
            iconColor="primary"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard
            value={kpiData.activeToday}
            label="Activi Astazi"
            icon="ti ti-user-check"
            iconColor="success"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard
            value={kpiData.onLeave}
            label="In Concediu"
            icon="ti ti-plane-departure"
            iconColor="warning"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard
            value={kpiData.newThisMonth}
            label="Noi Luna Aceasta"
            icon="ti ti-user-plus"
            iconColor="info"
          />
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="shadow-sm">
        {/* Data Table Header */}
        <DataTableHeader
          title="Lista Personal"
          subtitle={`${total} membri`}
          search={
            <SearchInput
              placeholder="Cauta dupa nume, email..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onClear={() => handleSearch('')}
              style={{ minWidth: 280 }}
            />
          }
          actions={
            <div className="d-flex gap-2 flex-wrap">
              {/* Filters */}
              <select
                className="form-select form-select-sm"
                value={roleFilter}
                onChange={handleRoleFilterChange}
                style={{ width: 'auto', minWidth: 140 }}
              >
                <option value="all">Toate Rolurile</option>
                {Object.entries(roleConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>

              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                style={{ width: 'auto', minWidth: 130 }}
              >
                <option value="all">Toate Statusurile</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>

              <select
                className="form-select form-select-sm"
                value={departmentFilter}
                onChange={handleDepartmentFilterChange}
                style={{ width: 'auto', minWidth: 160 }}
              >
                <option value="all">Toate Departamentele</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              {/* View Toggle */}
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('list')}
                  title="Vizualizare Lista"
                >
                  <i className="ti ti-list"></i>
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('grid')}
                  title="Vizualizare Grid"
                >
                  <i className="ti ti-layout-grid"></i>
                </button>
              </div>

              {/* Bulk Actions */}
              {isSomeSelected && (
                <div className="btn-group" role="group">
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={handleBulkActivate}
                    loading={bulkActivateMutation.isPending}
                    disabled={isBulkActionPending}
                    title="Activeaza Selectate"
                  >
                    <i className="ti ti-check me-1"></i>
                    Activeaza ({selectedStaff.size})
                  </Button>
                  <Button
                    variant="outline-warning"
                    size="sm"
                    onClick={handleBulkDeactivate}
                    loading={bulkDeactivateMutation.isPending}
                    disabled={isBulkActionPending}
                    title="Dezactiveaza Selectate"
                  >
                    <i className="ti ti-x me-1"></i>
                    Dezactiveaza
                  </Button>
                </div>
              )}

              {/* Export */}
              <Button variant="outline-secondary" size="sm" onClick={handleExport}>
                <i className="ti ti-download me-1"></i>
                Export
              </Button>
            </div>
          }
        />

        <CardBody className="p-0">
          {/* Loading State */}
          {isLoading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Se incarca...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {staffError && !isLoading && (
            <div className="text-center py-5">
              <div className="avatar avatar-lg bg-danger-transparent rounded-circle mx-auto mb-3">
                <i className="ti ti-alert-circle fs-24 text-danger"></i>
              </div>
              <h6 className="text-danger mb-2">Eroare la incarcarea datelor</h6>
              <p className="text-muted small mb-3">
                Nu am putut incarca lista de personal. Verificati conexiunea.
              </p>
              <Button variant="outline-primary" size="sm" onClick={() => window.location.reload()}>
                <i className="ti ti-refresh me-1"></i>
                Reincarca
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !staffError && filteredStaff.length === 0 && (
            <TableEmpty
              icon="ti ti-users-group"
              title={searchQuery ? 'Niciun rezultat gasit' : 'Niciun angajat inregistrat'}
              description={
                searchQuery
                  ? 'Incearca sa modifici criteriile de cautare sau sterge filtrele pentru a vedea tot personalul.'
                  : 'Adauga primul angajat pentru a incepe.'
              }
              action={
                !searchQuery && (
                  <Button variant="primary" onClick={handleAddStaff}>
                    <i className="ti ti-plus me-1"></i>
                    Adauga Angajat
                  </Button>
                )
              }
            />
          )}

          {/* List View */}
          {!isLoading && !staffError && filteredStaff.length > 0 && viewMode === 'list' && (
            <Table hover>
              <TableHead>
                <TableRow>
                  <TableHeaderCell style={{ width: 40 }}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={isAllSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </TableHeaderCell>
                  <TableHeaderCell>Angajat</TableHeaderCell>
                  <TableHeaderCell>Rol</TableHeaderCell>
                  <TableHeaderCell>Contact</TableHeaderCell>
                  <TableHeaderCell>Departament</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell style={{ width: 120 }}>Actiuni</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStaff.map((staff) => (
                  <TableRow
                    key={staff.id}
                    className="cursor-pointer"
                    onClick={() => handleViewStaff(staff)}
                  >
                    {/* Checkbox */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedStaff.has(staff.id)}
                        onChange={(e) => handleSelectStaff(staff.id, e.target.checked)}
                      />
                    </TableCell>

                    {/* Staff Info with Avatar */}
                    <TableCell>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className={`avatar avatar-sm bg-${roleConfig[staff.role].color.replace('soft-', '')}-transparent rounded-circle`}
                        >
                          {staff.avatar ? (
                            <img
                              src={staff.avatar}
                              alt={`${staff.firstName} ${staff.lastName}`}
                              className="avatar-img rounded-circle"
                            />
                          ) : (
                            <span
                              className={`avatar-text text-${roleConfig[staff.role].color.replace('soft-', '')} fw-medium`}
                            >
                              {getInitials(staff.firstName, staff.lastName)}
                            </span>
                          )}
                        </div>
                        <div>
                          <h6 className="mb-0 fw-semibold">
                            {staff.firstName} {staff.lastName}
                          </h6>
                          <small className="text-muted">
                            Angajat din {formatDate(staff.hireDate)}
                          </small>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <Badge variant={roleConfig[staff.role].color as 'soft-primary'}>
                        <i className={`${roleConfig[staff.role].icon} me-1`}></i>
                        {roleConfig[staff.role].label}
                      </Badge>
                    </TableCell>

                    {/* Contact */}
                    <TableCell>
                      <div>
                        <div className="d-flex align-items-center gap-1 text-muted">
                          <i className="ti ti-mail fs-14"></i>
                          <span className="small">{staff.email}</span>
                        </div>
                        {staff.phone && (
                          <div className="d-flex align-items-center gap-1 text-muted">
                            <i className="ti ti-phone fs-14"></i>
                            <span className="small">{staff.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Department */}
                    <TableCell>
                      <span className="text-muted">{staff.department}</span>
                      {staff.specializations.length > 0 && (
                        <div className="d-flex gap-1 flex-wrap mt-1">
                          {staff.specializations.slice(0, 2).map((spec, idx) => (
                            <Badge key={idx} variant="soft-secondary" size="sm">
                              {spec}
                            </Badge>
                          ))}
                          {staff.specializations.length > 2 && (
                            <Badge variant="soft-secondary" size="sm">
                              +{staff.specializations.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge variant={statusConfig[staff.status].color as 'soft-success'}>
                        {statusConfig[staff.status].label}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <TableActions>
                        <ActionButton
                          icon="ti ti-eye"
                          actionType="view"
                          tooltip="Vezi Detalii"
                          onClick={() => handleViewStaff(staff)}
                        />
                        <ActionButton
                          icon="ti ti-edit"
                          actionType="edit"
                          tooltip="Editeaza"
                          onClick={() => handleEditStaff(staff)}
                        />
                        <ActionButton
                          icon="ti ti-calendar"
                          actionType="default"
                          tooltip="Program Lucru"
                          onClick={() => toast('Functionalitate in dezvoltare', { icon: '🚧' })}
                        />
                      </TableActions>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Grid View */}
          {!isLoading && !staffError && filteredStaff.length > 0 && viewMode === 'grid' && (
            <div className="p-4">
              <div className="row g-4">
                {filteredStaff.map((staff) => (
                  <div key={staff.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                    <StaffCard
                      staff={staff}
                      roleConfig={roleConfig}
                      statusConfig={statusConfig}
                      onView={() => handleViewStaff(staff)}
                      onEdit={() => handleEditStaff(staff)}
                      selected={selectedStaff.has(staff.id)}
                      onSelect={(checked) => handleSelectStaff(staff.id, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardBody>

        {/* Pagination Footer */}
        {!isLoading && !staffError && totalPages > 1 && (
          <DataTableFooter
            info={`Afisare ${(currentPage - 1) * pageSize + 1} - ${Math.min(
              currentPage * pageSize,
              total
            )} din ${total} angajati`}
          >
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </DataTableFooter>
        )}
      </Card>

      {/* Form Modal */}
      <StaffFormModal
        open={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        staff={editingStaff}
        roleConfig={roleConfig}
        departments={departments}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Details Drawer */}
      <StaffDetailsDrawer
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        staff={viewingStaff}
        roleConfig={roleConfig}
        statusConfig={statusConfig}
        onEdit={handleEditStaff}
      />
    </AppShell>
  );
}

export default StaffPage;
