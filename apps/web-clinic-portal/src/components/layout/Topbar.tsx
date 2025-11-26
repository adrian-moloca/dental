import { useEffect, useState } from 'react';
import { NotificationsPanel } from '../panels/NotificationsPanel';
import { QuickActionsPanel } from '../panels/QuickActionsPanel';
import { CommandPalette } from '../panels/CommandPalette';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

const sampleNotifications = [
  { id: 'n1', title: 'Patient arrived', body: 'John Doe checked in at 10:30', time: '2m ago', unread: true },
  { id: 'n2', title: 'Low stock', body: 'Gloves (M) below threshold in Chair 3', time: '12m ago', unread: false },
  { id: 'n3', title: 'Payment posted', body: 'Invoice INV-204 paid online (RON 320)', time: '30m ago', unread: false },
];

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openQuickActions, setOpenQuickActions] = useState(false);
  const [openCommand, setOpenCommand] = useState(false);

  // listen for Ctrl/Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === 'k';
      const isCmd = e.metaKey || e.ctrlKey;
      if (isK && isCmd) {
        e.preventDefault();
        setOpenCommand(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const hasUnreadNotifications = sampleNotifications.some((n) => n.unread);

  return (
    <>
      <header
        className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-sm"
        role="banner"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="md"
              onClick={onMenuClick}
              className="lg:hidden"
              aria-label="Open navigation menu"
            >
              <Icon name="menu" className="w-5 h-5" aria-hidden={true} />
            </Button>

            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Dental OS</span>
              <span className="text-[var(--primary)] font-semibold">Clinic Portal</span>
            </div>
            <div className="relative w-64 hidden md:block">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] w-4 h-4"
                aria-hidden={true}
              />
              <input
                type="search"
                placeholder="Search patients, appointments..."
                className="w-full rounded-full border border-[var(--border)] bg-[var(--surface-card)] pl-10 pr-12 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                aria-label="Search patients and appointments"
                onClick={() => setOpenCommand(true)}
                onFocus={() => setOpenCommand(true)}
                readOnly
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--text-tertiary)] border border-[var(--border)] px-1.5 py-0.5 rounded bg-[var(--surface)]">
                ⌘K
              </kbd>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setOpenNotifications(true)}
              className="relative"
              aria-label={`Notifications${hasUnreadNotifications ? ' - You have unread notifications' : ''}`}
            >
              <Icon name="bell" className="w-5 h-5" aria-hidden={true} />
              {hasUnreadNotifications && (
                <span
                  className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse"
                  aria-hidden={true}
                />
              )}
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => setOpenQuickActions(true)}
              aria-label="Open quick actions"
            >
              <Icon name="lightning" className="w-4 h-4" aria-hidden={true} />
              <span className="hidden sm:inline ml-1">Quick actions</span>
            </Button>
            <div
              className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-3 py-2"
              role="status"
              aria-label="Current clinic: Central Clinic, Bucharest"
            >
              <div
                className="h-7 w-7 rounded-full bg-[var(--primary)]/20 border border-[var(--primary)]/30 text-[var(--primary)] text-sm font-semibold flex items-center justify-center"
                aria-hidden={true}
              >
                CL
              </div>
              <div className="text-xs leading-tight hidden sm:block">
                <div className="text-[var(--text)] font-semibold">Central Clinic</div>
                <div className="text-[var(--text-tertiary)]">Bucharest</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <NotificationsPanel
        open={openNotifications}
        onClose={() => setOpenNotifications(false)}
        items={sampleNotifications}
      />
      <QuickActionsPanel open={openQuickActions} onClose={() => setOpenQuickActions(false)} />
      <CommandPalette open={openCommand} onClose={() => setOpenCommand(false)} />
    </>
  );
}
