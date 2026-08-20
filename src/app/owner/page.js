'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, Bot, Database, LogOut, ShieldAlert, Sparkles, Calendar, LayoutDashboard } from 'lucide-react';

export default function MasterOwnerDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();

    // 1. Exact-millisecond auto-logout timeout
    let timeoutId;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('chatio_owner_session');
      if (stored) {
        try {
          const session = JSON.parse(stored);
          const remaining = (session.expiresAt || 0) - Date.now();
          if (remaining > 0) {
            timeoutId = setTimeout(() => {
              handleLogout();
            }, remaining);
          } else {
            handleLogout();
          }
        } catch {
          handleLogout();
        }
      }
    }

    // 2. Real-time detection if token is deleted in DevTools or other tab
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('chatio_owner_session');
        if (!stored) {
          handleLogout();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    document.addEventListener('visibilitychange', handleStorageChange);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
      document.removeEventListener('visibilitychange', handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout failed', err);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chatio_owner_session');
    }
    router.push('/admin/login');
  };

  const fetchStats = async () => {
    // 1. Strict Local Storage Token Requirement
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('chatio_owner_session');
      if (!stored) {
        // Missing token -> must log in again
        handleLogout();
        return;
      }

      try {
        const session = JSON.parse(stored);
        if (!session.authorized || !session.expiresAt || Date.now() >= session.expiresAt) {
          handleLogout();
          return;
        }
      } catch {
        handleLogout();
        return;
      }
    }

    try {
      const res = await axios.get('/api/owner/stats');
      setStats(res.data);
    } catch (err) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('chatio_owner_session');
      }
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };




  if (loading) {
    return (
      <main className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Sparkles className="w-5 h-5 animate-spin text-indigo-400" />
          <p>Loading Master Owner Dashboard...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background-primary flex flex-col items-center justify-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-400" />
        <h2 className="text-2xl font-bold text-white">Access Denied</h2>
        <p className="text-red-400">{error}</p>
        <Button onClick={() => router.push('/admin/login')}>Log In as Owner</Button>
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-background-primary p-6 lg:p-10 text-slate-100">
      <header className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <h1 className="text-3xl font-display font-bold text-white">
              Master Owner <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Monitoring</span>
            </h1>
          </div>
          <p className="text-slate-400 text-sm">Platform monitoring & user management for Muhammad Anza Muneeb Khan.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button href="/admin" variant="primary" size="sm" className="gap-1.5 shadow-md shadow-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Train Main Bot (/admin)
          </Button>
          <Button href="/" variant="ghost" size="sm" className="border-white/10 text-slate-300">
            Home
          </Button>
          <Button variant="secondary" onClick={handleLogout} className="gap-2 border-white/10">
            <LogOut className="w-4 h-4" /> Log Out
          </Button>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="text-center py-8 bg-background-card/80 border-white/10">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3 text-amber-400">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Platform Users</p>
          <h2 className="text-4xl font-bold text-white mt-2">{stats?.totalUsers || 0}</h2>
        </Card>

        <Card className="text-center py-8 bg-background-card/80 border-white/10">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3 text-indigo-400">
            <Bot className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active User Chatbots</p>
          <h2 className="text-4xl font-bold text-white mt-2">{stats?.totalBots || 0}</h2>
        </Card>

        <Card className="text-center py-8 bg-background-card/80 border-white/10">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3 text-cyan-400">
            <Database className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trained Knowledge Bases</p>
          <h2 className="text-4xl font-bold text-white mt-2">{stats?.totalKnowledgeBases || 0}</h2>
        </Card>
      </div>

      {/* User Directory Table */}
      <Card className="bg-background-card/80 border-white/10 p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <Users className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Registered Users Directory</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="py-3 px-4 font-semibold">Name</th>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold">App ID</th>
                <th className="py-3 px-4 font-semibold">Bot Name</th>
                <th className="py-3 px-4 font-semibold">Provider</th>
                <th className="py-3 px-4 font-semibold">Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {stats?.users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                  <td className="py-4 px-4 font-medium text-white">{u.name}</td>
                  <td className="py-4 px-4 text-indigo-400">{u.email}</td>
                  <td className="py-4 px-4 font-mono text-xs text-slate-400">{u.appId}</td>
                  <td className="py-4 px-4 text-white">{u.botName}</td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">
                      {u.provider || 'gemini'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-400 text-xs flex items-center gap-1.5 pt-5">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}
