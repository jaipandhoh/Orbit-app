import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from './components/ui';
import DueThisWeek from './components/dashboard/DueThisWeek';
import AwaitingReview from './components/dashboard/AwaitingReview';
import ResultsOverdue from './components/dashboard/ResultsOverdue';
import ActiveCampaigns from './components/dashboard/ActiveCampaigns';

const DashboardView = ({ onPostClick, onCampaignClick, onNavigate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error(`Failed to load dashboard (${res.status})`);
      setData(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="animate-fadeIn">
      {/* Page header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ds-fg">Dashboard</h1>
          <p className="text-sm text-ds-fg-muted mt-1">Your PR command center.</p>
        </div>
        <span className="text-sm text-ds-fg-muted pt-2">{today}</span>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 mb-8 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          <span className="flex-1">{error}</span>
          <Button variant="ghost" size="sm" onClick={fetchDashboard}>
            <RefreshCw size={14} />
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 w-36 bg-ds-bg-subtle rounded mb-4" />
              <div className="space-y-2">
                <div className="h-10 bg-ds-bg-subtle rounded-lg" />
                <div className="h-10 bg-ds-bg-subtle rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : data && (
        <div className="space-y-10">
          <DueThisWeek posts={data.dueThisWeek} onPostClick={onPostClick} />
          <AwaitingReview posts={data.awaitingReview} onPostClick={onPostClick} />
          <ResultsOverdue posts={data.resultsOverdue} onPostClick={onPostClick} />
          <ActiveCampaigns
            campaigns={data.activeCampaigns}
            onCampaignClick={onCampaignClick}
            onNavigate={onNavigate}
          />
        </div>
      )}
    </div>
  );
};

export default DashboardView;
