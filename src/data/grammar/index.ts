import type {
  PatternsData,
  VerbConjugationData,
  ParticlesData,
  AdjectiveData,
  CategoryInfo,
  CategoryGroup,
  GrammarMenuItem,
  GrammarCategory,
} from "./types";

import patternsN5Json from "./patterns-n5.json";
import patternsN4Json from "./patterns-n4.json";
import verbConjugationJson from "./verb-conjugation.json";
import particlesJson from "./particles.json";
import adjectiveJson from "./adjective.json";

// JSON 데이터를 타입과 함께 export
export const patternsN5 = patternsN5Json as PatternsData;
export const patternsN4 = patternsN4Json as PatternsData;
export const verbConjugation = verbConjugationJson as VerbConjugationData;
export const particles = particlesJson as ParticlesData;
export const adjectives = adjectiveJson as AdjectiveData;

// 기본 문법 하위 카테고리
export const basicGrammarCategories: CategoryInfo[] = [
  {
    id: "verb-conjugation",
    label: "동사 활용",
    color: "bg-purple-600 hover:bg-purple-700",
    description: "일본어 동사의 기본 활용형",
  },
  {
    id: "particles",
    label: "조사",
    color: "bg-orange-600 hover:bg-orange-700",
    description: "일본어의 주요 조사 (助詞)",
  },
  {
    id: "adjectives",
    label: "형용사",
    color: "bg-pink-600 hover:bg-pink-700",
    description: "い형용사와 な형용사의 활용",
  },
]

// 메뉴 구조 (그룹 + 단일 카테고리)
export const grammarMenu: GrammarMenuItem[] = [
  {
    id: "basic-grammar",
    label: "기본 문법",
    color: "bg-slate-600 hover:bg-slate-700",
    description: "동사, 조사, 형용사 활용",
    children: basicGrammarCategories,
  },
  {
    id: "n5-patterns",
    label: "N5 문형",
    color: "bg-green-600 hover:bg-green-700",
    description: "JLPT N5 수준의 기본 문형",
  },
  {
    id: "n4-patterns",
    label: "N4 문형",
    color: "bg-blue-600 hover:bg-blue-700",
    description: "JLPT N4 수준의 중급 기초 문형",
  },
]

// 모든 카테고리 (플랫 리스트) - 기존 호환성 유지
export const grammarCategories: CategoryInfo[] = [
  ...basicGrammarCategories,
  {
    id: "n5-patterns",
    label: "N5 문형",
    color: "bg-green-600 hover:bg-green-700",
    description: "JLPT N5 수준의 기본 문형",
  },
  {
    id: "n4-patterns",
    label: "N4 문형",
    color: "bg-blue-600 hover:bg-blue-700",
    description: "JLPT N4 수준의 중급 기초 문형",
  },
]

// 카테고리별 데이터 가져오기
export function getGrammarDataByCategory(category: GrammarCategory) {
  switch (category) {
    case "n5-patterns":
      return { type: "patterns" as const, data: patternsN5 };
    case "n4-patterns":
      return { type: "patterns" as const, data: patternsN4 };
    case "verb-conjugation":
      return { type: "verb" as const, data: verbConjugation };
    case "particles":
      return { type: "particles" as const, data: particles };
    case "adjectives":
      return { type: "adjectives" as const, data: adjectives };
    default:
      throw new Error(`Unknown category: ${category}`);
  }
}

// 타입 재export
export * from "./types";
