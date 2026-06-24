import React from 'react';

const platformConfig = {
  linkedin: { bg: 'bg-blue-600', label: 'Li' },
  twitter: { bg: 'bg-sky-500', label: 'X' },
  x: { bg: 'bg-sky-500', label: 'X' },
  instagram: { bg: 'bg-gradient-to-br from-pink-500 to-purple-600', label: 'Ig' },
  facebook: { bg: 'bg-indigo-600', label: 'Fb' },
};

const defaultConfig = { bg: 'bg-gray-400', label: '?' };

const PlatformIcon = ({ platform, size = 32, className = '' }) => {
  const key = (platform || '').toLowerCase();
  const config = platformConfig[key] || defaultConfig;

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full text-white font-semibold shrink-0 ${config.bg} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
      title={platform}
    >
      {config.label}
    </div>
  );
};

const PlatformIconCluster = ({ platforms = [], max = 4 }) => {
  const visible = platforms.slice(0, max);
  const overflow = platforms.length - max;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((p, i) => (
        <PlatformIcon
          key={`${p}-${i}`}
          platform={p}
          size={28}
          className="ring-2 ring-white"
        />
      ))}
      {overflow > 0 && (
        <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ds-bg-subtle text-ds-fg-muted text-xs font-medium ring-2 ring-white">
          +{overflow}
        </div>
      )}
    </div>
  );
};

export { PlatformIcon, PlatformIconCluster };
export default PlatformIcon;
