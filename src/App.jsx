import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './store/authStore';
import { queryClient } from './lib/queryClient';
import AppRouter from './routes/AppRouter';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#16161f',
                color: '#f0f0ff',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#2ed573', secondary: '#16161f' },
              },
              error: {
                iconTheme: { primary: '#ff4757', secondary: '#16161f' },
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
