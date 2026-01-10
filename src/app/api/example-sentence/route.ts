import { NextRequest, NextResponse } from "next/server";
import { getGemini } from "@/lib/gemini";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { word, level } = await request.json();

    if (!word) {
      return NextResponse.json(
        { error: "Japanese word is required" },
        { status: 400 }
      );
    }

    // 캐시 확인
    const supabase = getSupabase();
    const { data: cached } = await supabase
      .from("example_cache")
      .select("example")
      .eq("word", word)
      .eq("level", level)
      .single();

    if (cached) {
      console.log("Cache hit for:", word, level);
      return NextResponse.json({
        word,
        example: cached.example,
        cached: true,
      });
    }

    // 캐시 미스 - Gemini API 호출
    console.log("Cache miss for:", word, level);
    const gemini = getGemini();
    const model = gemini.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `일본어 단어 "${word}"를 사용한 예시 문장을 1개 만들어주세요.

각 문장에 대해 다음 형식으로 응답해주세요:
1. 일본어 문장
2. 읽는 방법 (히라가나)
3. 한국어 번역
4. 해당 단어의 JLPT 수준 (예: N5, N4, N3, N2, N1)

난이도는 JLPT ${level} 수준으로 해주세요

JSON 형식으로만 응답해주세요:
{
  "word": "${word}",
  "example": {
    "japanese": "일본어 문장",
    "reading": "히라가나 읽기",
    "korean": "한국어 번역",
    "level": "N5"
  }
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // JSON 파싱 시도
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse response" },
        { status: 500 }
      );
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);

    // 캐시에 저장
    await supabase.from("example_cache").upsert({
      word,
      level,
      example: parsedResponse.example,
    });

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error("Example sentence generation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to generate example sentences: ${errorMessage}` },
      { status: 500 }
    );
  }
}
