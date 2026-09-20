import { ReactNode } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    ViewStyle,
} from "react-native";

export const COLORS = {
  background: "#FFF9F7",
  white: "#FFFFFF",

  pink: "#E85D75",
  pinkDark: "#D84F68",
  pinkSoft: "#FFE3EA",
  pinkLighter: "#FFF0F2",

  text: "#30272A",
  textSoft: "#806D73",
  muted: "#A09297",

  border: "#F0E3E6",

  yellow: "#FFF0D9",
  purple: "#EEE8FF",
  green: "#E5F5F0",

  black: "#171214",
};

type ScreenProps = {
  children: ReactNode;
  contentContainerStyle?: ViewStyle;
  scroll?: boolean;
};

export function Screen({
  children,
  contentContainerStyle,
  scroll = true,
}: ScreenProps) {
  if (!scroll) {
    return (
      <View style={[styles.screen, contentContainerStyle]}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.scrollContent,
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

type HeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
};

export function Header({
  title,
  subtitle,
  onBack,
  right,
}: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            style={styles.backButton}
            hitSlop={10}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>
        ) : null}

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{title}</Text>

          {subtitle ? (
            <Text style={styles.headerSubtitle}>{subtitle}</Text>
          ) : null}
        </View>
      </View>

      {right ? <View>{right}</View> : null}
    </View>
  );
}

type SectionTitleProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

export function SectionTitle({
  title,
  subtitle,
  right,
}: SectionTitleProps) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionTitleText}>
        <Text style={styles.sectionTitle}>{title}</Text>

        {subtitle ? (
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        ) : null}
      </View>

      {right ? <View>{right}</View> : null}
    </View>
  );
}

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
  style?: ViewStyle;
};

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  secondary = false,
  style,
}: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryButton,
        secondary && styles.secondaryButton,
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressedButton,
        style,
      ]}
    >
      <Text
        style={[
          styles.primaryButtonText,
          secondary && styles.secondaryButtonText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

type OptionCardProps = {
  title: string;
  subtitle?: string;

  // Both names are supported so existing screens work.
  icon?: string;
  emoji?: string;

  selected?: boolean;
  onPress: () => void;
  rightText?: string;
};

export function OptionCard({
  title,
  subtitle,
  icon,
  emoji,
  selected = false,
  onPress,
  rightText,
}: OptionCardProps) {
  const displayIcon = emoji ?? icon;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionCard,
        selected && styles.optionCardSelected,
        pressed && styles.optionCardPressed,
      ]}
    >
      {displayIcon ? (
        <View
          style={[
            styles.optionIcon,
            selected && styles.optionIconSelected,
          ]}
        >
          <Text style={styles.optionIconText}>
            {displayIcon}
          </Text>
        </View>
      ) : null}

      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{title}</Text>

        {subtitle ? (
          <Text style={styles.optionSubtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightText ? (
        <Text style={styles.optionRightText}>
          {rightText}
        </Text>
      ) : (
        <Text style={styles.optionArrow}>
          {selected ? "✓" : "›"}
        </Text>
      )}
    </Pressable>
  );
}

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
};

export function Chip({
  label,
  selected = false,
  onPress,
}: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.chipPressed,
      ]}
    >
      <Text
        style={[
          styles.chipText,
          selected && styles.chipTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type EmptyStateProps = {
  icon?: string;
  title: string;
  message?: string;
  action?: ReactNode;
};

export function EmptyState({
  icon = "🐱",
  title,
  message,
  action,
}: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>{icon}</Text>
      </View>

      <Text style={styles.emptyTitle}>{title}</Text>

      {message ? (
        <Text style={styles.emptyMessage}>{message}</Text>
      ) : null}

      {action ? (
        <View style={styles.emptyAction}>{action}</View>
      ) : null}
    </View>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "numeric" | "email-address";
};

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = "default",
}: FieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.muted}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        style={[
          styles.input,
          multiline && styles.multilineInput,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },

  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  backText: {
    fontSize: 32,
    lineHeight: 34,
    color: COLORS.text,
    marginTop: -3,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSoft,
    marginTop: 3,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 10,
  },

  sectionTitleText: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },

  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSoft,
    marginTop: 3,
  },

  primaryButton: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: COLORS.pink,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    marginTop: 10,
  },

  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
  },

  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  secondaryButtonText: {
    color: COLORS.text,
  },

  disabledButton: {
    opacity: 0.45,
  },

  pressedButton: {
    transform: [{ scale: 0.98 }],
  },

  optionCard: {
    minHeight: 74,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 10,
  },

  optionCardSelected: {
    borderColor: COLORS.pink,
    backgroundColor: COLORS.pinkLighter,
  },

  optionCardPressed: {
    opacity: 0.8,
  },

  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.pinkLighter,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  optionIconSelected: {
    backgroundColor: COLORS.pinkSoft,
  },

  optionIconText: {
    fontSize: 23,
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },

  optionSubtitle: {
    fontSize: 12,
    color: COLORS.textSoft,
    marginTop: 3,
  },

  optionRightText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.pink,
    marginLeft: 8,
  },

  optionArrow: {
    fontSize: 25,
    color: COLORS.muted,
    marginLeft: 8,
  },

  chip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
    marginBottom: 8,
  },

  chipSelected: {
    backgroundColor: COLORS.pink,
    borderColor: COLORS.pink,
  },

  chipPressed: {
    opacity: 0.75,
  },

  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSoft,
  },

  chipTextSelected: {
    color: COLORS.white,
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 45,
    paddingHorizontal: 25,
  },

  emptyIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: COLORS.pinkLighter,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  emptyIconText: {
    fontSize: 35,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
  },

  emptyMessage: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textSoft,
    textAlign: "center",
    marginTop: 7,
  },

  emptyAction: {
    marginTop: 15,
    width: "100%",
  },

  fieldContainer: {
    marginBottom: 16,
  },

  fieldLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
  },

  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    color: COLORS.text,
    fontSize: 15,
  },

  multilineInput: {
    minHeight: 120,
    paddingTop: 14,
    paddingBottom: 14,
  },
});