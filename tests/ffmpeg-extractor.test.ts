import { describe, expect, it } from "vitest";
import {
  isLegacyExtractionFormat,
  isExoPlayerSourceError,
  getFfmpegExtractionStrategy,
  stableUriHash,
  getExtractedCacheUri,
  legacyExtractorFormats,
  strictTranscodeFormats,
} from "../lib/ffmpeg-extractor";
import { shouldAttemptFfmpegExtraction } from "../lib/video-engine";

describe("FFmpeg Extraction Layer - Format Detection", () => {
  it("identifies legacy video formats that trigger ExoPlayer Source errors", () => {
    expect(isLegacyExtractionFormat("video.flv")).toBe(true);
    expect(isLegacyExtractionFormat("sample.FLV")).toBe(true);
    expect(isLegacyExtractionFormat("dvd_track.vob")).toBe(true);
    expect(isLegacyExtractionFormat("movie.VOB")).toBe(true);
    expect(isLegacyExtractionFormat("archive.mpg")).toBe(true);
    expect(isLegacyExtractionFormat("stream.mpeg")).toBe(true);
    expect(isLegacyExtractionFormat("media.wmv")).toBe(true);
    expect(isLegacyExtractionFormat("clip.avi")).toBe(true);
    expect(isLegacyExtractionFormat("old_recording.3gp")).toBe(true);
    expect(isLegacyExtractionFormat("content://media/external/video/media/1234?format=flv")).toBe(true);
  });

  it("identifies modern well-supported MP4/WebM formats as non-legacy", () => {
    expect(isLegacyExtractionFormat("standard.mp4")).toBe(false);
    expect(isLegacyExtractionFormat("standard.m4v")).toBe(false);
    expect(isLegacyExtractionFormat(null)).toBe(false);
    expect(isLegacyExtractionFormat("")).toBe(false);
  });
});

describe("FFmpeg Extraction Layer - ExoPlayer Source Error Detection", () => {
  it("detects standard ExoPlayer and Media3 Source error signatures", () => {
    expect(isExoPlayerSourceError("PlaybackException: Source error")).toBe(true);
    expect(isExoPlayerSourceError("ExoPlaybackException: Source error")).toBe(true);
    expect(isExoPlayerSourceError("UnrecognizedInputFormatException: None of the available extractors could read the stream")).toBe(true);
    expect(isExoPlayerSourceError("ExtractorException: None of the available extractors")).toBe(true);
    expect(isExoPlayerSourceError("error_code_parsing_container_unsupported")).toBe(true);
    expect(isExoPlayerSourceError("error_code_decoding_format_unsupported")).toBe(true);
    expect(isExoPlayerSourceError("Media period failed to load track")).toBe(true);
  });

  it("detects localized Arabic extractor and source error messages", () => {
    expect(isExoPlayerSourceError("خطأ في المصدر: تعذر قراءة الحاوية")).toBe(true);
    expect(isExoPlayerSourceError("فشل في أدوات الاستخراج")).toBe(true);
  });

  it("does not trigger on unrelated errors", () => {
    expect(isExoPlayerSourceError("Network connection timeout")).toBe(false);
    expect(isExoPlayerSourceError("User cancelled playback")).toBe(false);
    expect(isExoPlayerSourceError(null)).toBe(false);
    expect(isExoPlayerSourceError(undefined)).toBe(false);
  });
});

describe("FFmpeg Extraction Layer - Strategy Selection", () => {
  it("selects transcode strategy for formats with legacy video/audio codecs (VOB, WMV, MPG)", () => {
    expect(getFfmpegExtractionStrategy("movie.vob")).toBe("transcode");
    expect(getFfmpegExtractionStrategy("movie.wmv")).toBe("transcode");
    expect(getFfmpegExtractionStrategy("movie.mpg")).toBe("transcode");
  });

  it("selects remux strategy for stream-copy candidate containers (FLV, AVI)", () => {
    expect(getFfmpegExtractionStrategy("stream.flv")).toBe("remux");
    expect(getFfmpegExtractionStrategy("clip.avi")).toBe("remux");
  });

  it("escalates to transcode when an ExoPlayer Source error is encountered", () => {
    expect(getFfmpegExtractionStrategy("video.mp4", "None of the available extractors could read the stream")).toBe("transcode");
  });

  it("shouldAttemptFfmpegExtraction triggers on legacy formats or Source errors", () => {
    expect(shouldAttemptFfmpegExtraction("test.flv")).toBe(true);
    expect(shouldAttemptFfmpegExtraction("test.vob")).toBe(true);
    expect(shouldAttemptFfmpegExtraction("test.mp4", "Source error")).toBe(true);
    expect(shouldAttemptFfmpegExtraction("test.mp4", "Network timeout")).toBe(false);
  });
});

describe("FFmpeg Extraction Layer - Cache Key and Path Resolution", () => {
  it("generates deterministic and stable hashes for URIs", () => {
    const uri1 = "file:///storage/emulated/0/Download/sample.flv";
    const uri2 = "file:///storage/emulated/0/Download/sample.flv";
    const uri3 = "file:///storage/emulated/0/Movies/sample.flv";

    expect(stableUriHash(uri1)).toBe(stableUriHash(uri2));
    expect(stableUriHash(uri1)).not.toBe(stableUriHash(uri3));
  });

  it("constructs an MP4 destination path containing the stable hash", () => {
    const uri = "file:///storage/emulated/0/Download/legacy.vob";
    const cacheUri = getExtractedCacheUri(uri);
    expect(cacheUri).toContain("remo-extracted-");
    expect(cacheUri.endsWith(".mp4")).toBe(true);
  });
});
