import React from 'react';
import { Difficulty, Domain, InterviewType } from '../types';
import EasyIcon from './icons/EasyIcon';
import MediumIcon from './icons/MediumIcon';
import HardIcon from './icons/HardIcon';
import CheckIcon from './icons/CheckIcon';
import LogoIcon from './icons/LogoIcon';

interface WelcomeScreenProps {
  onStart: (difficulty: Difficulty, domain: Domain, interviewType: InterviewType, companyName: string, jobDescription: string) => void;
  selectedDifficulty: Difficulty;
  setSelectedDifficulty: (difficulty: Difficulty) => void;
  selectedDomain: Domain;
  setSelectedDomain: (domain: Domain) => void;
  selectedInterviewType: InterviewType;
  setSelectedInterviewType: (interviewType: InterviewType) => void;
  companyName: string;
  setCompanyName: (name: string) => void;
  jobDescription: string;
  setJobDescription: (desc: string) => void;
}

const difficulties: { name: Difficulty; icon: React.ReactElement, description: string }[] = [
  { name: 'Easy', icon: <EasyIcon />, description: "Straightforward problem with a clear goal." },
  { name: 'Medium', icon: <MediumIcon />, description: "Some ambiguity, requires balancing priorities." },
  { name: 'Hard', icon: <HardIcon />, description: "Complex, ill-defined, multiple stakeholders." },
];

const domains: Domain[] = [
  'General',
  'Finance / Banking',
  'Healthcare',
  'E-commerce / Retail',
  'Technology / SaaS',
  'Insurance',
  'Telecommunications',
];

const interviewTypes: InterviewType[] = [
  // Business & Product
  'Case Study',
  'Product Management',
  'Requirement Gathering',
  // Technical
  'System Design',
  'Data Structures & Algorithms (DSA)',
  'Technical Questions (SQL, API, etc.)',
  // Process & Methodology
  'Agile / Scrum Methodology',
  'User Acceptance Testing (UAT)',
  // Behavioral
  'Behavioral Questions',
  'Situational Judgement Tests',
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  onStart, 
  selectedDifficulty, 
  setSelectedDifficulty,
  selectedDomain,
  setSelectedDomain,
  selectedInterviewType,
  setSelectedInterviewType,
  companyName,
  setCompanyName,
  jobDescription,
  setJobDescription
}) => {
  
  const handleStart = () => {
    onStart(selectedDifficulty, selectedDomain, selectedInterviewType, companyName, jobDescription);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 animate-fade-in">
        <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-2xl shadow-2xl p-6 md:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Setup Your Interview
              </h1>
              <p className="text-md text-neutral-300">
                Test your skills against a Gemini-powered interviewer.
              </p>
            </div>


            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4 text-center">1. Choose your difficulty</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {difficulties.map(({ name, icon, description }) => (
                    <button
                      key={name}
                      onClick={() => setSelectedDifficulty(name)}
                      className={`relative p-5 rounded-lg text-left transition-all duration-200 border-2 ${
                        selectedDifficulty === name
                          ? 'bg-brand-primary/20 border-brand-primary'
                          : 'bg-neutral-800/60 border-neutral-700 hover:border-brand-primary/50'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        {React.cloneElement(icon, { className: 'h-6 w-6 mr-3' })}
                        <span className="text-lg font-bold text-white">{name}</span>
                      </div>
                      <p className="text-sm text-neutral-400">{description}</p>
                      {selectedDifficulty === name && (
                        <div className="absolute top-2 right-2 bg-brand-primary rounded-full p-1">
                          <CheckIcon className="h-4 w-4 text-neutral-900" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4 text-center">2. Select an Industry</h2>
                  <div className="relative">
                    <select 
                        value={selectedDomain}
                        onChange={(e) => setSelectedDomain(e.target.value as Domain)}
                        className="w-full appearance-none bg-neutral-800/60 border-2 border-neutral-700 text-white text-lg rounded-lg p-3 focus:ring-2 focus:ring-brand-primary focus:outline-none focus:border-brand-primary"
                      >
                        {domains.map(domain => (
                          <option key={domain} value={domain}>{domain}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4 text-center">3. Choose Interview Type</h2>
                  <div className="relative">
                    <select 
                        value={selectedInterviewType}
                        onChange={(e) => setSelectedInterviewType(e.target.value as InterviewType)}
                        className="w-full appearance-none bg-neutral-800/60 border-2 border-neutral-700 text-white text-lg rounded-lg p-3 focus:ring-2 focus:ring-brand-primary focus:outline-none focus:border-brand-primary"
                      >
                        {interviewTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                  <h2 className="text-xl font-semibold text-white mb-4 text-center">4. (Optional) Customize</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="companyName" className="block text-left text-neutral-300 mb-2">Company Name</label>
                        <input 
                          id="companyName"
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="E.g., Google, Microsoft..."
                          className="w-full bg-neutral-800/60 border-2 border-neutral-700 text-white text-lg rounded-lg p-3 focus:ring-2 focus:ring-brand-primary focus:outline-none focus:border-brand-primary"
                        />
                      </div>
                      <div>
                        <label htmlFor="jobDescription" className="block text-left text-neutral-300 mb-2">Job Description</label>
                        <textarea 
                          id="jobDescription"
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          placeholder="Paste the job description here..."
                          className="w-full bg-neutral-800/60 border-2 border-neutral-700 text-white text-lg rounded-lg p-3 focus:ring-2 focus:ring-brand-primary focus:outline-none focus:border-brand-primary resize-none"
                          rows={1}
                        />
                      </div>
                  </div>
              </div>
          </div>
            <div className="text-center mt-10">
              <button
                onClick={handleStart}
                className="bg-brand-primary hover:bg-brand-primary/80 text-neutral-900 font-bold py-3 px-10 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-brand-primary/20"
              >
                Start Interview
              </button>
            </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
