/**
 * Treatment Plan Create Page - Enhanced Treatment Plan Builder
 *
 * A comprehensive treatment plan builder for dental practices with:
 * - Patient selection and info display
 * - Mini odontogram for tooth selection
 * - Multi-phase treatment planning
 * - Procedure catalog with drag-and-drop
 * - Financial summary with discounts
 * - Alternative plan comparison
 * - Smart suggestions and warnings
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Input,
  Textarea,
  Modal,
  ConfirmModal,
  Breadcrumb,
  type BreadcrumbItem,
} from '../components/ui-new';
import { usePatient, usePatients } from '../hooks/usePatients';
import { useProcedureCatalog, useCreateTreatmentPlan } from '../hooks/useClinical';
import { useDebounce } from '../hooks/useDebounce';
import OdontogramEditor from '../components/clinical/OdontogramEditor';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

// ============================================================================
// Types
// ============================================================================

interface ProcedureItem {
  id: string;
  procedureId: string;
  code: string;
  name: string;
  description: string;
  category: string;
  tooth?: string;
  surfaces?: string[];
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  estimatedDuration?: number;
}

interface TreatmentPhase {
  id: string;
  name: string;
  order: number;
  procedures: ProcedureItem[];
  subtotal: number;
  isCollapsed: boolean;
}

interface AlternativePlan {
  id: string;
  name: string;
  phases: TreatmentPhase[];
  isRecommended: boolean;
  advantages: string[];
  disadvantages: string[];
  grandTotal: number;
}

interface DiscountConfig {
  type: 'percentage' | 'fixed';
  value: number;
}

interface PaymentPlanConfig {
  enabled: boolean;
  downPayment: number;
  installments: number;
  frequency: 'weekly' | 'monthly';
}

interface ToothCondition {
  condition: string;
  surfaces: string[];
}

interface ToothData {
  toothNumber: number;
  conditions: ToothCondition[];
  inPlan: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const PROCEDURE_CATEGORIES = [
  { id: 'all', name: 'Toate', icon: 'ti-list' },
  { id: 'preventive', name: 'Preventie', icon: 'ti-shield-check' },
  { id: 'restorative', name: 'Restaurare', icon: 'ti-tool' },
  { id: 'endodontic', name: 'Endodontie', icon: 'ti-medical-cross' },
  { id: 'periodontic', name: 'Parodontologie', icon: 'ti-heart-rate-monitor' },
  { id: 'prosthodontic', name: 'Protetica', icon: 'ti-crown' },
  { id: 'surgical', name: 'Chirurgie', icon: 'ti-cut' },
  { id: 'orthodontic', name: 'Ortodontie', icon: 'ti-arrows-horizontal' },
  { id: 'implant', name: 'Implantologie', icon: 'ti-pin' },
];

const ADULT_TEETH_FDI = [
  [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
  [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38],
];

const TOOTH_CONDITIONS = [
  { value: 'healthy', label: 'Sanatos', color: 'bg-success' },
  { value: 'caries', label: 'Carie', color: 'bg-danger' },
  { value: 'filling', label: 'Plomba', color: 'bg-primary' },
  { value: 'crown', label: 'Coroana', color: 'bg-purple' },
  { value: 'missing', label: 'Lipsa', color: 'bg-secondary' },
  { value: 'implant', label: 'Implant', color: 'bg-indigo' },
  { value: 'root_canal', label: 'Canal', color: 'bg-warning' },
];

// Demo procedure catalog for when API is not available
const DEMO_PROCEDURES = [
  { id: '1', code: 'D0120', name: 'Consultatie Periodica', description: 'Examinare orala periodica', category: 'preventive', defaultPrice: 150, estimatedDuration: 15 },
  { id: '2', code: 'D1110', name: 'Detartraj si Periaj Profesional', description: 'Curatare dentara profesionala', category: 'preventive', defaultPrice: 250, estimatedDuration: 45 },
  { id: '3', code: 'D2140', name: 'Plomba Compozit 1 Suprafata', description: 'Restaurare cu compozit fotopolimerizabil', category: 'restorative', defaultPrice: 350, estimatedDuration: 30 },
  { id: '4', code: 'D2150', name: 'Plomba Compozit 2 Suprafete', description: 'Restaurare cu compozit 2 suprafete', category: 'restorative', defaultPrice: 450, estimatedDuration: 45 },
  { id: '5', code: 'D2160', name: 'Plomba Compozit 3 Suprafete', description: 'Restaurare cu compozit 3 suprafete', category: 'restorative', defaultPrice: 550, estimatedDuration: 60 },
  { id: '6', code: 'D2391', name: 'Plomba Compozit MOD', description: 'Restaurare compozit MOD', category: 'restorative', defaultPrice: 650, estimatedDuration: 60 },
  { id: '7', code: 'D2740', name: 'Coroana Ceramica', description: 'Coroana integral ceramica', category: 'prosthodontic', defaultPrice: 2500, estimatedDuration: 120 },
  { id: '8', code: 'D2750', name: 'Coroana Metalo-Ceramica', description: 'Coroana metalo-ceramica', category: 'prosthodontic', defaultPrice: 1800, estimatedDuration: 120 },
  { id: '9', code: 'D3310', name: 'Tratament Canal Anterior', description: 'Tratament endodontic dinte anterior', category: 'endodontic', defaultPrice: 800, estimatedDuration: 60 },
  { id: '10', code: 'D3320', name: 'Tratament Canal Premolar', description: 'Tratament endodontic premolar', category: 'endodontic', defaultPrice: 1000, estimatedDuration: 90 },
  { id: '11', code: 'D3330', name: 'Tratament Canal Molar', description: 'Tratament endodontic molar', category: 'endodontic', defaultPrice: 1500, estimatedDuration: 120 },
  { id: '12', code: 'D4341', name: 'Chiuretaj Parodontal', description: 'Chiuretaj si planare radiculara', category: 'periodontic', defaultPrice: 300, estimatedDuration: 45 },
  { id: '13', code: 'D6010', name: 'Implant Dentar', description: 'Implant dentar din titan', category: 'implant', defaultPrice: 4500, estimatedDuration: 90 },
  { id: '14', code: 'D6058', name: 'Coroana pe Implant', description: 'Coroana ceramica pe implant', category: 'implant', defaultPrice: 3000, estimatedDuration: 60 },
  { id: '15', code: 'D7140', name: 'Extractie Simpla', description: 'Extractie dinte erupt', category: 'surgical', defaultPrice: 200, estimatedDuration: 30 },
  { id: '16', code: 'D7210', name: 'Extractie Chirurgicala', description: 'Extractie cu alveolotomie', category: 'surgical', defaultPrice: 500, estimatedDuration: 45 },
  { id: '17', code: 'D7240', name: 'Extractie Molar de Minte', description: 'Extractie molar de minte inclus', category: 'surgical', defaultPrice: 800, estimatedDuration: 60 },
  { id: '18', code: 'D8080', name: 'Aparat Dentar Fix', description: 'Tratament ortodontic aparat fix', category: 'orthodontic', defaultPrice: 8000, estimatedDuration: 60 },
];

// Treatment sequence warnings
const SEQUENCE_WARNINGS: Record<string, string[]> = {
  crown: ['root_canal', 'buildup'],
  implant: ['extraction', 'bone_graft'],
  bridge: ['extraction'],
};

// ============================================================================
// Helper Functions
// ============================================================================

const generateId = () => crypto.randomUUID();

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const calculatePhaseSubtotal = (procedures: ProcedureItem[]): number => {
  return procedures.reduce((sum, p) => sum + p.total, 0);
};

const calculateGrandTotal = (phases: TreatmentPhase[]): number => {
  return phases.reduce((sum, phase) => sum + phase.subtotal, 0);
};

const calculateDiscount = (total: number, discount: DiscountConfig): number => {
  if (discount.type === 'percentage') {
    return (total * discount.value) / 100;
  }
  return discount.value;
};

const calculatePatientResponsibility = (
  total: number,
  discount: DiscountConfig,
  insuranceCoverage: number
): number => {
  const discountAmount = calculateDiscount(total, discount);
  return Math.max(0, total - discountAmount - insuranceCoverage);
};

// ============================================================================
// Mini Odontogram Component
// ============================================================================

interface MiniOdontogramProps {
  teethData: Map<number, ToothData>;
  selectedTooth: number | null;
  onToothClick: (toothNumber: number) => void;
  teethInPlan: Set<number>;
}

function MiniOdontogram({
  teethData,
  selectedTooth,
  onToothClick,
  teethInPlan,
}: MiniOdontogramProps) {
  const getToothColor = (toothNumber: number): string => {
    const tooth = teethData.get(toothNumber);
    if (!tooth || tooth.conditions.length === 0) return 'bg-success';
    const condition = tooth.conditions[0].condition;
    const config = TOOTH_CONDITIONS.find((c) => c.value === condition);
    return config?.color || 'bg-success';
  };

  return (
    <div className="mini-odontogram">
      {/* Upper Arch */}
      <div className="d-flex justify-content-center gap-1 mb-2">
        {ADULT_TEETH_FDI[0].map((toothNumber) => (
          <button
            key={toothNumber}
            type="button"
            onClick={() => onToothClick(toothNumber)}
            className={clsx(
              'mini-tooth btn p-0 position-relative',
              getToothColor(toothNumber),
              selectedTooth === toothNumber && 'ring-2 ring-primary',
              teethInPlan.has(toothNumber) && 'tooth-in-plan'
            )}
            style={{
              width: '24px',
              height: '32px',
              borderRadius: '4px',
              border: selectedTooth === toothNumber ? '2px solid var(--bs-primary)' : '1px solid rgba(0,0,0,0.2)',
              transition: 'all 0.15s ease',
            }}
            title={`Dinte ${toothNumber}`}
          >
            <span className="position-absolute" style={{ fontSize: '8px', top: '-12px', left: '50%', transform: 'translateX(-50%)', color: 'var(--bs-secondary)' }}>
              {toothNumber}
            </span>
            {teethInPlan.has(toothNumber) && (
              <span className="position-absolute" style={{ bottom: '-8px', left: '50%', transform: 'translateX(-50%)' }}>
                <i className="ti ti-check text-success" style={{ fontSize: '10px' }}></i>
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lower Arch */}
      <div className="d-flex justify-content-center gap-1">
        {ADULT_TEETH_FDI[1].map((toothNumber) => (
          <button
            key={toothNumber}
            type="button"
            onClick={() => onToothClick(toothNumber)}
            className={clsx(
              'mini-tooth btn p-0 position-relative',
              getToothColor(toothNumber),
              selectedTooth === toothNumber && 'ring-2 ring-primary',
              teethInPlan.has(toothNumber) && 'tooth-in-plan'
            )}
            style={{
              width: '24px',
              height: '32px',
              borderRadius: '4px',
              border: selectedTooth === toothNumber ? '2px solid var(--bs-primary)' : '1px solid rgba(0,0,0,0.2)',
              transition: 'all 0.15s ease',
            }}
            title={`Dinte ${toothNumber}`}
          >
            {teethInPlan.has(toothNumber) && (
              <span className="position-absolute" style={{ top: '-8px', left: '50%', transform: 'translateX(-50%)' }}>
                <i className="ti ti-check text-success" style={{ fontSize: '10px' }}></i>
              </span>
            )}
            <span className="position-absolute" style={{ fontSize: '8px', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', color: 'var(--bs-secondary)' }}>
              {toothNumber}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Procedure Catalog Sidebar Component
// ============================================================================

interface ProcedureCatalogProps {
  onAddProcedure: (procedure: ProcedureItem) => void;
  selectedTooth: number | null;
}

function ProcedureCatalog({ onAddProcedure, selectedTooth }: ProcedureCatalogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Use API catalog with fallback to demo data
  const { data: catalogData } = useProcedureCatalog(
    debouncedSearch.length >= 2 ? debouncedSearch : undefined,
    selectedCategory !== 'all' ? selectedCategory : undefined
  );

  const procedures = useMemo(() => {
    let list = catalogData?.data || DEMO_PROCEDURES;

    // Filter by category
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Filter by search
    if (debouncedSearch.length >= 2) {
      const search = debouncedSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.code.toLowerCase().includes(search) ||
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search)
      );
    }

    return list;
  }, [catalogData, selectedCategory, debouncedSearch]);

  type ProcedureType = typeof DEMO_PROCEDURES[0] | { id: string; code: string; name: string; description: string; category: string; defaultPrice: number; estimatedDuration?: number };

  const handleDragStart = (e: React.DragEvent, procedure: ProcedureType) => {
    e.dataTransfer.setData('procedure', JSON.stringify(procedure));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleAddClick = (procedure: ProcedureType) => {
    const newItem: ProcedureItem = {
      id: generateId(),
      procedureId: procedure.id,
      code: procedure.code,
      name: procedure.name,
      description: procedure.description,
      category: procedure.category,
      tooth: selectedTooth?.toString(),
      quantity: 1,
      unitPrice: procedure.defaultPrice,
      discount: 0,
      total: procedure.defaultPrice,
      estimatedDuration: procedure.estimatedDuration,
    };
    onAddProcedure(newItem);
  };

  return (
    <div className="procedure-catalog h-100 d-flex flex-column">
      {/* Search */}
      <div className="p-3 border-bottom">
        <Input
          type="text"
          placeholder="Cauta procedura..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon="ti ti-search"
        />
      </div>

      {/* Categories */}
      <div className="p-2 border-bottom overflow-auto" style={{ maxHeight: '120px' }}>
        <div className="d-flex flex-wrap gap-1">
          {PROCEDURE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={clsx(
                'btn btn-sm',
                selectedCategory === cat.id ? 'btn-primary' : 'btn-outline-secondary'
              )}
            >
              <i className={`ti ${cat.icon} me-1`}></i>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Procedure List */}
      <div className="flex-grow-1 overflow-auto p-2">
        {procedures.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <i className="ti ti-search-off fs-32"></i>
            <p className="mt-2 mb-0 small">Nicio procedura gasita</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {procedures.map((procedure) => (
              <div
                key={procedure.id}
                draggable
                onDragStart={(e) => handleDragStart(e, procedure)}
                className="procedure-item card border cursor-grab hover-shadow-sm"
                style={{ transition: 'all 0.15s ease' }}
              >
                <div className="card-body p-2">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <Badge variant="soft-secondary" size="sm">{procedure.code}</Badge>
                        <span className="fw-semibold small text-truncate" style={{ maxWidth: '140px' }}>
                          {procedure.name}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2 text-muted small">
                        <span className="fw-bold text-primary">{formatCurrency(procedure.defaultPrice)}</span>
                        {procedure.estimatedDuration && (
                          <>
                            <span>|</span>
                            <span>
                              <i className="ti ti-clock me-1"></i>
                              {procedure.estimatedDuration} min
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="soft-primary"
                      size="sm"
                      iconOnly
                      onClick={() => handleAddClick(procedure)}
                      title="Adauga in plan"
                    >
                      <i className="ti ti-plus"></i>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Tooth Indicator */}
      {selectedTooth && (
        <div className="p-2 border-top bg-primary-subtle">
          <div className="d-flex align-items-center justify-content-center gap-2 text-primary small">
            <i className="ti ti-dental"></i>
            <span>Dinte selectat: <strong>{selectedTooth}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Phase Component
// ============================================================================

interface PhaseComponentProps {
  phase: TreatmentPhase;
  phaseIndex: number;
  isLast: boolean;
  onUpdatePhase: (phaseId: string, updates: Partial<TreatmentPhase>) => void;
  onRemovePhase: (phaseId: string) => void;
  onAddProcedure: (phaseId: string, procedure: ProcedureItem) => void;
  onUpdateProcedure: (phaseId: string, procedureId: string, updates: Partial<ProcedureItem>) => void;
  onRemoveProcedure: (phaseId: string, procedureId: string) => void;
  onMoveProcedure: (fromPhaseId: string, toPhaseId: string, procedureId: string) => void;
  allPhaseIds: string[];
}

function PhaseComponent({
  phase,
  phaseIndex,
  isLast,
  onUpdatePhase,
  onRemovePhase,
  onAddProcedure,
  onUpdateProcedure,
  onRemoveProcedure,
  onMoveProcedure,
  allPhaseIds,
}: PhaseComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [phaseName, setPhaseName] = useState(phase.name);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const procedureData = e.dataTransfer.getData('procedure');
    if (procedureData) {
      const procedure = JSON.parse(procedureData);
      const newItem: ProcedureItem = {
        id: generateId(),
        procedureId: procedure.id,
        code: procedure.code,
        name: procedure.name,
        description: procedure.description,
        category: procedure.category,
        quantity: 1,
        unitPrice: procedure.defaultPrice,
        discount: 0,
        total: procedure.defaultPrice,
        estimatedDuration: procedure.estimatedDuration,
      };
      onAddProcedure(phase.id, newItem);
    }

    // Check for moving procedure between phases
    const moveData = e.dataTransfer.getData('moveProcedure');
    if (moveData) {
      const { fromPhaseId, procedureId } = JSON.parse(moveData);
      if (fromPhaseId !== phase.id) {
        onMoveProcedure(fromPhaseId, phase.id, procedureId);
      }
    }
  };

  const handleNameSave = () => {
    onUpdatePhase(phase.id, { name: phaseName });
    setIsEditing(false);
  };

  const handleProcedureDragStart = (e: React.DragEvent, procedureId: string) => {
    e.dataTransfer.setData('moveProcedure', JSON.stringify({ fromPhaseId: phase.id, procedureId }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const totalDuration = phase.procedures.reduce((sum, p) => sum + (p.estimatedDuration || 0) * p.quantity, 0);

  return (
    <Card
      className={clsx('mb-3', isDragOver && 'border-primary bg-primary-subtle')}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardHeader className="d-flex align-items-center justify-content-between py-2">
        <div className="d-flex align-items-center gap-2">
          <Badge variant="primary" pill>
            {phaseIndex + 1}
          </Badge>
          {isEditing ? (
            <div className="d-flex align-items-center gap-2">
              <input
                type="text"
                value={phaseName}
                onChange={(e) => setPhaseName(e.target.value)}
                className="form-control form-control-sm"
                style={{ width: '200px' }}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              />
              <Button variant="soft-success" size="sm" onClick={handleNameSave}>
                <i className="ti ti-check"></i>
              </Button>
              <Button variant="soft-secondary" size="sm" onClick={() => setIsEditing(false)}>
                <i className="ti ti-x"></i>
              </Button>
            </div>
          ) : (
            <h6
              className="mb-0 fw-bold cursor-pointer"
              onClick={() => setIsEditing(true)}
              title="Click pentru editare"
            >
              {phase.name}
              <i className="ti ti-edit ms-2 text-muted small"></i>
            </h6>
          )}
        </div>
        <div className="d-flex align-items-center gap-2">
          {totalDuration > 0 && (
            <Badge variant="soft-info" size="sm">
              <i className="ti ti-clock me-1"></i>
              {totalDuration} min
            </Badge>
          )}
          <Badge variant="soft-success" size="sm">
            {formatCurrency(phase.subtotal)}
          </Badge>
          <Button
            variant="soft-secondary"
            size="sm"
            onClick={() => onUpdatePhase(phase.id, { isCollapsed: !phase.isCollapsed })}
          >
            <i className={`ti ${phase.isCollapsed ? 'ti-chevron-down' : 'ti-chevron-up'}`}></i>
          </Button>
          {!isLast && (
            <Button
              variant="soft-danger"
              size="sm"
              onClick={() => onRemovePhase(phase.id)}
              title="Sterge faza"
            >
              <i className="ti ti-trash"></i>
            </Button>
          )}
        </div>
      </CardHeader>

      {!phase.isCollapsed && (
        <CardBody className="pt-0">
          {phase.procedures.length === 0 ? (
            <div className="text-center py-4 text-muted border-2 border-dashed rounded">
              <i className="ti ti-drag-drop fs-32"></i>
              <p className="mb-0 mt-2">Trage proceduri aici sau apasa butonul +</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '40px' }}></th>
                    <th style={{ width: '80px' }}>Dinte</th>
                    <th>Procedura</th>
                    <th style={{ width: '80px' }} className="text-center">Cant.</th>
                    <th style={{ width: '120px' }} className="text-end">Pret</th>
                    <th style={{ width: '100px' }} className="text-end">Disc. %</th>
                    <th style={{ width: '120px' }} className="text-end">Total</th>
                    <th style={{ width: '100px' }} className="text-center">Muta</th>
                    <th style={{ width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {phase.procedures.map((procedure) => (
                    <tr
                      key={procedure.id}
                      draggable
                      onDragStart={(e) => handleProcedureDragStart(e, procedure.id)}
                      className="cursor-grab"
                    >
                      <td>
                        <i className="ti ti-grip-vertical text-muted"></i>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={procedure.tooth || ''}
                          onChange={(e) =>
                            onUpdateProcedure(phase.id, procedure.id, { tooth: e.target.value })
                          }
                          className="form-control form-control-sm text-center"
                          placeholder="-"
                          style={{ width: '60px' }}
                        />
                      </td>
                      <td>
                        <div>
                          <Badge variant="soft-secondary" size="sm" className="me-2">
                            {procedure.code}
                          </Badge>
                          <span className="fw-medium">{procedure.name}</span>
                        </div>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={procedure.quantity}
                          onChange={(e) => {
                            const quantity = parseInt(e.target.value) || 1;
                            const total = (procedure.unitPrice * quantity * (100 - procedure.discount)) / 100;
                            onUpdateProcedure(phase.id, procedure.id, { quantity, total });
                          }}
                          className="form-control form-control-sm text-center"
                          style={{ width: '60px' }}
                        />
                      </td>
                      <td className="text-end">
                        <input
                          type="number"
                          min="0"
                          value={procedure.unitPrice}
                          onChange={(e) => {
                            const unitPrice = parseFloat(e.target.value) || 0;
                            const total = (unitPrice * procedure.quantity * (100 - procedure.discount)) / 100;
                            onUpdateProcedure(phase.id, procedure.id, { unitPrice, total });
                          }}
                          className="form-control form-control-sm text-end"
                          style={{ width: '100px' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={procedure.discount}
                          onChange={(e) => {
                            const discount = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                            const total = (procedure.unitPrice * procedure.quantity * (100 - discount)) / 100;
                            onUpdateProcedure(phase.id, procedure.id, { discount, total });
                          }}
                          className="form-control form-control-sm text-center"
                          style={{ width: '70px' }}
                        />
                      </td>
                      <td className="text-end fw-bold">
                        {formatCurrency(procedure.total)}
                      </td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value=""
                          onChange={(e) => {
                            if (e.target.value && e.target.value !== phase.id) {
                              onMoveProcedure(phase.id, e.target.value, procedure.id);
                            }
                          }}
                        >
                          <option value="">Muta la...</option>
                          {allPhaseIds
                            .filter((id) => id !== phase.id)
                            .map((id, idx) => (
                              <option key={id} value={id}>
                                Faza {idx + (allPhaseIds.indexOf(id) < allPhaseIds.indexOf(phase.id) ? 1 : 2)}
                              </option>
                            ))}
                        </select>
                      </td>
                      <td>
                        <Button
                          variant="soft-danger"
                          size="sm"
                          iconOnly
                          onClick={() => onRemoveProcedure(phase.id, procedure.id)}
                          title="Sterge"
                        >
                          <i className="ti ti-x"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="table-light">
                    <td colSpan={6} className="text-end fw-bold">
                      Subtotal Faza:
                    </td>
                    <td className="text-end fw-bold text-primary">
                      {formatCurrency(phase.subtotal)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardBody>
      )}
    </Card>
  );
}

// ============================================================================
// Financial Summary Component
// ============================================================================

interface FinancialSummaryProps {
  phases: TreatmentPhase[];
  discount: DiscountConfig;
  insuranceCoverage: number;
  paymentPlan: PaymentPlanConfig;
  onDiscountChange: (discount: DiscountConfig) => void;
  onInsuranceChange: (coverage: number) => void;
  onPaymentPlanChange: (plan: PaymentPlanConfig) => void;
}

function FinancialSummary({
  phases,
  discount,
  insuranceCoverage,
  paymentPlan,
  onDiscountChange,
  onInsuranceChange,
  onPaymentPlanChange,
}: FinancialSummaryProps) {
  const grandTotal = calculateGrandTotal(phases);
  const discountAmount = calculateDiscount(grandTotal, discount);
  const afterDiscount = grandTotal - discountAmount;
  const patientResponsibility = calculatePatientResponsibility(grandTotal, discount, insuranceCoverage);

  const installmentAmount = paymentPlan.enabled
    ? (patientResponsibility - paymentPlan.downPayment) / paymentPlan.installments
    : 0;

  return (
    <Card>
      <CardHeader title="Rezumat Financiar" icon="ti ti-calculator" />
      <CardBody>
        {/* Per Phase Breakdown */}
        <div className="mb-3">
          <h6 className="text-muted small fw-semibold mb-2">Detaliere pe Faze</h6>
          {phases.map((phase, idx) => (
            <div key={phase.id} className="d-flex justify-content-between align-items-center py-1">
              <span className="small">
                <Badge variant="soft-secondary" size="sm" className="me-2">{idx + 1}</Badge>
                {phase.name}
              </span>
              <span className="small fw-medium">{formatCurrency(phase.subtotal)}</span>
            </div>
          ))}
        </div>

        <hr />

        {/* Totals */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-medium">Total Brut</span>
          <span className="fw-bold">{formatCurrency(grandTotal)}</span>
        </div>

        {/* Discount */}
        <div className="mb-3">
          <label className="form-label small text-muted mb-1">Discount</label>
          <div className="d-flex gap-2">
            <select
              className="form-select form-select-sm"
              value={discount.type}
              onChange={(e) => onDiscountChange({ ...discount, type: e.target.value as 'percentage' | 'fixed' })}
              style={{ width: '100px' }}
            >
              <option value="percentage">%</option>
              <option value="fixed">RON</option>
            </select>
            <input
              type="number"
              min="0"
              value={discount.value}
              onChange={(e) => onDiscountChange({ ...discount, value: parseFloat(e.target.value) || 0 })}
              className="form-control form-control-sm"
            />
          </div>
          {discountAmount > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-2 text-danger">
              <span className="small">Discount aplicat</span>
              <span className="small fw-medium">-{formatCurrency(discountAmount)}</span>
            </div>
          )}
        </div>

        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-medium">Dupa Discount</span>
          <span className="fw-bold">{formatCurrency(afterDiscount)}</span>
        </div>

        {/* Insurance */}
        <div className="mb-3">
          <label className="form-label small text-muted mb-1">Acoperire Asigurare (RON)</label>
          <input
            type="number"
            min="0"
            value={insuranceCoverage}
            onChange={(e) => onInsuranceChange(parseFloat(e.target.value) || 0)}
            className="form-control form-control-sm"
          />
          {insuranceCoverage > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-2 text-success">
              <span className="small">Acoperit de asigurare</span>
              <span className="small fw-medium">-{formatCurrency(insuranceCoverage)}</span>
            </div>
          )}
        </div>

        <hr />

        {/* Patient Responsibility */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="fs-5 fw-bold">Responsabilitate Pacient</span>
          <span className="fs-4 fw-bold text-primary">{formatCurrency(patientResponsibility)}</span>
        </div>

        {/* Payment Plan */}
        <div className="border rounded p-3 bg-light">
          <div className="form-check mb-2">
            <input
              type="checkbox"
              className="form-check-input"
              id="enablePaymentPlan"
              checked={paymentPlan.enabled}
              onChange={(e) => onPaymentPlanChange({ ...paymentPlan, enabled: e.target.checked })}
            />
            <label className="form-check-label fw-medium" htmlFor="enablePaymentPlan">
              <i className="ti ti-calendar-dollar me-1"></i>
              Plan de Plata in Rate
            </label>
          </div>

          {paymentPlan.enabled && (
            <div className="row g-2 mt-2">
              <div className="col-6">
                <label className="form-label small text-muted">Avans (RON)</label>
                <input
                  type="number"
                  min="0"
                  max={patientResponsibility}
                  value={paymentPlan.downPayment}
                  onChange={(e) => onPaymentPlanChange({ ...paymentPlan, downPayment: parseFloat(e.target.value) || 0 })}
                  className="form-control form-control-sm"
                />
              </div>
              <div className="col-6">
                <label className="form-label small text-muted">Numar Rate</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={paymentPlan.installments}
                  onChange={(e) => onPaymentPlanChange({ ...paymentPlan, installments: parseInt(e.target.value) || 1 })}
                  className="form-control form-control-sm"
                />
              </div>
              <div className="col-12">
                <label className="form-label small text-muted">Frecventa</label>
                <select
                  className="form-select form-select-sm"
                  value={paymentPlan.frequency}
                  onChange={(e) => onPaymentPlanChange({ ...paymentPlan, frequency: e.target.value as 'weekly' | 'monthly' })}
                >
                  <option value="weekly">Saptamanal</option>
                  <option value="monthly">Lunar</option>
                </select>
              </div>
              {installmentAmount > 0 && (
                <div className="col-12 mt-2">
                  <div className="alert alert-info mb-0 py-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="small">
                        Avans: <strong>{formatCurrency(paymentPlan.downPayment)}</strong>
                      </span>
                      <span className="small">
                        {paymentPlan.installments} rate x <strong>{formatCurrency(installmentAmount)}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// Alternative Plans Component
// ============================================================================

interface AlternativePlansProps {
  alternatives: AlternativePlan[];
  onAddAlternative: () => void;
  onRemoveAlternative: (id: string) => void;
  onUpdateAlternative: (id: string, updates: Partial<AlternativePlan>) => void;
  onSetRecommended: (id: string) => void;
}

function AlternativePlans({
  alternatives,
  onAddAlternative,
  onRemoveAlternative,
  onUpdateAlternative,
  onSetRecommended,
}: AlternativePlansProps) {
  if (alternatives.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-4">
          <i className="ti ti-git-compare fs-32 text-muted"></i>
          <p className="text-muted mb-3">Nicio alternativa de tratament</p>
          <Button variant="outline-primary" onClick={onAddAlternative}>
            <i className="ti ti-plus me-1"></i>
            Adauga Alternativa
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Planuri Alternative"
        icon="ti ti-git-compare"
        actions={
          <Button variant="soft-primary" size="sm" onClick={onAddAlternative}>
            <i className="ti ti-plus me-1"></i>
            Adauga
          </Button>
        }
      />
      <CardBody>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Nume Alternativa</th>
                <th>Cost Total</th>
                <th className="text-center">Recomandat</th>
                <th style={{ width: '100px' }}></th>
              </tr>
            </thead>
            <tbody>
              {alternatives.map((alt) => (
                <tr key={alt.id}>
                  <td>
                    <input
                      type="text"
                      value={alt.name}
                      onChange={(e) => onUpdateAlternative(alt.id, { name: e.target.value })}
                      className="form-control form-control-sm"
                    />
                  </td>
                  <td className="fw-bold">{formatCurrency(alt.grandTotal)}</td>
                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => onSetRecommended(alt.id)}
                      className={clsx(
                        'btn btn-sm',
                        alt.isRecommended ? 'btn-success' : 'btn-outline-secondary'
                      )}
                    >
                      {alt.isRecommended ? (
                        <>
                          <i className="ti ti-star-filled me-1"></i>
                          Recomandat
                        </>
                      ) : (
                        'Seteaza'
                      )}
                    </button>
                  </td>
                  <td>
                    <Button
                      variant="soft-danger"
                      size="sm"
                      iconOnly
                      onClick={() => onRemoveAlternative(alt.id)}
                    >
                      <i className="ti ti-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// Smart Suggestions Component
// ============================================================================

interface SmartSuggestionsProps {
  phases: TreatmentPhase[];
  teethData: Map<number, ToothData>;
}

function SmartSuggestions({ phases, teethData }: SmartSuggestionsProps) {
  const suggestions = useMemo(() => {
    const result: Array<{ type: 'warning' | 'info' | 'success'; message: string }> = [];

    // Check for teeth with caries that don't have treatment planned
    teethData.forEach((tooth, number) => {
      const hasCaries = tooth.conditions.some((c) => c.condition === 'caries');
      if (hasCaries && !tooth.inPlan) {
        result.push({
          type: 'warning',
          message: `Dintele ${number} are carie dar nu este inclus in plan`,
        });
      }
    });

    // Check for sequence warnings
    const allProcedures = phases.flatMap((p) => p.procedures);
    allProcedures.forEach((proc) => {
      const category = proc.category.toLowerCase();
      const requiredPrereqs = SEQUENCE_WARNINGS[category];
      if (requiredPrereqs) {
        // This is a simplified check - in production would be more sophisticated
        result.push({
          type: 'info',
          message: `${proc.name} poate necesita proceduri preliminare`,
        });
      }
    });

    // Total duration estimate
    const totalDuration = allProcedures.reduce((sum, p) => sum + (p.estimatedDuration || 0) * p.quantity, 0);
    if (totalDuration > 0) {
      const hours = Math.floor(totalDuration / 60);
      const minutes = totalDuration % 60;
      result.push({
        type: 'info',
        message: `Durata estimata totala: ${hours > 0 ? `${hours}h ` : ''}${minutes}min`,
      });
    }

    // Check for high value plan
    const grandTotal = calculateGrandTotal(phases);
    if (grandTotal > 10000) {
      result.push({
        type: 'success',
        message: 'Plan de tratament complex - considera plan de plata in rate',
      });
    }

    return result;
  }, [phases, teethData]);

  if (suggestions.length === 0) return null;

  return (
    <Card className="mb-3">
      <CardHeader title="Sugestii Inteligente" icon="ti ti-bulb" />
      <CardBody className="py-2">
        {suggestions.map((suggestion, idx) => (
          <div
            key={idx}
            className={clsx(
              'd-flex align-items-center gap-2 py-2',
              idx > 0 && 'border-top'
            )}
          >
            <i
              className={clsx(
                'ti',
                suggestion.type === 'warning' && 'ti-alert-triangle text-warning',
                suggestion.type === 'info' && 'ti-info-circle text-info',
                suggestion.type === 'success' && 'ti-check text-success'
              )}
            ></i>
            <span className="small">{suggestion.message}</span>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

// ============================================================================
// Patient Selector Component
// ============================================================================

interface PatientSelectorProps {
  selectedPatientId: string | null;
  onSelectPatient: (patientId: string) => void;
}

function PatientSelector({ selectedPatientId, onSelectPatient }: PatientSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: patientsData, isLoading } = usePatients({
    search: debouncedSearch.length >= 2 ? debouncedSearch : undefined,
    limit: 10,
  });

  const { data: selectedPatientData } = usePatient(selectedPatientId || undefined);
  const selectedPatient = selectedPatientData?.data;

  return (
    <div className="position-relative">
      {selectedPatient ? (
        <div className="d-flex align-items-center gap-3 p-3 bg-light rounded">
          <div className="avatar avatar-lg bg-primary-transparent rounded-circle d-flex align-items-center justify-content-center">
            <span className="fw-bold">
              {selectedPatient.firstName?.[0]}{selectedPatient.lastName?.[0]}
            </span>
          </div>
          <div className="flex-grow-1">
            <h6 className="mb-0 fw-bold">
              {selectedPatient.firstName} {selectedPatient.lastName}
            </h6>
            <small className="text-muted">
              {selectedPatient.patientNumber || `ID: ${selectedPatient.id?.slice(0, 8)}`}
            </small>
          </div>
          <Button variant="soft-secondary" size="sm" onClick={() => onSelectPatient('')}>
            <i className="ti ti-x me-1"></i>
            Schimba
          </Button>
        </div>
      ) : (
        <div>
          <Input
            type="text"
            placeholder="Cauta pacient dupa nume..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            icon="ti ti-search"
          />
          {isOpen && searchTerm.length >= 2 && (
            <div
              className="position-absolute w-100 mt-1 bg-white border rounded shadow-lg z-3"
              style={{ maxHeight: '300px', overflowY: 'auto' }}
            >
              {isLoading ? (
                <div className="p-3 text-center">
                  <div className="spinner-border spinner-border-sm" role="status"></div>
                </div>
              ) : patientsData?.data?.length ? (
                patientsData.data.map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    className="d-flex align-items-center gap-2 w-100 p-2 border-0 bg-transparent text-start hover-bg-light"
                    onClick={() => {
                      onSelectPatient(patient.id);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                  >
                    <div className="avatar avatar-sm bg-primary-transparent rounded-circle d-flex align-items-center justify-content-center">
                      <span className="small">{patient.firstName?.[0]}{patient.lastName?.[0]}</span>
                    </div>
                    <div>
                      <div className="fw-medium">{patient.firstName} {patient.lastName}</div>
                      <small className="text-muted">{patient.patientNumber || patient.id?.slice(0, 8)}</small>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-muted">
                  Niciun pacient gasit
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function TreatmentPlanCreatePage() {
  const navigate = useNavigate();
  const { patientId: urlPatientId } = useParams<{ patientId: string }>();
  const [searchParams] = useSearchParams();
  const initialPatientId = urlPatientId || searchParams.get('patientId') || '';

  // State
  const [patientId, setPatientId] = useState<string>(initialPatientId);
  const [planTitle, setPlanTitle] = useState('');
  const [planNotes, setPlanNotes] = useState('');
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [showCatalogSidebar, setShowCatalogSidebar] = useState(true);

  // Phases state
  const [phases, setPhases] = useState<TreatmentPhase[]>([
    {
      id: generateId(),
      name: 'Faza 1: Urgenta',
      order: 1,
      procedures: [],
      subtotal: 0,
      isCollapsed: false,
    },
  ]);

  // Alternative plans state
  const [alternatives, setAlternatives] = useState<AlternativePlan[]>([]);

  // Financial state
  const [discount, setDiscount] = useState<DiscountConfig>({ type: 'percentage', value: 0 });
  const [insuranceCoverage, setInsuranceCoverage] = useState(0);
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlanConfig>({
    enabled: false,
    downPayment: 0,
    installments: 6,
    frequency: 'monthly',
  });

  // Modals
  const [showPresentModal, setShowPresentModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);

  // Teeth data (simulated - would come from API)
  const [teethData] = useState<Map<number, ToothData>>(() => {
    const map = new Map<number, ToothData>();
    // Add some demo data
    map.set(16, { toothNumber: 16, conditions: [{ condition: 'caries', surfaces: ['O'] }], inPlan: false });
    map.set(26, { toothNumber: 26, conditions: [{ condition: 'filling', surfaces: ['MO'] }], inPlan: false });
    map.set(36, { toothNumber: 36, conditions: [{ condition: 'crown', surfaces: [] }], inPlan: false });
    map.set(46, { toothNumber: 46, conditions: [{ condition: 'missing', surfaces: [] }], inPlan: false });
    return map;
  });

  // Mutations
  const createPlanMutation = useCreateTreatmentPlan();

  // Calculate teeth in plan
  const teethInPlan = useMemo(() => {
    const set = new Set<number>();
    phases.forEach((phase) => {
      phase.procedures.forEach((proc) => {
        if (proc.tooth) {
          set.add(parseInt(proc.tooth));
        }
      });
    });
    return set;
  }, [phases]);

  // Recalculate subtotals when procedures change
  useEffect(() => {
    setPhases((prev) =>
      prev.map((phase) => ({
        ...phase,
        subtotal: calculatePhaseSubtotal(phase.procedures),
      }))
    );
  }, []);

  // Handlers
  const handleAddPhase = useCallback(() => {
    const newPhase: TreatmentPhase = {
      id: generateId(),
      name: `Faza ${phases.length + 1}`,
      order: phases.length + 1,
      procedures: [],
      subtotal: 0,
      isCollapsed: false,
    };
    setPhases([...phases, newPhase]);
  }, [phases]);

  const handleUpdatePhase = useCallback((phaseId: string, updates: Partial<TreatmentPhase>) => {
    setPhases((prev) =>
      prev.map((phase) => (phase.id === phaseId ? { ...phase, ...updates } : phase))
    );
  }, []);

  const handleRemovePhase = useCallback((phaseId: string) => {
    setPhases((prev) => prev.filter((phase) => phase.id !== phaseId));
  }, []);

  const handleAddProcedureToPhase = useCallback((phaseId: string, procedure: ProcedureItem) => {
    setPhases((prev) =>
      prev.map((phase) => {
        if (phase.id === phaseId) {
          const newProcedures = [...phase.procedures, procedure];
          return {
            ...phase,
            procedures: newProcedures,
            subtotal: calculatePhaseSubtotal(newProcedures),
          };
        }
        return phase;
      })
    );
  }, []);

  const handleAddProcedure = useCallback((procedure: ProcedureItem) => {
    // Add to the first non-collapsed phase, or the first phase
    const targetPhase = phases.find((p) => !p.isCollapsed) || phases[0];
    if (targetPhase) {
      handleAddProcedureToPhase(targetPhase.id, procedure);
    }
  }, [phases, handleAddProcedureToPhase]);

  const handleUpdateProcedure = useCallback(
    (phaseId: string, procedureId: string, updates: Partial<ProcedureItem>) => {
      setPhases((prev) =>
        prev.map((phase) => {
          if (phase.id === phaseId) {
            const newProcedures = phase.procedures.map((proc) =>
              proc.id === procedureId ? { ...proc, ...updates } : proc
            );
            return {
              ...phase,
              procedures: newProcedures,
              subtotal: calculatePhaseSubtotal(newProcedures),
            };
          }
          return phase;
        })
      );
    },
    []
  );

  const handleRemoveProcedure = useCallback((phaseId: string, procedureId: string) => {
    setPhases((prev) =>
      prev.map((phase) => {
        if (phase.id === phaseId) {
          const newProcedures = phase.procedures.filter((proc) => proc.id !== procedureId);
          return {
            ...phase,
            procedures: newProcedures,
            subtotal: calculatePhaseSubtotal(newProcedures),
          };
        }
        return phase;
      })
    );
  }, []);

  const handleMoveProcedure = useCallback(
    (fromPhaseId: string, toPhaseId: string, procedureId: string) => {
      setPhases((prev) => {
        const fromPhase = prev.find((p) => p.id === fromPhaseId);
        const procedure = fromPhase?.procedures.find((p) => p.id === procedureId);

        if (!procedure) return prev;

        return prev.map((phase) => {
          if (phase.id === fromPhaseId) {
            const newProcedures = phase.procedures.filter((p) => p.id !== procedureId);
            return {
              ...phase,
              procedures: newProcedures,
              subtotal: calculatePhaseSubtotal(newProcedures),
            };
          }
          if (phase.id === toPhaseId) {
            const newProcedures = [...phase.procedures, procedure];
            return {
              ...phase,
              procedures: newProcedures,
              subtotal: calculatePhaseSubtotal(newProcedures),
            };
          }
          return phase;
        });
      });
    },
    []
  );

  const handleToothClick = useCallback((toothNumber: number) => {
    setSelectedTooth((prev) => (prev === toothNumber ? null : toothNumber));
  }, []);

  // Alternative plan handlers
  const handleAddAlternative = useCallback(() => {
    const newAlt: AlternativePlan = {
      id: generateId(),
      name: `Alternativa ${alternatives.length + 1}`,
      phases: [],
      isRecommended: false,
      advantages: [],
      disadvantages: [],
      grandTotal: 0,
    };
    setAlternatives([...alternatives, newAlt]);
  }, [alternatives]);

  const handleRemoveAlternative = useCallback((id: string) => {
    setAlternatives((prev) => prev.filter((alt) => alt.id !== id));
  }, []);

  const handleUpdateAlternative = useCallback((id: string, updates: Partial<AlternativePlan>) => {
    setAlternatives((prev) =>
      prev.map((alt) => (alt.id === id ? { ...alt, ...updates } : alt))
    );
  }, []);

  const handleSetRecommended = useCallback((id: string) => {
    setAlternatives((prev) =>
      prev.map((alt) => ({ ...alt, isRecommended: alt.id === id }))
    );
  }, []);

  // Save handler
  const handleSave = useCallback(async (status: 'draft' | 'pending' | 'approved') => {
    if (!patientId) {
      toast.error('Selecteaza un pacient');
      return;
    }

    if (!planTitle.trim()) {
      toast.error('Introdu un titlu pentru plan');
      return;
    }

    const hasProcedures = phases.some((p) => p.procedures.length > 0);
    if (!hasProcedures) {
      toast.error('Adauga cel putin o procedura in plan');
      return;
    }

    try {
      // Transform to API format
      const planData = {
        title: planTitle,
        status,
        options: [
          {
            optionId: generateId(),
            name: 'Plan Principal',
            procedures: phases.flatMap((phase) =>
              phase.procedures.map((proc) => ({
                code: proc.code,
                description: proc.name,
                estimatedCost: proc.total,
              }))
            ),
            totalEstimatedCost: calculateGrandTotal(phases),
          },
          ...alternatives.map((alt) => ({
            optionId: alt.id,
            name: alt.name,
            procedures: alt.phases.flatMap((phase) =>
              phase.procedures.map((proc) => ({
                code: proc.code,
                description: proc.name,
                estimatedCost: proc.total,
              }))
            ),
            totalEstimatedCost: alt.grandTotal,
          })),
        ],
      };

      await createPlanMutation.mutateAsync({
        patientId,
        data: planData,
      });

      toast.success(
        status === 'draft'
          ? 'Planul a fost salvat ca ciorna'
          : status === 'pending'
          ? 'Planul a fost prezentat pacientului'
          : 'Planul a fost acceptat de pacient'
      );

      navigate(`/clinical/${patientId}?tab=plans`);
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Eroare la salvarea planului');
    }
  }, [patientId, planTitle, phases, alternatives, createPlanMutation, navigate]);

  // Grand total
  const grandTotal = calculateGrandTotal(phases);
  const patientResponsibility = calculatePatientResponsibility(grandTotal, discount, insuranceCoverage);

  // Breadcrumb
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: 'ti ti-home' },
    { label: 'Pacienti', href: '/patients', icon: 'ti ti-users' },
    { label: 'Plan de Tratament Nou', icon: 'ti ti-file-plus' },
  ];

  const allPhaseIds = phases.map((p) => p.id);

  return (
    <AppShell
      title="Plan de Tratament Nou"
      subtitle="Construieste un plan de tratament complet pentru pacient"
      actions={
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={() => navigate(-1)}>
            <i className="ti ti-arrow-left me-1"></i>
            Inapoi
          </Button>
          <Button
            variant="soft-secondary"
            onClick={() => setShowCatalogSidebar(!showCatalogSidebar)}
          >
            <i className={`ti ${showCatalogSidebar ? 'ti-layout-sidebar-right-collapse' : 'ti-layout-sidebar-right-expand'} me-1`}></i>
            {showCatalogSidebar ? 'Ascunde Catalog' : 'Arata Catalog'}
          </Button>
        </div>
      }
    >
      <Breadcrumb items={breadcrumbItems} className="mb-3" />

      <div className="row">
        {/* Main Content */}
        <div className={showCatalogSidebar ? 'col-lg-8 col-xl-9' : 'col-12'}>
          {/* Patient Header */}
          <Card className="mb-3">
            <CardHeader title="Pacient" icon="ti ti-user" />
            <CardBody>
              <PatientSelector
                selectedPatientId={patientId}
                onSelectPatient={setPatientId}
              />
            </CardBody>
          </Card>

          {/* Odontogram */}
          <Card className="mb-3">
            <CardHeader
              title="Odontograma"
              icon="ti ti-dental"
              actions={
                selectedTooth && (
                  <Badge variant="primary">
                    Dinte selectat: {selectedTooth}
                  </Badge>
                )
              }
            />
            <CardBody>
              <OdontogramEditor
                patientId={patientId || 'new'}
                data={Array.from(teethData.values())}
                readOnly={false}
              />
              <p className="text-muted small mt-3 mb-0 text-center">
                Click pe un dinte pentru a selecta si adauga proceduri specifice
              </p>
            </CardBody>
          </Card>

          {/* Plan Details */}
          <Card className="mb-3">
            <CardHeader title="Detalii Plan" icon="ti ti-file-description" />
            <CardBody>
              <div className="row g-3">
                <div className="col-md-8">
                  <Input
                    label="Titlu Plan"
                    placeholder="ex: Reabilitare Orala Completa"
                    value={planTitle}
                    onChange={(e) => setPlanTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Data</label>
                  <input
                    type="text"
                    className="form-control"
                    value={format(new Date(), 'dd MMMM yyyy', { locale: ro })}
                    disabled
                  />
                </div>
                <div className="col-12">
                  <Textarea
                    label="Note"
                    placeholder="Observatii generale despre planul de tratament..."
                    value={planNotes}
                    onChange={(e) => setPlanNotes(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Smart Suggestions */}
          <SmartSuggestions phases={phases} teethData={teethData} />

          {/* Treatment Phases */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="mb-0 fw-bold">
              <i className="ti ti-list-check me-2 text-primary"></i>
              Faze de Tratament
            </h5>
            <Button variant="primary" onClick={handleAddPhase}>
              <i className="ti ti-plus me-1"></i>
              Adauga Faza
            </Button>
          </div>

          {phases.map((phase, idx) => (
            <PhaseComponent
              key={phase.id}
              phase={phase}
              phaseIndex={idx}
              isLast={phases.length === 1}
              onUpdatePhase={handleUpdatePhase}
              onRemovePhase={handleRemovePhase}
              onAddProcedure={handleAddProcedureToPhase}
              onUpdateProcedure={handleUpdateProcedure}
              onRemoveProcedure={handleRemoveProcedure}
              onMoveProcedure={handleMoveProcedure}
              allPhaseIds={allPhaseIds}
            />
          ))}

          {/* Alternative Plans */}
          <div className="mt-4">
            <AlternativePlans
              alternatives={alternatives}
              onAddAlternative={handleAddAlternative}
              onRemoveAlternative={handleRemoveAlternative}
              onUpdateAlternative={handleUpdateAlternative}
              onSetRecommended={handleSetRecommended}
            />
          </div>

          {/* Financial Summary */}
          <div className="mt-4">
            <FinancialSummary
              phases={phases}
              discount={discount}
              insuranceCoverage={insuranceCoverage}
              paymentPlan={paymentPlan}
              onDiscountChange={setDiscount}
              onInsuranceChange={setInsuranceCoverage}
              onPaymentPlanChange={setPaymentPlan}
            />
          </div>

          {/* Actions */}
          <Card className="mt-4 sticky-bottom bg-white shadow-lg">
            <CardBody className="py-3">
              <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <span className="text-muted">Total:</span>
                  <span className="fs-4 fw-bold text-primary">{formatCurrency(patientResponsibility)}</span>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleSave('draft')}
                    loading={createPlanMutation.isPending}
                  >
                    <i className="ti ti-device-floppy me-1"></i>
                    Salveaza Ciorna
                  </Button>
                  <Button
                    variant="soft-info"
                    onClick={() => setShowPresentModal(true)}
                  >
                    <i className="ti ti-presentation me-1"></i>
                    Prezinta Pacientului
                  </Button>
                  <Button
                    variant="soft-success"
                    onClick={() => setShowAcceptModal(true)}
                  >
                    <i className="ti ti-signature me-1"></i>
                    Pacient Acceptat
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => toast.success('Functionalitate in dezvoltare')}
                  >
                    <i className="ti ti-calendar-plus me-1"></i>
                    Programeaza
                  </Button>
                  <Button
                    variant="outline-primary"
                    onClick={() => toast.success('PDF generat (demo)')}
                  >
                    <i className="ti ti-printer me-1"></i>
                    Print/PDF
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Procedure Catalog Sidebar */}
        {showCatalogSidebar && (
          <div className="col-lg-4 col-xl-3">
            <div className="sticky-top" style={{ top: '80px' }}>
              <Card style={{ height: 'calc(100vh - 100px)' }}>
                <CardHeader title="Catalog Proceduri" icon="ti ti-list-search" />
                <ProcedureCatalog
                  onAddProcedure={handleAddProcedure}
                  selectedTooth={selectedTooth}
                />
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Present to Patient Modal */}
      <Modal
        open={showPresentModal}
        onClose={() => setShowPresentModal(false)}
        title="Prezinta Planul de Tratament"
        icon="ti ti-presentation"
        size="md"
        footer={
          <div className="d-flex gap-2 justify-content-end">
            <Button variant="light" onClick={() => setShowPresentModal(false)}>
              Anuleaza
            </Button>
            <Button
              variant="info"
              onClick={() => {
                handleSave('pending');
                setShowPresentModal(false);
              }}
              loading={createPlanMutation.isPending}
            >
              <i className="ti ti-send me-1"></i>
              Prezinta
            </Button>
          </div>
        }
      >
        <div className="text-center py-3">
          <i className="ti ti-file-invoice fs-48 text-info mb-3"></i>
          <h5>Genereaza PDF pentru Prezentare</h5>
          <p className="text-muted mb-4">
            Planul de tratament va fi salvat si va genera un PDF pe care il poti
            prezenta pacientului.
          </p>
          <div className="d-flex flex-column gap-2">
            <div className="form-check text-start">
              <input type="checkbox" className="form-check-input" id="includePrices" defaultChecked />
              <label className="form-check-label" htmlFor="includePrices">
                Include preturi
              </label>
            </div>
            <div className="form-check text-start">
              <input type="checkbox" className="form-check-input" id="includeInsurance" defaultChecked />
              <label className="form-check-label" htmlFor="includeInsurance">
                Include estimare asigurare
              </label>
            </div>
            <div className="form-check text-start">
              <input type="checkbox" className="form-check-input" id="includePaymentPlan" defaultChecked />
              <label className="form-check-label" htmlFor="includePaymentPlan">
                Include optiuni plan de plata
              </label>
            </div>
          </div>
        </div>
      </Modal>

      {/* Accept Modal */}
      <Modal
        open={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        title="Acceptare Plan de Tratament"
        icon="ti ti-signature"
        size="md"
        footer={
          <div className="d-flex gap-2 justify-content-end">
            <Button variant="light" onClick={() => setShowAcceptModal(false)}>
              Anuleaza
            </Button>
            <Button
              variant="success"
              onClick={() => {
                handleSave('approved');
                setShowAcceptModal(false);
              }}
              loading={createPlanMutation.isPending}
            >
              <i className="ti ti-check me-1"></i>
              Confirma Acceptare
            </Button>
          </div>
        }
      >
        <div className="py-3">
          <div className="alert alert-info mb-4">
            <div className="d-flex gap-2">
              <i className="ti ti-info-circle"></i>
              <div>
                <strong>Consimtamant Pacient</strong>
                <p className="mb-0 small">
                  Prin marcarea planului ca "Acceptat", confirmati ca pacientul a
                  fost informat si a acceptat planul de tratament propus.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Semnatura Pacient</label>
            <div
              className="border rounded bg-light d-flex align-items-center justify-content-center"
              style={{ height: '120px' }}
            >
              <span className="text-muted small">
                <i className="ti ti-writing me-1"></i>
                Canvas pentru semnatura (in dezvoltare)
              </span>
            </div>
          </div>

          <div className="form-check">
            <input type="checkbox" className="form-check-input" id="confirmAccept" />
            <label className="form-check-label" htmlFor="confirmAccept">
              Confirm ca pacientul a inteles si a acceptat planul de tratament,
              inclusiv costurile estimate.
            </label>
          </div>
        </div>
      </Modal>

      {/* Styles */}
      <style>{`
        .mini-tooth:hover {
          transform: scale(1.1);
          z-index: 10;
        }

        .tooth-in-plan {
          box-shadow: 0 0 0 2px rgba(25, 135, 84, 0.5);
        }

        .procedure-item {
          cursor: grab;
        }

        .procedure-item:active {
          cursor: grabbing;
        }

        .procedure-item:hover {
          border-color: var(--bs-primary) !important;
          background-color: rgba(var(--bs-primary-rgb), 0.05);
        }

        .cursor-grab {
          cursor: grab;
        }

        .cursor-grab:active {
          cursor: grabbing;
        }

        .cursor-pointer {
          cursor: pointer;
        }

        .hover-bg-light:hover {
          background-color: var(--bs-light);
        }

        .hover-shadow-sm:hover {
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
        }

        .sticky-bottom {
          position: sticky;
          bottom: 0;
          z-index: 100;
        }

        .z-3 {
          z-index: 1030;
        }

        .bg-primary-subtle {
          background-color: rgba(var(--bs-primary-rgb), 0.1);
        }

        .bg-purple {
          background-color: #6f42c1;
        }

        .bg-indigo {
          background-color: #6610f2;
        }

        .border-dashed {
          border-style: dashed !important;
        }

        .border-2 {
          border-width: 2px !important;
        }

        .avatar {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          font-size: 1rem;
        }

        .avatar-sm {
          width: 32px;
          height: 32px;
          font-size: 0.875rem;
        }

        .avatar-lg {
          width: 48px;
          height: 48px;
          font-size: 1.25rem;
        }

        .bg-primary-transparent {
          background-color: rgba(var(--bs-primary-rgb), 0.1);
          color: var(--bs-primary);
        }
      `}</style>
    </AppShell>
  );
}
