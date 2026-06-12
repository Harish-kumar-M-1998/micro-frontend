import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { getStore } from '@mfe/shared-auth';
import UserPage from './pages/UserPage';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={getStore()}>
      <div className="p-6">
        <UserPage />
      </div>
    </Provider>
  </StrictMode>,
);
