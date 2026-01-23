// 공통 예문 타입
export interface GrammarExample {
  japanese: string
  reading: string
  korean: string
}

// 변환 예시 타입
export interface Transformation {
  original: string
  originalReading: string
  originalMeaning: string
  steps: string[]
  result: string
  resultReading: string
  resultMeaning: string
}

// N5/N4 문형 관련 타입
export interface ConjugationItem {
  japanese: string
  reading: string
  korean: string
}

export interface PatternConjugation {
  present?: string | ConjugationItem
  negative?: string | ConjugationItem
  past?: string | ConjugationItem
  pastNegative?: string | ConjugationItem
}

export interface PatternUsage {
  usage: string
  description?: string
  example?: GrammarExample
  examples?: GrammarExample[]
}

export interface RelatedPattern {
  pattern: string
  meaning: string
  note?: string
}

export interface GrammarPattern {
  id: string
  pattern: string
  meaning: string
  formation: string
  explanation: string
  transformations?: Transformation[]
  conjugation?: PatternConjugation
  usages?: PatternUsage[]
  examples?: GrammarExample[]
  notes?: string[]
  responses?: {
    positive: string
    negative: string
  }
  casualForms?: string[]
  relatedPatterns?: RelatedPattern[]
  vsAtoDe?: string
  vsPotential?: string
  vsKedo?: string
  negative?: {
    pattern: string
    meaning: string
    example: GrammarExample
  }
  morePolite?: string
  casual?: string
  exceptions?: { original: string; becomes: string }[]
  negatives?: {
    verb?: string
    iAdj?: string
    naAdj?: string
  }
  usageForSimile?: {
    meaning: string
    examples: GrammarExample[]
  }
  vsOtherConditionals?: {
    [key: string]: string
  }
  politeVersions?: {
    [key: string]: string
  }
  vsTsumori?: string
  vsKara?: string
  tenseNote?: string
}

export interface PatternsData {
  id: string
  title: string
  level: string
  description: string
  patterns: GrammarPattern[]
}

// 동사 활용 관련 타입
export interface VerbGroup {
  name: string
  description: string
  examples: string[]
}

export interface ConjugationRule {
  group: string
  rule: string
  detail: string
}

export interface VerbExample {
  dictionary: string
  conjugated: string
  reading: string
  meaning: string
  group: number
  negative?: string
  past?: string
  pastNegative?: string
  note?: string
}

export interface SoundChange {
  ending: string
  change: string
  example: string
  exception?: string
}

export interface UsageExample {
  japanese: string
  reading: string
  korean: string
}

export interface VerbConjugation {
  id: string
  name: string
  level: string
  usage: string
  rules: ConjugationRule[]
  examples: VerbExample[]
  soundChanges?: SoundChange[]
  usageExamples?: UsageExample[]
}

export interface VerbConjugationData {
  id: string
  title: string
  description: string
  verbGroups: {
    group1: VerbGroup
    group2: VerbGroup
    group3: VerbGroup
  }
  conjugations: VerbConjugation[]
}

// 조사 관련 타입
export interface ParticleUsage {
  usage: string
  description: string
  examples: GrammarExample[]
  note?: string
  vsNi?: string
  vsTo?: string
  vsGa?: {
    description: string
    points: string[]
  }
}

export interface Particle {
  id: string
  particle: string
  reading: string
  level: string
  name: string
  mainUsage: string
  usages: ParticleUsage[]
  vsGa?: {
    description: string
    points: string[]
  }
  vsNi?: string
}

export interface ParticlesData {
  id: string
  title: string
  description: string
  particles: Particle[]
}

// 형용사 관련 타입
export interface AdjectiveConjugationExample {
  word: string
  reading: string
  casual?: string
  polite?: string
  conjugated?: string
  meaning: string
}

export interface AdjectiveConjugation {
  form: string
  rule: string
  formal?: string
  example: AdjectiveConjugationExample
}

export interface CommonWord {
  word: string
  reading: string
  meaning: string
  note?: string
}

export interface IrregularConjugation {
  word: string
  note: string
  forms: {
    present: string
    negative: string
    past: string
    pastNegative: string
    te: string
    adverb: string
  }
}

export interface AdjectiveType {
  id: string
  name: string
  description: string
  conjugations: AdjectiveConjugation[]
  commonWords: CommonWord[]
  irregularConjugation?: IrregularConjugation
  lookAlikeIAdjectives?: {
    description: string
    words: CommonWord[]
  }
}

export interface ComparisonForm {
  form: string
  iAdj: string
  naAdj: string
}

export interface AdjectiveData {
  id: string
  title: string
  description: string
  types: AdjectiveType[]
  comparisonTable: {
    title: string
    forms: ComparisonForm[]
  }
}

// 카테고리 타입
export type GrammarCategory =
  | 'n5-patterns'
  | 'n4-patterns'
  | 'verb-conjugation'
  | 'particles'
  | 'adjectives'

export interface CategoryInfo {
  id: GrammarCategory
  label: string
  color: string
  description: string
}
