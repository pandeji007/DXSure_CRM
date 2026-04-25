import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AppRouter from './routes/AppRouter';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './store/authStore';

const toastOptions = {
  duration: 4000,
  style: {
    background: '#16161f',
    color: '#f0f0ff',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
          <Toaster position="top-right" toastOptions={toastOptions} />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
