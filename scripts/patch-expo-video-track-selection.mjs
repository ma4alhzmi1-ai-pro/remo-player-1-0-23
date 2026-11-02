import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const sourceRoot = resolve(root, "node_modules/expo-video/android/src/main/java/expo/modules/video");
if (!existsSync(sourceRoot)) {
  console.log("expo-video Android source not found, skipping track-selection patch");
  process.exit(0);
}

const trackFile = resolve(sourceRoot, "player/VideoPlayerVideoTracks.kt");
const trackSource = `package expo.modules.video.player

import androidx.annotation.OptIn
import androidx.media3.common.C
import androidx.media3.common.Format
import androidx.media3.common.MimeTypes
import androidx.media3.common.TrackGroup
import androidx.media3.common.TrackSelectionOverride
import androidx.media3.common.TrackSelectionParameters
import androidx.media3.common.Tracks
import androidx.media3.common.util.UnstableApi
import expo.modules.video.records.VideoTrack
import java.lang.ref.WeakReference

@OptIn(UnstableApi::class)
class VideoPlayerVideoTracks(owner: VideoPlayer) : VideoPlayerListener {
  private val owner = WeakReference(owner)
  private val videoPlayer: VideoPlayer?
    get() = owner.get()
  private val formatsToGroups = mutableMapOf<Format, Pair<TrackGroup, Int>>()
  private var currentVideoTrackFormat: Format? = null
  private var currentOverride: TrackSelectionOverride? = null
  var currentVideoTrack: VideoTrack?
    get() = VideoTrack.fromFormat(currentVideoTrackFormat)
    set(value) { applyVideoTrack(value) }
  val availableVideoTracks = arrayListOf<VideoTrack>()

  override fun onTracksChanged(player: VideoPlayer, tracks: Tracks) {
    formatsToGroups.clear()
    availableVideoTracks.clear()
    for (group in tracks.groups) {
      for (i in 0 until group.length) {
        val format = group.getTrackFormat(i)
        if (!MimeTypes.isVideo(format.sampleMimeType)) continue
        formatsToGroups[format] = group.mediaTrackGroup to i
        VideoTrack.fromFormat(format, group.isTrackSupported(i))?.let { availableVideoTracks.add(it) }
      }
    }
    currentVideoTrackFormat = findSelectedVideoFormat()
    super.onTracksChanged(player, tracks)
  }

  override fun onTrackSelectionParametersChanged(player: VideoPlayer, parameters: TrackSelectionParameters) {
    currentVideoTrackFormat = findSelectedVideoFormat()
    super.onTrackSelectionParametersChanged(player, parameters)
  }

  private fun applyVideoTrack(videoTrack: VideoTrack?) {
    val player = videoPlayer?.player ?: return
    var params = player.trackSelectionParameters
    currentOverride?.let { params = params.buildUpon().clearOverridesOfType(C.TRACK_TYPE_VIDEO).build() }
    if (videoTrack == null) {
      player.trackSelectionParameters = params
      currentOverride = null
      return
    }
    val format = formatsToGroups.keys.firstOrNull { it.id == videoTrack.id }
    val groupAndIndex = format?.let { formatsToGroups[it] } ?: return
    val override = TrackSelectionOverride(groupAndIndex.first, groupAndIndex.second)
    player.trackSelectionParameters = params.buildUpon().addOverride(override).build()
    currentOverride = override
  }

  private fun findSelectedVideoFormat(): Format? {
    val params = videoPlayer?.player?.trackSelectionParameters ?: return null
    params.overrides.forEach { (group, override) ->
      if (group.type == C.TRACK_TYPE_VIDEO) {
        return override.trackIndices.firstOrNull()?.let { group.getFormat(it) }
      }
    }
    return null
  }
}
`;
writeFileSync(trackFile, trackSource);

function patch(relativePath, before, after) {
  const path = resolve(sourceRoot, relativePath);
  if (!existsSync(path)) throw new Error(`Missing ${relativePath}`);
  const source = readFileSync(path, "utf8");
  if (source.includes(after)) return;
  if (!source.includes(before)) throw new Error(`Pattern not found in ${relativePath}`);
  writeFileSync(path, source.replace(before, after));
}

patch(
  "player/VideoPlayer.kt",
  "  val audioTracks: VideoPlayerAudioTracks = VideoPlayerAudioTracks(this)\n",
  "  val audioTracks: VideoPlayerAudioTracks = VideoPlayerAudioTracks(this)\n  val videoTracks: VideoPlayerVideoTracks = VideoPlayerVideoTracks(this)\n",
);
patch(
  "VideoModule.kt",
  `      Property("videoTrack")\n        .get { ref: VideoPlayer ->\n          ref.currentVideoTrack\n        }\n`,
  `      Property("videoTrack")\n        .get { ref: VideoPlayer ->\n          ref.videoTracks.currentVideoTrack\n        }\n        .set { ref: VideoPlayer, videoTrack: expo.modules.video.records.VideoTrack? ->\n          appContext.mainQueue.launch {\n            ref.videoTracks.currentVideoTrack = videoTrack\n          }\n        }\n`,
);
console.log("expo-video video-track selection patch applied");
