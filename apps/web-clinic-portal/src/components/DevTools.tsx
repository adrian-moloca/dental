import { useEffect, useRef, useState } from 'react';

declare const __BUILD_TIME__: string;

type HmrStatus = 'connected' | 'connecting' | 'disconnected' | 'updating';

interface ReloadEvent {
  timestamp: number;
  type: 'hmr' | 'manual' | 'page';
}

export function DevTools() {
  const [hmrStatus, setHmrStatus] = useState<HmrStatus>('connecting');
  const [lastReloadTime, setLastReloadTime] = useState<number>(Date.now());
  const [isVisible, setIsVisible] = useState(true);
  const [reloadEvents, setReloadEvents] = useState<ReloadEvent[]>([]);
  const hmrCheckTimeout = useRef<number>();
  const connectionRetries = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    if (import.meta.hot) {
      const attemptConnection = () => {
        try {
          setHmrStatus('connected');
          connectionRetries.current = 0;

          import.meta.hot!.on('vite:beforeUpdate', () => {
            setHmrStatus('updating');
            setReloadEvents((prev) => [
              { timestamp: Date.now(), type: 'hmr' },
              ...prev.slice(0, 4),
            ]);
          });

          import.meta.hot!.on('vite:afterUpdate', () => {
            setHmrStatus('connected');
            setLastReloadTime(Date.now());
          });

          import.meta.hot!.on('vite:error', (_err: unknown) => {
            setHmrStatus('disconnected');
            connectionRetries.current += 1;

            if (connectionRetries.current <= maxRetries) {
              hmrCheckTimeout.current = setTimeout(attemptConnection, 2000);
            }
          });

          import.meta.hot!.on('vite:ws:connect', () => {
            setHmrStatus('connected');
            connectionRetries.current = 0;
          });

          import.meta.hot!.on('vite:ws:disconnect', () => {
            setHmrStatus('disconnected');
          });
        } catch {
          setHmrStatus('disconnected');
          connectionRetries.current += 1;

          if (connectionRetries.current <= maxRetries) {
            hmrCheckTimeout.current = setTimeout(attemptConnection, 2000);
          }
        }
      };

      attemptConnection();

      return () => {
        if (hmrCheckTimeout.current) {
          clearTimeout(hmrCheckTimeout.current);
        }
      };
    } else {
      setHmrStatus('disconnected');
    }
  }, []);

  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  if (!isVisible) {
    const statusColor =
      hmrStatus === 'connected'
        ? 'bg-green-500'
        : hmrStatus === 'updating'
          ? 'bg-blue-500'
          : 'bg-red-500';

    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className={`group relative flex items-center gap-2 px-3 py-2 ${statusColor} text-white rounded-lg font-mono text-xs font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105`}
          title={`HMR: ${hmrStatus}`}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full ${statusColor} ${hmrStatus === 'connected' || hmrStatus === 'updating' ? 'animate-pulse' : ''}`}
            />
            {hmrStatus === 'updating' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            )}
          </span>
          Dev
          <span className="hidden group-hover:inline text-[10px] ml-1">
            ({hmrStatus})
          </span>
        </button>
      </div>
    );
  }

  const buildTime = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : 'Unknown';
  const buildDate = new Date(buildTime);
  const timeSinceReload = Math.floor((Date.now() - lastReloadTime) / 1000);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const statusConfig = {
    connected: {
      color: 'from-green-600 to-emerald-600',
      textColor: 'text-green-300',
      dotColor: 'bg-green-400',
      label: 'Connected',
    },
    updating: {
      color: 'from-blue-600 to-cyan-600',
      textColor: 'text-blue-300',
      dotColor: 'bg-blue-400',
      label: 'Updating',
    },
    connecting: {
      color: 'from-yellow-600 to-orange-600',
      textColor: 'text-yellow-300',
      dotColor: 'bg-yellow-400',
      label: 'Connecting',
    },
    disconnected: {
      color: 'from-red-600 to-rose-600',
      textColor: 'text-red-300',
      dotColor: 'bg-red-400',
      label: 'Disconnected',
    },
  };

  const config = statusConfig[hmrStatus];

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div
        className={`bg-gradient-to-br ${config.color} backdrop-blur-md rounded-xl shadow-2xl border border-white/10 overflow-hidden`}
      >
        <div className="p-4 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full ${config.dotColor} opacity-75 ${hmrStatus === 'connecting' || hmrStatus === 'updating' ? 'animate-pulse' : ''}`}
                />
                {(hmrStatus === 'connecting' || hmrStatus === 'updating') && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                )}
              </span>
              <h3 className="font-semibold text-sm">{config.label}</h3>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/60 hover:text-white/90 transition-colors"
              title="Hide"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            <div className="bg-white/10 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex items-start justify-between">
                <span className="text-white/70 font-mono">Last Reload:</span>
                <span className={`${config.textColor} font-semibold font-mono`}>
                  {formatTime(timeSinceReload)}
                </span>
              </div>

              <div className="flex items-start justify-between">
                <span className="text-white/70 font-mono">Build Time:</span>
                <span className="text-white/90 font-mono font-semibold">
                  {buildDate.toLocaleTimeString()}
                </span>
              </div>

              <div className="flex items-start justify-between">
                <span className="text-white/70 font-mono">Mode:</span>
                <span className="text-white/90 font-mono font-semibold">
                  {import.meta.env.MODE}
                </span>
              </div>
            </div>

            {reloadEvents.length > 0 && (
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-white/70 font-mono text-[10px] mb-2">
                  Recent Reloads:
                </div>
                <div className="space-y-1">
                  {reloadEvents.map((event, idx) => (
                    <div
                      key={idx}
                      className="text-[10px] text-white/80 font-mono flex items-center justify-between"
                    >
                      <span>
                        {idx === 0 ? '●' : '○'} {event.type.toUpperCase()}
                      </span>
                      <span className="text-white/60">
                        {formatTime(Math.floor((Date.now() - event.timestamp) / 1000))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white/5 rounded-lg p-3 space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200"
              >
                Hard Reload
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
                className="w-full bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200"
              >
                Clear Storage
              </button>
            </div>

            <div className="text-[10px] text-white/60 font-mono">
              Cache: /tmp/vite-cache
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
