import React, { useState } from 'react';
import ModalActions from './components/ModalActions.jsx';

const ContactFormModal = ({ contact, onClose, onCreate, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    email: contact?.email || '',
    organization: contact?.organization || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (contact) {
      onUpdate(contact.contact_id, formData);
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
          {contact ? 'Edit Contact' : 'New Contact'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text dark:text-white mb-1">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text dark:text-white mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text dark:text-white mb-1">Organization</label>
            <input
              type="text"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <ModalActions
            primaryLabel={contact ? 'Update Contact' : 'Create Contact'}
            secondaryLabel="Cancel"
            onSecondary={onClose}
          />
        </form>
      </div>
    </div>
  );
};

export default ContactFormModal;
