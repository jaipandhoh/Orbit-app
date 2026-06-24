import React from 'react';

const palette = [
  'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-amber-500',
  'bg-teal-500', 'bg-indigo-500', 'bg-rose-500', 'bg-cyan-500',
];

const sizeMap = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
};

function hashName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

const Avatar = ({ name = '', size = 'md', className = '' }) => {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const bg = palette[hashName(name) % palette.length];

  return (
    <div className={`inline-flex items-center justify-center rounded-full text-white font-medium shrink-0 ${bg} ${sizeMap[size]} ${className}`}>
      {initials}
    </div>
  );
};

export default Avatar;
