import { NextRequest, NextResponse } from 'next/server'
import { getOpenAI } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage } = await request.json()

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Text and target language are required' },
        { status: 400 }
      )
    }

    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful translator. Translate the following text to ${targetLanguage}. Only respond with the translation, nothing else.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
    })

    if (!completion.choices || completion.choices.length === 0) {
      return NextResponse.json(
        { error: 'No translation result received' },
        { status: 500 }
      )
    }

    const translatedText = completion.choices[0]?.message?.content || ''

    return NextResponse.json({ translatedText })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    )
  }
}
