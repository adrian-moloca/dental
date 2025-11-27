/**
 * Right Sidebar - Contextual actions, info, and features
 */

import { useSidebar } from '../../contexts/SidebarContext';
import { Icon } from '../ui/Icon';
import clsx from 'clsx';
import { type ReactNode } from 'react';

interface RightSidebarProps {
  title?: string;
  children: ReactNode;
}

export function RightSidebar({ title = 'Details', children }: RightSidebarProps) {
  const { rightSidebarOpen, toggleRightSidebar } = useSidebar();

  return (
    <>
      {/* Backdrop for mobile */}
      {rightSidebarOpen && (
        <div
          className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={toggleRightSidebar}
          aria-hidden={true}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:relative right-0 top-0 bottom-0 z-40',
          'w-80 lg:w-96 bg-surface/95 backdrop-blur border-l border-border',
          'transform transition-transform duration-300 ease-in-out',
          'flex flex-col',
          rightSidebarOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        aria-label={title}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            onClick={toggleRightSidebar}
            className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-muted hover:text-foreground"
            aria-label="Close sidebar"
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </aside>
    </>
  );
}

export function RightSidebarSection({
  title,
  children,
  collapsible: _collapsible = false,
}: {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
}) {
  return (
    <div className="mb-6 last:mb-0">
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function RightSidebarItem({
  label,
  value,
  icon,
  action,
}: {
  label: string;
  value?: string | ReactNode;
  icon?: ReactNode;
  action?: () => void;
}) {
  return (
    <div className="flex items-start gap-3">
      {icon && <div className="text-muted mt-0.5">{icon}</div>}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted mb-1">{label}</div>
        {typeof value === 'string' ? (
          <div className="text-sm text-foreground font-medium">{value}</div>
        ) : (
          value
        )}
      </div>
      {action && (
        <button
          onClick={action}
          className="p-1.5 rounded hover:bg-surface-hover transition-colors text-muted hover:text-foreground"
        >
          <Icon name="chevronRight" className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
