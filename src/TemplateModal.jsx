import React from 'react';
import { QUICK_TEMPLATES } from './constants/templates.js';
import TemplateCard from './components/TemplateCard.jsx';
import ModalActions from './components/ModalActions.jsx';

const TemplateModal = ({ onClose, onSelectTemplate, onViewAllTemplates, onStartFromScratch }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-black rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-slideUp border dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text dark:text-white">Choose a Template</h2>
          <button
            onClick={onClose}
            className="text-mutedText dark:text-gray-400 hover:text-text dark:hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {QUICK_TEMPLATES.map((template) => (
            <TemplateCard
              key={template.template_key}
              template={template}
              onSelect={onSelectTemplate}
            />
          ))}
        </div>

        <div className="mt-6 pt-6 border-t">
          <ModalActions
            primaryType="button"
            secondaryType="button"
            primaryLabel="View All Templates"
            secondaryLabel="Start from Scratch"
            primaryClassName="btn-secondary flex-1"
            secondaryClassName="btn-secondary flex-1"
            onPrimary={onViewAllTemplates}
            onSecondary={onStartFromScratch}
          />
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;
