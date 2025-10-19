import React from 'react';

const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        strokeWidth="1.5" 
        stroke="currentColor" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={`h-8 w-8 ${className}`}
    >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M12 1a8 8 0 1 0 0 16a8 8 0 0 0 0 -16z" />
        <path d="M12 11m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
        <path d="M12 14v7" />
        <path d="M9 12h-7" />
        <path d="M15 12h7" />
        <path d="M12 1v-7" />
        <path d="M10 5l-4 -4" />
        <path d="M14 5l4 -4" />
        <path d="M10 19l-4 4" />
        <path d="M14 19l4 4" />
    </svg>
);

export default LogoIcon;
