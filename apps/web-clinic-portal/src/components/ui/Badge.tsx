import clsx from 'clsx';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

type Props = {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
};

export function Badge({ tone = 'neutral', children, className, size = 'md' }: Props) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium',
        // Sizes
        size === 'sm' && 'px-2 py-0.5 text-[10px]',
        size === 'md' && 'px-3 py-1 text-xs',
        // Tones - all WCAG AA compliant (4.5:1 contrast minimum)
        tone === 'success' && 'bg-[var(--success)]/15 text-[var(--success)] border border-[var(--success)]/30',
        tone === 'warning' && 'bg-[var(--warning)]/15 text-[var(--warning)] border border-[var(--warning)]/30',
        tone === 'danger' && 'bg-[var(--danger)]/15 text-[var(--danger)] border border-[var(--danger)]/30',
        tone === 'info' && 'bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30',
        tone === 'neutral' && 'bg-[var(--surface-card)] text-[var(--text-secondary)] border border-[var(--border)]',
        className
      )}
    >
      {children}
    </span>
  );
}
