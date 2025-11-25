/**
 * Advanced Notification Center - Filtering, actions, real-time updates
 */

import { useState, useMemo } from 'react';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import clsx from 'clsx';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'appointment' | 'patient' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  timestamp: number;
  read: boolean;
  actionLabel?: string;
  actionUrl?: string;
  avatar?: string;
}

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onAction?: (notification: Notification) => void;
}

const filters = ['all', 'unread', 'appointments', 'patients', 'system'] as const;
type Filter = typeof filters[number];

export function NotificationCenter({
  open,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onAction,
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Apply filter
    if (filter === 'unread') {
      filtered = filtered.filter((n) => !n.read);
    } else if (filter === 'appointments') {
      filtered = filtered.filter((n) => n.type === 'appointment');
    } else if (filter === 'patients') {
      filtered = filtered.filter((n) => n.type === 'patient');
    } else if (filter === 'system') {
      filtered = filtered.filter((n) => n.type === 'system');
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.message.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Sort by timestamp
    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }, [notifications, filter, searchQuery]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden={true}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-surface border-l border-border z-50 flex flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Notification center"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
              {unreadCount > 0 && (
                <Badge tone="neutral" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-xs text-brand-400 hover:text-brand-300 font-medium"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-muted hover:text-foreground"
                aria-label="Close"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
              aria-hidden={true}
            />
            <input
              type="search"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface-hover border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-border flex items-center gap-2 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
                filter === f
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                  : 'text-muted hover:text-foreground hover:bg-surface-hover',
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="p-4 rounded-full bg-surface-hover mb-4">
                <Icon name="bell" className="w-8 h-8 text-muted" />
              </div>
              <p className="text-sm text-muted">No notifications</p>
              <p className="text-xs text-muted mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onDelete={onDelete}
                  onAction={onAction}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onAction,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAction?: (notification: Notification) => void;
}) {
  const typeConfig = {
    info: { icon: 'info' as const, color: 'text-brand-400' },
    success: { icon: 'check' as const, color: 'text-emerald-400' },
    warning: { icon: 'exclamation' as const, color: 'text-amber-400' },
    error: { icon: 'exclamation' as const, color: 'text-red-400' },
    appointment: { icon: 'calendar' as const, color: 'text-brand-400' },
    patient: { icon: 'users' as const, color: 'text-brand-400' },
    system: { icon: 'settings' as const, color: 'text-muted' },
  };

  const config = typeConfig[notification.type];

  return (
    <div
      className={clsx(
        'px-6 py-4 hover:bg-surface-hover transition-colors group',
        !notification.read && 'bg-brand-500/5',
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={clsx('flex-shrink-0 mt-0.5', config.color)}>
          <Icon name={config.icon} className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={clsx('text-sm font-medium', notification.read ? 'text-muted' : 'text-foreground')}>
              {notification.title}
            </h3>
            {!notification.read && (
              <div className="h-2 w-2 rounded-full bg-brand-400 flex-shrink-0" aria-label="Unread" />
            )}
          </div>
          <p className="text-xs text-muted mb-2">{notification.message}</p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">{notification.time}</span>
            {notification.actionLabel && (
              <button
                onClick={() => onAction?.(notification)}
                className="text-xs text-brand-400 hover:text-brand-300 font-medium"
              >
                {notification.actionLabel}
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!notification.read && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="p-1.5 rounded hover:bg-surface-hover transition-colors text-muted hover:text-foreground"
              title="Mark as read"
            >
              <Icon name="check" className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(notification.id)}
            className="p-1.5 rounded hover:bg-surface-hover transition-colors text-muted hover:text-red-400"
            title="Delete"
          >
            <Icon name="x" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
