import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Card } from '../ui';
import { VIEWS } from '../../routes';

const ActiveCampaigns = ({ campaigns, onCampaignClick, onNavigate }) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-ds-fg">
          Active campaigns
          {campaigns.length > 0 && (
            <span className="ml-2 text-xs font-medium text-ds-fg-muted">· {campaigns.length}</span>
          )}
        </h2>
        {campaigns.length > 0 && (
          <button
            onClick={() => onNavigate(VIEWS.CAMPAIGNS)}
            className="text-xs font-medium text-ds-accent hover:text-ds-accent/80 flex items-center gap-1 cursor-pointer"
          >
            View all <ChevronRight size={12} />
          </button>
        )}
      </div>

      {campaigns.length === 0 ? (
        <p className="text-sm text-ds-fg-muted py-6">No active campaigns. Start one from the Campaigns page.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((campaign) => {
            const total = Number(campaign.total_posts) || 0;
            const published = Number(campaign.published_posts) || 0;
            const pct = total > 0 ? Math.round((published / total) * 100) : 0;

            return (
              <Card
                key={campaign.campaign_id}
                className="cursor-pointer"
                onClick={() => onCampaignClick(campaign)}
              >
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-ds-fg truncate">{campaign.title}</h3>
                  <p className="text-xs text-ds-fg-muted mt-1 line-clamp-2">
                    {campaign.objective || 'No description'}
                  </p>
                  <div className="mt-3">
                    <div className="w-full h-1.5 bg-ds-bg-subtle rounded-full overflow-hidden">
                      <div
                        className="h-full bg-ds-accent rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-ds-fg-muted mt-1.5">
                      {published} of {total} posts published
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ActiveCampaigns;
