import React, { useState, useCallback } from 'react';
import { GameStatus, Difficulty, ConversationTurn, Domain, InterviewType } from './types';
import * as geminiService from './services/geminiService';
import WelcomeScreen from './components/WelcomeScreen';
import GameScreen from './components/GameScreen';
import FeedbackScreen from './components/FeedbackScreen';
import LoadingSpinner from './components/LoadingSpinner';
import SampleAnswerModal from './components/SampleAnswerModal';
import LogoIcon from './components/icons/LogoIcon';

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
  const [companyName, setCompanyName] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [scenario, setScenario] = useState<string>('');
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [finalFeedback, setFinalFeedback] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [isGeneratingSampleAnswer, setIsGeneratingSampleAnswer] = useState<boolean>(false);
  const [sampleAnswer, setSampleAnswer] = useState<string>('');
  const [isSampleAnswerModalOpen, setIsSampleAnswerModalOpen] = useState<boolean>(false);
  const [sampleAnswerError, setSampleAnswerError] = useState<string | null>(null);
  
  const handleStartGame = useCallback(async (selectedDifficulty: Difficulty, selectedDomain: Domain, selectedInterviewType: InterviewType, company: string, jobDesc: string) => {
    setGameStatus(GameStatus.Generating);
    setError(null);
    setConversation([]);
    setFinalFeedback('');
    setDifficulty(selectedDifficulty);
    setDomain(selectedDomain);
    setInterviewType(selectedInterviewType);
    setCompanyName(company);
    setJobDescription(jobDesc);

    try {
      const generatedScenario = await geminiService.generateScenario(selectedDifficulty, selectedDomain, selectedInterviewType, company, jobDesc);
      setScenario(generatedScenario);

      const firstQuestion = await geminiService.askFirstQuestion(generatedScenario, selectedInterviewType);
      const firstCategory = selectedInterviewType === 'Case Study' ? 'Strategy Analysis' : selectedInterviewType;
      setConversation([{ question: firstQuestion, category: firstCategory }]);
      setGameStatus(GameStatus.Playing);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to start the interview. Please try again.');
      setGameStatus(GameStatus.Error);
    }
  }, []);

  const handleAnswerSubmit = useCallback(async (answer: string) => {
    setGameStatus(GameStatus.Evaluating);
    
    // Update conversation with user's answer
    const updatedConversation = [...conversation];
    const currentTurn = updatedConversation[updatedConversation.length - 1];
    // Avoid re-adding the answer on retry
    if (!currentTurn.answer) {
      currentTurn.answer = answer;
      setConversation(updatedConversation);
    }

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
        interviewType,
        companyName,
        jobDescription
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
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'There was an error evaluating your answer. Please try again.');
      setGameStatus(GameStatus.Error);
    }
  }, [conversation, scenario, difficulty, domain, interviewType, companyName, jobDescription]);

  const handleRestart = () => {
    setGameStatus(GameStatus.Welcome);
    setDifficulty('Medium');
    setDomain('General');
    setInterviewType('Case Study');
    setCompanyName('');
    setJobDescription('');
    setError(null);
    setConversation([]);
  };
  
  const handleTryAgain = useCallback(() => {
    setError(null);
    // If conversation is empty, the initial generation failed.
    if (conversation.length === 0) {
      handleStartGame(difficulty, domain, interviewType, companyName, jobDescription);
    } else {
      // Otherwise, the evaluation of the last answer failed.
      const lastTurn = conversation[conversation.length - 1];
      if (lastTurn?.answer) {
        handleAnswerSubmit(lastTurn.answer);
      } else {
        // Fallback case, should not happen but good to have
        handleRestart();
      }
    }
  }, [conversation, difficulty, domain, interviewType, companyName, jobDescription, handleStartGame, handleAnswerSubmit]);

  const handleRequestSampleAnswer = useCallback(async () => {
    if (!conversation.length) return;
    
    // Reset state and open modal immediately for better UX
    setSampleAnswer('');
    setSampleAnswerError(null);
    setIsGeneratingSampleAnswer(true);
    setIsSampleAnswerModalOpen(true);

    try {
      const lastTurnIndex = conversation.length - 1;
      const currentQuestion = conversation[lastTurnIndex].question;
      const historyUpToCurrentQuestion = conversation.slice(0, lastTurnIndex);

      const conversationHistory = historyUpToCurrentQuestion
        .map(turn => `Interviewer (${turn.category || 'General'}): ${turn.question}\nCandidate: ${turn.answer || ''}`)
        .join('\n\n');

      const generatedAnswer = await geminiService.generateSampleAnswer(
        scenario,
        interviewType,
        conversationHistory,
        currentQuestion,
        companyName,
        jobDescription
      );
      setSampleAnswer(generatedAnswer);
    } catch (e: any) {
      // Set local error for the modal instead of global error
      setSampleAnswerError(e.message || 'Failed to generate sample answer.');
    } finally {
      setIsGeneratingSampleAnswer(false);
    }
  }, [conversation, scenario, interviewType, companyName, jobDescription]);

  const handleCloseSampleAnswerModal = () => {
    setIsSampleAnswerModalOpen(false);
    setSampleAnswer('');
    setSampleAnswerError(null);
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
            companyName={companyName}
            setCompanyName={setCompanyName}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
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
            onRequestSampleAnswer={handleRequestSampleAnswer}
            isGeneratingSampleAnswer={isGeneratingSampleAnswer}
            onGoBack={handleRestart}
          />
        );
      case GameStatus.Finished:
        return <FeedbackScreen feedback={finalFeedback} onRestart={handleRestart} />;
      case GameStatus.Error:
        return (
            <div className="text-center text-white animate-fade-in w-full max-w-2xl mx-auto p-4 md:p-8">
              <h2 className="text-3xl text-red-500 font-bold mb-4">An Error Occurred</h2>
              <div className="bg-neutral-800 p-6 rounded-lg mb-8 border border-neutral-700 text-left">
                <p className="text-neutral-300 whitespace-pre-wrap">{error}</p>
              </div>
              <button
                onClick={handleTryAgain}
                className="bg-brand-primary hover:bg-brand-primary/80 text-neutral-900 font-bold py-3 px-8 rounded-lg text-lg transition-transform duration-200 transform hover:scale-105"
              >
                Try Again
              </button>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="bg-neutral-900 text-white min-h-screen flex flex-col items-center justify-center font-sans p-4">
      <div className="w-full max-w-4xl mx-auto">
        <header className="flex items-center justify-center gap-3 my-6">
            <LogoIcon className="h-10 w-10 text-brand-primary"/>
            <h1 className="text-2xl font-bold text-neutral-200 tracking-tight">
                Business Analyst Interview Simulator
            </h1>
        </header>
        <div className="w-full h-[calc(100vh-120px)] max-h-[800px] flex items-center justify-center">
          {renderContent()}
        </div>
      </div>
      {isSampleAnswerModalOpen && (
        <SampleAnswerModal
          answer={sampleAnswer}
          onClose={handleCloseSampleAnswerModal}
          isLoading={isGeneratingSampleAnswer}
          error={sampleAnswerError}
          onRetry={handleRequestSampleAnswer}
        />
      )}
    </main>
  );
};

export default App;