import clsx from 'clsx';

export type TimelineItem = {
  id: string;
  title: string;
  detail?: string;
  time: string;
  tone?: 'success' | 'warning' | 'info';
};

type Props = {
  items: TimelineItem[];
};

export function Timeline({ items }: Props) {
  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={item.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={clsx(
                'h-3 w-3 rounded-full',
                item.tone === 'success' && 'bg-emerald-400',
                item.tone === 'warning' && 'bg-amber-400',
                (!item.tone || item.tone === 'info') && 'bg-brand-400',
              )}
            />
            {idx !== items.length - 1 && <div className="h-full w-px bg-white/10 flex-1" />}
          </div>
          <div className="rounded-lg border border-white/5 bg-white/5 p-3 flex-1">
            <div className="flex items-center justify-between text-sm">
              <p className="text-white font-semibold">{item.title}</p>
              <span className="text-xs uppercase tracking-[0.08em] text-slate-500">{item.time}</span>
            </div>
            {item.detail && <p className="text-sm text-slate-300 mt-1">{item.detail}</p>}
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <div className="text-sm text-slate-400">No history yet.</div>
      )}
    </div>
  );
}
