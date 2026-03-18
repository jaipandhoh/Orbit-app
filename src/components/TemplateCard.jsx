import React from 'react';
import { Sparkles, Target } from 'lucide-react';

const TemplateCard = ({ template, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(template)}
      className="card hover-lift cursor-pointer group border-2 border-transparent hover:border-blue-500"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
          <Target className="text-blue-600" size={24} />
        </div>
        <Sparkles className="text-blue-400" size={20} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{template.name}</h3>
      <p className="text-gray-600 text-sm mb-4">{template.description}</p>
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>{template.stages.length} stages</span>
        <span>•</span>
        <span>{template.planned_deliverables?.length || 0} deliverables</span>
        <span>•</span>
        <span>{template.recommended_duration_weeks} weeks</span>
      </div>
    </div>
  );
};

export default TemplateCard;
