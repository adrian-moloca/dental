/**
 * Treatment Plan Builder - Create multi-option treatment plans
 */

import { useState } from 'react';
import { Icon } from '../ui/Icon';

interface Procedure {
  code: string;
  description: string;
  estimatedCost: number;
}

interface TreatmentOption {
  optionId: string;
  name: string;
  procedures: Procedure[];
  totalEstimatedCost: number;
}

interface TreatmentPlanBuilderProps {
  patientId: string;
  onSave?: (data: { title: string; options: TreatmentOption[] }) => void;
  onCancel?: () => void;
}

export function TreatmentPlanBuilder({ onSave, onCancel }: TreatmentPlanBuilderProps) {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState<TreatmentOption[]>([
    {
      optionId: crypto.randomUUID(),
      name: 'Optiunea 1',
      procedures: [],
      totalEstimatedCost: 0,
    },
  ]);

  const addOption = () => {
    setOptions([
      ...options,
      {
        optionId: crypto.randomUUID(),
        name: `Optiunea ${options.length + 1}`,
        procedures: [],
        totalEstimatedCost: 0,
      },
    ]);
  };

  const removeOption = (optionId: string) => {
    setOptions(options.filter((opt) => opt.optionId !== optionId));
  };

  const updateOption = (optionId: string, updates: Partial<TreatmentOption>) => {
    setOptions(
      options.map((opt) =>
        opt.optionId === optionId ? { ...opt, ...updates } : opt
      )
    );
  };

  const addProcedure = (optionId: string) => {
    const newProcedure: Procedure = {
      code: '',
      description: '',
      estimatedCost: 0,
    };

    setOptions(
      options.map((opt) => {
        if (opt.optionId === optionId) {
          const newProcedures = [...opt.procedures, newProcedure];
          const totalCost = newProcedures.reduce((sum, p) => sum + p.estimatedCost, 0);
          return {
            ...opt,
            procedures: newProcedures,
            totalEstimatedCost: totalCost,
          };
        }
        return opt;
      })
    );
  };

  const updateProcedure = (optionId: string, procedureIndex: number, updates: Partial<Procedure>) => {
    setOptions(
      options.map((opt) => {
        if (opt.optionId === optionId) {
          const newProcedures = opt.procedures.map((proc, idx) =>
            idx === procedureIndex ? { ...proc, ...updates } : proc
          );
          const totalCost = newProcedures.reduce((sum, p) => sum + p.estimatedCost, 0);
          return {
            ...opt,
            procedures: newProcedures,
            totalEstimatedCost: totalCost,
          };
        }
        return opt;
      })
    );
  };

  const removeProcedure = (optionId: string, procedureIndex: number) => {
    setOptions(
      options.map((opt) => {
        if (opt.optionId === optionId) {
          const newProcedures = opt.procedures.filter((_, idx) => idx !== procedureIndex);
          const totalCost = newProcedures.reduce((sum, p) => sum + p.estimatedCost, 0);
          return {
            ...opt,
            procedures: newProcedures,
            totalEstimatedCost: totalCost,
          };
        }
        return opt;
      })
    );
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Va rugam introduceti un titlu pentru planul de tratament');
      return;
    }

    if (options.length === 0) {
      alert('Va rugam adaugati cel putin o optiune de tratament');
      return;
    }

    for (const option of options) {
      if (option.procedures.length === 0) {
        alert(`Va rugam adaugati proceduri la ${option.name}`);
        return;
      }
    }

    onSave?.({ title, options });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Creaza Plan de Tratament</h2>
        <p className="text-sm font-medium text-text-tertiary">
          Construieste optiuni multiple de tratament pentru pacient
        </p>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="plan-title" className="block text-sm font-semibold text-text-secondary mb-2">
          Titlu Plan *
        </label>
        <input
          id="plan-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ex: Reabilitare Orala Completa"
          className="w-full px-4 py-2 bg-surface border-2 border-border rounded-lg text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
        />
      </div>

      {/* Treatment Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Optiuni de Tratament</h3>
          <button
            onClick={addOption}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
          >
            <Icon name="plus" className="w-4 h-4" />
            Adauga Optiune
          </button>
        </div>

        {options.map((option) => (
          <div
            key={option.optionId}
            className="p-6 bg-surface border-2 border-border rounded-lg space-y-4 shadow-sm"
          >
            {/* Option Header */}
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={option.name}
                onChange={(e) => updateOption(option.optionId, { name: e.target.value })}
                className="text-lg font-bold bg-transparent border-b-2 border-transparent hover:border-border focus:border-brand text-foreground focus:outline-none"
              />
              {options.length > 1 && (
                <button
                  onClick={() => removeOption(option.optionId)}
                  className="p-2 text-white bg-danger hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                  aria-label="Sterge optiunea"
                  title="Sterge optiunea"
                >
                  <Icon name="x" className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Procedures */}
            <div className="space-y-3">
              {option.procedures.map((procedure, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <input
                    type="text"
                    placeholder="Cod"
                    value={procedure.code}
                    onChange={(e) =>
                      updateProcedure(option.optionId, idx, { code: e.target.value })
                    }
                    className="w-24 px-3 py-2 bg-white border-2 border-border rounded-lg text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                  />
                  <input
                    type="text"
                    placeholder="Descriere procedura"
                    value={procedure.description}
                    onChange={(e) =>
                      updateProcedure(option.optionId, idx, { description: e.target.value })
                    }
                    className="flex-1 px-3 py-2 bg-white border-2 border-border rounded-lg text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                  />
                  <input
                    type="number"
                    placeholder="Pret (RON)"
                    value={procedure.estimatedCost || ''}
                    onChange={(e) =>
                      updateProcedure(option.optionId, idx, {
                        estimatedCost: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-32 px-3 py-2 bg-white border-2 border-border rounded-lg text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                  />
                  <button
                    onClick={() => removeProcedure(option.optionId, idx)}
                    className="p-2 text-white bg-danger hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                    aria-label="Sterge procedura"
                    title="Sterge procedura"
                  >
                    <Icon name="x" className="w-5 h-5" />
                  </button>
                </div>
              ))}

              <button
                onClick={() => addProcedure(option.optionId)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-text-secondary hover:text-foreground border-2 border-dashed border-border hover:border-brand hover:bg-surface-hover rounded-lg transition-colors"
              >
                <Icon name="plus" className="w-4 h-4" />
                Adauga Procedura
              </button>
            </div>

            {/* Total Cost */}
            <div className="pt-4 border-t-2 border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-text-secondary">Cost Total Estimat</span>
                <span className="text-xl font-bold text-brand">
                  {formatCurrency(option.totalEstimatedCost)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-6 border-t-2 border-border">
        <button
          onClick={onCancel}
          className="px-6 py-2.5 bg-white text-text-secondary border-2 border-border rounded-lg font-semibold hover:border-text-muted hover:bg-surface-hover transition-colors"
        >
          Anuleaza
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-brand text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors shadow-sm"
        >
          Salveaza Planul de Tratament
        </button>
      </div>
    </div>
  );
}
