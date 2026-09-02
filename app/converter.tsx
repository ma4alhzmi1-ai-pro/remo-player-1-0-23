import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { convertVideoToMp4 } from '@/lib/video-converter';
import { isConvertibleFormat } from '@/lib/media-utils';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors } from '@/constants/colors';

export default function ConverterScreen() {
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const pickAndConvert = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;
      const asset = result.assets[0];

      if (!isConvertibleFormat(asset.name)) {
        Alert.alert('صيغة غير مدعومة للتحويل', 'اختر ملف فيديو بصيغة قابلة للتحويل.');
        return;
      }

      setSelectedFile(asset.name);
      setConverting(true);
      setProgress(0);

      const outputUri = await convertVideoToMp4(asset.uri, (prog) => {
        setProgress(prog.percent);
      });

      Alert.alert('تم التحويل بنجاح', `تم حفظ الملف المحول في:\n${outputUri}`);
    } catch (error) {
      Alert.alert('خطأ في التحويل', error instanceof Error ? error.message : 'تعذر إتمام التحويل.');
    } finally {
      setConverting(false);
      setSelectedFile(null);
      setProgress(0);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>تحويل صيغ الفيديو</Text>
        <Text style={styles.subtitle}>
          اختر ملف فيديو بصيغة غير مدعومة (مثل FLV, AVI, MKV...) وسيتم تحويله إلى MP4.
        </Text>

        <Pressable
          onPress={pickAndConvert}
          style={styles.pickButton}
          disabled={converting}
        >
          {converting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.pickButtonText}>اختر ملف للتحويل</Text>
          )}
        </Pressable>

        {selectedFile && (
          <Text style={styles.fileName}>جارٍ تحويل: {selectedFile}</Text>
        )}

        {converting && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress.toFixed(1)}%</Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
  },
  pickButton: {
    backgroundColor: colors.cyan,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  pickButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fileName: {
    color: colors.text,
    marginTop: 20,
    fontSize: 14,
  },
  progressContainer: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#2A3542',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.cyan,
  },
  progressText: {
    color: colors.text,
    marginTop: 5,
    fontSize: 12,
  },
});
