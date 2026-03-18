import React, { useState } from 'react';
import { X } from 'lucide-react';

const RequestFormModal = ({ request, onClose, onSubmit, campaigns = [], departments = [], users = [] }) => {
  const [formData, setFormData] = useState({
    title: request?.title || '',
    description: request?.description || '',
    platform: request?.platform || 'instagram',
    content_type: request?.content_type || 'feed_post',
    priority: request?.priority || 'normal',
    deadline_at: request?.deadline_at ? new Date(request.deadline_at).toISOString().slice(0, 16) : '',
    campaign_id: request?.campaign_id || '',
    department_id: request?.department_id || '',
    owner_user_id: request?.owner_user_id || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      deadline_at: formData.deadline_at ? new Date(formData.deadline_at).toISOString() : null,
      campaign_id: formData.campaign_id || null,
      department_id: formData.department_id || null,
      owner_user_id: formData.owner_user_id || null,
    };
    onSubmit(submitData);
  };

  const getContentTypesForPlatform = (platform) => {
    const types = {
      instagram: ['feed_post', 'reel', 'story', 'carousel'],
      tiktok: ['reel'],
      email: ['email_blast'],
      website: ['web_update'],
      flyer: ['print'],
      other: ['other'],
    };
    return types[platform] || ['other'];
  };

  const contentTypes = getContentTypesForPlatform(formData.platform);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-surface border border-border rounded-card p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h2 font-bold text-text">
            {request ? 'Edit Request' : 'New Internal Request'}
          </h2>
          <button onClick={onClose} className="text-mutedText hover:text-text transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-body font-medium text-text mb-2">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-surface2 border border-border rounded-control px-4 py-2 text-text placeholder-mutedText focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Spring Product Launch Announcement"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-body font-medium text-text mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full bg-surface2 border border-border rounded-control px-4 py-2 text-text placeholder-mutedText focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Describe what you need..."
            />
          </div>

          {/* Platform & Content Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body font-medium text-text mb-2">Platform *</label>
              <select
                required
                value={formData.platform}
                onChange={(e) => {
                  const newPlatform = e.target.value;
                  const newTypes = getContentTypesForPlatform(newPlatform);
                  setFormData({ ...formData, platform: newPlatform, content_type: newTypes[0] });
                }}
                className="w-full bg-surface2 border border-border rounded-control px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="email">Email</option>
                <option value="website">Website</option>
                <option value="flyer">Flyer</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-body font-medium text-text mb-2">Content Type *</label>
              <select
                required
                value={formData.content_type}
                onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                className="w-full bg-surface2 border border-border rounded-control px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {contentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority & Deadline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body font-medium text-text mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-surface2 border border-border rounded-control px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-body font-medium text-text mb-2">Deadline</label>
              <input
                type="datetime-local"
                value={formData.deadline_at}
                onChange={(e) => setFormData({ ...formData, deadline_at: e.target.value })}
                className="w-full bg-surface2 border border-border rounded-control px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Owner */}
          <div>
            <label className="block text-body font-medium text-text mb-2">Assign Owner</label>
            <select
              value={formData.owner_user_id}
              onChange={(e) => setFormData({ ...formData, owner_user_id: e.target.value })}
              className="w-full bg-surface2 border border-border rounded-control px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">— Unassigned —</option>
              {users.map((u) => (
                <option key={u.user_id} value={u.user_id}>
                  {u.name} {u.role && u.role !== 'member' ? `(${u.role})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Department & Campaign */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body font-medium text-text mb-2">Department</label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full bg-surface2 border border-border rounded-control px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">— None —</option>
                {departments.map((d) => (
                  <option key={d.department_id} value={d.department_id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-body font-medium text-text mb-2">Campaign</label>
              <select
                value={formData.campaign_id}
                onChange={(e) => setFormData({ ...formData, campaign_id: e.target.value })}
                className="w-full bg-surface2 border border-border rounded-control px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">— None —</option>
                {campaigns.map((c) => (
                  <option key={c.campaign_id} value={c.campaign_id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">
              {request ? 'Update Request' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestFormModal;
