import { GoogleGenAI, Type } from '@google/genai';
import { Difficulty, ConversationTurn, GeminiEvaluationResponse, Domain, InterviewType } from '../types';

// Per guidelines, initialize with API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using gemini-2.5-flash as it's good for basic text tasks and fast.
const model = 'gemini-2.5-flash';

export async function generateScenario(difficulty: Difficulty, domain: Domain, interviewType: InterviewType): Promise<string> {
  const domainInstruction = domain === 'General'
    ? 'The scenario should be general and not specific to any industry.'
    : `The scenario should be set in the ${domain} industry. Make sure the context is relevant to that domain.`

  let prompt = '';

  switch (interviewType) {
    case 'Behavioral Questions':
      prompt = `
        You are an expert interviewer for a Business Analyst position.
        You are about to start a behavioral interview. 
        Provide a simple, welcoming opening statement to the candidate.
        For example: "Thanks for coming in today. We're going to start with some questions about your past experiences."
        Provide ONLY the opening statement.
      `;
      break;
    case 'Product Management':
    case 'Requirement Gathering':
    case 'User Acceptance Testing (UAT)':
        prompt = `
        You are an expert interviewer for a Business Analyst position.
        Generate a very brief (2-3 sentences) scenario to set the stage for an interview focused on **${interviewType}**.
        The difficulty of the scenario should be: ${difficulty}.
        ${domainInstruction}
        Provide ONLY the scenario description.
      `;
      break;
    case 'Technical Questions (SQL, API, etc.)':
        prompt = `
        You are an expert interviewer for a Business Analyst position.
        Generate a very brief (2-3 sentences) technical context for an interview focused on **Technical Skills**.
        The context should set up a scenario where a technical question (like SQL, API design, or data mapping) would be relevant.
        The difficulty of the scenario should be: ${difficulty}.
        ${domainInstruction}
        Example: "Our e-commerce platform needs to integrate with a new third-party shipping provider. We have their API documentation."
        Provide ONLY the context.
      `;
      break;
    case 'Situational Judgement Tests':
       prompt = `
        You are an expert interviewer for a Business Analyst position.
        Generate a brief (2-3 sentences) but challenging workplace scenario for a **Situational Judgement Test**.
        The scenario should present a dilemma involving conflicting priorities, difficult stakeholders, or ethical ambiguity that a Business Analyst might face.
        The difficulty of the scenario should be: ${difficulty}.
        ${domainInstruction}
        Example: "During user testing for a new feature, a senior director insists on a last-minute change that is outside the project's scope and will delay the launch. The development team says it's not feasible."
        Provide ONLY the scenario.
      `;
      break;
    case 'Case Study':
    default:
       prompt = `
        You are an expert interviewer for a Business Analyst position, and your methods are grounded in the BABOK (Business Analysis Body of Knowledge) Guide.
        Generate a concise and engaging case study scenario for a job interview. The scenario should allow a candidate to demonstrate skills across multiple BABOK Knowledge Areas.
        
        The difficulty of the scenario should be: ${difficulty}.
        ${domainInstruction}

        - For 'Easy' difficulty, create a well-defined problem.
        - For 'Medium' difficulty, introduce some ambiguity or conflicting needs.
        - For 'Hard' difficulty, present a complex, ill-defined business problem.

        Provide ONLY the scenario description, without any questions or introductions.
      `;
      break;
  }
  
  try {
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text.trim();
  } catch (error) {
    console.error(`Error generating scenario for type ${interviewType}:`, error);
    throw new Error('Failed to generate interview scenario.');
  }
}

export async function askFirstQuestion(scenario: string, interviewType: InterviewType): Promise<string> {
  let prompt = '';

  switch(interviewType) {
    case 'Behavioral Questions':
      prompt = `
        You are an expert Business Analyst interviewer.
        Your opening statement to the candidate was: "${scenario}"
        Now, ask a common, open-ended behavioral question to start the interview.
        Good examples: "Tell me about a time you faced a significant challenge on a project.", "Describe a situation where you had to influence stakeholders without direct authority."
        Provide ONLY the question.
      `;
      break;
    case 'Product Management':
    case 'Requirement Gathering':
    case 'User Acceptance Testing (UAT)':
       prompt = `
        You are an expert Business Analyst interviewer.
        Based on the following short scenario, what is the best opening question to ask for an interview focused on **${interviewType}**?
        The question should be open-ended and directly related to the core topic.
        Scenario: "${scenario}"
        Provide ONLY the question.
      `;
      break;
    case 'Technical Questions (SQL, API, etc.)':
      prompt = `
        You are an expert Technical Interviewer for a Business Analyst role.
        Based on the following technical context, ask a relevant and specific technical question.
        The question could be about SQL, API interaction, data modeling, or system design, depending on the context.
        Context: "${scenario}"
        Example Question (for API context): "How would you design the request payload for the 'create shipment' endpoint?"
        Example Question (for database context): "Write a SQL query to retrieve all customers who have not placed an order in the last 6 months."
        Provide ONLY the question.
      `;
      break;
    case 'Situational Judgement Tests':
       prompt = `
        You are an expert interviewer for a Business Analyst position.
        Based on the following challenging scenario, ask a question that prompts the candidate to explain how they would handle the situation.
        The question should be open-ended.
        Scenario: "${scenario}"
        Good examples: "How would you proceed in this situation?", "What are your immediate next steps?", "Describe how you would handle this."
        Provide ONLY the question.
      `;
      break;
    case 'Case Study':
    default:
      prompt = `
        You are an expert Business Analyst interviewer grounded in the BABOK Guide.
        Based on the following case study scenario, what is the best opening question to ask?
        The question should prompt the candidate to begin with **Strategy Analysis**.
        Scenario: "${scenario}"
        Good examples: "How would you begin to approach this problem?", "What would be your first steps?"
        Provide ONLY the question.
      `;
      break;
  }
  
  try {
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text.trim();
  } catch (error) {
    console.error(`Error generating first question for type ${interviewType}:`, error);
    throw new Error('Failed to generate the first question.');
  }
}

const evaluationResponseSchema = {
  type: Type.OBJECT,
  properties: {
    feedback: { type: Type.STRING, description: "Constructive feedback on the user's last answer. Be specific about what was good and what could be improved. Keep it to 1-2 sentences." },
    nextQuestion: { type: Type.STRING, description: "The next logical question. If the interview is over, this should be an empty string." },
    nextQuestionCategory: { type: Type.STRING, description: "The category for the next question. If the interview is over, this should be an empty string." },
    isGameOver: { type: Type.BOOLEAN, description: "Set to true if the interview should end now, otherwise false." },
    finalFeedback: { type: Type.STRING, description: "A comprehensive summary of the candidate's performance. Only provide this when isGameOver is true. Otherwise, it should be an empty string." }
  },
  required: ['feedback', 'nextQuestion', 'nextQuestionCategory', 'isGameOver', 'finalFeedback'],
};

function getEvaluationPrompt(
    interviewType: InterviewType,
    difficulty: Difficulty,
    domain: Domain,
    scenario: string,
    turnNumber: number,
    maxTurns: number,
    conversationHistory: string,
    userAnswer: string
): string {
  
  const baseInstructions = `
    You are an expert Business Analyst interviewer simulating an interview.
    Your role is to evaluate the candidate's answer and ask a relevant follow-up question.

    **Interview Details:**
    - **Interview Type:** ${interviewType}
    - **Difficulty:** ${difficulty}
    - **Domain:** ${domain}
    - **Scenario/Context:** ${scenario}
    - **Current Turn:** ${turnNumber} of ${maxTurns}
    - **Conversation History:**
    ${conversationHistory}

    **Candidate's Latest Answer to be Evaluated:**
    "${userAnswer}"

    **Your Tasks:**
    1.  **Evaluate the answer:** Assess the candidate's response based on the principles of the **${interviewType}** interview type.
    2.  **Provide feedback:** Write brief (1-2 sentences), constructive feedback.
    3.  **Decide the next step:**
        - If the turn limit (${maxTurns}) is reached, the interview MUST end. Set 'isGameOver' to true.
        - Otherwise, formulate a logical follow-up question that digs deeper or explores a new facet of the topic.
    4.  **Generate Final Feedback (if game is over):** If 'isGameOver' is true, provide a comprehensive final feedback summary (3-5 sentences) of the candidate's performance.
    5.  **Format your response:** You MUST respond in the specified JSON format.
  `;
  
  let typeSpecificInstructions = '';

  switch (interviewType) {
    case 'Behavioral Questions':
      typeSpecificInstructions = `
        **Evaluation Focus (Behavioral):**
        - Evaluate the answer based on the STAR method (Situation, Task, Action, Result). Did the candidate structure their response well?
        - Was the example relevant? Was the outcome clear?
        - **Next Question:** Ask another behavioral question that explores a different competency (e.g., teamwork, conflict resolution, problem-solving).
        - **Question Category:** The category should be the competency you are targeting (e.g., 'Conflict Resolution').
      `;
      break;
    case 'Requirement Gathering':
    case 'Product Management':
    case 'User Acceptance Testing (UAT)':
       typeSpecificInstructions = `
        **Evaluation Focus (${interviewType}):**
        - Assess the answer for clarity, depth, and relevance to ${interviewType}. Does it demonstrate practical knowledge?
        - **Next Question:** Ask a follow-up question that challenges their assumption or asks for more detail on their proposed process.
        - **Question Category:** The category should be a sub-topic within ${interviewType} (e.g., 'Stakeholder Identification', 'Prioritization', 'Test Case Design').
      `;
      break;
    case 'Technical Questions (SQL, API, etc.)':
      typeSpecificInstructions = `
        **Evaluation Focus (Technical):**
        - Assess the answer for technical accuracy and correctness. If they provided code (e.g., SQL), is it valid and efficient?
        - Did they explain their reasoning clearly? Do they understand the underlying concepts?
        - **Next Question:** Ask a follow-up that builds on their answer (e.g., "How would you modify that query to also include X?"), or ask another technical question relevant to the context.
        - **Question Category:** The category should be the technical skill being tested (e.g., 'SQL Query', 'API Design', 'Data Mapping').
      `;
      break;
    case 'Situational Judgement Tests':
      typeSpecificInstructions = `
        **Evaluation Focus (Situational Judgement):**
        - Evaluate the candidate's judgement, professionalism, and problem-solving approach.
        - Did they consider multiple perspectives (e.g., business needs, technical constraints, stakeholder impact)?
        - Was their proposed action plan logical and diplomatic?
        - **Next Question:** Ask a follow-up that explores the potential consequences of their proposed action or introduces a new complication to the scenario.
        - **Question Category:** The category should reflect the core conflict (e.g., 'Stakeholder Management', 'Scope Creep', 'Conflict Resolution').
      `;
      break;
    case 'Case Study':
    default:
      typeSpecificInstructions = `
        **Evaluation Focus (BABOK-based Case Study):**
        - Evaluate the candidate's response based on BABOK principles relevant to the previous question's category.
        - **BABOK Question Categories:**
          - Strategy Analysis
          - Business Analysis Planning and Monitoring
          - Elicitation and Collaboration
          - Requirements Analysis and Design Definition (RADD)
          - Solution Evaluation
        - **Next Question:** Select a logical BABOK category that has not been heavily covered yet to ensure a well-rounded interview. Formulate a question that fits this category.
        - **Question Category:** The category must be one of the BABOK categories listed above.
      `;
      break;
  }

  return `
    ${baseInstructions}
    ${typeSpecificInstructions}

    - 'nextQuestion' and 'nextQuestionCategory' MUST be empty strings if 'isGameOver' is true.
    - 'finalFeedback' MUST be an empty string if 'isGameOver' is false.
  `;
}


export async function evaluateAnswerAndGetNext(
  scenario: string,
  conversation: ConversationTurn[],
  userAnswer: string,
  turnNumber: number,
  maxTurns: number,
  difficulty: Difficulty,
  domain: Domain,
  interviewType: InterviewType
): Promise<GeminiEvaluationResponse> {
  const conversationHistory = conversation
    .map(turn => `Interviewer (${turn.category || 'General'}): ${turn.question}\nCandidate: ${turn.answer || ''}`)
    .join('\n\n');

  const prompt = getEvaluationPrompt(interviewType, difficulty, domain, scenario, turnNumber, maxTurns, conversationHistory, userAnswer);

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: evaluationResponseSchema,
      },
    });

    const jsonString = response.text;
    const result: GeminiEvaluationResponse = JSON.parse(jsonString);
    
    return result;

  } catch (error) {
    console.error('Error evaluating answer:', error);
    if (turnNumber >= maxTurns) {
        return {
            feedback: "There was an issue processing your response, but since we've reached the end, let's wrap up.",
            nextQuestion: "",
            nextQuestionCategory: "",
            isGameOver: true,
            finalFeedback: "A technical error prevented a full evaluation. Thank you for completing the simulation."
        }
    }
    throw new Error('Failed to evaluate answer and get the next question.');
  }
}