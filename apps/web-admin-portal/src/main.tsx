import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Icon libraries
import '@fortawesome/fontawesome-free/css/all.min.css';
import '@tabler/icons-webfont/dist/tabler-icons.min.css';

// Custom SCSS (Preclinic Design System)
import './index.scss';

import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
