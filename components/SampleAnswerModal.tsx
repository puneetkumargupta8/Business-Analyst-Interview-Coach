import React, { useState, useCallback, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorIcon from './icons/ErrorIcon';
import CopyIcon from './icons/CopyIcon';
import CheckIcon from './icons/CheckIcon';

interface SampleAnswerModalProps {
  answer: string;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

const SampleAnswerModal: React.FC<SampleAnswerModalProps> = ({ answer, onClose, isLoading, error, onRetry }) => {
  const [isCopied, setIsCopied] = useState(false);
  
  // useEffect to handle Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);
  
  const handleCopy = useCallback(async () => {
    if (!answer || isCopied) return;
    try {
      await navigator.clipboard.writeText(answer);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }, [answer, isCopied]);


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-16">
          <LoadingSpinner />
          <p className="mt-4 text-neutral-400">Generating expert advice...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <ErrorIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-400 mb-2">Failed to Generate Answer</h3>
          <p className="text-neutral-400 mb-6">{error}</p>
          <button
            onClick={onRetry}
            className="bg-brand-primary hover:bg-brand-primary/80 text-neutral-900 font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    if (answer) {
      return (
        <div className="max-h-[60vh] overflow-y-auto pr-2 text-neutral-300 whitespace-pre-wrap">
          <p>{answer}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sample-answer-title"
    >
      <div 
        className="bg-neutral-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-neutral-700 flex flex-col min-h-[200px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 id="sample-answer-title" className="text-2xl font-bold text-brand-primary">
            Sample Answer
          </h2>
           <button 
            onClick={onClose} 
            className="text-neutral-500 hover:text-white transition-colors"
            aria-label="Close sample answer"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>
        
        <div className="flex-grow flex flex-col justify-center">
          {renderContent()}
        </div>
        
        <div className="mt-6 flex justify-between items-center flex-shrink-0">
            <div>
              {!isLoading && !error && answer && (
                  <button
                    onClick={handleCopy}
                    disabled={isCopied}
                    className="flex items-center gap-2 bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    {isCopied ? (
                      <>
                        <CheckIcon className="h-5 w-5 text-brand-primary" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <CopyIcon />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
              )}
            </div>

            {!isLoading && !error && answer && (
                <button 
                  onClick={onClose} 
                  className="bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                  aria-label="Close sample answer"
                >
                  Close
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default SampleAnswerModal;