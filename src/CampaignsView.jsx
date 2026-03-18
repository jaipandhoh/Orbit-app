import React from 'react';
import { Plus, Calendar, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { getHealthColor, getStatusColor } from './utils';

const CampaignsView = ({
  transformedCampaigns,
  loading,
  onNewCampaign,
  onCampaignClick,
  onEditCampaign,
  onDeleteCampaign,
  isDarkMode = false,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Campaigns</h1>
          <p className="text-mutedText mt-1">Manage your PR initiatives</p>
        </div>
        <button
          onClick={onNewCampaign}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          New Campaign
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading campaigns...</div>
      ) : transformedCampaigns.length === 0 ? (
        <div className="text-center py-8 text-gray-600">No campaigns yet</div>
      ) : (
        <div className="grid gap-4">
          {transformedCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              onClick={() => onCampaignClick(campaign)}
              className="card hover-lift cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-text group-hover:text-blue-500 transition-colors">
                      {campaign.name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        campaign.status
                      )}`}
                    >
                      {campaign.status}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getHealthColor(
                        campaign.health
                      )}`}
                    >
                      {campaign.health === 'healthy' ? '✓ Healthy' : '⚠ At Risk'}
                    </span>
                  </div>
                  <p className="text-mutedText mb-3">{campaign.goal}</p>
                  <div className="flex items-center gap-6 text-sm text-mutedText">
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {campaign.startDate} → {campaign.endDate || 'Ongoing'}
                    </span>
                    <span>
                      {campaign.completedPosts}/{campaign.plannedPosts} posts completed
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCampaign && onEditCampaign(campaign);
                    }}
                    className="btn-secondary px-3 py-2 flex items-center gap-2"
                    title="Edit campaign"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCampaign && onDeleteCampaign(campaign.campaign_id ?? campaign.id);
                    }}
                    className="btn-secondary px-3 py-2 flex items-center gap-2 text-danger border-danger/40 hover:bg-danger/10"
                    title="Delete campaign"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                  <ChevronRight
                    className="text-mutedText group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
                    size={24}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                {campaign.kpi_reach > 0 && (
                  <div className="p-3 bg-surface2 rounded-lg">
                    <div className="text-xs text-mutedText mb-1">Reach</div>
                    <div className="text-lg font-bold text-text">{campaign.kpi_reach.toLocaleString()}</div>
                  </div>
                )}
                {campaign.kpi_engagement > 0 && (
                  <div className="p-3 bg-surface2 rounded-lg">
                    <div className="text-xs text-mutedText mb-1">Engagement</div>
                    <div className="text-lg font-bold text-text">{campaign.kpi_engagement.toLocaleString()}</div>
                  </div>
                )}
                {campaign.kpi_earned_mentions > 0 && (
                  <div className="p-3 bg-surface2 rounded-lg">
                    <div className="text-xs text-mutedText mb-1">Mentions</div>
                    <div className="text-lg font-bold text-text">{campaign.kpi_earned_mentions}</div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 bg-surface2 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    style={{ width: `${campaign.progress}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-text">{campaign.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignsView;



