import { invokeLLM, listLLMModels } from "./_core/llm";
import { storagePut } from "./storage";

export type SubtitleCue = {
  start: number;
  end: number;
  text: string;
};

export type GeneratedSubtitleTrack = {
  targetLanguage: string;
  detectedLanguage: string;
  cues: SubtitleCue[];
};

const MAX_VIDEO_BYTES = 6 * 1024 * 1024;

function cleanJson(content: string) {
  return content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

export function parseSubtitleResponse(content: string, targetLanguage: string): GeneratedSubtitleTrack {
  const parsed = JSON.parse(cleanJson(content)) as { detectedLanguage?: unknown; cues?: unknown };
  const rawCues = Array.isArray(parsed.cues) ? parsed.cues : [];
  const cues = rawCues
    .map((cue): SubtitleCue | null => {
      if (!cue || typeof cue !== "object") return null;
      const record = cue as Record<string, unknown>;
      const start = Number(record.start);
      const end = Number(record.end);
      const text = typeof record.text === "string" ? record.text.trim() : "";
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || !text) return null;
      return { start: Math.max(0, Number(start.toFixed(2))), end: Number(end.toFixed(2)), text };
    })
    .filter((cue): cue is SubtitleCue => cue !== null)
    .sort((a, b) => a.start - b.start)
    .slice(0, 400);

  if (!cues.length) throw new Error("تعذر إنشاء أسطر ترجمة صالحة لهذا الفيديو.");
  return {
    targetLanguage,
    detectedLanguage: typeof parsed.detectedLanguage === "string" ? parsed.detectedLanguage : "غير محددة",
    cues,
  };
}

export async function translateVideoWithAi(input: {
  videoBuffer: Buffer;
  targetLanguage: string;
  requestOrigin: string;
}) {
  if (!input.videoBuffer.length || input.videoBuffer.length > MAX_VIDEO_BYTES) {
    throw new Error("حجم الفيديو المسموح للترجمة الذكية هو 6MB كحد أقصى.");
  }

  const { url } = await storagePut(
    `video-translations/${Date.now()}-${crypto.randomUUID()}.mp4`,
    input.videoBuffer,
    "video/mp4",
  );
  const videoUrl = new URL(url, input.requestOrigin).toString();
  const { data: models } = await listLLMModels();
  const model = models.find((entry) => entry.id === "gemini-3-flash-preview")?.id;
  if (!model) throw new Error("نموذج الترجمة متعدد الوسائط غير متاح حالياً.");

  const response = await invokeLLM({
    model,
    messages: [
      {
        role: "system",
        content: "You create faithful timed subtitle translations. Return JSON only, never markdown.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze the spoken dialogue in this short video. Transcribe it, then translate it into ${input.targetLanguage}. Return exactly this JSON object: {"detectedLanguage":"ISO language name","cues":[{"start":0.0,"end":2.5,"text":"translated subtitle"}]}. Preserve chronological timings, do not overlap cues, use seconds, and omit non-speech audio descriptions.`,
          },
          { type: "file_url", file_url: { url: videoUrl, mime_type: "video/mp4" } },
        ],
      },
    ],
    response_format: { type: "json_object" },
  });
  const content = response.choices[0]?.message.content;
  if (typeof content !== "string") throw new Error("لم تُرجع خدمة الذكاء الاصطناعي نص ترجمة صالحاً.");
  return parseSubtitleResponse(content, input.targetLanguage);
}
