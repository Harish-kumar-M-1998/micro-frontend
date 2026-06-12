import { StrictMode, Component, ErrorInfo, ReactNode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import {
  createAppStore,
  setStore,
  restoreSession,
  listenMfeEvent,
  logout,
  monitoring,
  reportErrorBoundary,
} from '@mfe/shared-auth';
import App from './App';
import './index.css';

const store = createAppStore();
setStore(store);
store.dispatch(restoreSession());

// Listen for cross-MFE logout events (token expiry from API interceptor)
listenMfeEvent('auth:logout', () => {
  store.dispatch(logout());
});

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportErrorBoundary(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
            <button
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white"
              onClick={() => window.location.reload()}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function LoadingFallback() {
  return (
    <div className="flex min-h-[400px] items-center justify-center" role="status">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      <span className="sr-only">Loading microfrontend...</span>
    </div>
  );
}

monitoring.track({ name: 'app_initialized', properties: { app: 'host' } });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <App />
          </Suspense>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
);
