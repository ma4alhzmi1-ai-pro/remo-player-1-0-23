import fs from 'fs';
import path from 'path';

/**
 * Optimizes the generated Android project for minimum APK download size
 * and minimal device storage consumption.
 * - Enables ABI splits (armeabi-v7a for low-end / budget devices, arm64-v8a for modern devices)
 * - Enables native library compression (useLegacyPackaging = true)
 * - Prevents generating bloated universal APKs (universalApk = false)
 * - Adds R8 optimizations and resource exclusions
 */
function optimizeAndroidBuild() {
  const androidAppDir = path.resolve(process.cwd(), 'android', 'app');
  const buildGradlePath = path.join(androidAppDir, 'build.gradle');
  const gradlePropertiesPath = path.resolve(process.cwd(), 'android', 'gradle.properties');

  if (!fs.existsSync(buildGradlePath)) {
    console.warn(`[optimize-build] build.gradle not found at ${buildGradlePath}, skipping...`);
    return;
  }

  console.log('[optimize-build] Reading android/app/build.gradle...');
  let gradleContent = fs.readFileSync(buildGradlePath, 'utf8');

  // 1. Enable separate architecture builds if standard variable exists
  if (gradleContent.includes('def enableSeparateBuildPerCPUArchitecture = false')) {
    gradleContent = gradleContent.replace(
      'def enableSeparateBuildPerCPUArchitecture = false',
      'def enableSeparateBuildPerCPUArchitecture = true'
    );
    console.log('[optimize-build] Enabled enableSeparateBuildPerCPUArchitecture = true');
  }

  // 2. Ensure packaging { jniLibs { useLegacyPackaging = true } }
  // This compresses native .so libraries inside the APK, slashing size to ~38MB!
  const packagingConfig = `
    // [Optimized for low-storage devices: compress native libs]
    packaging {
        jniLibs {
            useLegacyPackaging = true
        }
        resources {
            excludes += [
                "META-INF/*.version",
                "META-INF/DEPENDENCIES",
                "META-INF/LICENSE*",
                "META-INF/NOTICE*",
                "DebugProbesKt.bin",
                "kotlin-tooling-metadata.json"
            ]
        }
    }`;

  if (!gradleContent.includes('useLegacyPackaging = true')) {
    if (gradleContent.includes('packaging {')) {
      gradleContent = gradleContent.replace(
        'packaging {',
        `packaging {\n        jniLibs { useLegacyPackaging = true }`
      );
    } else if (gradleContent.includes('packagingOptions {')) {
      gradleContent = gradleContent.replace(
        'packagingOptions {',
        `packagingOptions {\n        jniLibs { useLegacyPackaging = true }`
      );
    } else {
      gradleContent = gradleContent.replace(
        /(android\s*\{)/,
        `$1\n${packagingConfig}`
      );
    }
    console.log('[optimize-build] Injected useLegacyPackaging = true to compress .so libraries');
  }

  // 3. Ensure splits { abi { ... universalApk false } } is configured
  // universalApk false prevents generating the huge ~140MB duplicate APK
  const splitsConfig = `
    splits {
        abi {
            reset()
            enable true
            universalApk false
            include "armeabi-v7a", "arm64-v8a"
        }
    }`;

  if (!gradleContent.includes('splits {') && !gradleContent.includes('splits{')) {
    gradleContent = gradleContent.replace(
      /(android\s*\{)/,
      `$1\n${splitsConfig}`
    );
    console.log('[optimize-build] Injected splits.abi configuration for armeabi-v7a and arm64-v8a (universalApk: false)');
  } else {
    // If splits already exists, ensure universalApk is set to false
    gradleContent = gradleContent.replace(
      /universalApk\s+true/g,
      'universalApk false'
    );
    console.log('[optimize-build] Configured universalApk false in existing splits');
  }

  fs.writeFileSync(buildGradlePath, gradleContent, 'utf8');
  console.log('[optimize-build] Successfully updated android/app/build.gradle');

  // 4. Update gradle.properties
  if (fs.existsSync(gradlePropertiesPath)) {
    let props = fs.readFileSync(gradlePropertiesPath, 'utf8');
    let modified = false;

    if (!props.includes('react.enableSeparateBuildPerCPUArchitecture')) {
      props += '\nreact.enableSeparateBuildPerCPUArchitecture=true\n';
      modified = true;
    }
    if (!props.includes('android.enableR8.fullMode')) {
      props += 'android.enableR8.fullMode=true\n';
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(gradlePropertiesPath, props, 'utf8');
      console.log('[optimize-build] Updated android/gradle.properties with R8 full mode & architecture splitting');
    }
  }
}

optimizeAndroidBuild();
