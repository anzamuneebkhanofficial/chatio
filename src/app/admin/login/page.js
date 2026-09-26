'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ShieldCheck, Mail, Lock, LogIn, ArrowLeft, UserCheck, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // If already authorized and within expiration window, automatically jump to /admin
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('chatio_owner_session');
      if (stored) {
        try {
          const session = JSON.parse(stored);
          if (session.expiresAt && Date.now() > session.expiresAt) {
            // Expired session
            localStorage.removeItem('chatio_owner_session');
            setCheckingAuth(false);
            return;
          }
        } catch {
          localStorage.removeItem('chatio_owner_session');
        }
      }
    }

    axios.get('/api/owner/stats')
      .then((res) => {
        if (typeof window !== 'undefined') {
          const expirySeconds = res.data?.sessionExpirySeconds || (7 * 24 * 60 * 60);
          const existing = localStorage.getItem('chatio_owner_session');
          if (!existing) {
            const expiresAt = Date.now() + (expirySeconds * 1000);
            localStorage.setItem('chatio_owner_session', JSON.stringify({
              authorized: true,
              expiresAt: expiresAt,
              duration: `${expirySeconds}s`,
              readableExpiry: new Date(expiresAt).toISOString(),
              role: 'master_owner',
            }));
          }
        }
        router.replace('/admin');
      })
      .catch(() => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('chatio_owner_session');
        }
        setCheckingAuth(false);
      });
  }, [router]);

  const handleAdminLogin = async (data) => {
    const loadingToastId = toast.loading('Authenticating Master Owner...');

    try {
      const res = await axios.post('/api/auth/login', data);
      toast.success('Master Owner authorized!', { id: loadingToastId });
      
      if (typeof window !== 'undefined') {
        const expirySeconds = res.data?.expiresInSeconds || (7 * 24 * 60 * 60);
        const expiresAt = Date.now() + (expirySeconds * 1000);
        localStorage.setItem('chatio_owner_session', JSON.stringify({
          authorized: true,
          expiresAt: expiresAt,
          duration: `${expirySeconds}s`,
          readableExpiry: new Date(expiresAt).toISOString(),
          role: 'master_owner',
        }));
      }

      router.push('/admin');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid Master Owner credentials. Access denied.', { id: loadingToastId });
    }
  };




  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080a16] text-slate-400">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <p className="text-sm">Verifying Owner Session...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080a16] p-4 relative text-slate-100 selection:bg-emerald-600 selection:text-white">
      <Card className="w-full max-w-md relative z-10 p-8 border border-white/10 bg-[#0d1222] shadow-2xl rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] uppercase font-bold text-emerald-300 tracking-wider">
            <ShieldCheck className="w-3 h-3" /> System Portal
          </span>
        </div>

        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-xl shadow-emerald-500/25">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">Master Owner Portal</h1>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
            Platform control center & main bot training.<br />
            Sign in with system environment credentials.
          </p>
        </div>

        <form onSubmit={handleSubmit(handleAdminLogin)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-400" /> Owner Email
            </label>
            <Input
              type="email"
              placeholder="owner@example.com"
              className="bg-[#12182e] border-white/15 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
              {...register('email', { required: true })}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-teal-400" /> Master Password
            </label>
            <Input
              type="password"
              placeholder="Enter master password"
              className="bg-[#12182e] border-white/15 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
              {...register('password', { required: true })}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-3 gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-emerald-600/30 h-11"
            disabled={isSubmitting}
          >
            <LogIn className="w-4 h-4" />
            {isSubmitting ? 'Verifying Credentials...' : 'Access Admin Control Center'}
          </Button>
        </form>

        <div className="mt-8 pt-5 border-t border-white/10 text-center">
          <p className="text-xs text-slate-400 mb-2">Are you a regular user looking for your chatbot dashboard?</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" /> Go to User Sign In (Clerk)
          </Link>
        </div>
      </Card>
    </div>
  );
}
