import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { getStore } from '@mfe/shared-auth';
import DashboardPage from './pages/DashboardPage';
import './index.css';

/** Standalone dev entry - uses shared store singleton from host when available */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={getStore()}>
      <div className="p-6">
        <DashboardPage />
      </div>
    </Provider>
  </StrictMode>,
);
