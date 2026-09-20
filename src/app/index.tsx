import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { BirthdayDraft, loadDraft } from "../lib/birthday-storage";

// --------------------------------------------------
// LOCAL DESIGN COLORS
// --------------------------------------------------

const COLORS = {
  background: "#FFF9F7",
  white: "#FFFFFF",

  pink: "#E85D75",
  pinkDark: "#D84F68",
  pinkSoft: "#FFE3EA",
  pinkLighter: "#FFF0F2",

  text: "#30272A",
  textSoft: "#806D73",

  border: "#F0E3E6",
};

// --------------------------------------------------
// HOME SCREEN
// --------------------------------------------------

export default function HomeScreen() {
  const router = useRouter();

  const [draft, setDraft] = useState<BirthdayDraft | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        try {
          const saved = await loadDraft();

          if (active) {
            setDraft(saved);
          }
        } catch (error) {
          console.log("Failed to load birthday draft:", error);
        }
      };

      load();

      return () => {
        active = false;
      };
    }, [])
  );

  const hasSavedBirthday =
    !!draft?.name &&
    !!draft?.birthday;

  const createNewBirthday = () => {
    router.push("/create?new=1");
  };

  const continueBirthday = () => {
    router.push("/create");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* =========================================
            HEADER
        ========================================= */}

        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <Text style={styles.brand}>
              birthday meow 🐱
            </Text>

            <Text style={styles.tagline}>
              make it purr-fect ✨
            </Text>
          </View>

          <View style={styles.catBadge}>
            <Text style={styles.catBadgeText}>🐱</Text>
          </View>
        </View>

        {/* =========================================
            HERO
        ========================================= */}

        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>
            CREATE SOMETHING SPECIAL
          </Text>

          <Text style={styles.heroTitle}>
            A birthday{"\n"}
            made just for them.
          </Text>

          {/* SAVED BIRTHDAY */}

          {hasSavedBirthday && (
            <View style={styles.savedBirthday}>
              <View style={styles.savedInfo}>
                <View style={styles.savedDot} />

                <View style={styles.savedTextBlock}>
                  <Text style={styles.savedLabel}>
                    YOUR SAVED BIRTHDAY
                  </Text>

                  <Text style={styles.savedName}>
                    {draft?.name}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={continueBirthday}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  Continue creating
                </Text>

                <Text style={styles.primaryButtonArrow}>
                  →
                </Text>
              </Pressable>
            </View>
          )}

          {/* CREATE NEW */}

          <Pressable
            onPress={createNewBirthday}
            style={({ pressed }) => [
              hasSavedBirthday
                ? styles.secondaryButton
                : styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text
              style={
                hasSavedBirthday
                  ? styles.secondaryButtonText
                  : styles.primaryButtonText
              }
            >
              Create a new one
            </Text>

            <Text
              style={
                hasSavedBirthday
                  ? styles.secondaryButtonIcon
                  : styles.primaryButtonArrow
              }
            >
              +
            </Text>
          </Pressable>

          {/* DECORATIVE CAT */}

          <View style={styles.heroCat}>
            <Text style={styles.heroCatText}>
              🐱
            </Text>
          </View>
        </View>

        {/* =========================================
            QUICK BUILD
        ========================================= */}

        <View style={styles.quickSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>
                QUICK BUILD
              </Text>

              <Text style={styles.sectionTitle}>
                Make it yours
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/create")}
              hitSlop={10}
            >
              <Text style={styles.viewAll}>
                View all →
              </Text>
            </Pressable>
          </View>

          <View style={styles.featureGrid}>
            <FeatureCard
              number="01"
              title="Templates"
              subtitle="Pick a look"
              onPress={() => router.push("/templates")}
            />

            <FeatureCard
              number="02"
              title="Photos"
              subtitle="Add memories"
              onPress={() => router.push("/photos")}
            />

            <FeatureCard
              number="03"
              title="Birthday wish"
              subtitle="Write something"
              onPress={() => router.push("/wishes")}
            />

            <FeatureCard
              number="04"
              title="Music"
              subtitle="Set the mood"
              onPress={() => router.push("/music")}
            />
          </View>
        </View>

        {/* =========================================
            FOOTER
        ========================================= */}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with love, one birthday at a time.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// --------------------------------------------------
// FEATURE CARD
// --------------------------------------------------

function FeatureCard({
  number,
  title,
  subtitle,
  onPress,
}: {
  number: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.featureCard,
        pressed && styles.featurePressed,
      ]}
    >
      <View style={styles.featureTop}>
        <Text style={styles.featureNumber}>
          {number}
        </Text>

        <Text style={styles.featureArrow}>
          ↗
        </Text>
      </View>

      <View>
        <Text style={styles.featureTitle}>
          {title}
        </Text>

        <Text style={styles.featureSubtitle}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

// --------------------------------------------------
// STYLES
// --------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // ---------------- HEADER ----------------

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 28,
  },

  brandBlock: {
    flex: 1,
    paddingRight: 12,
  },

  brand: {
    fontSize: 42,
    lineHeight: 48,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: -1.8,
  },

  tagline: {
    marginTop: 5,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
    color: COLORS.textSoft,
    letterSpacing: 0.2,
  },

  catBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.pinkLighter,
    alignItems: "center",
    justifyContent: "center",
  },

  catBadgeText: {
    fontSize: 32,
  },

  // ---------------- HERO ----------------

  heroCard: {
    minHeight: 510,
    borderRadius: 34,
    backgroundColor: COLORS.pinkSoft,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 28,
    overflow: "hidden",
    position: "relative",
  },

  eyebrow: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
    letterSpacing: 2.5,
    color: COLORS.pinkDark,
    marginBottom: 20,
  },

  heroTitle: {
    fontSize: 38,
    lineHeight: 43,
    fontWeight: "900",
    letterSpacing: -1.3,
    color: COLORS.text,
    maxWidth: 350,
  },

  // ---------------- SAVED BIRTHDAY ----------------

  savedBirthday: {
    marginTop: 30,
  },

  savedInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  savedDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.pink,
    marginRight: 10,
  },

  savedTextBlock: {
    flex: 1,
  },

  savedLabel: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: COLORS.textSoft,
  },

  savedName: {
    marginTop: 2,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "800",
    color: COLORS.text,
  },

  // ---------------- BUTTONS ----------------

  primaryButton: {
    minHeight: 62,
    borderRadius: 20,
    backgroundColor: COLORS.pink,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,

    shadowColor: COLORS.pinkDark,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5,
  },

  primaryButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.2,
  },

  primaryButtonArrow: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "800",
  },

  secondaryButton: {
    minHeight: 58,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: COLORS.pink,
    backgroundColor: "rgba(255,255,255,0.72)",
    paddingHorizontal: 20,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  secondaryButtonText: {
    color: COLORS.pinkDark,
    fontSize: 17,
    fontWeight: "800",
  },

  secondaryButtonIcon: {
    color: COLORS.pinkDark,
    fontSize: 24,
    fontWeight: "700",
  },

  buttonPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.9,
  },

  // ---------------- HERO CAT ----------------

  heroCat: {
    position: "absolute",
    right: 20,
    bottom: 8,
  },

  heroCatText: {
    fontSize: 122,
  },

  // ---------------- QUICK BUILD ----------------

  quickSection: {
    marginTop: 38,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  sectionEyebrow: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    letterSpacing: 1.8,
    color: COLORS.pinkDark,
  },

  sectionTitle: {
    marginTop: 4,
    fontSize: 27,
    lineHeight: 32,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: -0.7,
  },

  viewAll: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.pinkDark,
    marginBottom: 3,
  },

  // ---------------- FEATURE GRID ----------------

  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },

  featureCard: {
    width: "48%",
    minHeight: 145,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    justifyContent: "space-between",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },

  featurePressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.88,
  },

  featureTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  featureNumber: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    color: COLORS.pink,
  },

  featureArrow: {
    fontSize: 20,
    color: COLORS.textSoft,
    fontWeight: "500",
  },

  featureTitle: {
    marginTop: 20,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800",
    color: COLORS.text,
  },

  featureSubtitle: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.textSoft,
    fontWeight: "600",
  },

  // ---------------- FOOTER ----------------

  footer: {
    alignItems: "center",
    paddingTop: 38,
  },

  footerText: {
    fontSize: 12,
    color: COLORS.textSoft,
    fontWeight: "600",
  },
});