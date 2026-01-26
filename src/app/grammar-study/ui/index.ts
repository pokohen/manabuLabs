// Common components
export {
  SpeakerButton,
  speakJapanese,
  SpeakerIcon,
  HandwritingCanvas,
  QuizInput,
  QuizResultScreen,
  QuizLoadingScreen,
  QuizErrorScreen,
  LearningCompletionScreen,
  IntroStep,
  FormationStep,
  ExamplesStep,
  QuizStep,
} from './common'
export type { AnsweredItem } from './common'

// Grammar patterns (N5/N4)
export {
  GrammarCard,
  GrammarDetailModal,
  GrammarPuzzleQuiz,
  GrammarQuizSetup,
  PuzzleQuestion,
  StepLearning,
} from './patterns'
export type { QuestionCount as GrammarQuestionCount } from './patterns'

// Verb conjugation
export {
  VerbConjugationCard,
  VerbConjugationDetailModal,
  VerbConjugationQuiz,
  VerbConjugationQuizSetup,
  VerbStepLearning,
  ConjugationDetailModal,
} from './verb'
export type { QuestionCount as VerbQuestionCount, QuizQuestion } from './verb'

// Particles
export {
  ParticleCard,
  ParticleDetailModal,
  ParticleQuiz,
  ParticleQuizSetup,
  ParticleStepLearning,
} from './particle'
export type { ParticleQuestionCount } from './particle'

// Adjectives
export {
  AdjectiveCard,
  AdjectiveDetailModal,
  AdjectiveConjugationQuiz,
  AdjectiveQuizSetup,
} from './adjective'
export type { AdjectiveQuestionCount } from './adjective'

// Main page
export { default as GrammarStepPage } from './GrammarStepPage'
