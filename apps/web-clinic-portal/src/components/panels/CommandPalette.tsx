import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

type Command = {
  id: string;
  label: string;
  hint?: string;
  to: string;
};

const defaultCommands: Command[] = [
  { id: 'cmd-appointment', label: 'Create appointment', hint: 'Book a patient visit', to: '/appointments/create' },
  { id: 'cmd-patients', label: 'Search patients', hint: 'Open patients list', to: '/patients' },
  { id: 'cmd-docs', label: 'Upload document', hint: 'Attach to patient', to: '/patients' },
  { id: 'cmd-team', label: 'Team roster', hint: 'Manage staff access', to: '/patients' },
];

type Props = {
  open: boolean;
  onClose: () => void;
  commands?: Command[];
};

export function CommandPalette({ open, onClose, commands = defaultCommands }: Props) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    if (!query) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));
  }, [commands, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-ink-900/95 shadow-soft">
        <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search…"
            className="w-full bg-transparent text-white placeholder:text-slate-500 focus:outline-none text-sm"
          />
          <span className="rounded-md border border-white/10 px-2 py-1 text-[11px] text-slate-500">Esc</span>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {filtered.map((cmd, idx) => (
            <Link
              key={cmd.id}
              to={cmd.to}
              onClick={onClose}
              className={clsx(
                'block px-4 py-3 hover:bg-white/5 transition',
                idx === 0 && 'rounded-t-2xl',
                idx === filtered.length - 1 && 'rounded-b-2xl',
              )}
            >
              <div className="text-sm font-semibold text-white">{cmd.label}</div>
              {cmd.hint && <div className="text-xs text-slate-400">{cmd.hint}</div>}
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-slate-400">No commands found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
