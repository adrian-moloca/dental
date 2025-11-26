import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Bootstrap CSS (before custom styles)
import 'bootstrap/dist/css/bootstrap.min.css';

// Icon libraries
import '@fortawesome/fontawesome-free/css/all.min.css';
import '@tabler/icons-webfont/dist/tabler-icons.min.css';

// Custom SCSS (after Bootstrap for overrides)
import './styles/scss/main.scss';

// Legacy CSS (to be removed progressively)
import './index.css';

import App from './App.tsx';
import { ToastProvider } from './components/toast/ToastProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
);
