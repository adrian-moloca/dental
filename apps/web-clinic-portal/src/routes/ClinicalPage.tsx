/**
 * Clinical Page - Patient clinical records and charting
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useClinicalNotes, useTreatmentPlans, useProcedures, useOdontogram, useUpdateOdontogram } from '../hooks/useClinical';
import { Icon } from '../components/ui/Icon';
import { OdontogramEditor } from '../components/clinical/OdontogramEditor';

type TabType = 'notes' | 'chart' | 'procedures' | 'treatments';

export function ClinicalPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('chart');

  const { data: notes, isLoading: notesLoading } = useClinicalNotes(patientId!);
  const { data: treatments, isLoading: treatmentsLoading } = useTreatmentPlans(patientId!);
  const { data: procedures, isLoading: proceduresLoading } = useProcedures(patientId!);
  const { data: odontogram, isLoading: odontogramLoading } = useOdontogram(patientId!);
  const updateOdontogram = useUpdateOdontogram();

  const handleSaveOdontogram = async (data: any) => {
    await updateOdontogram.mutateAsync({
      patientId: patientId!,
      data: {
        patientId: patientId!,
        entries: [
          {
            chartedAt: new Date().toISOString(),
            teeth: data,
          },
        ],
      },
    });
  };

  const tabs = [
    { id: 'chart' as TabType, label: 'Odontogram', icon: 'clipboard' },
    { id: 'notes' as TabType, label: 'Clinical Notes', icon: 'document' },
    { id: 'procedures' as TabType, label: 'Procedures', icon: 'lightning' },
    { id: 'treatments' as TabType, label: 'Treatment Plans', icon: 'clipboard' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Clinical Records</h1>
        <p className="text-sm text-foreground/60 mt-1">
          Patient clinical data, charting, and treatment history
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${
              activeTab === tab.id
                ? 'text-brand border-b-2 border-brand'
                : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            <Icon name={tab.icon as any} className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'chart' && (
          <div className="p-6 bg-surface rounded-lg border border-white/10">
            {odontogramLoading ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="loading" className="w-8 h-8 text-brand animate-spin" />
              </div>
            ) : (
              <OdontogramEditor
                patientId={patientId!}
                data={odontogram?.data?.entries?.[0]?.teeth || []}
                onSave={handleSaveOdontogram}
              />
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            {notesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="loading" className="w-8 h-8 text-brand animate-spin" />
              </div>
            ) : !notes?.data || notes.data.length === 0 ? (
              <div className="p-12 text-center bg-surface rounded-lg border border-white/10">
                <Icon name="document" className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground/60 mb-2">No clinical notes</h3>
                <p className="text-sm text-foreground/40 mb-6">
                  Start documenting patient encounters
                </p>
                <button className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors">
                  Create First Note
                </button>
              </div>
            ) : (
              notes.data.map((note) => (
                <div key={note.id} className="p-6 bg-surface rounded-lg border border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{note.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-foreground/60">
                        <span>{new Date(note.encounterDate).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="capitalize">{note.type}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {note.isFinalized && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                          Finalized
                        </span>
                      )}
                      {note.isSigned && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">
                          Signed
                        </span>
                      )}
                    </div>
                  </div>

                  {note.soap && (
                    <div className="space-y-3">
                      {note.soap.subjective && (
                        <div>
                          <div className="text-xs font-medium text-foreground/50 uppercase mb-1">Subjective</div>
                          <p className="text-sm text-foreground/80">{note.soap.subjective}</p>
                        </div>
                      )}
                      {note.soap.objective && (
                        <div>
                          <div className="text-xs font-medium text-foreground/50 uppercase mb-1">Objective</div>
                          <p className="text-sm text-foreground/80">{note.soap.objective}</p>
                        </div>
                      )}
                      {note.soap.assessment && (
                        <div>
                          <div className="text-xs font-medium text-foreground/50 uppercase mb-1">Assessment</div>
                          <p className="text-sm text-foreground/80">{note.soap.assessment}</p>
                        </div>
                      )}
                      {note.soap.plan && (
                        <div>
                          <div className="text-xs font-medium text-foreground/50 uppercase mb-1">Plan</div>
                          <p className="text-sm text-foreground/80">{note.soap.plan}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {note.content && !note.soap && (
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">{note.content}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'procedures' && (
          <div className="space-y-4">
            {proceduresLoading ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="loading" className="w-8 h-8 text-brand animate-spin" />
              </div>
            ) : !procedures?.data || procedures.data.length === 0 ? (
              <div className="p-12 text-center bg-surface rounded-lg border border-white/10">
                <Icon name="lightning" className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground/60 mb-2">No procedures</h3>
                <p className="text-sm text-foreground/40">
                  Procedures will appear here once documented
                </p>
              </div>
            ) : (
              <div className="bg-surface rounded-lg border border-white/10 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-surface-hover border-b border-white/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase">
                        Teeth
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-foreground/60 uppercase">
                        Fee
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {procedures.data.map((proc) => (
                      <tr key={proc.id} className="hover:bg-surface-hover transition-colors">
                        <td className="px-6 py-4 text-sm text-foreground">
                          {new Date(proc.procedureDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-foreground">{proc.code}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{proc.description}</td>
                        <td className="px-6 py-4 text-sm text-foreground/70">
                          {proc.teeth.join(', ')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            proc.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                            proc.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' :
                            proc.status === 'planned' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-gray-500/20 text-gray-300'
                          }`}>
                            {proc.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-medium text-foreground">
                          ${proc.fee.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'treatments' && (
          <div className="space-y-4">
            {treatmentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="loading" className="w-8 h-8 text-brand animate-spin" />
              </div>
            ) : !treatments?.data || treatments.data.length === 0 ? (
              <div className="p-12 text-center bg-surface rounded-lg border border-white/10">
                <Icon name="clipboard" className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground/60 mb-2">No treatment plans</h3>
                <p className="text-sm text-foreground/40 mb-6">
                  Create treatment plans with multiple options
                </p>
                <button className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors">
                  Create Treatment Plan
                </button>
              </div>
            ) : (
              treatments.data.map((plan) => (
                <div key={plan.id} className="p-6 bg-surface rounded-lg border border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{plan.title}</h3>
                      <div className="text-sm text-foreground/60 mt-1">
                        {new Date(plan.planDate).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      plan.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                      plan.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' :
                      plan.status === 'approved' ? 'bg-cyan-500/20 text-cyan-300' :
                      plan.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {plan.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {plan.options.map((option) => (
                      <div key={option.optionId} className="p-4 bg-surface-hover rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground">{option.name}</span>
                          <span className="text-brand font-bold">
                            ${option.totalEstimatedCost.toFixed(2)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {option.procedures.map((proc, idx) => (
                            <div key={idx} className="flex justify-between text-sm text-foreground/70">
                              <span>{proc.description}</span>
                              <span>${proc.estimatedCost.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
