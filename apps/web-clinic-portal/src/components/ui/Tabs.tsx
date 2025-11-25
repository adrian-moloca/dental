import clsx from 'clsx';
import { useState } from 'react';

export type Tab = {
  id: string;
  label: string;
  badge?: string | number;
};

type Props = {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (id: string) => void;
};

export function Tabs({ tabs, defaultTab, onChange }: Props) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);

  const handleChange = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  return (
    <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleChange(tab.id)}
          className={clsx(
            'relative rounded-full px-4 py-2 font-semibold transition',
            active === tab.id
              ? 'bg-white/10 text-white shadow-soft border border-white/15'
              : 'text-slate-300 hover:text-white',
          )}
        >
          {tab.label}
          {tab.badge !== undefined && (
            <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-200 border border-white/10">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
