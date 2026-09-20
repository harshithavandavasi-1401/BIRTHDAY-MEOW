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

const TEMPLATES = [
  {
    id: "cute",
    name: "Cute Pink",
    emoji: "🎀",
    background: "#FFE3EA",
    accent: "#E85D75",
    description: "Soft, cute and playful",
  },
  {
    id: "floral",
    name: "Floral",
    emoji: "🌸",
    background: "#FCE8F1",
    accent: "#C85C88",
    description: "Pretty flowers and soft colors",
  },
  {
    id: "party",
    name: "Party",
    emoji: "🎉",
    background: "#FFF0D9",
    accent: "#F18A4B",
    description: "Bright and energetic",
  },
  {
    id: "elegant",
    name: "Elegant",
    emoji: "✨",
    background: "#EEE8FF",
    accent: "#8167C8",
    description: "Simple and sophisticated",
  },
  {
    id: "rainbow",
    name: "Colorful",
    emoji: "🌈",
    background: "#E5F5F0",
    accent: "#45A88A",
    description: "Fun and colorful",
  },
];

export default function TemplatesScreen() {
  const router = useRouter();

  const [draft, setDraft] =
    useState<BirthdayDraft | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadDraft().then(setDraft);
    }, [])
  );

  const selectTemplate = async (
    template: (typeof TEMPLATES)[number]
  ) => {
    const next = await saveDraft({
      templateId: template.id,
      background: template.background,
      accent: template.accent,
    });

    setDraft(next);
  };

  return (
    <View style={styles.screen}>
      <Header
        title="Templates"
        subtitle="Choose their birthday style"
        onBack={() => router.back()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>
          Pick a mood 🎀
        </Text>

        <Text style={styles.subtitle}>
          Your template controls the overall look of
          their birthday.
        </Text>

        {TEMPLATES.map((template) => {
          const selected =
            draft?.templateId === template.id;

          return (
            <Pressable
              key={template.id}
              onPress={() =>
                selectTemplate(template)
              }
              style={[
                styles.template,
                {
                  backgroundColor:
                    template.background,
                },
                selected &&
                  styles.templateSelected,
              ]}
            >
              <View
                style={[
                  styles.preview,
                  {
                    backgroundColor:
                      template.background,
                  },
                ]}
              >
                <Text style={styles.previewEmoji}>
                  {template.emoji}
                </Text>

                <Text
                  style={[
                    styles.previewName,
                    {
                      color:
                        template.accent,
                    },
                  ]}
                >
                  Happy Birthday
                </Text>

                <View
                  style={[
                    styles.previewLine,
                    {
                      backgroundColor:
                        template.accent,
                    },
                  ]}
                />
              </View>

              <View style={styles.templateInfo}>
                <Text style={styles.templateName}>
                  {template.name}
                </Text>

                <Text
                  style={styles.templateDescription}
                >
                  {template.description}
                </Text>
              </View>

              {selected ? (
                <View style={styles.check}>
                  <Text style={styles.checkText}>
                    ✓
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}

        <PrimaryButton
          title="Continue"
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

  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 8,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
    marginBottom: 20,
  },

  template: {
    borderRadius: 24,
    padding: 12,
    marginBottom: 13,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },

  templateSelected: {
    borderColor: COLORS.pink,
  },

  preview: {
    height: 145,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  previewEmoji: {
    fontSize: 40,
  },

  previewName: {
    fontSize: 20,
    fontWeight: "900",
    marginTop: 8,
  },

  previewLine: {
    width: 70,
    height: 4,
    borderRadius: 4,
    marginTop: 8,
  },

  templateInfo: {
    paddingHorizontal: 5,
    paddingTop: 12,
  },

  templateName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
  },

  templateDescription: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },

  check: {
    position: "absolute",
    right: 19,
    top: 19,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.pink,
    alignItems: "center",
    justifyContent: "center",
  },

  checkText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
});