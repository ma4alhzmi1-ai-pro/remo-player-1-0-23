import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  ActivityIndicator,
  Alert,
  BackHandler,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMediaSession } from '@/hooks/useMediaSession';
import { MaterialIcons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors } from '@/constants/colors';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get('window');

export default function VideoPlayerScreen() {
  const router = useRouter();
  const { currentItem, closeMediaSession } = useMediaSession();
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // التحقق من وجود مقطع فيديو
  if (!currentItem || currentItem.mediaType !== 'video') {
    return (
      <ScreenContainer>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>لا يوجد مقطع فيديو محدد.</Text>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>العودة</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  // تحميل الفيديو عند تغيير المقطع أو إعادة المحاولة
  useEffect(() => {
    const loadVideo = async () => {
      setLoading(true);
      setError(null);
      try {
        const uri = currentItem.uri;
        // التحقق من وجود الملف
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) {
          throw new Error('الملف غير موجود على الجهاز');
        }

        // تشغيل الفيديو
        await videoRef.current?.loadAsync(
          { uri },
          { shouldPlay: true, resizeMode: ResizeMode.CONTAIN }
        );
        setLoading(false);
      } catch (err: any) {
        console.error('Video loading error:', err);
        setError(err.message || 'حدث خطأ أثناء تحميل الفيديو');
        setLoading(false);
      }
    };

    loadVideo();
  }, [currentItem, retryCount]);

  // معالج ضغط زر الرجوع
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      closeMediaSession();
      router.back();
      return true;
    });
    return () => backHandler.remove();
  }, [closeMediaSession, router]);

  // عند تغيير حالة التشغيل
  const handlePlaybackStatusUpdate = (newStatus: AVPlaybackStatus) => {
    setStatus(newStatus);
    if (newStatus.isLoaded && newStatus.isPlaying) {
      setLoading(false);
    }
    if (newStatus.isLoaded && newStatus.didJustFinish) {
      // انتهى الفيديو
      videoRef.current?.replayAsync();
    }
  };

  // التحكم في التشغيل
  const togglePlayPause = () => {
    if (status?.isLoaded) {
      status.isPlaying
        ? videoRef.current?.pauseAsync()
        : videoRef.current?.playAsync();
    }
  };

  // التقديم السريع
  const seek = async (seconds: number) => {
    if (status?.isLoaded && status.durationMillis) {
      const newPos = Math.min(
        Math.max((status.positionMillis || 0) + seconds * 1000, 0),
        status.durationMillis
      );
      await videoRef.current?.setPositionAsync(newPos);
    }
  };

  // إعادة المحاولة
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  // عرض شاشة الخطأ
  if (error) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>تعذر تشغيل الفيديو</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Pressable onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} style={styles.backButtonSmall}>
            <Text style={styles.backButtonText}>العودة</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  // العرض الرئيسي
  return (
    <ScreenContainer>
      <View style={styles.container}>
        {/* عنصر الفيديو */}
        <Video
          ref={videoRef}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          useNativeControls
        />

        {/* مؤشر التحميل */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.cyan} />
            <Text style={styles.loadingText}>جاري تحميل الفيديو...</Text>
          </View>
        )}

        {/* أزرار التحكم المخصصة (اختياري) - يمكن إزالتها واستخدام عناصر التحكم الأصلية */}
        {!loading && status?.isLoaded && (
          <View style={styles.controlsOverlay}>
            <View style={styles.controlsRow}>
              <Pressable onPress={() => seek(-10)} style={styles.controlBtn}>
                <MaterialIcons name="replay-10" size={32} color="#fff" />
              </Pressable>
              <Pressable onPress={togglePlayPause} style={styles.playBtn}>
                <MaterialIcons
                  name={status.isPlaying ? 'pause' : 'play-arrow'}
                  size={48}
                  color="#fff"
                />
              </Pressable>
              <Pressable onPress={() => seek(10)} style={styles.controlBtn}>
                <MaterialIcons name="forward-10" size={32} color="#fff" />
              </Pressable>
            </View>
          </View>
        )}

        {/* زر الإغلاق في الأعلى */}
        <Pressable onPress={closeMediaSession} style={styles.closeButton}>
          <MaterialIcons name="arrow-back" size={28} color="#fff" />
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: width,
    height: height,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 40,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 24,
  },
  controlBtn: {
    padding: 8,
  },
  playBtn: {
    padding: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 30,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: colors.text,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: colors.cyan,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  errorTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 12,
  },
  errorMessage: {
    color: colors.muted,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.cyan,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButtonSmall: {
    backgroundColor: '#2A3542',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
});
