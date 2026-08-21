import type { LocalSubtitleCue } from "@/lib/subtitle-store";

export const subtitleExtensions = ["srt", "vtt", "ssa", "ass", "smi", "sami", "sub", "txt", "mpl", "pjs"] as const;

function extensionOf(filename: string) {
  return filename.toLowerCase().split(".").pop() ?? "";
}

function cleanCueText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\\N/g, "\n")
    .replace(/\{[^}]*\}/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\|/g, "\n")
    .trim();
}

function parseClock(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2}):(\d{2})(?:[,.](\d{1,3}))?$/);
  if (!match) return null;
  const [, hours, minutes, seconds, fraction = "0"] = match;
  const millis = Number(fraction.padEnd(3, "0").slice(0, 3));
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + millis / 1000;
}

function cue(start: number | null, end: number | null, text: string): LocalSubtitleCue | null {
  const cleaned = cleanCueText(text);
  if (start === null || end === null || !cleaned || end <= start) return null;
  return { start: Number(start.toFixed(2)), end: Number(end.toFixed(2)), text: cleaned };
}

function parseTimedBlocks(content: string) {
  const blocks = content.replace(/\r/g, "").split(/\n{2,}/);
  const cues: LocalSubtitleCue[] = [];
  blocks.forEach((block) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const timeLineIndex = lines.findIndex((line) => line.includes("-->"));
    if (timeLineIndex < 0) return;
    const [startRaw, endRaw] = lines[timeLineIndex].split("-->").map((part) => part.trim().split(/\s+/)[0]);
    const parsed = cue(parseClock(startRaw), parseClock(endRaw), lines.slice(timeLineIndex + 1).join("\n"));
    if (parsed) cues.push(parsed);
  });
  return cues;
}

function parseAss(content: string) {
  const cues: LocalSubtitleCue[] = [];
  content.split(/\r?\n/).forEach((line) => {
    if (!/^Dialogue\s*:/i.test(line)) return;
    const fields = line.replace(/^Dialogue\s*:\s*/i, "").split(",");
    if (fields.length < 10) return;
    const parsed = cue(parseClock(fields[1]), parseClock(fields[2]), fields.slice(9).join(","));
    if (parsed) cues.push(parsed);
  });
  return cues;
}

function parseMicroDvd(content: string) {
  const cues: LocalSubtitleCue[] = [];
  content.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\{(\d+)\}\{(\d+)\}(.*)$/);
    if (!match) return;
    const parsed = cue(Number(match[1]) / 25, Number(match[2]) / 25, match[3]);
    if (parsed) cues.push(parsed);
  });
  return cues;
}

function parseMpl2(content: string) {
  const cues: LocalSubtitleCue[] = [];
  content.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\[(\d+)\]\[(\d+)\](.*)$/);
    if (!match) return;
    const parsed = cue(Number(match[1]) / 10, Number(match[2]) / 10, match[3]);
    if (parsed) cues.push(parsed);
  });
  return cues;
}

function parseSami(content: string) {
  const points = Array.from(content.matchAll(/<sync\s+start\s*=\s*"?(\d+)"?[^>]*>([\s\S]*?)(?=<sync\s+start|$)/gi));
  return points.map((match, index) => {
    const start = Number(match[1]) / 1000;
    const end = index < points.length - 1 ? Number(points[index + 1][1]) / 1000 : start + 3;
    return cue(start, end, match[2]);
  }).filter((item): item is LocalSubtitleCue => item !== null);
}

function parseTmPlayer(content: string) {
  const cues: LocalSubtitleCue[] = [];
  const matches = content.split(/\r?\n/).map((line) => line.match(/^(\d{1,2}:\d{2}:\d{2})[:=](.*)$/)).filter(Boolean) as RegExpMatchArray[];
  matches.forEach((match, index) => {
    const start = parseClock(match[1]);
    const end = index < matches.length - 1 ? parseClock(matches[index + 1][1]) : start === null ? null : start + 3;
    const parsed = cue(start, end, match[2]);
    if (parsed) cues.push(parsed);
  });
  return cues;
}

export function supportsSubtitleImport(filename: string) {
  return subtitleExtensions.includes(extensionOf(filename) as (typeof subtitleExtensions)[number]);
}

export function parseSubtitleFile(content: string, filename: string) {
  const extension = extensionOf(filename);
  let cues: LocalSubtitleCue[] = [];
  if (extension === "ass" || extension === "ssa") cues = parseAss(content);
  else if (extension === "smi" || extension === "sami") cues = parseSami(content);
  else if (extension === "mpl") cues = parseMpl2(content);
  else if (extension === "sub" && /^\{\d+\}\{\d+\}/m.test(content)) cues = parseMicroDvd(content);
  else if (extension === "txt" && /^\d{1,2}:\d{2}:\d{2}[:=]/m.test(content)) cues = parseTmPlayer(content);
  else cues = parseTimedBlocks(content);
  const ordered = cues.sort((a, b) => a.start - b.start).slice(0, 1200);
  if (!ordered.length) throw new Error("لم يتمكن REMO PLAYER من قراءة هذا الملف كنص ترجمة متزامن. تدعم هذه النسخة ملفات SRT وVTT وASS وSSA وSAMI وMicroDVD وMPL2 وTMPlayer النصية.");
  return ordered;
}
