/**
 * RecentPatients Widget
 *
 * Shows recently viewed or added patients.
 */

import { useQuery } from '@tanstack/react-query';
import { patientsClient } from '../../../../api/patientsClient';
import { WidgetWrapper } from './WidgetWrapper';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface RecentPatientsWidgetProps {
  editMode?: boolean;
}

export function RecentPatientsWidget({ editMode = false }: RecentPatientsWidgetProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['patients', 'recent'],
    queryFn: async () => {
      const response = await patientsClient.search({
        page: 1,
        limit: 6,
      });
      return response.data || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const patients = data || [];
  const isEmpty = patients.length === 0;

  return (
    <WidgetWrapper
      id="recentPatients"
      title="Pacienti Recenti"
      icon="ti ti-users"
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
      emptyMessage="Nu exista pacienti recenti"
      editMode={editMode}
      actions={
        <Link to="/patients" className="btn btn-sm btn-light">
          <i className="ti ti-eye me-1"></i>
          Vezi Tot
        </Link>
      }
    >
      <div className="list-group list-group-flush">
        {patients.map((patient) => (
          <Link
            key={patient.id}
            to={`/patients/${patient.id}`}
            className="list-group-item list-group-item-action border-0 py-2"
          >
            <div className="d-flex align-items-center">
              <div className="avatar avatar-sm bg-primary-transparent rounded-circle me-3">
                <span className="avatar-initials text-primary fw-bold">
                  {patient.firstName?.[0]}
                  {patient.lastName?.[0]}
                </span>
              </div>
              <div className="flex-grow-1">
                <div className="fw-medium">
                  {patient.firstName} {patient.lastName}
                </div>
                <small className="text-muted">
                  {patient.phones?.[0]?.number && (
                    <>
                      <i className="ti ti-phone me-1"></i>
                      {patient.phones[0].number}
                    </>
                  )}
                </small>
              </div>
              <div className="text-end">
                <small className="text-muted">
                  {patient.createdAt && format(new Date(patient.createdAt), 'dd MMM')}
                </small>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </WidgetWrapper>
  );
}

export default RecentPatientsWidget;
