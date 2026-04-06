import React from 'react';

const OrbitLogo = ({ size = 40, className = '' }) => {
  return (
    <img
      src="/orbit-logo.png"
      alt="Orbit Logo"
      width={size}
      height={size}
      className={`object-contain ${className}`}
    />
  );
};

export default OrbitLogo;
