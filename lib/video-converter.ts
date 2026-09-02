import { FFmpegKit, ReturnCode, Statistics } from 'ffmpeg-kit-react-native';

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

  return new Promise((resolve, reject) => {
    const session = FFmpegKit.executeAsync(
      command,
      async (session) => {
        const returnCode = await session.getReturnCode();
        if (ReturnCode.isSuccess(returnCode)) {
          resolve(outputUri);
        } else {
          reject(new Error('فشل التحويل. تأكد من سلامة الملف الأصلي.'));
        }
      },
      (log) => {},
      (statistics: Statistics) => {
        if (onProgress && statistics) {
          const totalBytes = statistics.getSize();
          const currentBytes = statistics.getTime();
          const percent = totalBytes > 0 ? Math.min(100, (currentBytes / totalBytes) * 100) : 0;
          onProgress({ percent, currentBytes, totalBytes });
        }
      }
    );
  });
}
