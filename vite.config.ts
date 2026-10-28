import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'expo-file-system/legacy': path.resolve(__dirname, 'repo_temp/tests/mocks/expo-file-system.ts'),
        'expo-file-system': path.resolve(__dirname, 'repo_temp/tests/mocks/expo-file-system.ts'),
        '@react-native-async-storage/async-storage': path.resolve(__dirname, 'repo_temp/tests/mocks/async-storage.ts'),
        'react-native': path.resolve(__dirname, 'repo_temp/tests/mocks/react-native.ts'),
        'expo-secure-store': path.resolve(__dirname, 'repo_temp/tests/mocks/expo-secure-store.ts'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
