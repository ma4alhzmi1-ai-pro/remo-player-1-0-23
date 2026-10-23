import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const sourceRoot = resolve(root, "node_modules/expo-video/android/src/main/java/expo/modules/video");

if (!existsSync(sourceRoot)) {
  console.log("expo-video android source not found, skipping patch");
  process.exit(0);
}

function patchFile(relativePath, replacements) {
  const path = resolve(sourceRoot, relativePath);
  if (!existsSync(path)) return;
  let source = readFileSync(path, "utf8");
  for (const [before, after] of replacements) {
    if (source.includes(after)) continue;
    if (!source.includes(before)) {
      console.warn(`[patch-expo-video] Pattern not found in ${relativePath}, skipping this hunk.`);
      continue;
    }
    source = source.replace(before, after);
  }
  writeFileSync(path, source);
}

// 1. VideoMediaSessionCallback.kt
patchFile("playbackService/VideoMediaSessionCallback.kt", [
  [
    `            .add(Player.COMMAND_SEEK_FORWARD)\n            .add(Player.COMMAND_SEEK_BACK)\n            .build()`,
    `            .add(Player.COMMAND_SEEK_FORWARD)\n            .add(Player.COMMAND_SEEK_BACK)\n            .add(Player.COMMAND_SEEK_TO_NEXT)\n            .add(Player.COMMAND_SEEK_TO_PREVIOUS)\n            .build()`,
  ],
  [
    `            .add(SessionCommand(ExpoVideoPlaybackService.SEEK_BACKWARD_COMMAND, Bundle.EMPTY))\n            .add(SessionCommand(ExpoVideoPlaybackService.SEEK_FORWARD_COMMAND, Bundle.EMPTY))\n            .build()`,
    `            .add(SessionCommand(ExpoVideoPlaybackService.SEEK_BACKWARD_COMMAND, Bundle.EMPTY))\n            .add(SessionCommand(ExpoVideoPlaybackService.SEEK_FORWARD_COMMAND, Bundle.EMPTY))\n            .add(SessionCommand(ExpoVideoPlaybackService.SKIP_NEXT_COMMAND, Bundle.EMPTY))\n            .add(SessionCommand(ExpoVideoPlaybackService.SKIP_PREVIOUS_COMMAND, Bundle.EMPTY))\n            .build()`,
  ],
  [
    `      ExpoVideoPlaybackService.SEEK_BACKWARD_COMMAND -> session.player.seekTo(session.player.currentPosition - ExpoVideoPlaybackService.SEEK_INTERVAL_MS)\n    }`,
    `      ExpoVideoPlaybackService.SEEK_BACKWARD_COMMAND -> session.player.seekTo(session.player.currentPosition - ExpoVideoPlaybackService.SEEK_INTERVAL_MS)\n      ExpoVideoPlaybackService.SKIP_NEXT_COMMAND -> ExpoVideoPlaybackService.dispatchMediaAction("next", session.player)\n      ExpoVideoPlaybackService.SKIP_PREVIOUS_COMMAND -> ExpoVideoPlaybackService.dispatchMediaAction("previous", session.player)\n    }`,
  ],
  [
    `  override fun onCustomCommand(session: MediaSession, controller: MediaSession.ControllerInfo, customCommand: SessionCommand, args: Bundle): ListenableFuture<SessionResult> {`,
    `  override fun onPlayerCommandRequest(session: MediaSession, controller: MediaSession.ControllerInfo, playerCommand: Int): Int {\n    if (playerCommand == Player.COMMAND_SEEK_TO_NEXT) {\n      ExpoVideoPlaybackService.dispatchMediaAction("next", session.player)\n      return MediaSession.ConnectionResult.RESULT_SUCCESS\n    } else if (playerCommand == Player.COMMAND_SEEK_TO_PREVIOUS) {\n      ExpoVideoPlaybackService.dispatchMediaAction("previous", session.player)\n      return MediaSession.ConnectionResult.RESULT_SUCCESS\n    }\n    return super.onPlayerCommandRequest(session, controller, playerCommand)\n  }\n\n  override fun onCustomCommand(session: MediaSession, controller: MediaSession.ControllerInfo, customCommand: SessionCommand, args: Bundle): ListenableFuture<SessionResult> {`,
  ],
]);

// 2. ExpoVideoPlaybackService.kt
patchFile("playbackService/ExpoVideoPlaybackService.kt", [
  [
    `  private val commandSeekBackward = SessionCommand(SEEK_BACKWARD_COMMAND, Bundle.EMPTY)`,
    `  private val commandSeekBackward = SessionCommand(SEEK_BACKWARD_COMMAND, Bundle.EMPTY)\n  private val commandSkipNext = SessionCommand(SKIP_NEXT_COMMAND, Bundle.EMPTY)\n  private val commandSkipPrevious = SessionCommand(SKIP_PREVIOUS_COMMAND, Bundle.EMPTY)\n  private val skipNextButton = CommandButton.Builder()\n    .setDisplayName("Next")\n    .setSessionCommand(commandSkipNext)\n    .setIconResId(androidx.media3.session.R.drawable.media3_icon_skip_forward)\n    .build()\n  private val skipPreviousButton = CommandButton.Builder()\n    .setDisplayName("Previous")\n    .setSessionCommand(commandSkipPrevious)\n    .setIconResId(androidx.media3.session.R.drawable.media3_icon_skip_back)\n    .build()`,
  ],
  [
    `      .setCustomLayout(ImmutableList.of(seekBackwardButton, seekForwardButton))`,
    `      .setCustomLayout(ImmutableList.of(skipPreviousButton, seekBackwardButton, seekForwardButton, skipNextButton))`,
  ],
  [
    `  private val mediaSessions = mutableMapOf<ExoPlayer, MediaSession>()`,
    `  private val mediaSessions = mutableMapOf<ExoPlayer, MediaSession>()\n  private val videoPlayers = mutableMapOf<ExoPlayer, VideoPlayer>()`,
  ],
  [
    `    val mediaSession = MediaSession.Builder(this, player)`,
    `    videoPlayers[player] = videoPlayer\n    val mediaSession = MediaSession.Builder(this, player)`,
  ],
  [
    `    val session = mediaSessions.remove(player)`,
    `    videoPlayers.remove(player)\n    val session = mediaSessions.remove(player)`,
  ],
  [
    `  private fun cleanup() {\n    hideAllNotifications()\n    mediaSessions.forEach { (_, session) ->\n      session.release()\n    }\n    mediaSessions.clear()\n  }`,
    `  private fun cleanup() {\n    hideAllNotifications()\n    mediaSessions.forEach { (_, session) ->\n      session.release()\n    }\n    mediaSessions.clear()\n    videoPlayers.clear()\n  }`,
  ],
  [
    `    const val SEEK_BACKWARD_COMMAND = "SEEK_REWIND"`,
    `    const val SEEK_BACKWARD_COMMAND = "SEEK_REWIND"\n    const val SKIP_NEXT_COMMAND = "expo.modules.video.action.SKIP_NEXT"\n    const val SKIP_PREVIOUS_COMMAND = "expo.modules.video.action.SKIP_PREVIOUS"\n    private var activeServiceInstance: ExpoVideoPlaybackService? = null\n\n    fun dispatchMediaAction(action: String, player: androidx.media3.common.Player) {\n      val targetPlayer = player as? ExoPlayer ?: return\n      val vp = activeServiceInstance?.videoPlayers?.get(targetPlayer)\n      vp?.dispatchMediaControlAction(action)\n    }`,
  ],
  [
    `  override fun onBind(intent: Intent?): IBinder {\n    super.onBind(intent)\n    return binder\n  }`,
    `  override fun onBind(intent: Intent?): IBinder {\n    super.onBind(intent)\n    activeServiceInstance = this\n    return binder\n  }`,
  ],
  [
    `  override fun onDestroy() {\n    cleanup()\n    super.onDestroy()\n  }`,
    `  override fun onDestroy() {\n    cleanup()\n    if (activeServiceInstance == this) {\n      activeServiceInstance = null\n    }\n    super.onDestroy()\n  }`,
  ],
]);

// 3. VideoPlayer.kt
patchFile("player/VideoPlayer.kt", [
  [
    `  override fun emitTimeUpdate() {`,
    `  fun dispatchMediaControlAction(action: String) {\n    appContext.mainQueue.launch {\n      emit("mediaControlAction", mapOf("action" to action))\n    }\n  }\n\n  override fun emitTimeUpdate() {`,
  ],
]);

console.log("expo-video patch applied successfully");
