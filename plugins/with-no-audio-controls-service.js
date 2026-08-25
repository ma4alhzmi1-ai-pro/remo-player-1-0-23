const { AndroidConfig, withAndroidManifest } = require("@expo/config-plugins");

const AUDIO_CONTROLS_SERVICE = "expo.modules.audio.service.AudioControlsService";

/**
 * REMO PLAYER does not use expo-audio lock-screen controls. Removing its optional
 * media-session service prevents Android from creating a foreground media session
 * from this app when a player is released or the app transitions between screens.
 */
module.exports = function withNoAudioControlsService(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = AndroidConfig.Manifest.ensureToolsAvailable(config.modResults);
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
    const services = application.service ?? [];
    const alreadyRemoved = services.some(
      (service) => service.$?.["android:name"] === AUDIO_CONTROLS_SERVICE,
    );

    if (!alreadyRemoved) {
      services.push({
        $: {
          "android:name": AUDIO_CONTROLS_SERVICE,
          "tools:node": "remove",
        },
      });
    }

    application.service = services;
    config.modResults = manifest;
    return config;
  });
};
