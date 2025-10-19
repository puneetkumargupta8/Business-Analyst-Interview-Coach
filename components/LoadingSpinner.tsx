
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-10 h-10 border-4 border-neutral-200 border-t-brand-primary rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;
