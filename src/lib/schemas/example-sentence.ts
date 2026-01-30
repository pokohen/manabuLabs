import { z } from 'zod'

// JLPT 레벨
export const JLPTLevelSchema = z.enum(['N5', 'N4', 'N3', 'N2', 'N1'])
export type JLPTLevel = z.infer<typeof JLPTLevelSchema>

// API 요청 스키마
export const ExampleRequestSchema = z.object({
  word: z.string().min(1, '단어를 입력해주세요'),
  level: JLPTLevelSchema,
})
export type ExampleRequest = z.infer<typeof ExampleRequestSchema>

// 예시 문장 스키마
export const ExampleSentenceSchema = z.object({
  japanese: z.string(),
  reading: z.string(),
  korean: z.string(),
  level: JLPTLevelSchema.optional(),
})
export type ExampleSentence = z.infer<typeof ExampleSentenceSchema>

// Gemini API 응답 스키마
export const GeminiResponseSchema = z.object({
  word: z.string(),
  wordJapanese: z.string(),
  wordReading: z.string(),
  wordKorean: z.string().optional(),
  example: ExampleSentenceSchema,
})
export type GeminiResponse = z.infer<typeof GeminiResponseSchema>
