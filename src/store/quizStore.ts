import { create } from "zustand";
import {
  hiragana,
  katakana,
  KanaData,
  KanaType,
  QuestionCount,
  TimerMode,
} from "@/data/kana";

interface Question {
  kana: KanaData;
  options: string[];
  correctAnswer: string;
}

interface QuizConfig {
  kanaType: KanaType;
  questionCount: QuestionCount;
  timerMode: TimerMode;
}

// 각 문제에 대한 답변 기록
interface AnswerRecord {
  questionIndex: number;
  userAnswer: string | null; // null이면 시간 초과
  correctAnswer: string;
  isCorrect: boolean;
}

interface QuizState {
  // 설정
  config: QuizConfig | null;

  // 퀴즈 상태
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  correctCount: number;
  isFinished: boolean;
  questionTimer: number;
  totalTimer: number;
  showResult: boolean;

  // 답변 기록
  answers: AnswerRecord[];
}

interface QuizActions {
  // 설정 및 시작
  setConfig: (config: QuizConfig) => void;

  // 퀴즈 진행
  selectAnswer: (answer: string) => void;
  nextQuestion: () => void;

  // 타이머
  decrementQuestionTimer: () => void;
  decrementTotalTimer: () => void;

  // 리셋
  resetQuiz: () => void;
}

const initialState: QuizState = {
  config: null,
  questions: [],
  currentQuestionIndex: 0,
  selectedAnswer: null,
  correctCount: 0,
  isFinished: false,
  questionTimer: 10,
  totalTimer: 20 * 60, // 20분
  showResult: false,
  answers: [],
};

// 문제 생성 함수
const generateQuestions = (config: QuizConfig): Question[] => {
  const kanaData = config.kanaType === "hiragana" ? hiragana : katakana;
  const count =
    config.questionCount === "all" ? kanaData.length : config.questionCount;

  // 랜덤하게 섞기
  const shuffled = [...kanaData].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  // 각 문제에 대해 4개의 선택지 생성
  return selected.map((kana) => {
    const correctAnswer = kana.hangeul;
    const wrongAnswers = kanaData
      .filter((k) => k.hangeul !== correctAnswer)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((k) => k.hangeul);

    const options = [correctAnswer, ...wrongAnswers].sort(
      () => Math.random() - 0.5
    );

    return {
      kana,
      options,
      correctAnswer,
    };
  });
};

export const useQuizStore = create<QuizState & QuizActions>((set, get) => ({
  ...initialState,

  setConfig: (config) => {
    const questions = generateQuestions(config);
    set({
      ...initialState,
      config,
      questions,
    });
  },

  selectAnswer: (answer) => {
    const { questions, currentQuestionIndex, showResult } = get();
    if (showResult) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;

    const answerRecord: AnswerRecord = {
      questionIndex: currentQuestionIndex,
      userAnswer: answer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
    };

    set((state) => ({
      selectedAnswer: answer,
      showResult: true,
      correctCount: isCorrect ? state.correctCount + 1 : state.correctCount,
      answers: [...state.answers, answerRecord],
    }));
  },

  nextQuestion: () => {
    const { currentQuestionIndex, questions, showResult, answers } = get();

    // 시간 초과로 답을 선택하지 않은 경우 기록 추가
    let updatedAnswers = answers;
    if (!showResult) {
      const currentQuestion = questions[currentQuestionIndex];
      const timeoutRecord: AnswerRecord = {
        questionIndex: currentQuestionIndex,
        userAnswer: null, // 시간 초과
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect: false,
      };
      updatedAnswers = [...answers, timeoutRecord];
    }

    if (currentQuestionIndex < questions.length - 1) {
      set({
        currentQuestionIndex: currentQuestionIndex + 1,
        selectedAnswer: null,
        showResult: false,
        questionTimer: 10,
        answers: updatedAnswers,
      });
    } else {
      set({ isFinished: true, answers: updatedAnswers });
    }
  },

  decrementQuestionTimer: () => {
    const { questionTimer } = get();
    if (questionTimer > 0) {
      set({ questionTimer: questionTimer - 1 });
    }
  },

  decrementTotalTimer: () => {
    const { totalTimer } = get();
    if (totalTimer > 0) {
      set({ totalTimer: totalTimer - 1 });
    } else {
      set({ isFinished: true });
    }
  },

  resetQuiz: () => {
    set(initialState);
  },
}));
