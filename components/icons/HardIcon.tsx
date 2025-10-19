
import React from 'react';

const HardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-6 w-6 ${className}`}
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <rect x="6" y="14" width="4" height="6" rx="1" fill="currentColor" />
    <rect x="10" y="11" width="4" height="9" rx="1" fill="currentColor" />
    <rect x="14" y="5" width="4" height="15" rx="1" fill="currentColor" />
  </svg>
);

export default HardIcon;
