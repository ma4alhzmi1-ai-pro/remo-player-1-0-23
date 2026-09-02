export type ConversionProgress = {
  percent: number;
  currentBytes: number;
  totalBytes: number;
};

export async function convertVideoToMp4(
  inputUri: string,
  onProgress?: (progress: ConversionProgress) => void
): Promise<string> {
  const outputUri = inputUri.replace(/\.[^.]+$/, '') + '_converted.mp4';
  const command = `-i "${inputUri}" -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k -movflags +faststart "${outputUri}"`;

  try {
    // Dynamic import to prevent crash when native ffmpeg-kit is not bundled
    // @ts-ignore
    const ffmpegModule = await import('ffmpeg-kit-react-native').catch(() => null);
    if (!ffmpegModule || !ffmpegModule.FFmpegKit) {
      throw new Error('ميزة التحويل تتطلب مكتبة FFmpeg الأصلية. صيغة هذا الفيديو مدعومة للتشغيل المباشر داخل مشغل REMO PLAYER.');
    }

    const { FFmpegKit, ReturnCode } = ffmpegModule;

    return new Promise((resolve, reject) => {
      FFmpegKit.executeAsync(
        command,
        async (session: any) => {
          const returnCode = await session.getReturnCode();
          if (ReturnCode.isSuccess(returnCode)) {
            resolve(outputUri);
          } else {
            reject(new Error('فشل التحويل. تأكد من سلامة الملف الأصلي.'));
          }
        },
        () => {},
        (statistics: any) => {
          if (onProgress && statistics) {
            const totalBytes = statistics.getSize ? statistics.getSize() : 0;
            const currentBytes = statistics.getTime ? statistics.getTime() : 0;
            const percent = totalBytes > 0 ? Math.min(100, (currentBytes / totalBytes) * 100) : 0;
            onProgress({ percent, currentBytes, totalBytes });
          }
        }
      );
    });
  } catch (err: any) {
    throw new Error(err?.message || 'فشل التحويل. تأكد من سلامة الملف الأصلي.');
  }
}
