import React, { useState } from 'react';
import ModalActions from './components/ModalActions.jsx';

const toDateInputValue = (value) => {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'string') return value.includes('T') ? value.split('T')[0] : value.slice(0, 10);
  return '';
};

const CampaignFormModal = ({ campaign, onClose, onCreate, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: campaign?.title || '',
    objective: campaign?.objective || '',
    start_date: toDateInputValue(campaign?.start_date),
    status: campaign?.status || 'planning',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (campaign) {
      onUpdate(campaign.campaign_id ?? campaign.id, formData);
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
          {campaign ? 'Edit Campaign' : 'New Campaign'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text dark:text-white mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text dark:text-white mb-1">Objective</label>
            <textarea
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text dark:text-white mb-1">Start Date *</label>
            <input
              type="date"
              required
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text dark:text-white mb-1">Status *</label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <ModalActions
            primaryLabel={campaign ? 'Update Campaign' : 'Create Campaign'}
            secondaryLabel="Cancel"
            onSecondary={onClose}
          />
        </form>
      </div>
    </div>
  );
};

export default CampaignFormModal;
