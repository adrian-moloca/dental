import { useNavigate } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Skeleton } from '../ui/Skeleton';
import { useAppointments } from '../../hooks/useAppointments';

export function ConfirmationStatsWidget() {
  const navigate = useNavigate();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const endOfTomorrow = new Date(tomorrow);
  endOfTomorrow.setHours(23, 59, 59, 999);

  const { data, isLoading, isError, refetch } = useAppointments({
    startDate: tomorrow as any,
    endDate: endOfTomorrow as any,
    confirmed: false,
  });

  const unconfirmedCount = data?.data?.length || 0;
  const hasUnconfirmed = unconfirmedCount > 0;

  if (isLoading) {
    return (
      <div className="p-6 bg-surface rounded-lg border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <Skeleton variant="text" width={180} height={24} />
        </div>
        <Skeleton variant="text" width={80} height={48} />
        <Skeleton variant="text" width={120} height={16} className="mt-2" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-surface rounded-lg border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-red-500/20 text-red-300">
            <Icon name="exclamation" className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Confirmations</h3>
        </div>
        <div className="text-sm text-red-400 mb-2">Failed to load data</div>
        <button
          onClick={() => refetch()}
          className="text-xs text-brand hover:text-brand/80 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => navigate('/appointments?filter=needs-confirmation')}
      className="w-full p-6 bg-surface rounded-lg border border-white/10 hover:border-brand transition-all text-left group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              hasUnconfirmed
                ? 'bg-yellow-500/20 text-yellow-300'
                : 'bg-green-500/20 text-green-300'
            }`}
          >
            <Icon name={hasUnconfirmed ? 'exclamation' : 'check'} className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Needs Confirmation</h3>
        </div>
        <Icon
          name="calendar"
          className="w-5 h-5 text-foreground/40 group-hover:text-brand transition-colors"
        />
      </div>

      <div
        className={`text-4xl font-bold mb-2 ${
          hasUnconfirmed ? 'text-yellow-400' : 'text-green-400'
        }`}
      >
        {unconfirmedCount}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-foreground/60">
          {hasUnconfirmed
            ? `${unconfirmedCount === 1 ? 'appointment needs' : 'appointments need'} confirmation for tomorrow`
            : 'All appointments confirmed for tomorrow'}
        </div>
        <div className="text-brand text-sm opacity-0 group-hover:opacity-100 transition-opacity">
          View ’
        </div>
      </div>
    </button>
  );
}
