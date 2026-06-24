// Utility functions for styling and formatting

export const getHealthColor = (health) => {
  switch (health) {
    case 'healthy':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'at_risk':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'critical':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'bg-blue-100 text-blue-700';
    case 'planning':
    case 'planned':
      return 'bg-purple-100 text-purple-700';
    case 'at_risk':
      return 'bg-amber-100 text-amber-700';
    case 'complete':
    case 'completed':
      return 'bg-emerald-100 text-emerald-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

/** Returns a Tailwind border-left color class for platform chips.
 *  Uses solid colors that work in both light and dark mode. */
export const getPlatformAccentColor = (platform) => {
  switch (platform?.toLowerCase()) {
    case 'twitter':   return 'border-l-sky-400';
    case 'linkedin':  return 'border-l-blue-500';
    case 'instagram': return 'border-l-pink-500';
    case 'facebook':  return 'border-l-indigo-500';
    default:          return 'border-l-slate-400';
  }
};

export const getPlatformColor = (platform) => {
  switch (platform?.toLowerCase()) {
    case 'twitter':
      return 'bg-sky-100 text-sky-700';
    case 'linkedin':
      return 'bg-blue-100 text-blue-700';
    case 'instagram':
      return 'bg-pink-100 text-pink-700';
    case 'facebook':
      return 'bg-indigo-100 text-indigo-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};





