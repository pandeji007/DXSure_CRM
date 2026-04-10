import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setServerError('');
      setIsSubmitting(true);
      
      // Perform direct manual login
      await login(data.email, data.password);
      
      // Redirect successfully 
      navigate('/dashboard', { replace: true });
    } catch (e) {
      setServerError(e.message || 'Invalid login credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ x: [0, 100, -50, 0], y: [0, -80, 60, 0], scale: [1, 1.2, 0.9, 1] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)' }} />
        <motion.div animate={{ x: [0, -80, 40, 0], y: [0, 60, -100, 0], scale: [1, 0.9, 1.3, 1] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,212,170,0.06) 0%, transparent 70%)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="relative w-full max-w-md">
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-card p-8 shadow-card">
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }} className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
              <span className="text-2xl font-bold text-primary">DX</span>
            </motion.div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Welcome Back</h1>
            <p className="text-sm text-text-secondary mt-1">Sign in to DXSure CRM</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Direct Form Error Display Render */}
            {serverError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-danger/10 text-danger border border-danger/20 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{serverError}</p>
              </div>
            )}

            <Input label="Email" type="email" placeholder="admin@dxsure.com" icon={Mail} error={errors.email?.message} {...register('email')} />

            <div className="relative">
              <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" icon={Lock} error={errors.password?.message} {...register('password')} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[38px] text-text-muted hover:text-text-primary transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button type="submit" loading={isSubmitting} className="w-full mt-4" size="lg">Sign In</Button>
          </form>

          <p className="text-xs text-text-muted text-center mt-6">Contact your administrator if you need access</p>
        </div>
      </motion.div>
    </div>
  );
}
