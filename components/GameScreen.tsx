import React, { useState, useRef, useEffect } from 'react';
import { ConversationTurn, InterviewType } from '../types';
import LoadingSpinner from './LoadingSpinner';
import RobotIcon from './icons/RobotIcon';
import UserIcon from './icons/UserIcon';
import SendIcon from './icons/SendIcon';
import LightbulbIcon from './icons/LightbulbIcon';
import BackIcon from './icons/BackIcon';
import SpeakerIcon from './icons/SpeakerIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';

interface GameScreenProps {
  scenario: string;
  conversation: ConversationTurn[];
  isEvaluating: boolean;
  onSubmit: (answer: string) => void;
  interviewType: InterviewType;
  onRequestSampleAnswer: () => void;
  isGeneratingSampleAnswer: boolean;
  onGoBack: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
  scenario,
  conversation,
  isEvaluating,
  onSubmit,
  interviewType,
  onRequestSampleAnswer,
  isGeneratingSampleAnswer,
  onGoBack,
}) => {
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null); // Using 'any' for SpeechRecognition with vendor prefixes
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);
  
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setCurrentAnswer(finalTranscript + interimTranscript);
    };
    
    recognition.onend = () => {
      setIsRecording(false);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    // Cleanup: stop speech synthesis and recognition on component unmount
    return () => {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.abort();
    };
  }, []);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAnswer.trim() && !isEvaluating) {
      onSubmit(currentAnswer);
      setCurrentAnswer('');
    }
  };
  
  const handleSpeakQuestion = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any previous speech
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Sorry, your browser does not support text-to-speech.');
    }
  };

  const handleToggleRecording = () => {
    if (!recognitionRef.current) {
        alert("Speech recognition is not supported in this browser.");
        return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setCurrentAnswer('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };
  
  const lastTurn = conversation[conversation.length - 1];
  const scenarioTitle = interviewType === 'Case Study' ? 'Case Study Scenario' : 'Interview Context';

  return (
    <div className="w-full max-w-3xl mx-auto p-4 flex flex-col h-full animate-fade-in bg-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-2xl shadow-2xl">
      <div className="relative bg-neutral-900/40 p-4 rounded-lg mb-4 border border-neutral-700 flex-shrink-0">
        <button
          onClick={onGoBack}
          className="absolute top-3 left-3 text-neutral-400 hover:text-white transition-colors"
          aria-label="Go back to welcome screen"
        >
          <BackIcon />
        </button>
        <h2 className="text-xl font-bold text-brand-primary mb-2 text-center">{scenarioTitle}</h2>
        <p className="text-neutral-300 whitespace-pre-wrap text-center">{scenario}</p>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 space-y-4">
        {conversation.map((turn, index) => (
          <div key={index}>
            {/* Interviewer Question */}
            <div className="flex items-start gap-3 my-2 animate-fade-in">
              <div className="bg-neutral-700 p-2 rounded-full flex-shrink-0 border border-neutral-600">
                <RobotIcon />
              </div>
              <div className="flex-grow bg-neutral-700 p-3 rounded-lg text-white flex items-center justify-between gap-2">
                <div>
                  {turn.category && (
                    <p className="text-xs font-bold text-brand-primary mb-1 uppercase tracking-wider">{turn.category}</p>
                  )}
                  <p className="whitespace-pre-wrap">{turn.question}</p>
                </div>
                <button
                  onClick={() => handleSpeakQuestion(turn.question)}
                  className="text-neutral-400 hover:text-brand-primary transition-colors flex-shrink-0"
                  aria-label="Read question aloud"
                >
                  <SpeakerIcon />
                </button>
              </div>
            </div>

            {/* User Answer */}
            {turn.answer && (
              <div className="flex items-start justify-end gap-3 my-2 animate-fade-in">
                <div className="bg-brand-primary/90 text-neutral-900 p-3 rounded-lg max-w-[80%]">
                  <p className="font-medium">{turn.answer}</p>
                </div>
                 <div className="bg-neutral-600 p-2 rounded-full flex-shrink-0 border border-neutral-500">
                  <UserIcon />
                </div>
              </div>
            )}
            
            {/* Feedback */}
            {turn.feedback && (
                <div className="my-4 pl-14 animate-fade-in">
                  <div className="border-l-2 border-yellow-500/50 pl-3 text-sm text-neutral-400">
                      <div className="flex items-center gap-2 font-semibold text-yellow-400">
                          <LightbulbIcon />
                          <span>Feedback</span>
                      </div>
                      <p className="mt-1">{turn.feedback}</p>
                  </div>
              </div>
             )}
          </div>
        ))}
        {isEvaluating && (
          <div className="flex items-start gap-3 my-4">
            <div className="bg-neutral-700 p-2 rounded-full flex-shrink-0 border border-neutral-600">
              <RobotIcon />
            </div>
            <div className="bg-neutral-700 p-3 rounded-lg text-white">
                <LoadingSpinner />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      
      <div className="mt-4 pt-4 border-t border-neutral-700/50">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={
              isRecording
                ? 'Listening...'
                : isEvaluating
                ? 'Evaluating your answer...'
                : 'Type or record your answer here...'
            }
            disabled={isEvaluating || isGeneratingSampleAnswer}
            className="flex-grow bg-neutral-700 text-white rounded-lg p-3 resize-none focus:ring-2 focus:ring-brand-primary focus:outline-none border border-neutral-600"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleSubmit(e);
              }
            }}
          />
           <button
            type="button"
            onClick={handleToggleRecording}
            disabled={isEvaluating || isGeneratingSampleAnswer}
            className={`text-white rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
              isRecording ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-neutral-600 hover:bg-neutral-500'
            }`}
            aria-label={isRecording ? 'Stop recording' : 'Record answer'}
          >
            <MicrophoneIcon />
          </button>
          <button
            type="submit"
            disabled={isEvaluating || isGeneratingSampleAnswer || !currentAnswer.trim()}
            className="bg-brand-primary text-neutral-900 rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-primary/80 transition-colors"
          >
            <SendIcon />
          </button>
        </form>
         <div className="text-center mt-3">
            <button
              onClick={onRequestSampleAnswer}
              disabled={isEvaluating || isGeneratingSampleAnswer}
              className="text-sm text-neutral-400 hover:text-brand-primary disabled:text-neutral-600 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
            >
              <LightbulbIcon />
              {isGeneratingSampleAnswer ? 'Generating sample...' : 'Stuck? View a sample answer'}
            </button>
          </div>
      </div>
    </div>
  );
};

export default GameScreen;