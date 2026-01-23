import { NextRequest, NextResponse } from "next/server";
import { getGemini } from "@/lib/gemini";
import { getSupabase } from "@/lib/supabase";

interface TokenizeRequest {
  sentences: string[];
}

interface TokenizedSentence {
  original: string;
  tokens: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: TokenizeRequest = await request.json();

    if (!body.sentences || !Array.isArray(body.sentences) || body.sentences.length === 0) {
      return NextResponse.json(
        { error: "sentences array is required" },
        { status: 400 }
      );
    }

    // 최대 30문장으로 제한
    const sentences = body.sentences.slice(0, 30);
    const supabase = getSupabase();

    // 1. Supabase에서 캐시된 토큰화 결과 조회
    const { data: cachedData } = await supabase
      .from('tokenized_sentences')
      .select('sentence, tokens')
      .in('sentence', sentences);

    const cachedMap = new Map<string, string[]>();
    if (cachedData) {
      cachedData.forEach((item) => {
        cachedMap.set(item.sentence, item.tokens as string[]);
      });
    }

    // 2. 캐시에 없는 문장만 필터링
    const uncachedSentences = sentences.filter(s => !cachedMap.has(s));

    // 3. 캐시에 없는 문장이 있으면 Gemini API 호출
    if (uncachedSentences.length > 0) {
      const gemini = getGemini();
      const model = gemini.getGenerativeModel({
        model: "gemini-2.0-flash",
      });

      const prompt = `다음 일본어 문장들을 의미 단위(단어+조사, 동사구 등)로 분리해주세요.

규칙:
1. 단어와 붙어있는 조사는 함께 묶기 (예: 私は, 学校に, 本を)
2. 동사는 어간+활용어미를 함께 묶기 (예: 食べます, 行きました, しなければ)
3. 보조동사는 분리 (예: なりません, いけません)
4. 부사, 명사는 독립적으로 분리
5. 문장부호는 앞 단어에 붙이기

예시:
- "毎日勉強しなければなりません。" → ["毎日", "勉強", "しなければ", "なりません。"]
- "私は学校に行きます。" → ["私は", "学校に", "行きます。"]
- "これは本です。" → ["これは", "本です。"]

분리할 문장들:
${uncachedSentences.map((s, i) => `${i + 1}. ${s}`).join('\n')}

JSON 형식으로만 응답해주세요:
{
  "results": [
    { "original": "원본문장", "tokens": ["토큰1", "토큰2", ...] },
    ...
  ]
}`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // JSON 파싱
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[0]);
        const geminiResults: TokenizedSentence[] = jsonData.results || [];

        // 4. 새로운 결과를 Supabase에 저장
        const newRecords = geminiResults.map((r) => ({
          sentence: r.original,
          tokens: r.tokens,
        }));

        if (newRecords.length > 0) {
          await supabase
            .from('tokenized_sentences')
            .upsert(newRecords, { onConflict: 'sentence' });
        }

        // 캐시 맵에 새 결과 추가
        geminiResults.forEach((r) => {
          cachedMap.set(r.original, r.tokens);
        });
      }
    }

    // 5. 최종 결과 조합 (원래 순서 유지)
    const results: TokenizedSentence[] = sentences.map((sentence) => ({
      original: sentence,
      tokens: cachedMap.get(sentence) || [sentence],
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Tokenize error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to tokenize: ${errorMessage}` },
      { status: 500 }
    );
  }
}
