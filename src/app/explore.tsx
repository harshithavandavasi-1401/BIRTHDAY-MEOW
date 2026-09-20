import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import {
  COLORS,
  Header,
  OptionCard,
  Screen,
} from "@/components/birthday-ui";

const exploreItems = [
  {
    emoji: "🎨",
    title: "Templates",
    subtitle: "Pick a birthday card style",
    route: "/templates",
  },
  {
    emoji: "💌",
    title: "Birthday wishes",
    subtitle: "Write something meaningful",
    route: "/wishes",
  },
  {
    emoji: "🎵",
    title: "Music",
    subtitle: "Add a soundtrack",
    route: "/music",
  },
  {
    emoji: "✨",
    title: "GIFs & stickers",
    subtitle: "Make the card playful",
    route: "/gifs",
  },
  {
    emoji: "🎀",
    title: "Customize",
    subtitle: "Colors and typography",
    route: "/customize",
  },
];

export default function ExploreScreen() {
  const router = useRouter();

  return (
    <Screen>
      <Header
        title="Explore"
        subtitle="Everything you can add to your birthday"
        onBack={() => router.back()}
      />

      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🐱</Text>

        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>
            Make it purr-fect
          </Text>

          <Text style={styles.heroText}>
            Mix templates, wishes, music, stickers and
            customization to create something personal.
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        Birthday Meow tools
      </Text>

      <Text style={styles.sectionSubtitle}>
        Tap any option to start editing your birthday.
      </Text>

      <View style={styles.list}>
        {exploreItems.map((item) => (
          <OptionCard
            key={item.route}
            emoji={item.emoji}
            title={item.title}
            subtitle={item.subtitle}
            onPress={() =>
              router.push(
                item.route as
                  | "/templates"
                  | "/wishes"
                  | "/music"
                  | "/gifs"
                  | "/customize"
              )
            }
          />
        ))}
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipEmoji}>💡</Text>

        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>
            Everything saves automatically
          </Text>

          <Text style={styles.tipText}>
            Your birthday details stay saved on this device
            while you build your card.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: COLORS.pinkLighter,
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  heroEmoji: {
    fontSize: 42,
    marginRight: 14,
  },

  heroContent: {
    flex: 1,
  },

  heroTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.text,
  },

  heroText: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSoft,
    marginTop: 5,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.text,
  },

  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSoft,
    marginTop: 4,
    marginBottom: 13,
  },

  list: {
    marginBottom: 8,
  },

  tipCard: {
    backgroundColor: COLORS.yellow,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  tipEmoji: {
    fontSize: 25,
    marginRight: 11,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
  },

  tipText: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSoft,
    marginTop: 4,
  },
});