/**
 * Imaging Page - X-rays, DICOM studies, and AI analysis
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useImagingStudies, useImagingStudy, useUploadImagingFile, useAIResults, useRequestAIAnalysis } from '../hooks/useImaging';
import { Icon } from '../components/ui/Icon';

type ModalityType = 'PA' | 'PANO' | 'CEPH' | 'CBCT' | '3D' | '';

export function ImagingPage() {
  const { patientId } = useParams<{ patientId?: string }>();
  const [modalityFilter, setModalityFilter] = useState<ModalityType>('');
  const [selectedStudyId, setSelectedStudyId] = useState<string | null>(null);

  const { data, isLoading } = useImagingStudies({
    patientId: patientId || undefined,
    modality: modalityFilter || undefined,
  });

  const { data: selectedStudy } = useImagingStudy(selectedStudyId || '');
  const { data: aiResults } = useAIResults(selectedStudyId || '');
  const uploadFile = useUploadImagingFile();
  const requestAI = useRequestAIAnalysis();

  const studies = data?.data?.data || [];

  const modalityOptions = [
    { value: '', label: 'All Modalities' },
    { value: 'PA', label: 'Periapical' },
    { value: 'PANO', label: 'Panoramic' },
    { value: 'CEPH', label: 'Cephalometric' },
    { value: 'CBCT', label: 'CBCT' },
    { value: '3D', label: '3D Scan' },
  ];

  const handleFileUpload = async (studyId: string, file: File) => {
    await uploadFile.mutateAsync({ studyId, file });
  };

  const handleRequestAIAnalysis = async (analysisType: string) => {
    if (!selectedStudyId) return;
    await requestAI.mutateAsync({ studyId: selectedStudyId, analysisType });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Imaging & Radiology</h1>
          <p className="text-sm text-foreground/60 mt-1">
            X-rays, DICOM studies, and AI-powered analysis
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors font-medium">
          <Icon name="plus" className="w-5 h-5" />
          New Study
        </button>
      </div>

      {/* Modality Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {modalityOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setModalityFilter(option.value as ModalityType)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              modalityFilter === option.value
                ? 'bg-brand text-white'
                : 'bg-surface-hover text-foreground/70 hover:bg-surface-hover/80'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Studies Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Icon name="loading" className="w-8 h-8 text-brand animate-spin" />
        </div>
      ) : studies.length === 0 ? (
        <div className="p-12 text-center">
          <Icon name="document" className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground/60 mb-2">No imaging studies found</h3>
          <p className="text-sm text-foreground/40">
            {modalityFilter ? 'Try adjusting your filter' : 'Upload your first study to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studies.map((study) => (
            <div
              key={study.id}
              onClick={() => setSelectedStudyId(study.id)}
              className={`p-6 bg-surface rounded-lg border transition-all cursor-pointer ${
                selectedStudyId === study.id
                  ? 'border-brand ring-2 ring-brand/50'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Study Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-sm font-medium text-foreground">{study.studyId}</div>
                  <div className="text-xs text-foreground/50 mt-1">
                    {new Date(study.studyDate).toLocaleDateString()}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  study.status === 'available' ? 'bg-green-500/20 text-green-300' :
                  study.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {study.status}
                </span>
              </div>

              {/* Modality Badge */}
              <div className="inline-flex items-center px-3 py-1 bg-brand/20 text-brand rounded-full text-xs font-medium mb-3">
                {study.modality}
              </div>

              {/* Description */}
              {study.studyDescription && (
                <p className="text-sm text-foreground/70 mb-4">{study.studyDescription}</p>
              )}

              {/* Files */}
              <div className="flex items-center gap-2 text-xs text-foreground/50">
                <Icon name="document" className="w-4 h-4" />
                {study.files.length} file{study.files.length !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Study Details Modal */}
      {selectedStudyId && selectedStudy?.data && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg border border-white/10 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-bg border-b border-white/10 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{selectedStudy.data.studyId}</h2>
                <p className="text-sm text-foreground/60 mt-1">
                  {selectedStudy.data.modality} • {new Date(selectedStudy.data.studyDate).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudyId(null)}
                className="p-2 text-foreground/60 hover:text-foreground hover:bg-surface-hover rounded-lg transition-colors"
              >
                <Icon name="x" className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Description */}
              {selectedStudy.data.studyDescription && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
                  <p className="text-foreground/70">{selectedStudy.data.studyDescription}</p>
                </div>
              )}

              {/* Files */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Files</h3>
                  <label className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors cursor-pointer text-sm font-medium">
                    <Icon name="plus" className="w-4 h-4" />
                    Upload File
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.dcm"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(selectedStudyId, file);
                      }}
                    />
                  </label>
                </div>

                {selectedStudy.data.files.length === 0 ? (
                  <div className="p-8 text-center text-foreground/40 border border-dashed border-white/20 rounded-lg">
                    No files uploaded yet
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedStudy.data.files.map((file) => (
                      <div key={file.fileId} className="p-4 bg-surface rounded-lg border border-white/10">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">
                              {file.filename}
                            </div>
                            <div className="text-xs text-foreground/50 mt-1">
                              {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                          <button className="text-brand hover:text-brand/80 text-xs font-medium ml-2">
                            View
                          </button>
                        </div>
                        <div className="text-xs text-foreground/40">
                          {new Date(file.uploadedAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Analysis */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">AI Analysis</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRequestAIAnalysis('caries_detection')}
                      className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
                    >
                      Detect Caries
                    </button>
                    <button
                      onClick={() => handleRequestAIAnalysis('periodontal_assessment')}
                      className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                    >
                      Periodontal
                    </button>
                    <button
                      onClick={() => handleRequestAIAnalysis('bone_level')}
                      className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-colors text-sm"
                    >
                      Bone Level
                    </button>
                  </div>
                </div>

                {!aiResults?.data || aiResults.data.length === 0 ? (
                  <div className="p-8 text-center text-foreground/40 border border-dashed border-white/20 rounded-lg">
                    <Icon name="lightning" className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
                    <p className="text-sm">No AI analysis results yet</p>
                    <p className="text-xs mt-1">Request an analysis to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {aiResults.data.map((result) => (
                      <div key={result.resultId} className="p-4 bg-surface rounded-lg border border-white/10">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-sm font-medium text-foreground capitalize">
                              {result.analysisType.replace('_', ' ')}
                            </div>
                            <div className="text-xs text-foreground/50 mt-1">
                              {new Date(result.analysisDate).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Overall Assessment */}
                        <div className="mb-3 p-3 bg-surface-hover rounded-lg">
                          <div className="text-xs text-foreground/50 mb-1">Overall Assessment</div>
                          <p className="text-sm text-foreground">{result.overallAssessment}</p>
                        </div>

                        {/* Findings */}
                        {result.findings.length > 0 && (
                          <div>
                            <div className="text-xs text-foreground/50 mb-2">Findings</div>
                            <div className="space-y-2">
                              {result.findings.map((finding, idx) => (
                                <div key={idx} className="flex items-start gap-3 text-sm">
                                  <span className="px-2 py-1 bg-brand/20 text-brand rounded text-xs font-medium">
                                    Tooth {finding.tooth}
                                  </span>
                                  <div className="flex-1">
                                    <div className="text-foreground">{finding.finding}</div>
                                    <div className="text-foreground/50 text-xs mt-1">
                                      {finding.surface} • Confidence: {(finding.confidence * 100).toFixed(0)}%
                                      {finding.severity && ` • ${finding.severity}`}
                                    </div>
                                  </div>
                                  {finding.severity && (
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      finding.severity === 'severe' ? 'bg-red-500/20 text-red-300' :
                                      finding.severity === 'moderate' ? 'bg-yellow-500/20 text-yellow-300' :
                                      'bg-green-500/20 text-green-300'
                                    }`}>
                                      {finding.severity}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
