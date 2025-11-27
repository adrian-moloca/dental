/**
 * Interventions Demo Page
 *
 * Example showing how to use the ProcedureConsumptionModal in a typical workflow.
 * This demonstrates the complete flow from completing a procedure to deducting stock.
 */

import { useState } from 'react';
import { Card, CardHeader, CardBody, Button, Badge } from '../components/ui-new';
import { ProcedureConsumptionModal } from '../components/clinical';
import toast from 'react-hot-toast';

// Mock data matching the intervention system
const MOCK_PRODUCTS = [
  { id: '1', code: 'COMP-A2', name: 'Compozit A2', category: 'Materiale Restaurare', uom: 'bucata', unitCost: 45, stockQty: 12, minQty: 5 },
  { id: '2', code: 'ANEST-LID', name: 'Anestezic Lidocaina 2%', category: 'Anestezice', uom: 'fiola', unitCost: 3.5, stockQty: 50, minQty: 20 },
  { id: '3', code: 'GLOVES-M', name: 'Manusi latex M', category: 'Consumabile', uom: 'cutie', unitCost: 25, stockQty: 8, minQty: 3 },
  { id: '6', code: 'BONDING', name: 'Agent de adeziune', category: 'Materiale Restaurare', uom: 'flacon', unitCost: 80, stockQty: 5, minQty: 2 },
  { id: '7', code: 'ACID-37', name: 'Acid ortofosforic 37%', category: 'Materiale Restaurare', uom: 'flacon', unitCost: 35, stockQty: 8, minQty: 3 },
];

const MOCK_INTERVENTION = {
  id: '1',
  code: 'OBT-001',
  name: 'Obturatie compozit simpla',
  products: [
    { productId: '1', quantity: 1, isOptional: false },
    { productId: '2', quantity: 1, isOptional: false },
    { productId: '3', quantity: 2, isOptional: false },
    { productId: '6', quantity: 0.5, isOptional: false },
    { productId: '7', quantity: 0.5, isOptional: false },
  ],
};

const MOCK_APPOINTMENTS = [
  {
    id: '1',
    patientName: 'Maria Popescu',
    date: '2025-11-27 10:00',
    procedure: 'Obturatie compozit simpla',
    status: 'in_progress',
  },
  {
    id: '2',
    patientName: 'Ion Georgescu',
    date: '2025-11-27 11:30',
    procedure: 'Tratament endodontic',
    status: 'checked_in',
  },
  {
    id: '3',
    patientName: 'Elena Dumitrescu',
    date: '2025-11-27 14:00',
    procedure: 'Detartraj',
    status: 'scheduled',
  },
];

export function InterventionsDemo() {
  const [showConsumptionModal, setShowConsumptionModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<typeof MOCK_APPOINTMENTS[0] | null>(null);
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);

  const handleCompleteProcedure = (appointment: typeof MOCK_APPOINTMENTS[0]) => {
    setSelectedAppointment(appointment);
    setShowConsumptionModal(true);
  };

  const handleConfirmConsumption = (consumedProducts: any[]) => {
    console.log('Consumed products:', consumedProducts);

    // Update appointment status
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === selectedAppointment?.id
          ? { ...apt, status: 'completed' as const }
          : apt
      )
    );

    toast.success(
      `Procedura finalizata! ${consumedProducts.length} produse deduse din stoc.`
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="soft-secondary">Programat</Badge>;
      case 'checked_in':
        return <Badge variant="soft-primary">Prezent</Badge>;
      case 'in_progress':
        return <Badge variant="soft-warning">In desfasurare</Badge>;
      case 'completed':
        return <Badge variant="soft-success">Finalizat</Badge>;
      default:
        return <Badge variant="soft-secondary">{status}</Badge>;
    }
  };

  return (
    <div className="content">
      {/* Page Header */}
      <div className="d-flex align-items-sm-center justify-content-between flex-wrap gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1">Demo - Flux Interventii</h4>
          <p className="text-muted mb-0">
            Exemplu de integrare a sistemului de consum materiale
          </p>
        </div>
      </div>

      {/* Instructions */}
      <Card className="shadow-sm mb-4">
        <CardHeader className="bg-primary bg-opacity-10">
          <h5 className="fw-bold mb-0 text-primary">
            <i className="ti ti-info-circle me-2"></i>
            Cum functioneaza sistemul
          </h5>
        </CardHeader>
        <CardBody>
          <div className="row g-4">
            <div className="col-md-3">
              <div className="text-center">
                <div className="avatar avatar-lg bg-primary bg-opacity-10 rounded-circle mx-auto mb-3">
                  <i className="ti ti-clipboard-plus fs-32 text-primary"></i>
                </div>
                <h6 className="fw-semibold mb-2">1. Configureaza Interventii</h6>
                <p className="text-muted small mb-0">
                  Defineste produsele necesare pentru fiecare tip de interventie
                </p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <div className="avatar avatar-lg bg-success bg-opacity-10 rounded-circle mx-auto mb-3">
                  <i className="ti ti-calendar-check fs-32 text-success"></i>
                </div>
                <h6 className="fw-semibold mb-2">2. Executa Procedura</h6>
                <p className="text-muted small mb-0">
                  Efectueaza tratamentul la pacient conform planului
                </p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <div className="avatar avatar-lg bg-warning bg-opacity-10 rounded-circle mx-auto mb-3">
                  <i className="ti ti-package fs-32 text-warning"></i>
                </div>
                <h6 className="fw-semibold mb-2">3. Ajusteaza Consumul</h6>
                <p className="text-muted small mb-0">
                  Modifica cantitatile efectiv utilizate in timpul procedurii
                </p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <div className="avatar avatar-lg bg-info bg-opacity-10 rounded-circle mx-auto mb-3">
                  <i className="ti ti-database-export fs-32 text-info"></i>
                </div>
                <h6 className="fw-semibold mb-2">4. Deducere Automata</h6>
                <p className="text-muted small mb-0">
                  Produsele sunt deduse automat din stoc la confirmare
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Today's Appointments */}
      <Card className="shadow-sm">
        <CardHeader>
          <h5 className="fw-bold mb-0">Programari de Azi</h5>
        </CardHeader>
        <CardBody>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Ora</th>
                  <th>Pacient</th>
                  <th>Procedura</th>
                  <th>Status</th>
                  <th className="text-end">Actiuni</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id}>
                    <td>
                      <span className="fw-semibold text-primary">
                        {apt.date.split(' ')[1]}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar avatar-sm me-2 bg-primary bg-opacity-10 rounded-circle">
                          <span className="avatar-text text-primary fw-semibold">
                            {apt.patientName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </span>
                        </div>
                        <span className="fw-medium">{apt.patientName}</span>
                      </div>
                    </td>
                    <td>{apt.procedure}</td>
                    <td>{getStatusBadge(apt.status)}</td>
                    <td>
                      <div className="d-flex gap-2 justify-content-end">
                        {apt.status === 'in_progress' && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleCompleteProcedure(apt)}
                          >
                            <i className="ti ti-check me-2"></i>
                            Finalizeaza
                          </Button>
                        )}
                        {apt.status === 'checked_in' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setAppointments((prev) =>
                                prev.map((a) =>
                                  a.id === apt.id
                                    ? { ...a, status: 'in_progress' as const }
                                    : a
                                )
                              );
                              toast.success('Procedura inceputa');
                            }}
                          >
                            <i className="ti ti-player-play me-2"></i>
                            Incepe
                          </Button>
                        )}
                        {apt.status === 'completed' && (
                          <Badge variant="soft-success">
                            <i className="ti ti-check me-1"></i>
                            Finalizat
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Procedure Consumption Modal */}
      <ProcedureConsumptionModal
        open={showConsumptionModal}
        onClose={() => {
          setShowConsumptionModal(false);
          setSelectedAppointment(null);
        }}
        onConfirm={handleConfirmConsumption}
        intervention={MOCK_INTERVENTION}
        availableProducts={MOCK_PRODUCTS}
        patientName={selectedAppointment?.patientName}
        appointmentDate={selectedAppointment?.date}
      />
    </div>
  );
}

export default InterventionsDemo;
