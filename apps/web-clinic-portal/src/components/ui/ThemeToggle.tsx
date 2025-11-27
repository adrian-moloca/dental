/**
 * Theme Toggle - Beautiful theme switcher with animations
 */

import { useTheme } from '../../contexts/ThemeContext';
import clsx from 'clsx';

export function ThemeToggle() {
  const { theme, resolvedTheme: _resolvedTheme, setTheme } = useTheme();

  const themes = [
    { value: 'light' as const, icon: '☀️', label: 'Light' },
    { value: 'dark' as const, icon: '🌙', label: 'Dark' },
    { value: 'system' as const, icon: '💻', label: 'System' },
  ];

  return (
    <div
      className="flex items-center gap-1 p-1 rounded-lg bg-surface/50 border border-border"
      role="radiogroup"
      aria-label="Theme selection"
    >
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className={clsx(
            'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
            theme === t.value
              ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
          )}
          role="radio"
          aria-checked={theme === t.value}
        >
          <span className="mr-1.5">{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}
