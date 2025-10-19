
import React from 'react';

interface FeedbackScreenProps {
  feedback: string;
  onRestart: () => void;
}

const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ feedback, onRestart }) => {
  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-8 text-center animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
        Interview Complete!
      </h1>
      <div className="bg-neutral-800 p-6 rounded-lg mb-8 border border-neutral-700 text-left">
        <h2 className="text-2xl font-semibold text-brand-primary mb-3">Overall Feedback</h2>
        <p className="text-neutral-300 whitespace-pre-wrap">{feedback}</p>
      </div>
      <button
        onClick={onRestart}
        className="bg-brand-primary hover:bg-brand-primary/80 text-neutral-900 font-bold py-3 px-8 rounded-lg text-lg transition-transform duration-200 transform hover:scale-105"
      >
        Try Another Interview
      </button>
    </div>
  );
};

export default FeedbackScreen;
