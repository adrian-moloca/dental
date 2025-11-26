/**
 * Patients List Page - Preclinic-style
 *
 * Patient roster with search, filters, and data table.
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
  TableEmpty,
  DataTableHeader,
  DataTableFooter,
  Pagination,
} from '../components/ui-new';

export default function PatientsListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
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

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  // Calculate age from date of birth
  const calculateAge = (dob: string | Date) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Get initials from name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <AppShell
        title="Pacienti"
        subtitle="Gestioneaza fisele pacientilor"
        actions={
          <Button variant="primary" onClick={() => navigate('/patients/new')}>
            <i className="ti ti-plus me-1"></i>
            Pacient Nou
          </Button>
        }
      >
        <Card className="shadow-sm">
          <CardBody>
            <div className="placeholder-glow">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="d-flex gap-3 py-3 border-bottom">
                  <span className="placeholder col-1"></span>
                  <span className="placeholder col-3"></span>
                  <span className="placeholder col-2"></span>
                  <span className="placeholder col-2"></span>
                  <span className="placeholder col-1"></span>
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
      <AppShell
        title="Pacienti"
        subtitle="Gestioneaza fisele pacientilor"
      >
        <Card className="shadow-sm border-danger">
          <CardBody className="text-center py-5">
            <div className="avatar avatar-xl bg-danger-transparent rounded-circle mx-auto mb-3">
              <i className="ti ti-alert-circle fs-32 text-danger"></i>
            </div>
            <h5 className="fw-bold mb-2">Eroare la incarcarea pacientilor</h5>
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

  const patients = data?.data || [];

  return (
    <AppShell
      title="Pacienti"
      subtitle="Gestioneaza fisele pacientilor"
      actions={
        <Button variant="primary" onClick={() => navigate('/patients/new')}>
          <i className="ti ti-plus me-1"></i>
          Pacient Nou
        </Button>
      }
    >
      <Card className="shadow-sm">
        {/* Data Table Header */}
        <DataTableHeader
          title="Lista Pacienti"
          subtitle={data ? `${data.total} pacienti in total` : undefined}
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
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" size="sm">
                <i className="ti ti-filter me-1"></i>
                Filtre
              </Button>
              <Button variant="outline-secondary" size="sm">
                <i className="ti ti-download me-1"></i>
                Export
              </Button>
            </div>
          }
        />

        <CardBody className="p-0">
          {patients.length === 0 ? (
            <TableEmpty
              icon="ti ti-users-group"
              title={searchQuery ? 'Niciun rezultat gasit' : 'Niciun pacient inregistrat'}
              description={
                searchQuery
                  ? 'Incearca sa modifici criteriile de cautare sau sterge cautarea pentru a vedea toti pacientii.'
                  : 'Adauga primul pacient pentru a incepe.'
              }
              action={
                !searchQuery && (
                  <Button variant="primary" onClick={() => navigate('/patients/new')}>
                    <i className="ti ti-plus me-1"></i>
                    Adauga Pacient
                  </Button>
                )
              }
            />
          ) : (
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
                          <i className="ti ti-mail fs-14"></i>
                          <span className="small">
                            {patient.emails?.[0]?.address || 'Fara email'}
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-1 text-muted">
                          <i className="ti ti-phone fs-14"></i>
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
                          {new Date(patient.dateOfBirth).toLocaleDateString('ro-RO')}
                        </span>
                        <small className="d-block text-muted">
                          {calculateAge(patient.dateOfBirth)} ani
                        </small>
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
