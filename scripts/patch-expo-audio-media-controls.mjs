import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const sourceRoot = resolve(root, "node_modules/expo-audio/android/src/main/java/expo/modules/audio");

function patchFile(relativePath, replacements) {
  const path = resolve(sourceRoot, relativePath);
  let source = readFileSync(path, "utf8");
  for (const [before, after] of replacements) {
    if (source.includes(after)) continue;
    if (!source.includes(before)) {
      throw new Error(`لم يُعثر على موضع التصحيح المتوقع: ${relativePath}`);
    }
    source = source.replace(before, after);
  }
  writeFileSync(path, source);
}

patchFile("AudioRecords.kt", [[
  `class AudioLockScreenOptions(\n  @Field val showSeekForward: Boolean,\n  @Field val showSeekBackward: Boolean\n) : Record`,
  `class AudioLockScreenOptions(\n  @Field val showSeekForward: Boolean,\n  @Field val showSeekBackward: Boolean,\n  @Field val showSkipNext: Boolean = false,\n  @Field val showSkipPrevious: Boolean = false\n) : Record`,
]]);

patchFile("AudioPlayer.kt", [
  [
    `private const val AUDIO_SAMPLE_UPDATE = "audioSampleUpdate"\n`,
    `private const val AUDIO_SAMPLE_UPDATE = "audioSampleUpdate"\nprivate const val MEDIA_CONTROL_ACTION = "mediaControlAction"\n`,
  ],
  [
    `  private fun startUpdating() {`,
    `  fun emitMediaControlAction(action: String) {\n    playerScope.launch {\n      withContext(Dispatchers.Main) {\n        emit(MEDIA_CONTROL_ACTION, mapOf("action" to action))\n      }\n    }\n  }\n\n  private fun startUpdating() {`,
  ],
]);

patchFile("AudioModule.kt", [
  [
    `      val requestType = if (interruptionMode == InterruptionMode.DO_NOT_MIX) {\n        AudioManager.AUDIOFOCUS_GAIN_TRANSIENT\n      } else {\n        AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK\n      }`,
    `      val requestType = if (staysActiveInBackground) {\n        AudioManager.AUDIOFOCUS_GAIN\n      } else if (interruptionMode == InterruptionMode.DO_NOT_MIX) {\n        AudioManager.AUDIOFOCUS_GAIN_TRANSIENT\n      } else {\n        AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK\n      }`,
  ],
  [
    `      val requestType = if (interruptionMode == InterruptionMode.DO_NOT_MIX) {\n        AudioManager.AUDIOFOCUS_GAIN_TRANSIENT\n      } else {\n        AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK\n      }\n      audioManager.requestAudioFocus(audioFocusChangeListener, AudioManager.STREAM_MUSIC, requestType)`,
    `      val requestType = if (staysActiveInBackground) {\n        AudioManager.AUDIOFOCUS_GAIN\n      } else if (interruptionMode == InterruptionMode.DO_NOT_MIX) {\n        AudioManager.AUDIOFOCUS_GAIN_TRANSIENT\n      } else {\n        AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK\n      }\n      audioManager.requestAudioFocus(audioFocusChangeListener, AudioManager.STREAM_MUSIC, requestType)`,
  ],
  [
    `    OnDestroy {\n      appContext.mainQueue.launch {\n        releaseAudioFocus()\n        players.values.forEach {\n          it.ref.stop()\n        }\n\n        recorders.values.forEach {\n          it.stopRecording()\n        }\n\n        AudioControlsService.clearSession()\n      }\n    }`,
    `    OnDestroy {\n      appContext.mainQueue.launch {\n        // لا يوقف الخروج من الواجهة موسيقى نشطة تملك جلسة شاشة القفل.\n        // يستمر AudioControlsService كخدمة foreground للموسيقى فقط.\n        val hasBackgroundMusic = staysActiveInBackground && players.values.any {\n          it.isActiveForLockScreen && it.ref.isPlaying\n        }\n        if (!hasBackgroundMusic) {\n          releaseAudioFocus()\n          players.values.forEach {\n            it.ref.stop()\n          }\n          AudioControlsService.clearSession()\n        }\n\n        recorders.values.forEach {\n          it.stopRecording()\n        }\n      }\n    }`,
  ],
]);

patchFile("service/AudioControlsService.kt", [
  [
    `      ACTION_SEEK_BACKWARD -> withPlayerOnAppThread { player ->\n        player.seekTo(player.currentPosition - SEEK_INTERVAL_MS)\n      }\n    }`,
    `      ACTION_SEEK_BACKWARD -> withPlayerOnAppThread { player ->\n        player.seekTo(player.currentPosition - SEEK_INTERVAL_MS)\n      }\n\n      ACTION_SKIP_NEXT -> dispatchQueueActionInternal("next")\n      ACTION_SKIP_PREVIOUS -> dispatchQueueActionInternal("previous")\n    }`,
  ],
  [
    `  private fun updateSessionCustomLayout(isPlaying: Boolean) {\n    val session = mediaSession ?: return\n    val customLayout = mutableListOf<CommandButton>()\n\n    // Add seek backward button if enabled\n    if (currentOptions?.showSeekBackward == true) {\n      customLayout.add(\n        CommandButton.Builder(CommandButton.ICON_SKIP_BACK)\n          .setDisplayName("Seek Backward")\n          .setEnabled(true)\n          .setSessionCommand(SessionCommand(ACTION_SEEK_BACKWARD, Bundle.EMPTY))\n          .build()\n      )\n    }\n\n    // Add play/pause button (always present)\n    customLayout.add(\n      CommandButton.Builder(if (isPlaying) CommandButton.ICON_PAUSE else CommandButton.ICON_PLAY)\n        .setDisplayName(if (isPlaying) "Pause" else "Play")\n        .setEnabled(true)\n        .setPlayerCommand(Player.COMMAND_PLAY_PAUSE)\n        .build()\n    )\n\n    // Add seek forward button if enabled\n    if (currentOptions?.showSeekForward == true) {\n      customLayout.add(\n        CommandButton.Builder(CommandButton.ICON_SKIP_FORWARD)\n          .setDisplayName("Seek Forward")\n          .setEnabled(true)\n          .setSessionCommand(SessionCommand(ACTION_SEEK_FORWARD, Bundle.EMPTY))\n          .build()\n      )\n    }\n\n    session.setCustomLayout(customLayout)\n  }`,
    `  private fun updateSessionCustomLayout(isPlaying: Boolean) {\n    val session = mediaSession ?: return\n    val customLayout = mutableListOf<CommandButton>()\n\n    if (currentOptions?.showSkipPrevious == true) {\n      customLayout.add(\n        CommandButton.Builder(CommandButton.ICON_PREVIOUS)\n          .setDisplayName("Previous track")\n          .setEnabled(true)\n          .setSessionCommand(SessionCommand(ACTION_SKIP_PREVIOUS, Bundle.EMPTY))\n          .build()\n      )\n    }\n\n    customLayout.add(\n      CommandButton.Builder(if (isPlaying) CommandButton.ICON_PAUSE else CommandButton.ICON_PLAY)\n        .setDisplayName(if (isPlaying) "Pause" else "Play")\n        .setEnabled(true)\n        .setPlayerCommand(Player.COMMAND_PLAY_PAUSE)\n        .build()\n    )\n\n    if (currentOptions?.showSkipNext == true) {\n      customLayout.add(\n        CommandButton.Builder(CommandButton.ICON_NEXT)\n          .setDisplayName("Next track")\n          .setEnabled(true)\n          .setSessionCommand(SessionCommand(ACTION_SKIP_NEXT, Bundle.EMPTY))\n          .build()\n      )\n    }\n\n    if (currentOptions?.showSeekBackward == true) {\n      customLayout.add(\n        CommandButton.Builder(CommandButton.ICON_SKIP_BACK)\n          .setDisplayName("Seek Backward")\n          .setEnabled(true)\n          .setSessionCommand(SessionCommand(ACTION_SEEK_BACKWARD, Bundle.EMPTY))\n          .build()\n      )\n    }\n\n    if (currentOptions?.showSeekForward == true) {\n      customLayout.add(\n        CommandButton.Builder(CommandButton.ICON_SKIP_FORWARD)\n          .setDisplayName("Seek Forward")\n          .setEnabled(true)\n          .setSessionCommand(SessionCommand(ACTION_SEEK_FORWARD, Bundle.EMPTY))\n          .build()\n      )\n    }\n\n    session.setCustomLayout(customLayout)\n  }`,
  ],
  [
    `  private fun withPlayerOnAppThread(block: (Player) -> Unit) {`,
    `  private fun dispatchQueueActionInternal(action: String) {\n    currentPlayer?.emitMediaControlAction(action)\n  }\n\n  private fun withPlayerOnAppThread(block: (Player) -> Unit) {`,
  ],
  [
    `    const val ACTION_SEEK_FORWARD = "expo.modules.audio.action.SEEK_FORWARD"\n    const val ACTION_SEEK_BACKWARD = "expo.modules.audio.action.SEEK_REWIND"`,
    `    const val ACTION_SEEK_FORWARD = "expo.modules.audio.action.SEEK_FORWARD"\n    const val ACTION_SEEK_BACKWARD = "expo.modules.audio.action.SEEK_REWIND"\n    const val ACTION_SKIP_NEXT = "expo.modules.audio.action.SKIP_NEXT"\n    const val ACTION_SKIP_PREVIOUS = "expo.modules.audio.action.SKIP_PREVIOUS"`,
  ],
  [
    `    fun updateMetadata(player: AudioPlayer, metadata: Metadata?) {`,
    `    fun dispatchQueueAction(action: String) {\n      getInstance()?.dispatchQueueActionInternal(action)\n    }\n\n    fun updateMetadata(player: AudioPlayer, metadata: Metadata?) {`,
  ],
]);

patchFile("service/AudioMediaSessionCallback.kt", [
  [
    `            .add(SessionCommand(AudioControlsService.ACTION_SEEK_BACKWARD, Bundle.EMPTY))\n            .add(SessionCommand(AudioControlsService.ACTION_SEEK_FORWARD, Bundle.EMPTY))`,
    `            .add(SessionCommand(AudioControlsService.ACTION_SEEK_BACKWARD, Bundle.EMPTY))\n            .add(SessionCommand(AudioControlsService.ACTION_SEEK_FORWARD, Bundle.EMPTY))\n            .add(SessionCommand(AudioControlsService.ACTION_SKIP_PREVIOUS, Bundle.EMPTY))\n            .add(SessionCommand(AudioControlsService.ACTION_SKIP_NEXT, Bundle.EMPTY))`,
  ],
  [
    `      AudioControlsService.ACTION_SEEK_BACKWARD -> {\n        session.player.seekTo(session.player.currentPosition - AudioControlsService.SEEK_INTERVAL_MS)\n      }\n    }`,
    `      AudioControlsService.ACTION_SEEK_BACKWARD -> {\n        session.player.seekTo(session.player.currentPosition - AudioControlsService.SEEK_INTERVAL_MS)\n      }\n      AudioControlsService.ACTION_SKIP_PREVIOUS -> AudioControlsService.dispatchQueueAction("previous")\n      AudioControlsService.ACTION_SKIP_NEXT -> AudioControlsService.dispatchQueueAction("next")\n    }`,
  ],
]);

console.log("تم تطبيق تصحيح تحكمات إشعار Expo Audio.");
