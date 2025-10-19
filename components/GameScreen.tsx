import React, { useState, useRef, useEffect } from 'react';
import { ConversationTurn, InterviewType } from '../types';
import LoadingSpinner from './LoadingSpinner';
import RobotIcon from './icons/RobotIcon';
import UserIcon from './icons/UserIcon';
import SendIcon from './icons/SendIcon';

interface GameScreenProps {
  scenario: string;
  conversation: ConversationTurn[];
  isEvaluating: boolean;
  onSubmit: (answer: string) => void;
  interviewType: InterviewType;
}

const GameScreen: React.FC<GameScreenProps> = ({
  scenario,
  conversation,
  isEvaluating,
  onSubmit,
  interviewType,
}) => {
  const [currentAnswer, setCurrentAnswer] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAnswer.trim() && !isEvaluating) {
      onSubmit(currentAnswer);
      setCurrentAnswer('');
    }
  };
  
  const lastTurn = conversation[conversation.length - 1];
  const scenarioTitle = interviewType === 'Case Study' ? 'Case Study Scenario' : 'Interview Context';

  return (
    <div className="w-full max-w-3xl mx-auto p-4 flex flex-col h-full animate-fade-in">
      <div className="bg-neutral-800 p-4 rounded-lg mb-4 border border-neutral-700">
        <h2 className="text-xl font-bold text-brand-primary mb-2">{scenarioTitle}</h2>
        <p className="text-neutral-300">{scenario}</p>
      </div>

      <div className="flex-grow overflow-y-auto pr-2">
        {conversation.map((turn, index) => (
          <div key={index}>
            {/* Interviewer Question */}
            <div className="flex items-start gap-3 my-4 animate-fade-in">
              <div className="bg-brand-primary p-2 rounded-full flex-shrink-0">
                <RobotIcon />
              </div>
              <div className="bg-neutral-700 p-3 rounded-lg text-white">
                {turn.category && (
                  <p className="text-xs font-bold text-brand-primary mb-1 uppercase tracking-wider">{turn.category}</p>
                )}
                <p>{turn.question}</p>
              </div>
            </div>

            {/* User Answer */}
            {turn.answer && (
              <div className="flex items-start justify-end gap-3 my-4 animate-fade-in">
                <div className="bg-neutral-600 p-3 rounded-lg text-white">
                  <p>{turn.answer}</p>
                </div>
                <div className="bg-blue-500 p-2 rounded-full flex-shrink-0">
                  <UserIcon />
                </div>
              </div>
            )}
             {/* Feedback */}
             {turn.feedback && (
                <div className="my-4 text-sm text-neutral-400 italic pl-12 animate-fade-in">
                   <p><strong>Feedback:</strong> {turn.feedback}</p>
                </div>
             )}
          </div>
        ))}
        {isEvaluating && (
          <div className="flex items-start gap-3 my-4">
            <div className="bg-brand-primary p-2 rounded-full flex-shrink-0">
              <RobotIcon />
            </div>
            <div className="bg-neutral-700 p-3 rounded-lg text-white">
                <LoadingSpinner />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      
      <div className="mt-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={
              isEvaluating
                ? 'Evaluating your answer...'
                : `Your answer to: "${lastTurn?.question}"`
            }
            disabled={isEvaluating}
            className="flex-grow bg-neutral-700 text-white rounded-lg p-3 resize-none focus:ring-2 focus:ring-brand-primary focus:outline-none"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={isEvaluating || !currentAnswer.trim()}
            className="bg-brand-primary text-neutral-900 rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-primary/80 transition-colors"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

export default GameScreen;
