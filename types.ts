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
  // Business & Product
  | 'Case Study'
  | 'Product Management'
  | 'Requirement Gathering'
  // Technical
  | 'System Design'
  | 'Data Structures & Algorithms (DSA)'
  | 'Technical Questions (SQL, API, etc.)'
  // Process & Methodology
  | 'Agile / Scrum Methodology'
  | 'User Acceptance Testing (UAT)'
  // Behavioral
  | 'Behavioral Questions'
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