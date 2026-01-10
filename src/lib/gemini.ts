import { GoogleGenerativeAI } from '@google/generative-ai'

let geminiInstance: GoogleGenerativeAI | null = null

export function getGemini(): GoogleGenerativeAI {
  if (!geminiInstance) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set')
    }
    geminiInstance = new GoogleGenerativeAI(apiKey)
  }
  return geminiInstance
}

export default getGemini
