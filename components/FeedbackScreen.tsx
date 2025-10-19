import React from 'react';
import TrophyIcon from './icons/TrophyIcon';

interface FeedbackScreenProps {
  feedback: string;
  onRestart: () => void;
}

const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ feedback, onRestart }) => {
  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-8 text-center animate-fade-in">
      <TrophyIcon className="h-20 w-20 mx-auto text-yellow-400 mb-4" />
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
        Interview Complete!
      </h1>
      <div className="bg-neutral-800/50 backdrop-blur-sm p-6 rounded-2xl mb-8 border border-brand-primary/50 text-left animate-glow shadow-2xl">
        <h2 className="text-2xl font-semibold text-brand-primary mb-3">Overall Feedback</h2>
        <p className="text-neutral-300 whitespace-pre-wrap">{feedback}</p>
      </div>
      <button
        onClick={onRestart}
        className="bg-brand-primary hover:bg-brand-primary/80 text-neutral-900 font-bold py-3 px-8 rounded-lg text-lg transition-transform duration-200 transform hover:scale-105 shadow-lg shadow-brand-primary/20"
      >
        Try Another Interview
      </button>
    </div>
  );
};

export default FeedbackScreen;