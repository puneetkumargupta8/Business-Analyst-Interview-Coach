import React, { useState, useCallback } from 'react';
import { GameStatus, Difficulty, ConversationTurn, Domain, InterviewType } from './types';
import * as geminiService from './services/geminiService';
import WelcomeScreen from './components/WelcomeScreen';
import GameScreen from './components/GameScreen';
import FeedbackScreen from './components/FeedbackScreen';
import LoadingSpinner from './components/LoadingSpinner';

const getTurnsForDifficulty = (difficulty: Difficulty): number => {
  switch (difficulty) {
    case 'Easy':
      return 3;
    case 'Medium':
      return 5;
    case 'Hard':
      return 7;
    default:
      return 5;
  }
};

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Welcome);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [domain, setDomain] = useState<Domain>('General');
  const [interviewType, setInterviewType] = useState<InterviewType>('Case Study');
  const [scenario, setScenario] = useState<string>('');
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [finalFeedback, setFinalFeedback] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const handleStartGame = useCallback(async (selectedDifficulty: Difficulty, selectedDomain: Domain, selectedInterviewType: InterviewType) => {
    setGameStatus(GameStatus.Generating);
    setError(null);
    setConversation([]);
    setFinalFeedback('');
    setDifficulty(selectedDifficulty);
    setDomain(selectedDomain);
    setInterviewType(selectedInterviewType);

    try {
      const generatedScenario = await geminiService.generateScenario(selectedDifficulty, selectedDomain, selectedInterviewType);
      setScenario(generatedScenario);

      const firstQuestion = await geminiService.askFirstQuestion(generatedScenario, selectedInterviewType);
      const firstCategory = selectedInterviewType === 'Case Study' ? 'Strategy Analysis' : selectedInterviewType;
      setConversation([{ question: firstQuestion, category: firstCategory }]);
      setGameStatus(GameStatus.Playing);
    } catch (e) {
      console.error(e);
      setError('Failed to start the interview. Please try again.');
      setGameStatus(GameStatus.Error);
    }
  }, []);

  const handleAnswerSubmit = useCallback(async (answer: string) => {
    setGameStatus(GameStatus.Evaluating);
    
    // Update conversation with user's answer
    const updatedConversation = [...conversation];
    const currentTurn = updatedConversation[updatedConversation.length - 1];
    currentTurn.answer = answer;
    setConversation(updatedConversation);

    try {
      const turnNumber = conversation.length;
      const maxTurns = getTurnsForDifficulty(difficulty);
      const result = await geminiService.evaluateAnswerAndGetNext(
        scenario,
        conversation,
        answer,
        turnNumber,
        maxTurns,
        difficulty,
        domain,
        interviewType
      );
      
      // Update the feedback for the current turn
      const finalConversation = [...updatedConversation];
      finalConversation[finalConversation.length - 1].feedback = result.feedback;

      if (result.isGameOver || !result.nextQuestion) {
        setFinalFeedback(result.finalFeedback || "Great job! The interview is now complete.");
        setGameStatus(GameStatus.Finished);
      } else {
        setConversation([...finalConversation, { question: result.nextQuestion, category: result.nextQuestionCategory }]);
        setGameStatus(GameStatus.Playing);
      }
    } catch (e) {
      console.error(e);
      setError('There was an error evaluating your answer. Please try again.');
      setGameStatus(GameStatus.Error);
    }
  }, [conversation, scenario, difficulty, domain, interviewType]);

  const handleRestart = () => {
    setGameStatus(GameStatus.Welcome);
    setDifficulty('Medium');
    setDomain('General');
    setInterviewType('Case Study');
  };
  
  const renderContent = () => {
    switch (gameStatus) {
      case GameStatus.Welcome:
        return (
          <WelcomeScreen 
            onStart={handleStartGame} 
            selectedDifficulty={difficulty} 
            setSelectedDifficulty={setDifficulty}
            selectedDomain={domain}
            setSelectedDomain={setDomain}
            selectedInterviewType={interviewType}
            setSelectedInterviewType={setInterviewType}
          />
        );
      case GameStatus.Generating:
        return (
          <div className="text-center">
            <h2 className="text-2xl text-white mb-4">Generating your interview scenario...</h2>
            <LoadingSpinner />
          </div>
        );
      case GameStatus.Playing:
      case GameStatus.Evaluating:
        return (
          <GameScreen
            scenario={scenario}
            conversation={conversation}
            isEvaluating={gameStatus === GameStatus.Evaluating}
            onSubmit={handleAnswerSubmit}
            interviewType={interviewType}
          />
        );
      case GameStatus.Finished:
        return <FeedbackScreen feedback={finalFeedback} onRestart={handleRestart} />;
      case GameStatus.Error:
        return (
          <div className="text-center text-white">
            <h2 className="text-2xl text-red-500 mb-4">An Error Occurred</h2>
            <p className="mb-6">{error}</p>
            <button
              onClick={handleRestart}
              className="bg-brand-primary hover:bg-brand-primary/80 text-neutral-900 font-bold py-3 px-8 rounded-lg text-lg"
            >
              Start Over
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="bg-neutral-900 text-white min-h-screen flex flex-col items-center justify-center font-sans">
      <div className="w-full h-screen flex items-center justify-center p-4">
        {renderContent()}
      </div>
    </main>
  );
};

export default App;
