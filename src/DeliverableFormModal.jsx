import React, { useMemo, useState } from 'react';
import { X, Plus } from 'lucide-react';

const DELIVERABLE_TYPES = [
  { value: 'photo', label: 'Photo(s)' },
  { value: 'graphic', label: 'Graphic' },
  { value: 'video', label: 'Video' },
  { value: 'post', label: 'Social Post' },
  { value: 'email', label: 'Email' },
  { value: 'press_note', label: 'Press Note / Release' },
  { value: 'flyer', label: 'Flyer / Print' },
  { value: 'web_update', label: 'Website Update' },
  { value: 'partnership_outreach', label: 'Partnership Outreach' },
  { value: 'other', label: 'Other' },
];

const PLATFORMS = [
  { value: '', label: '—' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'X / Twitter' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'email', label: 'Email' },
  { value: 'website', label: 'Website' },
  { value: 'press', label: 'Press' },
  { value: 'other', label: 'Other' },
];

const PRIORITIES = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const STATUSES = [
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'needs_review', label: 'Needs Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'done', label: 'Done' },
];

const DeliverableFormModal = ({ campaignId, deliverable, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    deliverable_type: deliverable?.deliverable_type || 'graphic',
    title: deliverable?.title || '',
    stage: deliverable?.stage || '',
    platform: deliverable?.platform || '',
    owner_role: deliverable?.owner_role || '',
    priority: deliverable?.priority || 'medium',
    due_date: deliverable?.due_date ? String(deliverable.due_date).split('T')[0] : '',
    status: deliverable?.status || 'planned',
    description: deliverable?.description || '',
  });

  const canSubmit = useMemo(() => {
    return Boolean(campaignId && formData.deliverable_type && formData.title.trim());
  }, [campaignId, formData.deliverable_type, formData.title]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    onSubmit({
      campaign_id: campaignId,
      deliverable_type: formData.deliverable_type,
      title: formData.title.trim(),
      stage: formData.stage.trim() || null,
      platform: formData.platform || null,
      owner_role: formData.owner_role.trim() || null,
      priority: formData.priority || 'medium',
      // Send DATE as YYYY-MM-DD
      due_date: formData.due_date || null,
      status: formData.status || 'planned',
      description: formData.description.trim() || null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-surface border border-border rounded-card p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-h2 font-bold text-text">{deliverable ? 'Edit Deliverable' : 'Add Deliverable'}</h2>
            <p className="text-small text-mutedText">Comms master sheet row (type, owner, priority, due date)</p>
          </div>
          <button onClick={onClose} className="btn-secondary p-2">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-small font-medium text-text mb-1">Type *</label>
              <select
                value={formData.deliverable_type}
                onChange={(e) => setFormData({ ...formData, deliverable_type: e.target.value })}
                className="w-full px-4 py-2 border border-border bg-surface2 rounded-control text-text"
              >
                {DELIVERABLE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-small font-medium text-text mb-1">Due date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-2 border border-border bg-surface2 rounded-control text-text"
              />
            </div>
          </div>

          <div>
            <label className="block text-small font-medium text-text mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Instagram carousel graphics, Photo selection, Event flyer draft"
              className="w-full px-4 py-2 border border-border bg-surface2 rounded-control text-text"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-small font-medium text-text mb-1">Stage</label>
              <input
                type="text"
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                placeholder="e.g. Pre-launch, Launch week, Post-launch"
                className="w-full px-4 py-2 border border-border bg-surface2 rounded-control text-text"
              />
            </div>
            <div>
              <label className="block text-small font-medium text-text mb-1">Owner</label>
              <input
                type="text"
                value={formData.owner_role}
                onChange={(e) => setFormData({ ...formData, owner_role: e.target.value })}
                placeholder="e.g. Designer"
                className="w-full px-4 py-2 border border-border bg-surface2 rounded-control text-text"
              />
            </div>
            <div>
              <label className="block text-small font-medium text-text mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 border border-border bg-surface2 rounded-control text-text"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-small font-medium text-text mb-1">Channel / platform</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-4 py-2 border border-border bg-surface2 rounded-control text-text"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-small font-medium text-text mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-border bg-surface2 rounded-control text-text"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-small font-medium text-text mb-1">Notes</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Add links, specs, dimensions, copy notes, approvals needed, etc."
              className="w-full px-4 py-2 border border-border bg-surface2 rounded-control text-text"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={!canSubmit} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
              <Plus size={18} />
              {deliverable ? 'Save' : 'Add'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliverableFormModal;

