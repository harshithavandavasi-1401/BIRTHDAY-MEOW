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

const BACKGROUNDS = [
  "#FFE3EA",
  "#FCE8F1",
  "#FFF0D9",
  "#EEE8FF",
  "#E5F5F0",
  "#EAF2FF",
  "#FFF8D8",
  "#F5E8FF",
];

const ACCENTS = [
  "#E85D75",
  "#D95C8A",
  "#F18A4B",
  "#8167C8",
  "#45A88A",
  "#5288D8",
  "#D5A52E",
  "#A75CD1",
];

export default function CustomizeScreen() {
  const router = useRouter();

  const [draft, setDraft] =
    useState<BirthdayDraft | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadDraft().then(setDraft);
    }, [])
  );

  const change = async (
    patch: Partial<BirthdayDraft>
  ) => {
    const next = await saveDraft(patch);

    setDraft(next);
  };

  return (
    <View style={styles.screen}>
      <Header
        title="Customize"
        subtitle="Make it completely yours"
        onBack={() => router.back()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View
          style={[
            styles.preview,
            {
              backgroundColor:
                draft?.background ||
                COLORS.pinkSoft,
            },
          ]}
        >
          <Text
            style={[
              styles.previewEmoji,
              {
                color:
                  draft?.accent ||
                  COLORS.pink,
              },
            ]}
          >
            🎂
          </Text>

          <Text
            style={[
              styles.previewTitle,
              {
                color:
                  draft?.accent ||
                  COLORS.pink,
              },
            ]}
          >
            Happy Birthday
          </Text>

          <Text style={styles.previewText}>
            Make it purr-fect.
          </Text>
        </View>

        <Text style={styles.title}>
          Background
        </Text>

        <View style={styles.colorGrid}>
          {BACKGROUNDS.map((color) => (
            <Pressable
              key={color}
              onPress={() =>
                change({
                  background: color,
                })
              }
              style={[
                styles.color,
                {
                  backgroundColor: color,
                },
                draft?.background === color &&
                  styles.colorSelected,
              ]}
            />
          ))}
        </View>

        <Text style={styles.title}>
          Accent color
        </Text>

        <View style={styles.colorGrid}>
          {ACCENTS.map((color) => (
            <Pressable
              key={color}
              onPress={() =>
                change({
                  accent: color,
                })
              }
              style={[
                styles.color,
                {
                  backgroundColor: color,
                },
                draft?.accent === color &&
                  styles.colorSelected,
              ]}
            />
          ))}
        </View>

        <Text style={styles.title}>
          Typography
        </Text>

        <View style={styles.fontRow}>
          {[
            {
              id: "bold" as const,
              title: "Bold",
            },
            {
              id: "soft" as const,
              title: "Soft",
            },
            {
              id: "elegant" as const,
              title: "Elegant",
            },
          ].map((font) => (
            <Pressable
              key={font.id}
              onPress={() =>
                change({
                  fontStyle: font.id,
                })
              }
              style={[
                styles.fontCard,
                draft?.fontStyle ===
                  font.id &&
                  styles.fontSelected,
              ]}
            >
              <Text
                style={[
                  styles.fontText,
                  font.id === "bold" &&
                    styles.boldFont,
                  font.id === "soft" &&
                    styles.softFont,
                  font.id === "elegant" &&
                    styles.elegantFont,
                ]}
              >
                Aa
              </Text>

              <Text
                style={styles.fontName}
              >
                {font.title}
              </Text>
            </Pressable>
          ))}
        </View>

        <PrimaryButton
          title="Save Customize"
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

  preview: {
    height: 200,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },

  previewEmoji: {
    fontSize: 45,
  },

  previewTitle: {
    fontSize: 25,
    fontWeight: "900",
    marginTop: 8,
  },

  previewText: {
    color: COLORS.textSoft,
    fontSize: 12,
    marginTop: 4,
  },

  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 25,
    marginBottom: 13,
  },

  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  color: {
    width: 53,
    height: 53,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "transparent",
  },

  colorSelected: {
    borderColor: COLORS.text,
    transform: [{ scale: 1.08 }],
  },

  fontRow: {
    flexDirection: "row",
    gap: 10,
  },

  fontCard: {
    flex: 1,
    minHeight: 90,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  fontSelected: {
    borderColor: COLORS.pink,
    backgroundColor: COLORS.pinkSoft,
  },

  fontText: {
    color: COLORS.text,
    fontSize: 27,
  },

  boldFont: {
    fontWeight: "900",
  },

  softFont: {
    fontWeight: "500",
  },

  elegantFont: {
    fontWeight: "300",
    fontStyle: "italic",
  },

  fontName: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 4,
  },
});