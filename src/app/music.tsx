import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import * as DocumentPicker from "expo-document-picker";

import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";

import {
  useFocusEffect,
  useRouter,
} from "expo-router";

import {
  COLORS,
  Header,
  PrimaryButton,
  Screen,
} from "@/components/birthday-ui";

import {
  BirthdayDraft,
  loadDraft,
  persistLocalFile,
  saveDraft,
} from "@/lib/birthday-storage";

export default function MusicScreen() {
  const router = useRouter();

  const [draft, setDraft] =
    useState<BirthdayDraft | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [importing, setImporting] =
    useState(false);

  const [seekBarWidth, setSeekBarWidth] =
    useState(0);

  const [seeking, setSeeking] =
    useState(false);

  /*
   * Create one audio player.

   * It starts without a source.
   * When the user selects a track,
   * player.replace(uri) loads it.
   */
  const player = useAudioPlayer(null, {
    updateInterval: 250,
  });

  /*
   * Real-time playback information.
   *
   * currentTime
   * duration
   * playing
   * isLoaded
   * isBuffering
   */
  const playerStatus =
    useAudioPlayerStatus(player);

  /*
   * Load saved birthday data.
   */
  const loadData = useCallback(
    async () => {
      try {
        const currentDraft =
          await loadDraft();

        setDraft(currentDraft);
      } catch (error) {
        console.error(
          "Failed to load music draft:",
          error
        );

        Alert.alert(
          "Could not load music",
          "Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /*
   * Reload saved data whenever
   * the music screen becomes active.
   */
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  /*
   * Configure the audio session.

   * playsInSilentMode:
   * Music will play even when the iPhone
   * silent switch is enabled.
   */
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
    }).catch((error) => {
      console.log(
        "Audio mode setup failed:",
        error
      );
    });
  }, []);

  /*
   * When a saved track exists,
   * load it into the player.
   */
  useEffect(() => {
    const uri = draft?.musicUri;

    if (!uri) {
      return;
    }

    try {
      player.replace(uri);
    } catch (error) {
      console.error(
        "Could not load saved audio:",
        error
      );
    }
  }, [draft?.musicUri, player]);

  /*
   * Format seconds as:
   *
   * 0:00
   * 1:24
   * 12:08
   */
  const formatTime = (
    seconds: number
  ) => {
    if (
      !Number.isFinite(seconds) ||
      seconds < 0
    ) {
      return "0:00";
    }

    const totalSeconds =
      Math.floor(seconds);

    const minutes =
      Math.floor(
        totalSeconds / 60
      );

    const remainingSeconds =
      totalSeconds % 60;

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  /*
   * Current playback values.
   */
  const currentTime =
    Number.isFinite(
      playerStatus.currentTime
    )
      ? playerStatus.currentTime
      : 0;

  const duration =
    Number.isFinite(
      playerStatus.duration
    )
      ? playerStatus.duration
      : 0;

  /*
   * Progress percentage.
   */
  const progress =
    duration > 0
      ? Math.min(
          1,
          Math.max(
            0,
            currentTime / duration
          )
        )
      : 0;

  /*
   * Pick an audio file.
   */
  const pickAudio = async () => {
    try {
      setImporting(true);

      const result =
        await DocumentPicker.getDocumentAsync(
          {
            type: "audio/*",
            copyToCacheDirectory: true,
            multiple: false,
          }
        );

      if (
        result.canceled ||
        !result.assets?.length
      ) {
        return;
      }

      const asset =
        result.assets[0];

      if (!asset.uri) {
        Alert.alert(
          "Invalid audio",
          "The selected file does not have a usable audio location."
        );

        return;
      }

      /*
       * Determine file extension.
       */
      const extension =
        asset.name?.includes(".")
          ? asset.name
              .split(".")
              .pop()
              ?.toLowerCase() || "mp3"
          : "mp3";

      /*
       * Copy the file into the app's
       * persistent document directory.
       */
      const localUri =
        await persistLocalFile(
          asset.uri,
          extension
        );

      /*
       * Save the track in the birthday draft.
       */
      const updatedDraft =
        await saveDraft({
          musicUri: localUri,
          musicName:
            asset.name ||
            "Birthday soundtrack",
        });

      setDraft(updatedDraft);

      /*
       * Load the new file immediately.
       */
      player.replace(localUri);

      /*
       * Give the player a moment to load,
       * then start from the beginning.
       */
      setTimeout(() => {
        try {
          player.seekTo(0);
        } catch {
          // Audio may still be loading.
        }
      }, 100);

    } catch (error) {
      console.error(
        "Audio picker error:",
        error
      );

      Alert.alert(
        "Could not add music",
        "Please choose a supported audio file and try again."
      );
    } finally {
      setImporting(false);
    }
  };

  /*
   * Play / pause.
   */
  const togglePlayback =
    async () => {
      if (!draft?.musicUri) {
        Alert.alert(
          "No music selected",
          "Choose an audio file first."
        );

        return;
      }

      try {
        /*
         * If the track is still loading,
         * don't attempt playback yet.
         */
        if (
          playerStatus.isLoaded === false
        ) {
          Alert.alert(
            "Loading audio",
            "The audio is still loading. Try again in a moment."
          );

          return;
        }

        if (
          playerStatus.playing
        ) {
          player.pause();
        } else {
          /*
           * If the track has reached the end,
           * restart it automatically.
           */
          if (
            duration > 0 &&
            currentTime >=
              duration - 0.15
          ) {
            await player.seekTo(0);
          }

          player.play();
        }
      } catch (error) {
        console.error(
          "Playback error:",
          error
        );

        Alert.alert(
          "Playback error",
          "The selected audio could not be played."
        );
      }
    };

  /*
   * Restart the current track.
   */
  const restartTrack =
    async () => {
      if (!draft?.musicUri) {
        return;
      }

      try {
        await player.seekTo(0);
        player.play();
      } catch (error) {
        console.error(
          "Restart error:",
          error
        );
      }
    };

  /*
   * Seek bar layout.
   */
  const handleSeekBarLayout = (
    event: LayoutChangeEvent
  ) => {
    setSeekBarWidth(
      event.nativeEvent.layout.width
    );
  };

  /*
   * Seek when the user taps
   * somewhere on the progress bar.
   */
  const handleSeek = async (
    x: number
  ) => {
    if (
      duration <= 0 ||
      seekBarWidth <= 0
    ) {
      return;
    }

    const percentage =
      Math.min(
        1,
        Math.max(
          0,
          x / seekBarWidth
        )
      );

    const targetTime =
      percentage * duration;

    try {
      setSeeking(true);

      await player.seekTo(
        targetTime
      );
    } catch (error) {
      console.error(
        "Seek error:",
        error
      );
    } finally {
      setSeeking(false);
    }
  };

  /*
   * Remove saved music.
   */
  const removeMusic = async () => {
    try {
      player.pause();

      await player.seekTo(0);

      const updatedDraft =
        await saveDraft({
          musicUri: undefined,
          musicName: undefined,
        });

      setDraft(updatedDraft);
    } catch (error) {
      console.error(
        "Remove music error:",
        error
      );

      Alert.alert(
        "Could not remove music",
        "Please try again."
      );
    }
  };

  /*
   * Make the player active for
   * iOS / Android lock-screen metadata
   * while playing.
   */
  useEffect(() => {
    if (
      !draft?.musicUri ||
      !draft.musicName
    ) {
      return;
    }

    if (!playerStatus.playing) {
      return;
    }

    try {
      player.setActiveForLockScreen(
        true,
        {
          title:
            draft.musicName,
          artist:
            "Birthday Meow",
          albumTitle:
            "Birthday soundtrack",
        }
      );
    } catch (error) {
      console.log(
        "Lock screen audio setup:",
        error
      );
    }
  }, [
    draft?.musicUri,
    draft?.musicName,
    player,
    playerStatus.playing,
  ]);

  /*
   * Loading screen.
   */
  if (loading) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color={COLORS.pink}
        />

        <Text
          style={styles.loadingText}
        >
          Loading music...
        </Text>
      </View>
    );
  }

  const hasMusic =
    Boolean(draft?.musicUri);

  return (
    <Screen>
      <Header
        title="Birthday music"
        subtitle="Give the celebration its soundtrack"
        onBack={() =>
          router.back()
        }
      />

      {/* PLAYER */}
      {hasMusic ? (
        <View
          style={styles.playerCard}
        >
          {/* Top row */}
          <View
            style={styles.playerHeader}
          >
            <View
              style={
                styles.albumArtwork
              }
            >
              <Text
                style={
                  styles.albumEmoji
                }
              >
                🎵
              </Text>
            </View>

            <View
              style={
                styles.trackInfo
              }
            >
              <Text
                style={
                  styles.trackLabel
                }
              >
                NOW SELECTED
              </Text>

              <Text
                style={
                  styles.trackName
                }
                numberOfLines={2}
              >
                {draft?.musicName ||
                  "Birthday soundtrack"}
              </Text>

              <Text
                style={
                  styles.trackArtist
                }
              >
                Birthday Meow
              </Text>
            </View>

            <View
              style={[
                styles.statusDot,
                playerStatus.playing &&
                  styles.statusDotPlaying,
              ]}
            />
          </View>

          {/* Loading */}
          {playerStatus.isBuffering ? (
            <View
              style={
                styles.bufferingRow
              }
            >
              <ActivityIndicator
                size="small"
                color={
                  COLORS.pink
                }
              />

              <Text
                style={
                  styles.bufferingText
                }
              >
                Loading audio...
              </Text>
            </View>
          ) : null}

          {/* Seek bar */}
          <View
            style={
              styles.timelineSection
            }
          >
            <Pressable
              onLayout={
                handleSeekBarLayout
              }
              onPress={(event) =>
                handleSeek(
                  event.nativeEvent
                    .locationX
                )
              }
              style={
                styles.seekBar
              }
            >
              <View
                style={
                  styles.seekTrack
                }
              />

              <View
                style={[
                  styles.seekProgress,
                  {
                    width: `${progress * 100}%`,
                  },
                ]}
              />

              <View
                style={[
                  styles.seekThumb,
                  {
                    left: `${Math.max(
                      0,
                      Math.min(
                        100,
                        progress * 100
                      )
                    )}%`,
                  },
                ]}
              />
            </Pressable>

            <View
              style={
                styles.timeRow
              }
            >
              <Text
                style={
                  styles.timeText
                }
              >
                {formatTime(
                  currentTime
                )}
              </Text>

              <Text
                style={
                  styles.timeText
                }
              >
                {formatTime(
                  duration
                )}
              </Text>
            </View>
          </View>

          {/* Controls */}
          <View
            style={
              styles.controls
            }
          >
            <Pressable
              onPress={
                restartTrack
              }
              style={
                styles.smallControl
              }
              disabled={seeking}
            >
              <Text
                style={
                  styles.smallControlText
                }
              >
                ↺
              </Text>
            </Pressable>

            <Pressable
              onPress={
                togglePlayback
              }
              style={({ pressed }) => [
                styles.playButton,
                pressed &&
                  styles.playButtonPressed,
              ]}
            >
              {playerStatus.isBuffering ? (
                <ActivityIndicator
                  size="small"
                  color={
                    COLORS.white
                  }
                />
              ) : (
                <Text
                  style={
                    styles.playButtonText
                  }
                >
                  {playerStatus.playing
                    ? "Ⅱ"
                    : "▶"}
                </Text>
              )}
            </Pressable>

            <View
              style={
                styles.controlSpacer
              }
            />
          </View>
        </View>
      ) : (
        /* EMPTY PLAYER */
        <View
          style={
            styles.emptyPlayer
          }
        >
          <View
            style={
              styles.emptyArtwork
            }
          >
            <Text
              style={
                styles.emptyArtworkEmoji
              }
            >
              🎧
            </Text>
          </View>

          <Text
            style={
              styles.emptyPlayerTitle
            }
          >
            No soundtrack yet
          </Text>

          <Text
            style={
              styles.emptyPlayerText
            }
          >
            Add a song from the Files app
            and use it as the soundtrack
            for this birthday.
          </Text>
        </View>
      )}

      {/* ADD MUSIC */}
      <PrimaryButton
        title={
          importing
            ? "Opening Files..."
            : hasMusic
              ? "＋ Choose another song"
              : "＋ Choose audio from Files"
        }
        onPress={
          pickAudio
        }
        disabled={
          importing
        }
      />

      {/* REMOVE */}
      {hasMusic ? (
        <Pressable
          onPress={
            removeMusic
          }
          style={
            styles.removeButton
          }
        >
          <Text
            style={
              styles.removeButtonText
            }
          >
            Remove soundtrack
          </Text>
        </Pressable>
      ) : null}

      {/* INFO */}
      <View
        style={
          styles.infoCard
        }
      >
        <View
          style={
            styles.infoIcon
          }
        >
          <Text
            style={
              styles.infoIconText
            }
          >
            ♪
          </Text>
        </View>

        <View
          style={
            styles.infoContent
          }
        >
          <Text
            style={
              styles.infoTitle
            }
          >
            Your music stays with the birthday
          </Text>

          <Text
            style={
              styles.infoText
            }
          >
            The selected audio is saved locally
            with your birthday draft, so you
            can return to it later.
          </Text>
        </View>
      </View>

      {/* SUPPORTED FORMATS */}
      <View
        style={
          styles.formatsCard
        }
      >
        <Text
          style={
            styles.formatsTitle
          }
        >
          Audio files
        </Text>

        <View
          style={
            styles.formatRow
          }
        >
          <View
            style={
              styles.formatBadge
            }
          >
            <Text
              style={
                styles.formatText
              }
            >
              MP3
            </Text>
          </View>

          <View
            style={
              styles.formatBadge
            }
          >
            <Text
              style={
                styles.formatText
              }
            >
              M4A
            </Text>
          </View>

          <View
            style={
              styles.formatBadge
            }
          >
            <Text
              style={
                styles.formatText
              }
            >
              WAV
            </Text>
          </View>

          <View
            style={
              styles.formatBadge
            }
          >
            <Text
              style={
                styles.formatText
              }
            >
              AAC
            </Text>
          </View>
        </View>
      </View>

      <PrimaryButton
        title="Done"
        onPress={() =>
          router.back()
        }
        secondary
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor:
      COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSoft,
  },

  /*
   * PLAYER
   */

  playerCard: {
    backgroundColor:
      COLORS.white,
    borderRadius: 28,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    padding: 18,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 7,
    },

    elevation: 3,
  },

  playerHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  albumArtwork: {
    width: 66,
    height: 66,
    borderRadius: 21,
    backgroundColor:
      COLORS.pinkLighter,
    alignItems: "center",
    justifyContent: "center",
  },

  albumEmoji: {
    fontSize: 31,
  },

  trackInfo: {
    flex: 1,
    marginLeft: 14,
    paddingRight: 8,
  },

  trackLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.pink,
    letterSpacing: 1.5,
  },

  trackName: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
    marginTop: 3,
  },

  trackArtist: {
    fontSize: 11,
    color: COLORS.textSoft,
    marginTop: 3,
  },

  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor:
      COLORS.border,
  },

  statusDotPlaying: {
    backgroundColor:
      COLORS.pink,
  },

  bufferingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },

  bufferingText: {
    fontSize: 11,
    color: COLORS.textSoft,
    marginLeft: 8,
  },

  timelineSection: {
    marginTop: 24,
  },

  seekBar: {
    height: 24,
    justifyContent: "center",
    position: "relative",
  },

  seekTrack: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 5,
    borderRadius: 3,
    backgroundColor:
      COLORS.border,
  },

  seekProgress: {
    position: "absolute",
    left: 0,
    height: 5,
    borderRadius: 3,
    backgroundColor:
      COLORS.pink,
  },

  seekThumb: {
    position: "absolute",
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor:
      COLORS.pink,
    marginLeft: -7.5,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  timeRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    marginTop: 2,
  },

  timeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.muted,
  },

  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  smallControl: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor:
      COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },

  smallControlText: {
    fontSize: 24,
    color: COLORS.text,
  },

  playButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor:
      COLORS.pink,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,

    shadowColor:
      COLORS.pink,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 4,
  },

  playButtonPressed: {
    transform: [
      {
        scale: 0.94,
      },
    ],
  },

  playButtonText: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: "900",
  },

  controlSpacer: {
    width: 45,
    height: 45,
  },

  /*
   * EMPTY PLAYER
   */

  emptyPlayer: {
    backgroundColor:
      COLORS.white,
    borderRadius: 28,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    paddingVertical: 34,
    paddingHorizontal: 25,
    alignItems: "center",
  },

  emptyArtwork: {
    width: 82,
    height: 82,
    borderRadius: 27,
    backgroundColor:
      COLORS.pinkLighter,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  emptyArtworkEmoji: {
    fontSize: 38,
  },

  emptyPlayerTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: COLORS.text,
  },

  emptyPlayerText: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textSoft,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 290,
  },

  /*
   * REMOVE
   */

  removeButton: {
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  removeButtonText: {
    color: COLORS.pinkDark,
    fontSize: 13,
    fontWeight: "800",
  },

  /*
   * INFO
   */

  infoCard: {
    backgroundColor:
      COLORS.purple,
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 14,
  },

  infoIcon: {
    width: 45,
    height: 45,
    borderRadius: 16,
    backgroundColor:
      COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoIconText: {
    fontSize: 25,
    color: COLORS.pink,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  infoText: {
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.textSoft,
    marginTop: 4,
  },

  /*
   * FORMATS
   */

  formatsCard: {
    backgroundColor:
      COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    padding: 15,
    marginBottom: 8,
  },

  formatsTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 10,
  },

  formatRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  formatBadge: {
    backgroundColor:
      COLORS.background,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  formatText: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.textSoft,
    letterSpacing: 0.5,
  },
});