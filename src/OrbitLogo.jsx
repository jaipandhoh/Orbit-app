import React from 'react';

const OrbitLogo = ({ size = 40, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Light grey orbit (Horizontal, slightly tilted) */}
      <ellipse
        cx="50"
        cy="50"
        rx="40"
        ry="15"
        fill="none"
        stroke="#9ca3af"
        strokeWidth="2"
        transform="rotate(10 50 50)"
      />

      {/* Dark grey orbit (Tilted top-left to bottom-right) */}
      <ellipse
        cx="50"
        cy="50"
        rx="40"
        ry="16"
        fill="none"
        stroke="#4b5563"
        strokeWidth="2.5"
        transform="rotate(65 50 50)"
        className="dark:stroke-gray-400"
      />

      {/* Thick black orbit (Tilted bottom-left to top-right) */}
      <ellipse
        cx="50"
        cy="50"
        rx="42"
        ry="15"
        fill="none"
        stroke="#111827"
        strokeWidth="3.5"
        transform="rotate(-30 50 50)"
        className="dark:stroke-white"
      />

      {/* Light grey node (Bottom left) */}
      <circle
        cx="34"
        cy="64"
        r="4.5"
        fill="#9ca3af"
      />

      {/* Dark grey node (Top middle) */}
      <circle
        cx="48"
        cy="33"
        r="4.5"
        fill="#4b5563"
        className="dark:fill-gray-300"
      />

      {/* Blue node (Right side) */}
      <circle
        cx="82"
        cy="32"
        r="6.5"
        fill="#0ea5e9"
      />
    </svg>
  );
};

export default OrbitLogo;



