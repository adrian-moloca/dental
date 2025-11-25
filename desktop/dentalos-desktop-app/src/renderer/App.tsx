import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { useDeviceAuth } from './hooks/useDeviceAuth';

const App: React.FC = () => {
  const { isRegistered, loading } = useDeviceAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (window.dentalos?.theme) {
      window.dentalos.theme.onChanged((newTheme) => {
        setTheme(newTheme);
      });
    }
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await window.dentalos?.theme.toggle(newTheme);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading DentalOS Desktop...</p>
      </div>
    );
  }

  return (
    <div className={`app-container theme-${theme}`}>
      <header className="topbar">
        <div className="brand">
          <span className="logo-dot" />
          <div>
            <div style={{ fontWeight: 700 }}>DentalOS Desktop</div>
            <div className="muted" style={{ fontSize: 12 }}>Offline-first control room</div>
          </div>
        </div>
        <div className="top-actions">
          <span className="chip">Theme: {theme}</span>
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      {isRegistered ? <Dashboard /> : <LoginScreen />}
    </div>
  );
};

export default App;
