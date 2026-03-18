import React, { useState } from 'react';
import ModalActions from './components/ModalActions.jsx';

const PostFormModal = ({ post, campaigns, onClose, onCreate, onUpdate }) => {
  const [formData, setFormData] = useState({
    campaign_id: post?.campaign_id || campaigns[0]?.campaign_id || '',
    platform: post?.platform || 'twitter',
    content: post?.content || '',
    scheduled_at: post?.scheduled_at || '',
    published_at: post?.published_at || '',
    impressions: post?.impressions || 0,
    clicks: post?.clicks || 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (post) {
      onUpdate(post.post_id, formData);
    } else {
      onCreate(formData);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-black rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-text dark:text-white mb-6">
          {post ? 'Edit Post' : 'New Post'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text dark:text-white mb-1">Campaign *</label>
            <select
              required
              value={formData.campaign_id}
              onChange={(e) => setFormData({ ...formData, campaign_id: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a campaign</option>
              {(campaigns || []).map((c) => (
                <option key={c.campaign_id} value={c.campaign_id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text dark:text-white mb-1">Platform *</label>
            <select
              required
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="twitter">Twitter</option>
              <option value="linkedin">LinkedIn</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text dark:text-white mb-1">Content *</label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text dark:text-white mb-1">Scheduled At</label>
              <input
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text dark:text-white mb-1">Published At</label>
              <input
                type="datetime-local"
                value={formData.published_at}
                onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text dark:text-white mb-1">Impressions</label>
              <input
                type="number"
                value={formData.impressions}
                onChange={(e) => setFormData({ ...formData, impressions: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text dark:text-white mb-1">Clicks</label>
              <input
                type="number"
                value={formData.clicks}
                onChange={(e) => setFormData({ ...formData, clicks: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <ModalActions
            primaryLabel={post ? 'Update Post' : 'Create Post'}
            secondaryLabel="Cancel"
            onSecondary={onClose}
          />
        </form>
      </div>
    </div>
  );
};

export default PostFormModal;
