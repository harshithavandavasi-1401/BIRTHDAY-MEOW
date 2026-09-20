import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  COLORS,
  Header,
  PrimaryButton,
  Screen,
} from "@/components/birthday-ui";

import {
  BirthdayDraft,
  loadDraft,
} from "@/lib/birthday-storage";

const templates = {
  cute: {
    name: "Cute Pink",
    emoji: "🎀",
    background: "#FFE8EE",
    accent: "#E85D75",
  },

  floral: {
    name: "Floral",
    emoji: "🌸",
    background: "#FCECF3",
    accent: "#C85C88",
  },

  party: {
    name: "Party",
    emoji: "🎉",
    background: "#FFF1DE",
    accent: "#F08A48",
  },

  elegant: {
    name: "Elegant",
    emoji: "✦",
    background: "#F0EBFF",
    accent: "#8067C5",
  },

  rainbow: {
    name: "Colorful",
    emoji: "🌈",
    background: "#E7F6F1",
    accent: "#43A488",
  },
};

function getTemplate(templateId?: string) {
  return (
    templates[templateId as keyof typeof templates] ??
    templates.cute
  );
}

export default function PreviewScreen() {
  const router = useRouter();

  const [draft, setDraft] =
    useState<BirthdayDraft | null>(null);

  const [celebrating, setCelebrating] =
    useState(false);

  const [shareModalVisible, setShareModalVisible] =
    useState(false);

  const [shareMessage, setShareMessage] =
    useState("");

  const [copySuccess, setCopySuccess] =
    useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await loadDraft();
      setDraft(data);
    } catch (error) {
      console.error(
        "Preview loading error:",
        error
      );
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  useEffect(() => {
    if (!celebrating) {
      return;
    }

    const timer = setTimeout(() => {
      setCelebrating(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [celebrating]);

  const template = useMemo(
    () => getTemplate(draft?.templateId),
    [draft?.templateId]
  );

  const background =
    draft?.background || template.background;

  const accent =
    draft?.accent || template.accent;

  const firstPhoto =
    draft?.photos?.[0];

  const formattedDate = draft?.birthday
    ? new Date(
        draft.birthday
      ).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  /*
   * Create the text that will be shared.
   */
  const buildShareMessage = () => {
    if (!draft) {
      return "";
    }

    return [
      `🎂 Happy Birthday ${draft.name}!`,
      "",
      draft.age
        ? `Celebrating ${draft.age} wonderful years.`
        : "",
      draft.relationship
        ? `For my ${draft.relationship}.`
        : "",
      "",
      draft.wish ||
        "Wishing you the happiest birthday!",
      "",
      formattedDate
        ? `📅 ${formattedDate}`
        : "",
      "",
      "Made with Birthday Meow 🐱",
    ]
      .filter(Boolean)
      .join("\n");
  };

  /*
   * Open the sharing flow.
   */
  const shareBirthday = async () => {
    if (!draft) {
      Alert.alert(
        "Nothing to share",
        "Create a birthday first."
      );
      return;
    }

    const message = buildShareMessage();

    setShareMessage(message);
    setCopySuccess(false);

    /*
     * Native iOS / Android
     */
    if (Platform.OS !== "web") {
      try {
        await Share.share({
          title: `Happy Birthday ${draft.name}`,
          message,
        });
      } catch (error) {
        console.error(
          "Native share error:",
          error
        );

        setShareModalVisible(true);
      }

      return;
    }

    /*
     * Web
     */
    try {
      const webNavigator =
        typeof navigator !== "undefined"
          ? navigator
          : null;

      /*
       * Try native browser Web Share first.
       */
      if (
        webNavigator &&
        typeof webNavigator.share ===
          "function"
      ) {
        await webNavigator.share({
          title: `Happy Birthday ${draft.name}`,
          text: message,
        });

        return;
      }

      /*
       * If browser sharing is unavailable,
       * open our own share modal.
       */
      setShareModalVisible(true);
    } catch (error: any) {
      /*
       * User cancelled browser sharing.
       */
      if (
        error?.name === "AbortError"
      ) {
        return;
      }

      console.error(
        "Web share error:",
        error
      );

      setShareModalVisible(true);
    }
  };

  /*
   * Copy text to clipboard.
   */
  const copyMessage = async () => {
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText ===
          "function"
      ) {
        await navigator.clipboard.writeText(
          shareMessage
        );

        setCopySuccess(true);

        return;
      }

      /*
       * Fallback for browsers where
       * navigator.clipboard isn't available.
       */
      if (
        typeof document !== "undefined"
      ) {
        const textarea =
          document.createElement(
            "textarea"
          );

        textarea.value = shareMessage;

        textarea.style.position =
          "fixed";

        textarea.style.left = "-9999px";

        textarea.style.top = "-9999px";

        document.body.appendChild(
          textarea
        );

        textarea.focus();
        textarea.select();

        const copied =
          document.execCommand(
            "copy"
          );

        document.body.removeChild(
          textarea
        );

        if (copied) {
          setCopySuccess(true);
          return;
        }
      }

      Alert.alert(
        "Copy unavailable",
        "Please select and copy the message manually."
      );
    } catch (error) {
      console.error(
        "Clipboard error:",
        error
      );

      Alert.alert(
        "Copy unavailable",
        "Please select and copy the message manually."
      );
    }
  };

  /*
   * Native share fallback modal.
   */
  const closeShareModal = () => {
    setShareModalVisible(false);
    setCopySuccess(false);
  };

  if (!draft) {
    return (
      <Screen>
        <Header
          title="Preview"
          subtitle="Your birthday card"
          onBack={() => router.back()}
        />

        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>
            🎂
          </Text>

          <Text style={styles.emptyTitle}>
            Nothing to preview yet
          </Text>

          <Text style={styles.emptyText}>
            Create a birthday first, then come back
            here to see the finished card.
          </Text>

          <PrimaryButton
            title="Create birthday"
            onPress={() =>
              router.push(
                "/create?new=1"
              )
            }
          />
        </View>
      </Screen>
    );
  }

  return (
    <View style={styles.page}>
      <Screen
        contentContainerStyle={
          styles.content
        }
      >
        <Header
          title="Preview"
          subtitle="Your finished birthday"
          onBack={() => router.back()}
        />

        {/* BIRTHDAY CARD */}
        <View
          style={[
            styles.birthdayCard,
            {
              backgroundColor:
                background,
              borderColor:
                `${accent}35`,
            },
          ]}
        >
          <View style={styles.cardTop}>
            <Text
              style={[
                styles.templateLabel,
                {
                  color: accent,
                },
              ]}
            >
              {template.name.toUpperCase()}
            </Text>

            <Text
              style={styles.templateEmoji}
            >
              {template.emoji}
            </Text>
          </View>

          {/* PHOTO */}
          {firstPhoto ? (
            <View
              style={
                styles.mainPhotoWrapper
              }
            >
              <Image
                source={{
                  uri: firstPhoto,
                }}
                style={styles.mainPhoto}
              />

              <View
                style={[
                  styles.photoOverlay,
                  {
                    borderColor:
                      accent,
                  },
                ]}
              />
            </View>
          ) : (
            <View
              style={[
                styles.photoPlaceholder,
                {
                  borderColor:
                    `${accent}45`,
                },
              ]}
            >
              <Text
                style={
                  styles.photoPlaceholderEmoji
                }
              >
                📸
              </Text>

              <Text
                style={[
                  styles.photoPlaceholderText,
                  {
                    color: accent,
                  },
                ]}
              >
                Add a favorite photo
              </Text>
            </View>
          )}

          {/* GREETING */}
          <View style={styles.greeting}>
            <Text
              style={[
                styles.smallGreeting,
                {
                  color: accent,
                },
              ]}
            >
              HAPPY BIRTHDAY
            </Text>

            <Text style={styles.name}>
              {draft.name}
            </Text>

            {draft.age ? (
              <Text
                style={[
                  styles.age,
                  {
                    color: accent,
                  },
                ]}
              >
                {draft.age} years of
                wonderful
              </Text>
            ) : null}
          </View>

          <View
            style={[
              styles.divider,
              {
                backgroundColor:
                  `${accent}30`,
              },
            ]}
          />

          {/* WISH */}
          <Text style={styles.wish}>
            {draft.wish ||
              "Wishing you a beautiful birthday filled with happiness, love and unforgettable memories."}
          </Text>

          {/* DATE */}
          {formattedDate ? (
            <Text
              style={[
                styles.date,
                {
                  color: accent,
                },
              ]}
            >
              {formattedDate}
            </Text>
          ) : null}

          {/* STICKERS */}
          {draft.stickers?.length ? (
            <View style={styles.stickers}>
              {draft.stickers.map(
                (sticker, index) => (
                  <Text
                    key={`${sticker}-${index}`}
                    style={
                      styles.sticker
                    }
                  >
                    {sticker}
                  </Text>
                )
              )}
            </View>
          ) : null}

          {/* FOOTER */}
          <View
            style={styles.cardFooter}
          >
            <Text
              style={styles.footerText}
            >
              made with
            </Text>

            <Text
              style={[
                styles.footerBrand,
                {
                  color: accent,
                },
              ]}
            >
              birthday meow
            </Text>
          </View>
        </View>

        {/* CELEBRATE */}
        <Pressable
          onPress={() =>
            setCelebrating(true)
          }
          style={({ pressed }) => [
            styles.celebrateButton,
            pressed &&
              styles.pressed,
          ]}
        >
          <Text
            style={
              styles.celebrateIcon
            }
          >
            ✨
          </Text>

          <View
            style={
              styles.celebrateContent
            }
          >
            <Text
              style={
                styles.celebrateTitle
              }
            >
              Celebrate
            </Text>

            <Text
              style={
                styles.celebrateSubtitle
              }
            >
              Preview the birthday
              moment
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>
        </Pressable>

        {/* EDIT */}
        <Text
          style={styles.actionsTitle}
        >
          Edit your birthday
        </Text>

        <View
          style={styles.actionGrid}
        >
          <Pressable
            onPress={() =>
              router.push("/create")
            }
            style={styles.actionCard}
          >
            <Text
              style={styles.actionIcon}
            >
              ✏️
            </Text>

            <Text
              style={styles.actionTitle}
            >
              Details
            </Text>

            <Text
              style={
                styles.actionSubtitle
              }
            >
              Name, age & date
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              router.push(
                "/templates"
              )
            }
            style={styles.actionCard}
          >
            <Text
              style={styles.actionIcon}
            >
              🎨
            </Text>

            <Text
              style={styles.actionTitle}
            >
              Template
            </Text>

            <Text
              style={
                styles.actionSubtitle
              }
            >
              Change the look
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              router.push("/photos")
            }
            style={styles.actionCard}
          >
            <Text
              style={styles.actionIcon}
            >
              📷
            </Text>

            <Text
              style={styles.actionTitle}
            >
              Photos
            </Text>

            <Text
              style={
                styles.actionSubtitle
              }
            >
              Manage memories
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              router.push(
                "/customize"
              )
            }
            style={styles.actionCard}
          >
            <Text
              style={styles.actionIcon}
            >
              ✨
            </Text>

            <Text
              style={styles.actionTitle}
            >
              Customize
            </Text>

            <Text
              style={
                styles.actionSubtitle
              }
            >
              Colors & fonts
            </Text>
          </Pressable>
        </View>

        {/* SHARE */}
        <View style={styles.shareSection}>
          <Text
            style={styles.shareHint}
          >
            Ready to send it?
          </Text>

          <PrimaryButton
            title="Share birthday"
            onPress={
              shareBirthday
            }
          />
        </View>

        <PrimaryButton
          title="Back to home"
          onPress={() =>
            router.replace("/")
          }
          secondary
        />

        <View
          style={styles.bottomSpace}
        />
      </Screen>

      {/* CELEBRATION */}
      {celebrating ? (
        <View
          style={
            styles.confettiLayer
          }
          pointerEvents="none"
        >
          <Text
            style={[
              styles.confetti,
              {
                left: "8%",
                top: "12%",
              },
            ]}
          >
            🎉
          </Text>

          <Text
            style={[
              styles.confetti,
              {
                left: "24%",
                top: "18%",
              },
            ]}
          >
            ✨
          </Text>

          <Text
            style={[
              styles.confetti,
              {
                left: "43%",
                top: "10%",
              },
            ]}
          >
            🎈
          </Text>

          <Text
            style={[
              styles.confetti,
              {
                left: "65%",
                top: "20%",
              },
            ]}
          >
            💖
          </Text>

          <Text
            style={[
              styles.confetti,
              {
                left: "80%",
                top: "8%",
              },
            ]}
          >
            🎊
          </Text>

          <View
            style={
              styles.celebrationMessage
            }
          >
            <Text
              style={
                styles.celebrationEmoji
              }
            >
              🥳
            </Text>

            <Text
              style={
                styles.celebrationTitle
              }
            >
              Let the birthday
              begin!
            </Text>
          </View>
        </View>
      ) : null}

      {/* SHARE MODAL */}
      <Modal
        visible={
          shareModalVisible
        }
        transparent
        animationType="fade"
        onRequestClose={
          closeShareModal
        }
      >
        <View
          style={
            styles.modalBackdrop
          }
        >
          <View
            style={styles.shareModal}
          >
            <View
              style={
                styles.modalHandle
              }
            />

            <Text
              style={styles.modalEmoji}
            >
              💌
            </Text>

            <Text
              style={styles.modalTitle}
            >
              Share this birthday
            </Text>

            <Text
              style={
                styles.modalSubtitle
              }
            >
              Copy the message and send
              it anywhere.
            </Text>

            <View
              style={
                styles.messageBox
              }
            >
              <Text
                style={
                  styles.messageText
                }
                selectable
              >
                {shareMessage}
              </Text>
            </View>

            <Pressable
              onPress={copyMessage}
              style={({ pressed }) => [
                styles.copyButton,
                pressed &&
                  styles.copyButtonPressed,
              ]}
            >
              <Text
                style={
                  styles.copyButtonText
                }
              >
                {copySuccess
                  ? "✓ Copied!"
                  : "Copy message"}
              </Text>
            </Pressable>

            <Pressable
              onPress={
                closeShareModal
              }
              style={
                styles.cancelButton
              }
            >
              <Text
                style={
                  styles.cancelButtonText
                }
              >
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  content: {
    paddingBottom: 30,
  },

  birthdayCard: {
    borderRadius: 30,
    borderWidth: 1,
    padding: 18,
    overflow: "hidden",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 5,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginBottom: 14,
  },

  templateLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },

  templateEmoji: {
    fontSize: 22,
  },

  mainPhotoWrapper: {
    width: "100%",
    aspectRatio: 1.05,
    borderRadius: 23,
    overflow: "hidden",
    position: "relative",
  },

  mainPhoto: {
    width: "100%",
    height: "100%",
  },

  photoOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    bottom: 8,
    left: 8,
    borderRadius: 18,
    borderWidth: 1,
  },

  photoPlaceholder: {
    width: "100%",
    aspectRatio: 1.05,
    borderRadius: 23,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },

  photoPlaceholderEmoji: {
    fontSize: 42,
    marginBottom: 10,
  },

  photoPlaceholderText: {
    fontSize: 13,
    fontWeight: "800",
  },

  greeting: {
    alignItems: "center",
    marginTop: 24,
  },

  smallGreeting: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2.5,
  },

  name: {
    fontSize: 38,
    lineHeight: 43,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
    marginTop: 6,
    letterSpacing: -1,
  },

  age: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 5,
  },

  divider: {
    width: 55,
    height: 2,
    alignSelf: "center",
    marginVertical: 20,
  },

  wish: {
    fontSize: 15,
    lineHeight: 23,
    color: COLORS.textSoft,
    textAlign: "center",
    paddingHorizontal: 12,
  },

  date: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 16,
    letterSpacing: 0.5,
  },

  stickers: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 16,
    gap: 6,
  },

  sticker: {
    fontSize: 21,
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    gap: 4,
  },

  footerText: {
    fontSize: 9,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  footerBrand: {
    fontSize: 10,
    fontWeight: "900",
  },

  celebrateButton: {
    backgroundColor:
      COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 2,
  },

  pressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  celebrateIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor:
      COLORS.yellow,
    textAlign: "center",
    textAlignVertical:
      "center",
    fontSize: 23,
    overflow: "hidden",
  },

  celebrateContent: {
    flex: 1,
    marginLeft: 12,
  },

  celebrateTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
  },

  celebrateSubtitle: {
    fontSize: 11,
    color: COLORS.textSoft,
    marginTop: 3,
  },

  arrow: {
    fontSize: 25,
    color: COLORS.muted,
  },

  actionsTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
    marginTop: 25,
    marginBottom: 11,
  },

  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent:
      "space-between",
  },

  actionCard: {
    width: "48.3%",
    backgroundColor:
      COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    padding: 15,
    marginBottom: 10,
  },

  actionIcon: {
    fontSize: 23,
    marginBottom: 11,
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  actionSubtitle: {
    fontSize: 10,
    color: COLORS.textSoft,
    marginTop: 4,
    lineHeight: 15,
  },

  shareSection: {
    marginTop: 10,
  },

  shareHint: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
    marginBottom: 2,
  },

  empty: {
    backgroundColor:
      COLORS.white,
    borderRadius: 26,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  emptyEmoji: {
    fontSize: 48,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },

  emptyText: {
    fontSize: 13,
    color: COLORS.textSoft,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 7,
    marginBottom: 12,
  },

  bottomSpace: {
    height: 10,
  },

  confettiLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 100,
  },

  confetti: {
    position: "absolute",
    fontSize: 32,
  },

  celebrationMessage: {
    position: "absolute",
    left: 30,
    right: 30,
    top: "42%",
    backgroundColor:
      "rgba(255,255,255,0.97)",
    borderRadius: 28,
    padding: 25,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 25,
    shadowOffset: {
      width: 0,
      height: 10,
    },

    elevation: 10,
  },

  celebrationEmoji: {
    fontSize: 42,
  },

  celebrationTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
    marginTop: 10,
  },

  /*
   * SHARE MODAL
   */

  modalBackdrop: {
    flex: 1,
    backgroundColor:
      "rgba(20,16,18,0.48)",
    justifyContent: "flex-end",
  },

  shareModal: {
    backgroundColor:
      COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 30,

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 25,
    shadowOffset: {
      width: 0,
      height: -5,
    },

    elevation: 15,
  },

  modalHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor:
      COLORS.border,
    alignSelf: "center",
    marginBottom: 20,
  },

  modalEmoji: {
    fontSize: 38,
    textAlign: "center",
    marginBottom: 8,
  },

  modalTitle: {
    fontSize: 23,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },

  modalSubtitle: {
    fontSize: 13,
    color: COLORS.textSoft,
    textAlign: "center",
    marginTop: 5,
    marginBottom: 17,
  },

  messageBox: {
    backgroundColor:
      COLORS.background,
    borderRadius: 18,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    padding: 15,
    maxHeight: 210,
  },

  messageText: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.text,
  },

  copyButton: {
    height: 54,
    borderRadius: 18,
    backgroundColor:
      COLORS.pink,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },

  copyButtonPressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  copyButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "900",
  },

  cancelButton: {
    height: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },

  cancelButtonText: {
    color: COLORS.textSoft,
    fontSize: 14,
    fontWeight: "800",
  },
});