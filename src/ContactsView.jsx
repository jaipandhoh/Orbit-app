import React from 'react';
import { Plus, ChevronRight } from 'lucide-react';

const ContactsView = ({
  contacts,
  campaigns,
  posts,
  loading,
  onAddContact,
  isDarkMode = false,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Contacts</h1>
          <p className="text-mutedText mt-1">Your media and partner network</p>
        </div>
        <button 
          onClick={onAddContact}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Contact
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading contacts...</div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-8 text-gray-600">No contacts yet</div>
      ) : (
        <div className="grid gap-4">
          {contacts.map((contact) => {
            // Determine contact type from organization or email domain
            const contactType = contact.organization 
              ? (contact.organization.toLowerCase().includes('partner') ? 'partner' 
                 : contact.organization.toLowerCase().includes('media') || contact.organization.toLowerCase().includes('news') ? 'journalist'
                 : 'influencer')
              : 'contact';
            
            const lastContacted = contact.created_at 
              ? new Date(contact.created_at).toISOString().split('T')[0]
              : null;
            
            // Count interactions — currently contacts aren't linked to campaigns, so default to 0
            const interactions = 0;

            return (
              <div key={contact.contact_id} className="card hover-lift cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {contact.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {contact.name}
                      </h3>
                      <p className="text-gray-600 text-sm">{contact.organization || contact.email}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className={`px-3 py-1 rounded-full ${
                          contactType === 'journalist' 
                            ? 'bg-blue-100 text-blue-700' 
                            : contactType === 'partner' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-pink-100 text-pink-700'
                        }`}>
                          {contactType}
                        </span>
                        {lastContacted && (
                          <span className="text-gray-600">Last contacted: {lastContacted}</span>
                        )}
                        {interactions > 0 && (
                          <span className="text-gray-600">{interactions} interactions</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                    size={24}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContactsView;



