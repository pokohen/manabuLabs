import { NextRequest, NextResponse } from "next/server";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { getSupabase } from "@/lib/supabase";

let ttsClient: TextToSpeechClient | null = null;

function getTTSClient(): TextToSpeechClient {
  if (!ttsClient) {
    const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS;
    if (!credentials) {
      throw new Error("GOOGLE_CLOUD_CREDENTIALS environment variable is not set");
    }
    ttsClient = new TextToSpeechClient({
      credentials: JSON.parse(credentials),
    });
  }
  return ttsClient;
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // 캐시 확인
    const supabase = getSupabase();
    const { data: cached } = await supabase
      .from("tts_cache")
      .select("audio")
      .eq("text", text)
      .single();

    if (cached) {
      console.log("TTS cache hit for:", text.substring(0, 20) + "...");
      return NextResponse.json({ audio: cached.audio, cached: true });
    }

    // 캐시 미스 - Google Cloud TTS API 호출
    console.log("TTS cache miss for:", text.substring(0, 20) + "...");
    const client = getTTSClient();

    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: "ja-JP",
        name: "ja-JP-Neural2-B",
        ssmlGender: "FEMALE",
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: 1.0,
        pitch: 0,
      },
    });

    if (!response.audioContent) {
      return NextResponse.json({ error: "Failed to generate audio" }, { status: 500 });
    }

    const audioBuffer = Buffer.from(response.audioContent as Uint8Array);
    const base64Audio = audioBuffer.toString("base64");

    // 캐시에 저장
    await supabase.from("tts_cache").upsert({
      text,
      audio: base64Audio,
    });

    return NextResponse.json({ audio: base64Audio });
  } catch (error) {
    console.error("TTS error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `TTS failed: ${errorMessage}` },
      { status: 500 },
    );
  }
}
