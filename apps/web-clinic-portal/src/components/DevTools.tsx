import { useEffect, useRef, useState, type CSSProperties } from 'react';

declare const __BUILD_TIME__: string;

type HmrStatus = 'connected' | 'connecting' | 'disconnected' | 'updating';

interface ReloadEvent {
  timestamp: number;
  type: 'hmr' | 'manual' | 'page';
}

// Inline styles to avoid Tailwind/Bootstrap conflicts
const styles = {
  container: {
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    zIndex: 9999,
    maxWidth: '320px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  } as CSSProperties,
  minimizedButton: (bgColor: string) => ({
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: bgColor,
    color: '#fff',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '12px',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as CSSProperties),
  dot: (bgColor: string) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: bgColor,
  } as CSSProperties),
  panel: (gradientFrom: string, gradientTo: string) => ({
    background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
    backdropFilter: 'blur(8px)',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    overflow: 'hidden',
  } as CSSProperties),
  panelContent: {
    padding: '16px',
    color: '#fff',
  } as CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  } as CSSProperties,
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as CSSProperties,
  statusLabel: {
    fontWeight: 600,
    fontSize: '14px',
    margin: 0,
  } as CSSProperties,
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px',
    lineHeight: 1,
  } as CSSProperties,
  infoBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '12px',
  } as CSSProperties,
  infoRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    fontSize: '12px',
    marginBottom: '8px',
  } as CSSProperties,
  infoLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'monospace',
  } as CSSProperties,
  infoValue: (color: string) => ({
    color,
    fontWeight: 600,
    fontFamily: 'monospace',
  } as CSSProperties),
  button: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    marginBottom: '8px',
    transition: 'background-color 0.2s ease',
  } as CSSProperties,
  footer: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'monospace',
  } as CSSProperties,
};

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

          import.meta.hot!.on('vite:error', () => {
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

  const statusConfig = {
    connected: {
      bgColor: '#16a34a',
      gradientFrom: '#16a34a',
      gradientTo: '#059669',
      textColor: '#86efac',
      label: 'Connected',
    },
    updating: {
      bgColor: '#2563eb',
      gradientFrom: '#2563eb',
      gradientTo: '#0891b2',
      textColor: '#93c5fd',
      label: 'Updating',
    },
    connecting: {
      bgColor: '#ca8a04',
      gradientFrom: '#ca8a04',
      gradientTo: '#ea580c',
      textColor: '#fde047',
      label: 'Connecting',
    },
    disconnected: {
      bgColor: '#dc2626',
      gradientFrom: '#dc2626',
      gradientTo: '#e11d48',
      textColor: '#fca5a5',
      label: 'Disconnected',
    },
  };

  const config = statusConfig[hmrStatus];

  if (!isVisible) {
    return (
      <div style={styles.container}>
        <button
          onClick={() => setIsVisible(true)}
          style={styles.minimizedButton(config.bgColor)}
          title={`HMR: ${hmrStatus}`}
        >
          <span style={styles.dot(config.bgColor)} />
          Dev
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

  return (
    <div style={styles.container}>
      <div style={styles.panel(config.gradientFrom, config.gradientTo)}>
        <div style={styles.panelContent}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <span style={styles.dot('#fff')} />
              <h3 style={styles.statusLabel}>{config.label}</h3>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              style={styles.closeButton}
              title="Hide"
            >
              ×
            </button>
          </div>

          {/* Info Section */}
          <div style={styles.infoBox}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Last Reload:</span>
              <span style={styles.infoValue(config.textColor)}>
                {formatTime(timeSinceReload)}
              </span>
            </div>
            <div style={{ ...styles.infoRow, marginBottom: '8px' }}>
              <span style={styles.infoLabel}>Build Time:</span>
              <span style={styles.infoValue('rgba(255,255,255,0.9)')}>
                {buildDate.toLocaleTimeString()}
              </span>
            </div>
            <div style={{ ...styles.infoRow, marginBottom: 0 }}>
              <span style={styles.infoLabel}>Mode:</span>
              <span style={styles.infoValue('rgba(255,255,255,0.9)')}>
                {import.meta.env.MODE}
              </span>
            </div>
          </div>

          {/* Recent Reloads */}
          {reloadEvents.length > 0 && (
            <div style={styles.infoBox}>
              <div style={{ ...styles.infoLabel, fontSize: '10px', marginBottom: '8px' }}>
                Recent Reloads:
              </div>
              {reloadEvents.map((event, idx) => (
                <div
                  key={idx}
                  style={{ ...styles.infoRow, fontSize: '10px', marginBottom: '4px' }}
                >
                  <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {idx === 0 ? '●' : '○'} {event.type.toUpperCase()}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {formatTime(Math.floor((Date.now() - event.timestamp) / 1000))}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div>
            <button
              onClick={() => window.location.reload()}
              style={styles.button}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)')}
            >
              Hard Reload
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              style={{ ...styles.button, marginBottom: 0 }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)')}
            >
              Clear Storage
            </button>
          </div>

          {/* Footer */}
          <div style={{ ...styles.footer, marginTop: '12px' }}>
            Cache: /tmp/vite-cache
          </div>
        </div>
      </div>
    </div>
  );
}
