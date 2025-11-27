/**
 * Staff Management Page
 *
 * Comprehensive staff/employee management with KPI cards,
 * filters, list/grid views, and CRUD operations.
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

// Types
export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'doctor' | 'asistent' | 'receptioner' | 'admin' | 'manager';
  department: string;
  specializations: string[];
  status: 'activ' | 'inactiv' | 'concediu' | 'suspendat';
  avatar?: string;
  hireDate: string;
  schedule?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  patientsCount?: number;
  lastActive?: string;
}

// Mock data with Romanian names
const mockStaffData: StaffMember[] = [
  {
    id: '1',
    firstName: 'Dr. Alexandru',
    lastName: 'Popescu',
    email: 'alexandru.popescu@clinica.ro',
    phone: '+40 721 123 456',
    role: 'doctor',
    department: 'Stomatologie Generala',
    specializations: ['Endodontie', 'Protetice'],
    status: 'activ',
    hireDate: '2020-03-15',
    patientsCount: 145,
    lastActive: '2025-11-27T09:30:00',
  },
  {
    id: '2',
    firstName: 'Dr. Maria',
    lastName: 'Ionescu',
    email: 'maria.ionescu@clinica.ro',
    phone: '+40 722 234 567',
    role: 'doctor',
    department: 'Ortodontie',
    specializations: ['Ortodontie', 'Pedodontie'],
    status: 'activ',
    hireDate: '2019-06-01',
    patientsCount: 198,
    lastActive: '2025-11-27T10:15:00',
  },
  {
    id: '3',
    firstName: 'Elena',
    lastName: 'Dumitrescu',
    email: 'elena.dumitrescu@clinica.ro',
    phone: '+40 723 345 678',
    role: 'asistent',
    department: 'Stomatologie Generala',
    specializations: ['Asistenta Dentara', 'Sterilizare'],
    status: 'activ',
    hireDate: '2021-09-01',
    patientsCount: 0,
    lastActive: '2025-11-27T08:45:00',
  },
  {
    id: '4',
    firstName: 'Andrei',
    lastName: 'Stanescu',
    email: 'andrei.stanescu@clinica.ro',
    phone: '+40 724 456 789',
    role: 'receptioner',
    department: 'Receptie',
    specializations: ['Programari', 'Relatii Pacienti'],
    status: 'activ',
    hireDate: '2022-01-10',
    patientsCount: 0,
    lastActive: '2025-11-27T07:00:00',
  },
  {
    id: '5',
    firstName: 'Dr. Cristian',
    lastName: 'Gheorghiu',
    email: 'cristian.gheorghiu@clinica.ro',
    phone: '+40 725 567 890',
    role: 'doctor',
    department: 'Chirurgie Orala',
    specializations: ['Chirurgie', 'Implantologie'],
    status: 'concediu',
    hireDate: '2018-02-20',
    patientsCount: 89,
    lastActive: '2025-11-20T16:00:00',
  },
  {
    id: '6',
    firstName: 'Ana',
    lastName: 'Mihai',
    email: 'ana.mihai@clinica.ro',
    phone: '+40 726 678 901',
    role: 'admin',
    department: 'Administratie',
    specializations: ['Management', 'Financiar'],
    status: 'activ',
    hireDate: '2017-05-15',
    patientsCount: 0,
    lastActive: '2025-11-27T09:00:00',
  },
  {
    id: '7',
    firstName: 'Dr. Ioana',
    lastName: 'Vasile',
    email: 'ioana.vasile@clinica.ro',
    phone: '+40 727 789 012',
    role: 'doctor',
    department: 'Estetica Dentara',
    specializations: ['Estetica', 'Albire'],
    status: 'activ',
    hireDate: '2021-03-01',
    patientsCount: 112,
    lastActive: '2025-11-27T11:00:00',
  },
  {
    id: '8',
    firstName: 'Mihaela',
    lastName: 'Preda',
    email: 'mihaela.preda@clinica.ro',
    phone: '+40 728 890 123',
    role: 'asistent',
    department: 'Ortodontie',
    specializations: ['Asistenta Dentara', 'Radiologie'],
    status: 'inactiv',
    hireDate: '2020-07-01',
    patientsCount: 0,
    lastActive: '2025-11-15T14:00:00',
  },
  {
    id: '9',
    firstName: 'Gabriel',
    lastName: 'Constantinescu',
    email: 'gabriel.constantinescu@clinica.ro',
    phone: '+40 729 901 234',
    role: 'manager',
    department: 'Management',
    specializations: ['Management Clinic', 'HR'],
    status: 'activ',
    hireDate: '2016-01-15',
    patientsCount: 0,
    lastActive: '2025-11-27T08:00:00',
  },
  {
    id: '10',
    firstName: 'Raluca',
    lastName: 'Popa',
    email: 'raluca.popa@clinica.ro',
    phone: '+40 730 012 345',
    role: 'receptioner',
    department: 'Receptie',
    specializations: ['Programari', 'Facturare'],
    status: 'activ',
    hireDate: '2023-06-01',
    patientsCount: 0,
    lastActive: '2025-11-27T07:30:00',
  },
];

// Role configuration
const roleConfig: Record<StaffMember['role'], { label: string; color: string; icon: string }> = {
  doctor: { label: 'Doctor', color: 'soft-primary', icon: 'ti ti-stethoscope' },
  asistent: { label: 'Asistent', color: 'soft-info', icon: 'ti ti-heart-handshake' },
  receptioner: { label: 'Receptioner', color: 'soft-warning', icon: 'ti ti-headset' },
  admin: { label: 'Administrator', color: 'soft-danger', icon: 'ti ti-shield-check' },
  manager: { label: 'Manager', color: 'soft-purple', icon: 'ti ti-briefcase' },
};

// Status configuration
const statusConfig: Record<StaffMember['status'], { label: string; color: string }> = {
  activ: { label: 'Activ', color: 'soft-success' },
  inactiv: { label: 'Inactiv', color: 'soft-secondary' },
  concediu: { label: 'In Concediu', color: 'soft-warning' },
  suspendat: { label: 'Suspendat', color: 'soft-danger' },
};

type ViewMode = 'list' | 'grid';

export function StaffPage() {
  // State
  const [staffData] = useState<StaffMember[]>(mockStaffData);
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

  // Computed values
  const departments = useMemo(() => {
    const depts = new Set(staffData.map((s) => s.department));
    return Array.from(depts).sort();
  }, [staffData]);

  // Filter staff data
  const filteredStaff = useMemo(() => {
    return staffData.filter((staff) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          staff.firstName.toLowerCase().includes(query) ||
          staff.lastName.toLowerCase().includes(query) ||
          staff.email.toLowerCase().includes(query) ||
          staff.phone.includes(query);
        if (!matchesSearch) return false;
      }

      // Role filter
      if (roleFilter !== 'all' && staff.role !== roleFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && staff.status !== statusFilter) {
        return false;
      }

      // Department filter
      if (departmentFilter !== 'all' && staff.department !== departmentFilter) {
        return false;
      }

      return true;
    });
  }, [staffData, searchQuery, roleFilter, statusFilter, departmentFilter]);

  // Paginated data
  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStaff.slice(start, start + pageSize);
  }, [filteredStaff, currentPage]);

  const totalPages = Math.ceil(filteredStaff.length / pageSize);

  // KPI calculations
  const kpiData = useMemo(() => {
    const total = staffData.length;
    const activeToday = staffData.filter(
      (s) =>
        s.status === 'activ' &&
        s.lastActive &&
        new Date(s.lastActive).toDateString() === new Date().toDateString()
    ).length;
    const onLeave = staffData.filter((s) => s.status === 'concediu').length;
    const newThisMonth = staffData.filter((s) => {
      const hireDate = new Date(s.hireDate);
      const now = new Date();
      return (
        hireDate.getMonth() === now.getMonth() && hireDate.getFullYear() === now.getFullYear()
      );
    }).length;

    return { total, activeToday, onLeave, newThisMonth };
  }, [staffData]);

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
        setSelectedStaff(new Set(paginatedStaff.map((s) => s.id)));
      } else {
        setSelectedStaff(new Set());
      }
    },
    [paginatedStaff]
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

  const handleFormSubmit = useCallback((data: Partial<StaffMember>) => {
    console.log('Form submitted:', data);
    // TODO: Implement API call
    setIsFormModalOpen(false);
    setEditingStaff(null);
  }, []);

  const handleBulkActivate = useCallback(() => {
    console.log('Bulk activate:', Array.from(selectedStaff));
    // TODO: Implement bulk activate
  }, [selectedStaff]);

  const handleBulkDeactivate = useCallback(() => {
    console.log('Bulk deactivate:', Array.from(selectedStaff));
    // TODO: Implement bulk deactivate
  }, [selectedStaff]);

  const handleExport = useCallback(() => {
    console.log('Export staff data');
    // TODO: Implement export
  }, []);

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
    paginatedStaff.length > 0 && paginatedStaff.every((s) => selectedStaff.has(s.id));
  const isSomeSelected = selectedStaff.size > 0;

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
          subtitle={`${filteredStaff.length} membri`}
          search={
            <SearchInput
              placeholder="Cauta dupa nume, email, telefon..."
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
                    title="Activeaza Selectate"
                  >
                    <i className="ti ti-check me-1"></i>
                    Activeaza
                  </Button>
                  <Button
                    variant="outline-warning"
                    size="sm"
                    onClick={handleBulkDeactivate}
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
          {filteredStaff.length === 0 ? (
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
          ) : viewMode === 'list' ? (
            /* List View */
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
                {paginatedStaff.map((staff) => (
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
                        <div className="d-flex align-items-center gap-1 text-muted">
                          <i className="ti ti-phone fs-14"></i>
                          <span className="small">{staff.phone}</span>
                        </div>
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
                          onClick={() => console.log('View schedule:', staff.id)}
                        />
                      </TableActions>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            /* Grid View */
            <div className="p-4">
              <div className="row g-4">
                {paginatedStaff.map((staff) => (
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
        {totalPages > 1 && (
          <DataTableFooter
            info={`Afisare ${(currentPage - 1) * pageSize + 1} - ${Math.min(
              currentPage * pageSize,
              filteredStaff.length
            )} din ${filteredStaff.length} angajati`}
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
