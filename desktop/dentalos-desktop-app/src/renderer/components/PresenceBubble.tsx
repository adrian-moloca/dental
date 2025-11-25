import React from 'react';
import { PresenceUser } from '../../realtime/presence-manager';

export interface PresenceBubbleProps {
  users: PresenceUser[];
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Displays presence bubbles showing which users are currently viewing a resource.
 *
 * @example
 * const { usersViewing } = usePresence({ resourceType: 'patient', resourceId });
 * return <PresenceBubble users={usersViewing} maxVisible={3} />;
 */
export const PresenceBubble: React.FC<PresenceBubbleProps> = ({
  users,
  maxVisible = 3,
  size = 'md',
  className = '',
}) => {
  const visibleUsers = users.slice(0, maxVisible);
  const overflowCount = users.length - maxVisible;

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const getInitials = (name: string): string => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ONLINE':
        return 'bg-green-500';
      case 'AWAY':
        return 'bg-yellow-500';
      case 'BUSY':
        return 'bg-red-500';
      case 'OFFLINE':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getBubbleColor = (index: number): string => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    return colors[index % colors.length];
  };

  if (users.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {visibleUsers.map((user, index) => (
        <div
          key={user.actorId}
          className="relative"
          title={`${user.name} (${user.status})`}
        >
          <div
            className={`${sizeClasses[size]} ${getBubbleColor(index)} rounded-full flex items-center justify-center text-white font-semibold shadow-md transition-transform hover:scale-110`}
          >
            {getInitials(user.name)}
          </div>
          <div
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${getStatusColor(user.status)} rounded-full border-2 border-white`}
          ></div>
        </div>
      ))}
      {overflowCount > 0 && (
        <div
          className={`${sizeClasses[size]} bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-semibold shadow-md`}
          title={`${overflowCount} more user${overflowCount > 1 ? 's' : ''}`}
        >
          +{overflowCount}
        </div>
      )}
    </div>
  );
};
