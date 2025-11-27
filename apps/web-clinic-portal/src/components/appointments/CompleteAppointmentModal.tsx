/**
 * Complete Appointment Modal
 * Allows selecting procedures before completing appointment
 */

import { useState } from 'react';
import { Modal } from '../overlay/Modal';
import { Button } from '../ui/Button';
import { ProcedureSelector } from './ProcedureSelector';
import { SelectedProceduresList } from './SelectedProceduresList';
import type { AppointmentDto } from '../../types/appointment.types';
import type { ProcedureCatalogItem } from '../../api/clinicalClient';

export interface SelectedProcedure {
  id: string;
  procedureId: string;
  code: string;
  name: string;
  price: number;
  quantity: number;
  tooth?: string;
  surfaces?: string[];
}

interface CompleteAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  appointment: AppointmentDto | null;
  onComplete: (procedures: SelectedProcedure[]) => Promise<void>;
  isLoading?: boolean;
}

export function CompleteAppointmentModal({
  open,
  onClose,
  appointment,
  onComplete,
  isLoading = false,
}: CompleteAppointmentModalProps) {
  const [selectedProcedures, setSelectedProcedures] = useState<SelectedProcedure[]>([]);

  const handleSelectProcedure = (procedure: ProcedureCatalogItem) => {
    const newProcedure: SelectedProcedure = {
      id: `${procedure.id}-${Date.now()}`,
      procedureId: procedure.id,
      code: procedure.code,
      name: procedure.name,
      price: procedure.defaultPrice,
      quantity: 1,
      tooth: undefined,
      surfaces: undefined,
    };

    setSelectedProcedures((prev) => [...prev, newProcedure]);
  };

  const handleRemoveProcedure = (id: string) => {
    setSelectedProcedures((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdateProcedure = (id: string, updates: Partial<SelectedProcedure>) => {
    setSelectedProcedures((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const total = selectedProcedures.reduce(
    (sum, proc) => sum + proc.price * proc.quantity,
    0
  );

  const handleSubmit = async () => {
    try {
      await onComplete(selectedProcedures);
      setSelectedProcedures([]);
      onClose();
    } catch (error) {
      // Error handled by parent
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedProcedures([]);
      onClose();
    }
  };

  if (!appointment) return null;

  return (
    <Modal open={open} onClose={handleClose} title="Finalizare Programare" size="lg">
      <div className="space-y-6">
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Pacient</span>
              <p className="text-white font-medium mt-1">
                {appointment.patientId}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Doctor</span>
              <p className="text-white font-medium mt-1">
                {appointment.providerId}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Data si Ora</span>
              <p className="text-white font-medium mt-1">
                {new Date(appointment.start).toLocaleString('ro-RO')}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Cod Serviciu</span>
              <p className="text-white font-medium mt-1">
                {appointment.serviceCode}
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Adauga Proceduri Efectuate
          </label>
          <ProcedureSelector
            onSelect={handleSelectProcedure}
            disabled={isLoading}
          />
          <p className="text-xs text-slate-400 mt-1">
            Cauta dupa codul CDT (ex: D0120) sau numele procedurii
          </p>
        </div>

        {selectedProcedures.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Proceduri Selectate
            </label>
            <SelectedProceduresList
              procedures={selectedProcedures}
              onRemove={handleRemoveProcedure}
              onUpdate={handleUpdateProcedure}
              disabled={isLoading}
            />
          </div>
        )}

        <div className="bg-[var(--brand)]/10 border border-[var(--brand)]/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-white font-semibold">Total</span>
            <span className="text-2xl font-bold text-[var(--brand)]">
              {total.toFixed(2)} RON
            </span>
          </div>
          {selectedProcedures.length > 0 && (
            <p className="text-xs text-slate-400 mt-2">
              O factura proforma va fi generata automat
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
            fullWidth
          >
            Anuleaza
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={isLoading || selectedProcedures.length === 0}
            fullWidth
          >
            {selectedProcedures.length > 0
              ? 'Finalizeaza si Genereaza Factura'
              : 'Finalizeaza Fara Factura'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
