import React, { useState, useEffect } from 'react';
import { Users, Server, Megaphone, CheckSquare, MessageSquare, Lock } from 'lucide-react';
import { useToast } from './ToastProvider';
import { useAuth } from './context/AuthContext';

const API_BASE = '/api';

const AdminView = () => {
  const { toast } = useToast();
  const { authFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminStats();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'adminorbit123';
    if (password === adminPassword) {
      setIsAuthenticated(true);
    } else {
      toast('Incorrect admin password', { type: 'error' });
      setPassword('');
    }
  };

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE}/admin/stats`);
      if (!res.ok) throw new Error('Failed to fetch admin stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error(error);
      toast('Failed to load admin data', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (val) => {
    if (!val) return '';
    return new Date(val).toLocaleDateString(undefined, { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
        <div className="bg-surface dark:bg-surface-dark p-8 rounded-card border border-border dark:border-border-dark shadow-sm max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full text-primary">
              <Lock size={32} />
            </div>
          </div>
          <h2 className="text-h2 font-bold text-center text-text dark:text-white mb-2">Admin Access</h2>
          <p className="text-center text-mutedText mb-6 text-sm">Please enter the admin password to continue.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="input w-full text-center dark:bg-surface2-dark dark:border-gray-700 dark:text-white"
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn-primary w-full justify-center">
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-mutedText">
        Loading admin dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-h1 font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-mutedText mt-1">Platform overview and statistics</p>
      </div>

      {stats && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="bg-surface/90 dark:bg-surface-dark/90 p-6 rounded-card border border-border dark:border-border-dark flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-control text-primary">
                <Users size={24} />
              </div>
              <div>
                <p className="text-mutedText text-small font-medium">Total Users</p>
                <div className="text-h2 font-bold text-text dark:text-white mt-1">{stats.metrics.users}</div>
              </div>
            </div>

            <div className="bg-surface/90 dark:bg-surface-dark/90 p-6 rounded-card border border-border dark:border-border-dark flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-control text-purple-500">
                <Server size={24} />
              </div>
              <div>
                <p className="text-mutedText text-small font-medium">Workspaces</p>
                <div className="text-h2 font-bold text-text dark:text-white mt-1">{stats.metrics.workspaces}</div>
              </div>
            </div>

            <div className="bg-surface/90 dark:bg-surface-dark/90 p-6 rounded-card border border-border dark:border-border-dark flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-control text-success">
                <Megaphone size={24} />
              </div>
              <div>
                <p className="text-mutedText text-small font-medium">Campaigns</p>
                <div className="text-h2 font-bold text-text dark:text-white mt-1">{stats.metrics.campaigns}</div>
              </div>
            </div>

            <div className="bg-surface/90 dark:bg-surface-dark/90 p-6 rounded-card border border-border dark:border-border-dark flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-control text-blue-500">
                <MessageSquare size={24} />
              </div>
              <div>
                <p className="text-mutedText text-small font-medium">Posts</p>
                <div className="text-h2 font-bold text-text dark:text-white mt-1">{stats.metrics.posts}</div>
              </div>
            </div>

            <div className="bg-surface/90 dark:bg-surface-dark/90 p-6 rounded-card border border-border dark:border-border-dark flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-control text-warning">
                <CheckSquare size={24} />
              </div>
              <div>
                <p className="text-mutedText text-small font-medium">Requests</p>
                <div className="text-h2 font-bold text-text dark:text-white mt-1">{stats.metrics.requests}</div>
              </div>
            </div>
          </div>

          {/* Recent Users Table */}
          <div className="card">
            <h2 className="text-h2 font-bold text-text dark:text-white mb-4">Recent Accounts</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border dark:border-border-dark text-small text-mutedText">
                    <th className="pb-3 px-2 font-semibold">Name</th>
                    <th className="pb-3 px-2 font-semibold">Email</th>
                    <th className="pb-3 px-2 font-semibold">Joined At</th>
                  </tr>
                </thead>
                <tbody className="text-body text-text dark:text-white divide-y divide-border dark:divide-border-dark">
                  {stats.recentUsers?.map((user) => (
                    <tr key={user.id} className="hover:bg-surface2 dark:hover:bg-surface2-dark transition-colors">
                      <td className="py-3 px-2 font-medium">{user.name || 'Unknown'}</td>
                      <td className="py-3 px-2 text-mutedText">{user.email}</td>
                      <td className="py-3 px-2 text-mutedText">{formatDate(user.created_at)}</td>
                    </tr>
                  ))}
                  {(!stats.recentUsers || stats.recentUsers.length === 0) && (
                    <tr>
                      <td colSpan="3" className="py-6 text-center text-mutedText">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminView;
