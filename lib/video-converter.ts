import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { extractAudioTrackNative, remuxToMp4Native } from './native-audio-controls';

export type ConversionProgress = {
  percent: number;
  currentBytes?: number;
  totalBytes?: number;
  stage?: string;
};

export type ConversionResult = {
  outputUri: string;
  fileName: string;
  savedToPhoneStorage: boolean;
  storagePath: string;
};

export type AudioFormat = 'mp3' | 'aac' | 'm4a' | 'wav' | 'flac' | 'ogg' | 'opus' | 'wma';

export type AudioQuality = '320k' | '256k' | '192k' | '128k' | '96k' | '64k';

export type AudioSampleRate = '44100' | '48000' | '96000';

export type AudioChannelMode = 'stereo' | 'mono';

export type VideoToAudioOptions = {
  format: AudioFormat;
  quality: AudioQuality;
  sampleRate?: AudioSampleRate;
  channels?: AudioChannelMode;
  customFileName?: string;
  title?: string;
  artist?: string;
};

export const AUDIO_FORMAT_OPTIONS: { id: AudioFormat; label: string; desc: string; ext: string; mime: string }[] = [
  { id: 'm4a', label: 'M4A / AAC (أصلي سريع)', desc: 'استخراج صوتي فوري وحقيقي عبر محرك Android', ext: 'm4a', mime: 'audio/mp4' },
  { id: 'mp3', label: 'MP3', desc: 'الأكثر توافقاً وشعبية مع جميع الأجهزة والأنظمة', ext: 'mp3', mime: 'audio/mpeg' },
  { id: 'aac', label: 'AAC', desc: 'ترميز متقدم بجودة استوديو وضغط فعال', ext: 'aac', mime: 'audio/aac' },
  { id: 'wav', label: 'WAV', desc: 'صوت خام فائق الدقة بدون أي ضغط (PCM)', ext: 'wav', mime: 'audio/wav' },
  { id: 'flac', label: 'FLAC', desc: 'صوت نقي فائق الجودة بدون فقدان بيانات (Lossless)', ext: 'flac', mime: 'audio/flac' },
  { id: 'ogg', label: 'OGG', desc: 'صيغة Ogg Vorbis مفتوحة ومتقدمة للأجهزة الحديثة', ext: 'ogg', mime: 'audio/ogg' },
  { id: 'opus', label: 'OPUS', desc: 'أحدث صيغ البث والتخزين بأعلى كفاءة ونقاء', ext: 'opus', mime: 'audio/opus' },
  { id: 'wma', label: 'WMA', desc: 'صيغة Windows Media Audio القياسية', ext: 'wma', mime: 'audio/x-ms-wma' },
];

export const AUDIO_QUALITY_OPTIONS: { id: AudioQuality; label: string; bitrate: string; desc: string }[] = [
  { id: '320k', label: '320 kbps', bitrate: '320k', desc: 'جودة فائقة (Ultra High) - صوت نقي للأجهزة الاحترافية' },
  { id: '256k', label: '256 kbps', bitrate: '256k', desc: 'جودة استوديو عالية جداً (Studio Quality)' },
  { id: '192k', label: '192 kbps', bitrate: '192k', desc: 'جودة ممتازة موصى بها (High Quality)' },
  { id: '128k', label: '128 kbps', bitrate: '128k', desc: 'جودة قياسية متوازنة بين النقاء والحجم (Standard)' },
  { id: '96k', label: '96 kbps', bitrate: '96k', desc: 'جودة متوسطة خفيفة الحجم للمشاركة السريعة' },
  { id: '64k', label: '64 kbps', bitrate: '64k', desc: 'جودة موفرة مناسبة للمحاضرات والتسجيلات الصوتية' },
];

export const AUDIO_SAMPLE_RATE_OPTIONS: { id: AudioSampleRate; label: string; desc: string }[] = [
  { id: '48000', label: '48.0 kHz', desc: 'التردد الافتراضي للفيديو والأفلام' },
  { id: '44100', label: '44.1 kHz', desc: 'تردد الأقراص المدمجة القياسي (CD Quality)' },
  { id: '96000', label: '96.0 kHz', desc: 'تردد عالي الدقة (Hi-Res Audio)' },
];

async function saveToPhoneMediaAlbum(outputUri: string, albumName: string): Promise<{ saved: boolean; storagePath: string }> {
  try {
    const existingPermissions = await MediaLibrary.getPermissionsAsync();
    const permission = existingPermissions.granted
      ? existingPermissions
      : await MediaLibrary.requestPermissionsAsync();

    if (permission.granted) {
      const asset = await MediaLibrary.createAssetAsync(outputUri);
      if (asset) {
        try {
          const album = await MediaLibrary.getAlbumAsync(albumName);
          if (!album) {
            await MediaLibrary.createAlbumAsync(albumName, asset, false);
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          }
        } catch {
          // Album creation optional
        }
        return { saved: true, storagePath: asset.uri || outputUri };
      }
    }
  } catch {
    // Permission declined or environment without native media gallery
  }
  return { saved: false, storagePath: outputUri };
}

/**
 * يحوّل الفيديو إلى حاوية MP4 حقيقية عبر محرك Android MediaMuxer أو FFmpeg عند توفره.
 */
export async function convertVideoToMp4(
  inputUri: string,
  fileName?: string,
  onProgress?: (progress: ConversionProgress) => void
): Promise<ConversionResult> {
  const baseName = (fileName || inputUri.split('/').pop() || 'video')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, '_');
  const outputFileName = `${baseName}_converted_${Date.now()}.mp4`;

  const baseDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
  const outputUri = `${baseDir}${outputFileName}`;

  let conversionSuccessful = false;

  onProgress?.({ percent: 18, stage: 'جاري فحص المسارات داخل الفيديو عبر محرك Android...' });

  // 1. Native Android MediaExtractor + MediaMuxer remux (100% real MP4 output)
  const nativeRemuxed = await remuxToMp4Native(inputUri, outputUri);
  if (nativeRemuxed) {
    conversionSuccessful = true;
    onProgress?.({ percent: 88, stage: 'تم بناء حاوية MP4 القياسية بنجاح...' });
  }

  // 2. Fallback to FFmpegKit if linked in build for legacy incompatible codecs
  if (!conversionSuccessful) {
    try {
      // @ts-ignore
      const ffmpegModule = await import('ffmpeg-kit-react-native').catch(() => null);
      if (ffmpegModule && ffmpegModule.FFmpegKit) {
        const { FFmpegKit, ReturnCode } = ffmpegModule;
        const command = `-y -i "${inputUri}" -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -g 48 -keyint_min 48 -sc_threshold 0 -c:a aac -b:a 128k -movflags +faststart "${outputUri}"`;

        await new Promise<void>((resolve, reject) => {
          FFmpegKit.executeAsync(
            command,
            async (session: any) => {
              const returnCode = await session.getReturnCode();
              if (ReturnCode.isSuccess(returnCode)) {
                conversionSuccessful = true;
                resolve();
              } else {
                reject(new Error('تعذر تحويل هذا الترميز عبر محرك التحويل.'));
              }
            },
            () => {},
            (statistics: any) => {
              if (onProgress && statistics) {
                const totalBytes = statistics.getSize ? statistics.getSize() : 0;
                const currentBytes = statistics.getTime ? statistics.getTime() : 0;
                const percent = totalBytes > 0 ? Math.min(99, (currentBytes / totalBytes) * 100) : 55;
                onProgress({ percent, currentBytes, totalBytes, stage: 'جارٍ تحويل وترميز الفيديو إلى MP4...' });
              }
            }
          );
        });
      }
    } catch {
      // No ffmpeg-kit linked
    }
  }

  if (!conversionSuccessful) {
    await FileSystem.deleteAsync(outputUri, { idempotent: true }).catch(() => undefined);
    throw new Error('ترميز هذا الملف غير مدعوم في محرك التغليف المباشر لنظام Android؛ يمكنك تشغيله فوراً عبر محرك التوافق VLC في مشغل الفيديو.');
  }

  onProgress?.({ percent: 100, stage: 'تم التحويل! جارٍ الحفظ في ذاكرة تخزين الهاتف...' });

  const mediaSaved = await saveToPhoneMediaAlbum(outputUri, 'REMO Converted');
  return {
    outputUri,
    fileName: outputFileName,
    savedToPhoneStorage: mediaSaved.saved,
    storagePath: mediaSaved.storagePath,
  };
}

/**
 * يستخرج المسار الصوتي الحقيقي من الفيديو (عبر Android MediaExtractor/MediaMuxer بصيغة M4A
 * أو عبر FFmpegKit لباقي الصيغ عند توفره) ويحفظه في مكتبة الهاتف.
 */
export async function convertVideoToAudio(
  inputUri: string,
  options: VideoToAudioOptions,
  onProgress?: (progress: ConversionProgress) => void
): Promise<ConversionResult> {
  const {
    format = 'm4a',
    quality = '320k',
    sampleRate = '48000',
    channels = 'stereo',
    customFileName,
    title,
    artist,
  } = options;

  const rawBase = customFileName || title || inputUri.split('/').pop() || 'audio_track';
  const baseName = rawBase
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, '_');

  const baseDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
  let finalFileName = `${baseName}_${quality}.${format.toLowerCase()}`;
  let outputUri = `${baseDir}${finalFileName}`;
  let conversionSuccessful = false;

  onProgress?.({ percent: 22, stage: 'جاري قراءة المسار الصوتي الحقيقي من الفيديو...' });

  // 1. FFmpegKit if linked (supports all target formats)
  try {
    // @ts-ignore
    const ffmpegModule = await import('ffmpeg-kit-react-native').catch(() => null);
    if (ffmpegModule && ffmpegModule.FFmpegKit) {
      const { FFmpegKit, ReturnCode } = ffmpegModule;
      let codecArgs = `-c:a libmp3lame -b:a ${quality}`;
      switch (format) {
        case 'm4a':
        case 'aac':
          codecArgs = `-c:a aac -b:a ${quality}`;
          break;
        case 'wav':
          codecArgs = '-c:a pcm_s16le';
          break;
        case 'flac':
          codecArgs = '-c:a flac';
          break;
        case 'ogg':
          codecArgs = `-c:a libvorbis -b:a ${quality}`;
          break;
        case 'opus':
          codecArgs = `-c:a libopus -b:a ${quality}`;
          break;
        case 'wma':
          codecArgs = `-c:a wmav2 -b:a ${quality}`;
          break;
      }
      const channelArg = channels === 'mono' ? '-ac 1' : '-ac 2';
      const sampleRateArg = sampleRate ? `-ar ${sampleRate}` : '';
      const metaTitle = title ? `-metadata title="${title.replace(/"/g, '')}"` : '';
      const metaArtist = artist ? `-metadata artist="${artist.replace(/"/g, '')}"` : '';
      const command = `-y -i "${inputUri}" -vn ${codecArgs} ${channelArg} ${sampleRateArg} ${metaTitle} ${metaArtist} "${outputUri}"`;

      await new Promise<void>((resolve, reject) => {
        FFmpegKit.executeAsync(
          command,
          async (session: any) => {
            const returnCode = await session.getReturnCode();
            if (ReturnCode.isSuccess(returnCode)) {
              conversionSuccessful = true;
              resolve();
            } else {
              reject(new Error('فشل استخراج الصوت عبر محرك الترميز.'));
            }
          },
          () => {},
          (statistics: any) => {
            if (onProgress && statistics) {
              const totalBytes = statistics.getSize ? statistics.getSize() : 0;
              const currentBytes = statistics.getTime ? statistics.getTime() : 0;
              const percent = totalBytes > 0 ? Math.min(99, (currentBytes / totalBytes) * 100) : 55;
              onProgress({
                percent,
                currentBytes,
                totalBytes,
                stage: `جارٍ استخراج الصوت وترميزه إلى ${format.toUpperCase()} (${quality})...`,
              });
            }
          }
        );
      });
    }
  } catch {
    // Try native Android MediaExtractor + MediaMuxer next
  }

  // 2. Native Android MediaExtractor + MediaMuxer audio extraction into real .m4a container
  if (!conversionSuccessful) {
    finalFileName = `${baseName}_${Date.now()}.m4a`;
    outputUri = `${baseDir}${finalFileName}`;
    onProgress?.({ percent: 55, stage: 'جاري فصل المسار الصوتي الأصلي إلى ملف M4A عبر Android...' });
    const extracted = await extractAudioTrackNative(inputUri, outputUri);
    if (extracted) {
      conversionSuccessful = true;
    }
  }

  if (!conversionSuccessful) {
    await FileSystem.deleteAsync(outputUri, { idempotent: true }).catch(() => undefined);
    throw new Error('لا يحتوي الفيديو على مسار صوتي متوافق مع مستخرج Android المباشر، أو أن البيئة الحالية لا تدعم الاستخراج.');
  }

  onProgress?.({ percent: 100, stage: 'اكتمل استخراج الصوت الحقيقي! جارٍ الحفظ في المكتبة...' });

  const mediaSaved = await saveToPhoneMediaAlbum(outputUri, 'REMO Audio');
  return {
    outputUri,
    fileName: finalFileName,
    savedToPhoneStorage: mediaSaved.saved,
    storagePath: mediaSaved.storagePath,
  };
}
