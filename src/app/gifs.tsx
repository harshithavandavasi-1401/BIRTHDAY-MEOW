import { useFocusEffect, useRouter } from "expo-router";
import {
  useCallback,
  useState,
} from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  COLORS,
  Header,
  PrimaryButton,
} from "@/components/birthday-ui";

import {
  BirthdayDraft,
  loadDraft,
  saveDraft,
} from "@/lib/birthday-storage";

const STICKERS = [
  "🎉",
  "🎂",
  "🥳",
  "🎈",
  "🎁",
  "💖",
  "💕",
  "✨",
  "🌸",
  "🎀",
  "🧁",
  "🐱",
  "🫶",
  "💫",
  "🍰",
  "🌈",
];

export default function GifsScreen() {
  const router = useRouter();

  const [draft, setDraft] =
    useState<BirthdayDraft | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadDraft().then(setDraft);
    }, [])
  );

  const toggleSticker = async (
    sticker: string
  ) => {
    if (!draft) return;

    const exists =
      draft.stickers.includes(sticker);

    const stickers = exists
      ? draft.stickers.filter(
          (item) => item !== sticker
        )
      : [...draft.stickers, sticker];

    const next = await saveDraft({
      stickers,
    });

    setDraft(next);
  };

  return (
    <View style={styles.screen}>
      <Header
        title="GIFs & Stickers"
        subtitle="Add some birthday fun"
        onBack={() => router.back()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>
            🎉
          </Text>

          <Text style={styles.heroTitle}>
            Make it playful.
          </Text>

          <Text style={styles.heroSubtitle}>
            Pick the little details that make the
            birthday feel alive.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Stickers
        </Text>

        <View style={styles.grid}>
          {STICKERS.map((sticker) => {
            const selected =
              draft?.stickers.includes(
                sticker
              );

            return (
              <Pressable
                key={sticker}
                onPress={() =>
                  toggleSticker(sticker)
                }
                style={[
                  styles.sticker,
                  selected &&
                    styles.stickerSelected,
                ]}
              >
                <Text style={styles.stickerText}>
                  {sticker}
                </Text>

                {selected ? (
                  <View style={styles.check}>
                    <Text
                      style={
                        styles.checkText
                      }
                    >
                      ✓
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <PrimaryButton
          title="Done"
          onPress={() => router.back()}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: 20,
    paddingBottom: 45,
  },

  hero: {
    backgroundColor: COLORS.yellow,
    borderRadius: 24,
    padding: 25,
    alignItems: "center",
  },

  heroEmoji: {
    fontSize: 50,
  },

  heroTitle: {
    color: COLORS.text,
    fontSize: 23,
    fontWeight: "900",
    marginTop: 8,
  },

  heroSubtitle: {
    color: COLORS.textSoft,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 5,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 25,
    marginBottom: 13,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 11,
  },

  sticker: {
    width: "22.8%",
    aspectRatio: 1,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  stickerSelected: {
    backgroundColor: COLORS.pinkSoft,
    borderColor: COLORS.pink,
  },

  stickerText: {
    fontSize: 31,
  },

  check: {
    position: "absolute",
    right: 5,
    top: 5,
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: COLORS.pink,
    alignItems: "center",
    justifyContent: "center",
  },

  checkText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
});