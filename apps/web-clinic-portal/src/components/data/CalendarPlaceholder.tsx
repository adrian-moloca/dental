type Props = {
  title?: string;
};

export function CalendarPlaceholder({ title = 'Schedule' }: Props) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/5 p-4 shadow-soft">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">{title}</p>
          <p className="text-white font-semibold">Week view</p>
        </div>
        <div className="text-xs text-slate-500">Calendar placeholder</div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-xs text-slate-300">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="rounded-lg border border-white/5 bg-ink-800/60 p-3 min-h-[120px]">
            <div className="mb-2 text-slate-400">{day}</div>
            <div className="h-2 rounded bg-brand-500/30" />
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Swap with a real scheduler (FullCalendar/resource view) while keeping this chrome.
      </p>
    </div>
  );
}
