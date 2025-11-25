import clsx from 'clsx';

type Tone = 'success' | 'warning' | 'neutral';

type Props = {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
};

export function Badge({ tone = 'neutral', children, className }: Props) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        tone === 'success' && 'bg-[var(--success)]/20 text-[var(--text)] border border-[var(--success)]/50',
        tone === 'warning' && 'bg-[var(--warning)]/22 text-white border border-[var(--warning)]/60',
        tone === 'neutral' && 'bg-white/10 text-[var(--text)] border border-white/15',
        className
      )}
    >
      {children}
    </span>
  );
}
