import React from 'react';
import { Plus, AlertCircle, Clock, TrendingUp, ArrowRight, CheckSquare } from 'lucide-react';
import { getHealthColor, getStatusColor } from './utils';
import WeeklyFocusBanner from './WeeklyFocusBanner';
import { UrgentWidget, BlockedWidget, ApprovedNotScheduledWidget, CanWaitWidget } from './DashboardWidgets';
import PendingApprovals from './components/PendingApprovals';

const DashboardView = ({
  transformedCampaigns,
  posts,
  requests = [],
  loading,
  approvals = [],
  onNewCampaign,
  onViewCampaigns,
  onViewCalendar,
  onViewInsights,
  onCampaignClick,
  onViewInbox,
  onViewBoard,
  onReviewApproval,
}) => {
  const atRiskCampaigns = transformedCampaigns.filter((c) => c.health === 'at_risk');

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-mutedText mt-1">Your PR command center</p>
        </div>
        <button
          onClick={onNewCampaign}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          New Campaign
        </button>
      </div>

      {/* Weekly Focus Banner */}
      <WeeklyFocusBanner requests={requests} />

      {/* Single Source of Truth Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <UrgentWidget
          requests={requests}
          onViewAll={() => onViewInbox && onViewInbox({ filter: 'urgent' })}
        />
        <BlockedWidget
          requests={requests}
          onViewAll={() => onViewInbox && onViewInbox({ filter: 'blocked' })}
        />
        <ApprovedNotScheduledWidget
          requests={requests}
          onViewAll={() => onViewInbox && onViewInbox({ filter: 'approved' })}
        />
        <CanWaitWidget
          requests={requests}
          onViewAll={() => onViewInbox && onViewInbox({ filter: 'can_wait' })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* At Risk Campaigns Card */}
        <div className="relative group rounded-card overflow-hidden card-hoverable">
          <div className="absolute inset-0 bg-gradient-to-br from-warning/40 via-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="h-full bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-xl p-6 relative z-10 flex flex-col border border-border dark:border-border-dark group-hover:border-warning/50 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-warning/10 rounded-control shadow-inner">
                <AlertCircle className="text-warning drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" size={24} />
              </div>
              <span className="badge-warning shadow-sm">
                {atRiskCampaigns.length} Active
              </span>
            </div>
            <h3 className="text-h3 font-bold text-text dark:text-white mb-1">At Risk Campaigns</h3>
            <p className="text-mutedText text-body mb-6">Needs attention</p>
            <button
              onClick={onViewCampaigns}
              className="mt-auto text-warning font-semibold text-small flex items-center gap-1.5 hover:gap-2.5 transition-all"
            >
              Review campaigns <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Upcoming Deadlines Card */}
        <div className="relative group rounded-card overflow-hidden card-hoverable">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="h-full bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-xl p-6 relative z-10 flex flex-col border border-border dark:border-border-dark group-hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-control shadow-inner">
                <Clock className="text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" size={24} />
              </div>
              <span className="badge-primary shadow-sm">
                {posts.filter((p) => !p.published_at).length} This Week
              </span>
            </div>
            <h3 className="text-h3 font-bold text-transparent bg-clip-text bg-gradient-to-r from-text to-text/70 dark:from-white dark:to-white/70 mb-1">Upcoming Deadlines</h3>
            <p className="text-mutedText text-body mb-6">Posts due soon</p>
            <button
              onClick={onViewCalendar}
              className="mt-auto text-primary font-semibold text-small flex items-center gap-1.5 hover:gap-2.5 transition-all"
            >
              View calendar <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Recent Results Card */}
        <div className="relative group rounded-card overflow-hidden card-hoverable">
          <div className="absolute inset-0 bg-gradient-to-br from-success/40 via-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="h-full bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-xl p-6 relative z-10 flex flex-col border border-border dark:border-border-dark group-hover:border-success/50 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-success/10 rounded-control shadow-inner">
                <TrendingUp className="text-success drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" size={24} />
              </div>
              <span className="badge-success shadow-sm">
                {transformedCampaigns.filter((c) => c.status === 'completed').length} Complete
              </span>
            </div>
            <h3 className="text-h3 font-bold text-transparent bg-clip-text bg-gradient-to-r from-success to-emerald-400 mb-1">Recent Results</h3>
            <p className="text-mutedText text-body mb-6">Campaigns closed</p>
            <button
              onClick={onViewInsights}
              className="mt-auto text-success font-semibold text-small flex items-center gap-1.5 hover:gap-2.5 transition-all"
            >
              View insights <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <PendingApprovals />

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h2 font-bold text-text">Active Campaigns</h2>
          <button
            onClick={onViewCampaigns}
            className="text-primary font-medium text-small hover:text-primary/80"
          >
            View all
          </button>
        </div>
        {loading ? (
          <div className="text-center py-8 text-mutedText">Loading...</div>
        ) : transformedCampaigns.length === 0 ? (
          <div className="text-center py-8 text-mutedText">No campaigns yet</div>
        ) : (
          <div className="space-y-3">
            {transformedCampaigns.slice(0, 3).map((campaign) => (
              <div
                key={campaign.id}
                onClick={() => onCampaignClick(campaign)}
                className="relative group p-5 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-card hover:border-primary/50 transition-all cursor-pointer overflow-hidden card-hoverable mb-3 last:mb-0"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-4">
                      <h3 className="font-bold text-text dark:text-white text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                        {campaign.name}
                        <ArrowRight size={16} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-primary" />
                      </h3>
                      <p className="text-small text-mutedText mt-1 line-clamp-1">{campaign.goal}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusColor(
                          campaign.status
                        )} shadow-sm`}
                      >
                        {campaign.status.replace('_', ' ')}
                      </span>
                      <span
                        className={`w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-bold border shadow-sm ${getHealthColor(
                          campaign.health
                        )}`}
                        title={`Health: ${campaign.health.replace('_', ' ')}`}
                      >
                        {campaign.health === 'healthy' ? '✓' : '⚠'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3 text-small text-mutedText font-medium">
                      <div className="flex items-center gap-1.5 bg-surface2 dark:bg-surface2-dark px-2 py-1 rounded-control">
                        <span className="text-text dark:text-white font-bold">{campaign.completedPosts}</span>
                        <span>/</span>
                        <span>{campaign.plannedPosts} posts</span>
                      </div>
                      <span className="w-1 h-1 rounded-full bg-border dark:bg-border-dark" />
                      <span>{campaign.progress}% complete</span>
                    </div>

                    <div className="w-1/3 bg-surface2 dark:bg-surface2-dark rounded-full h-2 overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-1000 ease-out relative"
                        style={{ width: `${campaign.progress}%` }}
                      >
                        <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;


