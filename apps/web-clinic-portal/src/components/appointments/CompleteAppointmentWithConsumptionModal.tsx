/**
 * Complete Appointment With Consumption Modal
 *
 * Enhanced appointment completion modal that integrates stock consumption.
 * Flow:
 * 1. Select procedures performed
 * 2. Review and customize material consumption
 * 3. Confirm to complete appointment and deduct stock
 */

import { useState, useCallback, useEffect } from 'react';
import { Modal } from '../overlay/Modal';
import { Button } from '../ui/Button';
import { ProcedureSelector } from './ProcedureSelector';
import { SelectedProceduresList } from './SelectedProceduresList';
import { StockConsumptionModal, StockConsumptionTrigger } from '../inventory/StockConsumptionModal';
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

interface CompleteAppointmentWithConsumptionModalProps {
  open: boolean;
  onClose: () => void;
  appointment: AppointmentDto | null;
  onComplete: (procedures: SelectedProcedure[], materialCost: number) => Promise<void>;
  isLoading?: boolean;
}

export function CompleteAppointmentWithConsumptionModal({
  open,
  onClose,
  appointment,
  onComplete,
  isLoading = false,
}: CompleteAppointmentWithConsumptionModalProps) {
  const [selectedProcedures, setSelectedProcedures] = useState<SelectedProcedure[]>([]);
  const [showConsumptionModal, setShowConsumptionModal] = useState(false);
  const [materialCost, setMaterialCost] = useState(0);
  const [consumptionConfirmed, setConsumptionConfirmed] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedProcedures([]);
      setShowConsumptionModal(false);
      setMaterialCost(0);
      setConsumptionConfirmed(false);
    }
  }, [open]);

  const handleSelectProcedure = useCallback((procedure: ProcedureCatalogItem) => {
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
    // Reset consumption confirmation when procedures change
    setConsumptionConfirmed(false);
    setMaterialCost(0);
  }, []);

  const handleRemoveProcedure = useCallback((id: string) => {
    setSelectedProcedures((prev) => prev.filter((p) => p.id !== id));
    // Reset consumption confirmation when procedures change
    setConsumptionConfirmed(false);
    setMaterialCost(0);
  }, []);

  const handleUpdateProcedure = useCallback((id: string, updates: Partial<SelectedProcedure>) => {
    setSelectedProcedures((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    // Reset consumption confirmation when procedures change
    setConsumptionConfirmed(false);
    setMaterialCost(0);
  }, []);

  // Calculate procedure total
  const procedureTotal = selectedProcedures.reduce(
    (sum, proc) => sum + proc.price * proc.quantity,
    0
  );

  // Calculate grand total (procedures + materials)
  const grandTotal = procedureTotal + materialCost;

  // Handle consumption confirmation
  const handleConsumptionConfirm = useCallback((cost: number) => {
    setMaterialCost(cost);
    setConsumptionConfirmed(true);
    setShowConsumptionModal(false);
  }, []);

  // Handle final submit
  const handleSubmit = useCallback(async () => {
    try {
      await onComplete(selectedProcedures, materialCost);
      setSelectedProcedures([]);
      setMaterialCost(0);
      setConsumptionConfirmed(false);
      onClose();
    } catch (error) {
      // Error handled by parent
    }
  }, [selectedProcedures, materialCost, onComplete, onClose]);

  const handleClose = useCallback(() => {
    if (!isLoading) {
      setSelectedProcedures([]);
      setShowConsumptionModal(false);
      setMaterialCost(0);
      setConsumptionConfirmed(false);
      onClose();
    }
  }, [isLoading, onClose]);

  // Get unique procedure codes for consumption template
  const procedureCodes = [...new Set(selectedProcedures.map((p) => p.code))];
  const procedureNames = [...new Set(selectedProcedures.map((p) => p.name))];

  if (!appointment) return null;

  return (
    <>
      <Modal open={open} onClose={handleClose} title="Finalizare Programare" size="lg">
        <div className="space-y-6">
          {/* Appointment Info */}
          <div className="bg-[var(--surface-card)] rounded-lg p-4 border border-[var(--border)]">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[var(--text-tertiary)]">Pacient</span>
                <p className="text-[var(--text)] font-medium mt-1">
                  {appointment.patientId}
                </p>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)]">Doctor</span>
                <p className="text-[var(--text)] font-medium mt-1">
                  {appointment.providerId}
                </p>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)]">Data si Ora</span>
                <p className="text-[var(--text)] font-medium mt-1">
                  {new Date(appointment.start).toLocaleString('ro-RO')}
                </p>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)]">Cod Serviciu</span>
                <p className="text-[var(--text)] font-medium mt-1">
                  {appointment.serviceCode}
                </p>
              </div>
            </div>
          </div>

          {/* Procedure Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Adauga Proceduri Efectuate
            </label>
            <ProcedureSelector
              onSelect={handleSelectProcedure}
              disabled={isLoading}
            />
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Cauta dupa codul CDT (ex: D0120) sau numele procedurii
            </p>
          </div>

          {/* Selected Procedures */}
          {selectedProcedures.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
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

          {/* Stock Consumption Section */}
          {selectedProcedures.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Materiale Consumate
              </label>
              <StockConsumptionTrigger
                onClick={() => setShowConsumptionModal(true)}
                disabled={isLoading}
                hasWarnings={false}
                totalItems={consumptionConfirmed ? procedureCodes.length : 0}
                estimatedCost={materialCost}
              />
              {consumptionConfirmed && (
                <p className="text-xs text-[var(--success)] mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Consumul de materiale a fost configurat
                </p>
              )}
            </div>
          )}

          {/* Cost Summary */}
          <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-lg p-4 space-y-3">
            {/* Procedure Cost */}
            <div className="flex items-center justify-between">
              <span className="text-[var(--text)]">Cost Proceduri</span>
              <span className="font-semibold text-[var(--text)] tabular-nums">
                {procedureTotal.toFixed(2)} RON
              </span>
            </div>

            {/* Material Cost */}
            {materialCost > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-[var(--text)]">Cost Materiale</span>
                <span className="font-semibold text-[var(--text)] tabular-nums">
                  {materialCost.toFixed(2)} RON
                </span>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--primary)]/20">
              <span className="text-[var(--text)] font-semibold">Total</span>
              <span className="text-2xl font-bold text-[var(--primary)] tabular-nums">
                {grandTotal.toFixed(2)} RON
              </span>
            </div>

            {selectedProcedures.length > 0 && (
              <p className="text-xs text-[var(--text-tertiary)]">
                O factura proforma va fi generata automat
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
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

      {/* Stock Consumption Modal */}
      {appointment && selectedProcedures.length > 0 && (
        <StockConsumptionModal
          open={showConsumptionModal}
          onClose={() => setShowConsumptionModal(false)}
          onConfirm={handleConsumptionConfirm}
          appointmentId={appointment.id}
          patientId={appointment.patientId}
          providerId={appointment.providerId}
          procedureCodes={procedureCodes}
          procedureNames={procedureNames}
          disabled={isLoading}
        />
      )}
    </>
  );
}
