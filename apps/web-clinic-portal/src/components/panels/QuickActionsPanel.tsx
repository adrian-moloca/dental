import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Button } from '../ui/Button';

type QuickAction = {
  id: string;
  label: string;
  description?: string;
  to: string;
};

const defaultActions: QuickAction[] = [
  { id: 'qa1', label: 'Create appointment', description: 'Book a patient with provider/chair', to: '/appointments/create' },
  { id: 'qa2', label: 'Search patients', description: 'Jump to your roster', to: '/patients' },
  { id: 'qa3', label: 'Add patient note', description: 'Document chairside notes quickly', to: '/patients' },
];

type Props = {
  open: boolean;
  onClose: () => void;
  actions?: QuickAction[];
};

export function QuickActionsPanel({ open, onClose, actions = defaultActions }: Props) {
  return (
    <div
      className={clsx('fixed inset-0 z-40 transition', open ? 'pointer-events-auto' : 'pointer-events-none')}
      role="dialog"
      aria-modal="true"
      aria-label="Quick actions"
    >
      <div
        className={clsx('absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity', open ? 'opacity-100' : 'opacity-0')}
        onClick={onClose}
      />
      <div
        className={clsx(
          'absolute right-0 top-0 h-full w-full max-w-md transform border-l border-white/10 bg-ink-900/95 backdrop-blur-lg shadow-soft transition',
          open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Quick actions</p>
            <p className="text-white font-semibold">Do it faster</p>
          </div>
          <Button variant="ghost" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="divide-y divide-white/5 max-h-[calc(100%-64px)] overflow-y-auto">
          {actions.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              className="block px-5 py-4 hover:bg-white/5 transition"
              onClick={onClose}
            >
              <p className="text-sm font-semibold text-white">{item.label}</p>
              {item.description && <p className="text-sm text-slate-400">{item.description}</p>}
            </Link>
          ))}
          {actions.length === 0 && (
            <div className="p-6 text-center text-slate-400 text-sm">No quick actions configured.</div>
          )}
        </div>
      </div>
    </div>
  );
}
