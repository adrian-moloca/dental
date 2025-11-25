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
      name: 'Option 1',
      procedures: [],
      totalEstimatedCost: 0,
    },
  ]);

  const addOption = () => {
    setOptions([
      ...options,
      {
        optionId: crypto.randomUUID(),
        name: `Option ${options.length + 1}`,
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
      alert('Please enter a title for the treatment plan');
      return;
    }

    if (options.length === 0) {
      alert('Please add at least one treatment option');
      return;
    }

    for (const option of options) {
      if (option.procedures.length === 0) {
        alert(`Please add procedures to ${option.name}`);
        return;
      }
    }

    onSave?.({ title, options });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Create Treatment Plan</h2>
        <p className="text-sm text-foreground/60">
          Build multiple treatment options for the patient to choose from
        </p>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="plan-title" className="block text-sm font-medium text-foreground/70 mb-2">
          Plan Title *
        </label>
        <input
          id="plan-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Full Mouth Rehabilitation"
          className="w-full px-4 py-2 bg-surface border border-white/10 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>

      {/* Treatment Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Treatment Options</h3>
          <button
            onClick={addOption}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
          >
            <Icon name="plus" className="w-4 h-4" />
            Add Option
          </button>
        </div>

        {options.map((option) => (
          <div
            key={option.optionId}
            className="p-6 bg-surface border border-white/10 rounded-lg space-y-4"
          >
            {/* Option Header */}
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={option.name}
                onChange={(e) => updateOption(option.optionId, { name: e.target.value })}
                className="text-lg font-semibold bg-transparent border-b border-transparent hover:border-white/20 focus:border-brand text-foreground focus:outline-none"
              />
              {options.length > 1 && (
                <button
                  onClick={() => removeOption(option.optionId)}
                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  aria-label="Remove option"
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
                    placeholder="Code"
                    value={procedure.code}
                    onChange={(e) =>
                      updateProcedure(option.optionId, idx, { code: e.target.value })
                    }
                    className="w-24 px-3 py-2 bg-surface-hover border border-white/5 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={procedure.description}
                    onChange={(e) =>
                      updateProcedure(option.optionId, idx, { description: e.target.value })
                    }
                    className="flex-1 px-3 py-2 bg-surface-hover border border-white/5 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                  <input
                    type="number"
                    placeholder="Cost"
                    value={procedure.estimatedCost || ''}
                    onChange={(e) =>
                      updateProcedure(option.optionId, idx, {
                        estimatedCost: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-32 px-3 py-2 bg-surface-hover border border-white/5 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                  <button
                    onClick={() => removeProcedure(option.optionId, idx)}
                    className="p-2 text-foreground/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    aria-label="Remove procedure"
                  >
                    <Icon name="x" className="w-5 h-5" />
                  </button>
                </div>
              ))}

              <button
                onClick={() => addProcedure(option.optionId)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-foreground/70 hover:text-foreground border border-dashed border-white/20 hover:border-brand rounded-lg transition-colors"
              >
                <Icon name="plus" className="w-4 h-4" />
                Add Procedure
              </button>
            </div>

            {/* Total Cost */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground/70">Total Estimated Cost</span>
                <span className="text-xl font-bold text-brand">
                  ${option.totalEstimatedCost.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-6 border-t border-white/10">
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-surface-hover text-foreground rounded-lg font-medium hover:bg-surface-hover/80 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-brand text-white rounded-lg font-medium hover:bg-brand/90 transition-colors"
        >
          Save Treatment Plan
        </button>
      </div>
    </div>
  );
}
