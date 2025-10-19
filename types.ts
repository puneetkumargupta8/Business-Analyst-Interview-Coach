export enum GameStatus {
  Welcome = 'WELCOME',
  Generating = 'GENERATING',
  Playing = 'PLAYING',
  Evaluating = 'EVALUATING',
  Finished = 'FINISHED',
  Error = 'ERROR'
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Domain = 
  | 'General' 
  | 'Finance / Banking' 
  | 'Healthcare' 
  | 'E-commerce / Retail' 
  | 'Technology / SaaS' 
  | 'Insurance' 
  | 'Telecommunications';

export type InterviewType = 
  | 'Case Study'
  | 'Behavioral Questions'
  | 'Product Management'
  | 'Requirement Gathering'
  | 'User Acceptance Testing (UAT)'
  | 'Technical Questions (SQL, API, etc.)'
  | 'Situational Judgement Tests';

export interface ConversationTurn {
  question: string;
  category?: string;
  answer?: string;
  feedback?: string;
}

export interface GeminiEvaluationResponse {
  feedback: string;
  nextQuestion: string;
  nextQuestionCategory: string;
  isGameOver: boolean;
  finalFeedback: string;
}