import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  COLORS,
  Header,
  OptionCard,
  PrimaryButton,
  Screen,
} from "@/components/birthday-ui";

import {
  BirthdayDraft,
  loadDraft,
  saveDraft,
} from "@/lib/birthday-storage";

const wishOptions = [
  {
    key: "sweet",
    emoji: "💗",
    title: "Sweet & heartfelt",
    subtitle: "Warm and meaningful",
    text: "Wishing you a beautiful birthday filled with happiness, love, laughter and all the little moments that make life special. You deserve an amazing year ahead!",
  },
  {
    key: "fun",
    emoji: "🥳",
    title: "Fun & playful",
    subtitle: "Light, cheerful and energetic",
    text: "Happy Birthday! May your day be full of cake, laughs, surprises and absolutely no boring moments. Keep being your wonderful self!",
  },
  {
    key: "short",
    emoji: "✨",
    title: "Short & elegant",
    subtitle: "Simple and classy",
    text: "Happy Birthday! Wishing you happiness, success and countless beautiful memories in the year ahead.",
  },
  {
    key: "bestie",
    emoji: "🫶",
    title: "Best friend energy",
    subtitle: "For your favorite person",
    text: "Happy Birthday to one of the most special people in my life! Thank you for all the laughs, memories and madness. Here's to many more unforgettable moments together!",
  },
];

export default function WishesScreen() {
  const router = useRouter();

  const [draft, setDraft] =
    useState<BirthdayDraft | null>(null);

  const [selectedKey, setSelectedKey] =
    useState<string>("");

  const [customWish, setCustomWish] =
    useState("");

  const loadData = useCallback(async () => {
    try {
      const currentDraft = await loadDraft();

      setDraft(currentDraft);

      const savedWish = currentDraft.wish || "";

      setCustomWish(savedWish);

      const matchingOption = wishOptions.find(
        (option) => option.text === savedWish
      );

      setSelectedKey(
        matchingOption?.key || ""
      );
    } catch (error) {
      console.error("Failed to load wish:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const chooseWish = (option: (typeof wishOptions)[number]) => {
    setSelectedKey(option.key);
    setCustomWish(option.text);
  };

  const saveWish = async () => {
    const trimmedWish = customWish.trim();

    if (!trimmedWish) {
      Alert.alert(
        "Add a birthday wish",
        "Please choose a wish or write your own message."
      );
      return;
    }

    try {
      const updatedDraft = await saveDraft({
        wish: trimmedWish,
      });

      setDraft(updatedDraft);

      Alert.alert(
        "Wish saved",
        "Your birthday message has been saved."
      );
    } catch (error) {
      console.error("Save wish error:", error);

      Alert.alert(
        "Could not save",
        "Please try again."
      );
    }
  };

  return (
    <Screen>
      <Header
        title="Birthday wish"
        subtitle="Say something they will remember"
        onBack={() => router.back()}
      />

      <View style={styles.introCard}>
        <Text style={styles.introEmoji}>💌</Text>

        <View style={styles.introContent}>
          <Text style={styles.introTitle}>
            Pick a message or write your own
          </Text>

          <Text style={styles.introText}>
            You can edit any of the suggested wishes below.
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        Quick wishes
      </Text>

      <Text style={styles.sectionSubtitle}>
        Choose a starting point.
      </Text>

      <View style={styles.options}>
        {wishOptions.map((option) => (
          <OptionCard
            key={option.key}
            emoji={option.emoji}
            title={option.title}
            subtitle={option.subtitle}
            selected={selectedKey === option.key}
            onPress={() => chooseWish(option)}
          />
        ))}
      </View>

      <Text style={styles.sectionTitle}>
        Your message
      </Text>

      <Text style={styles.sectionSubtitle}>
        Make it personal.
      </Text>

      <TextInput
        value={customWish}
        onChangeText={(value) => {
          setCustomWish(value);
          setSelectedKey("");
        }}
        placeholder="Write your birthday wish here..."
        placeholderTextColor={COLORS.muted}
        multiline
        textAlignVertical="top"
        style={styles.textInput}
      />

      <PrimaryButton
        title="Save wish"
        onPress={saveWish}
      />

      <PrimaryButton
        title="Done"
        onPress={() => router.back()}
        secondary
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  introCard: {
    backgroundColor: COLORS.pinkLighter,
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  introEmoji: {
    fontSize: 34,
    marginRight: 13,
  },

  introContent: {
    flex: 1,
  },

  introTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },

  introText: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSoft,
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 4,
  },

  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSoft,
    marginTop: 4,
    marginBottom: 12,
  },

  options: {
    marginBottom: 15,
  },

  textInput: {
    minHeight: 145,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 15,
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 5,
  },
});