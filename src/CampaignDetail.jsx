import React from 'react';
import { ArrowLeft, Calendar, Target, TrendingUp, Pencil, Trash2, Plus, Trash, Edit2 } from 'lucide-react';
import { getHealthColor, getStatusColor } from './utils';

const CampaignDetail = ({
  campaign,
  posts,
  deliverables = [],
  approvals = [],
  onBack,
  onEdit,
  onDelete,
  onAddPost,
  onEditPost,
  onDeletePost,
  onAddDeliverable,
  onEditDeliverable,
  onDeleteDeliverable,
  onSubmitForApproval,
}) => {
  if (!campaign) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="text-center py-8 text-mutedText">Campaign not found</div>
      </div>
    );
  }

  const campaignId = campaign.campaign_id ?? campaign.id;
  const campaignPosts = (posts || []).filter((p) => p && p.campaign_id === campaignId);
  const campaignDeliverables = (deliverables || []).filter((d) => d && d.campaign_id === campaignId);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="btn-secondary p-2 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-text">{campaign.name}</h1>
          <p className="text-mutedText mt-1">{campaign.goal}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAddPost && onAddPost(campaignId)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add Post
          </button>
          <button
            type="button"
            onClick={() => onEdit && onEdit(campaign)}
            className="btn-secondary flex items-center gap-2"
          >
            <Pencil size={18} />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete && onDelete(campaignId)}
            className="btn-secondary flex items-center gap-2 text-danger border-danger/40 hover:bg-danger/10"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-surface2 rounded-xl">
              <Target className="text-blue-500" size={24} />
            </div>
            <div>
              <div className="text-sm text-mutedText">Status</div>
              <div className="text-lg font-bold text-text">{campaign.status}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}
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
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-surface2 rounded-xl">
              <Calendar className="text-purple-500" size={24} />
            </div>
            <div>
              <div className="text-sm text-mutedText">Timeline</div>
              <div className="text-lg font-bold text-text">
                {campaign.startDate} → {campaign.endDate || 'Ongoing'}
              </div>
            </div>
          </div>
          <div className="text-sm text-mutedText">
            {campaign.completedPosts}/{campaign.plannedPosts} posts completed
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-surface2 rounded-xl">
              <TrendingUp className="text-emerald-500" size={24} />
            </div>
            <div>
              <div className="text-sm text-mutedText">Progress</div>
              <div className="text-lg font-bold text-text">{campaign.progress}%</div>
            </div>
          </div>
          <div className="mt-3 bg-surface2 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
              style={{ width: `${campaign.progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {campaign.kpi_reach > 0 && (
          <div className="card">
            <div className="text-xs text-mutedText mb-1">Reach</div>
            <div className="text-2xl font-bold text-text">{campaign.kpi_reach.toLocaleString()}</div>
          </div>
        )}
        {campaign.kpi_engagement > 0 && (
          <div className="card">
            <div className="text-xs text-mutedText mb-1">Engagement</div>
            <div className="text-2xl font-bold text-text">{campaign.kpi_engagement.toLocaleString()}</div>
          </div>
        )}
        {campaign.kpi_earned_mentions > 0 && (
          <div className="card">
            <div className="text-xs text-mutedText mb-1">Earned Mentions</div>
            <div className="text-2xl font-bold text-text">{campaign.kpi_earned_mentions}</div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text">Planned Deliverables</h2>
          <button
            type="button"
            onClick={() => onAddDeliverable && onAddDeliverable(campaignId)}
            className="btn-secondary flex items-center gap-2"
          >
            <Plus size={18} />
            Add
          </button>
        </div>
        {campaignDeliverables.length === 0 ? (
          <div className="text-center py-8 text-mutedText">
            No deliverables for this campaign yet. Click <span className="font-semibold text-text">Add</span> to create one (photos, graphics, copy, etc.).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-12 gap-3 px-3 py-2 text-small text-mutedText border-b border-border">
                <div className="col-span-2">Type</div>
                <div className="col-span-4">Deliverable</div>
                <div className="col-span-2">Owner</div>
                <div className="col-span-1">Priority</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2 text-right">Due</div>
              </div>
              <div className="divide-y divide-border">
                {campaignDeliverables.map((d) => (
                  <div key={d.deliverable_id} className="grid grid-cols-12 gap-3 px-3 py-3 bg-surface2">
                    <div className="col-span-2 text-text font-medium capitalize">
                      {d.deliverable_type}
                      {d.platform ? <div className="text-small text-mutedText capitalize">{d.platform}</div> : null}
                    </div>
                    <div className="col-span-4 min-w-0">
                      <div className="text-text font-semibold truncate">{d.title}</div>
                      {d.stage ? <div className="text-small text-mutedText truncate">{d.stage}</div> : null}
                      {d.description ? <div className="text-small text-mutedText line-clamp-2 mt-1">{d.description}</div> : null}
                    </div>
                    <div className="col-span-2 text-text">
                      {d.owner_role ? d.owner_role : <span className="text-mutedText">—</span>}
                    </div>
                    <div className="col-span-1 text-text capitalize">{d.priority || 'medium'}</div>
                    <div className="col-span-1 text-text capitalize">{d.status || 'planned'}</div>
                    <div className="col-span-2 text-right text-text">
                      <div className="flex items-center justify-end gap-2">
                        <span>
                          {d.due_date ? new Date(d.due_date).toLocaleDateString() : <span className="text-mutedText">—</span>}
                        </span>
                        <button
                          type="button"
                          onClick={() => onEditDeliverable && onEditDeliverable(d)}
                          className="text-mutedText hover:text-text"
                          title="Edit deliverable"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteDeliverable && onDeleteDeliverable(d.deliverable_id)}
                          className="text-mutedText hover:text-danger"
                          title="Delete deliverable"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-text mb-4">Campaign Posts</h2>
        {campaignPosts.length === 0 ? (
          <div className="text-center py-8 text-mutedText">No posts for this campaign yet</div>
        ) : (
          <div className="space-y-3">
            {campaignPosts.map((post) => {
              const isPendingApproval = approvals.some(a => a.post_id === post.post_id && a.status === 'pending');
              return (
              <div key={post.post_id} className="p-4 border border-border rounded-lg bg-surface2">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text capitalize">{post.platform}</span>
                      {isPendingApproval && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-warning/20 text-warning">
                          Pending Review
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-mutedText mt-1">{post.content}</div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-mutedText">
                    <span>
                      {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Scheduled'}
                    </span>
                    {!isPendingApproval && !post.published_at && onSubmitForApproval && (
                      <button
                        type="button"
                        onClick={() => onSubmitForApproval(post.post_id)}
                        className="text-xs px-2 py-1 rounded-control border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
                        title="Submit for approval"
                      >
                        Submit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onEditPost && onEditPost(post)}
                      className="text-mutedText hover:text-text"
                      title="Edit post"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePost && onDeletePost(post.post_id)}
                      className="text-mutedText hover:text-danger"
                      title="Delete post"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-mutedText">
                  <span>Impressions: {post.impressions || 0}</span>
                  <span>Clicks: {post.clicks || 0}</span>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignDetail;





