import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { StoreProvider } from '@/shared/components/providers/StoreProvider';
import { ThemeProvider } from '@/shared/components/providers/ThemeProvider';
import { ErrorBoundary } from '@/shared/components/providers/ErrorBoundary';
import { ToastProvider } from '@/shared/components/ui/toast/toast';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shared/lib/query/queryClient';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <ThemeProvider>
          <ToastProvider position="top-right">
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </ToastProvider>
        </ThemeProvider>
      </StoreProvider>
    </QueryClientProvider>
  </StrictMode>,
);
