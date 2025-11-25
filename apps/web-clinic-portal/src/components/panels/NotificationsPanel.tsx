import clsx from 'clsx';
import { Button } from '../ui/Button';

type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread?: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  items: Notification[];
};

export function NotificationsPanel({ open, onClose, items }: Props) {
  return (
    <div
      className={clsx(
        'fixed inset-0 z-30 transition',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Notifications"
    >
      <div
        className={clsx(
          'absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />
      <div
        className={clsx(
          'absolute right-0 top-0 h-full w-full max-w-md transform border-l border-white/10 bg-ink-900/90 backdrop-blur-lg shadow-soft transition',
          open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Notifications</p>
            <p className="text-white font-semibold">Inbox</p>
          </div>
          <Button variant="ghost" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="divide-y divide-white/5 max-h-[calc(100%-64px)] overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="px-5 py-4 hover:bg-white/5 transition">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-sm text-slate-300">{item.body}</p>
                </div>
                {item.unread && <span className="h-2 w-2 rounded-full bg-emerald-400 mt-1.5" />}
              </div>
              <p className="mt-2 text-xs uppercase tracking-[0.1em] text-slate-500">{item.time}</p>
            </div>
          ))}
          {items.length === 0 && (
            <div className="p-6 text-center text-slate-400 text-sm">You are all caught up.</div>
          )}
        </div>
      </div>
    </div>
  );
}
