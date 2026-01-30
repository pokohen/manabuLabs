import { NextRequest, NextResponse } from "next/server";
import { getGemini } from "@/lib/gemini";
import { getSupabase } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  ExampleRequestSchema,
  GeminiResponseSchema,
} from "@/lib/schemas/example-sentence";

const DAILY_LIMIT = 5;

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const authSupabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await authSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // 일일 사용량 체크
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count } = await authSupabase
      .from("usage_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("action", "example_sentence")
      .gte("created_at", today.toISOString());

    if ((count ?? 0) >= DAILY_LIMIT) {
      return NextResponse.json(
        {
          error: "오늘의 예문 생성 한도(5회)를 초과했습니다.",
          dailyLimit: DAILY_LIMIT,
          used: count,
        },
        { status: 429 }
      );
    }

    // 사용량 기록 (rate limit 통과 후 바로 기록)
    await authSupabase.from("usage_logs").insert({
      user_id: user.id,
      action: "example_sentence",
    });

    const body = await request.json();

    // 요청 검증
    const parseResult = ExampleRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { word, level } = parseResult.data;

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

    const prompt = `"${word}"를 사용한 일본어 예시 문장을 1개 만들어주세요.

규칙:
- 입력이 한국어인 경우, 해당 뜻에 맞는 일본어 단어로 변환해주세요
- 입력이 일본어인 경우, 그대로 사용해주세요
- "wordJapanese"는 항상 일본어 표기 (한자 포함)
- "wordReading"은 항상 히라가나로 읽는 방법
- 난이도는 JLPT ${level} 수준으로 해주세요

JSON 형식으로만 응답해주세요:
{
  "word": "${word}",
  "wordJapanese": "일본어 단어 (한자 표기)",
  "wordReading": "히라가나 읽기",
  "example": {
    "japanese": "일본어 문장",
    "reading": "문장 전체의 히라가나 읽기",
    "korean": "한국어 번역",
    "level": "N5"
  }
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // JSON 파싱
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse response" },
        { status: 500 }
      );
    }

    const jsonData = JSON.parse(jsonMatch[0]);

    // Gemini 응답 검증
    const geminiResult = GeminiResponseSchema.safeParse(jsonData);
    if (!geminiResult.success) {
      console.error("Gemini response validation failed:", geminiResult.error);
      return NextResponse.json(
        { error: "Invalid response format from AI" },
        { status: 500 }
      );
    }

    const parsedResponse = geminiResult.data;

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
