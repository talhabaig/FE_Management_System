import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { setAccessToken, setAuthFailureHandler } from './lib/api';
import { queryClient } from './lib/queryClient';
import { router } from './routes/router';
import './index.css';

setAuthFailureHandler(() => {
  setAccessToken(null);
  queryClient.clear();
  if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
    window.location.assign('/login');
  }
});

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element was not found');
}

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
