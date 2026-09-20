import * as ImagePicker from "expo-image-picker";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import {
  useCallback,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  COLORS,
  Header,
  PrimaryButton,
} from "@/components/birthday-ui";

import {
  BirthdayDraft,
  EMPTY_DRAFT,
  loadDraft,
  persistLocalFile,
  saveDraft,
} from "@/lib/birthday-storage";

const RELATIONSHIPS = [
  "Best Friend",
  "Friend",
  "Partner",
  "Sister",
  "Brother",
  "Mom",
  "Dad",
  "Family",
  "Other",
];

export default function CreateBirthdayScreen() {
  const router = useRouter();

  const params =
    useLocalSearchParams<{
      new?: string;
    }>();

  const newMode = params.new === "1";

  const initialized = useRef(false);

  const [draft, setDraft] =
    useState<BirthdayDraft>({
      ...EMPTY_DRAFT,
    });

  const [calendarOpen, setCalendarOpen] =
    useState(false);

  const [calendarMonth, setCalendarMonth] =
    useState(new Date());

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        if (!initialized.current) {
          initialized.current = true;

          if (newMode) {
            setDraft({
              ...EMPTY_DRAFT,
              id: Date.now().toString(),
            });
            return;
          }
        }

        const data = await loadDraft();

        setDraft(data);

        if (data.birthday) {
          const date = new Date(
            data.birthday
          );

          if (!Number.isNaN(date.getTime())) {
            setCalendarMonth(date);
          }
        }
      };

      load();
    }, [newMode])
  );

  const update = async (
    patch: Partial<BirthdayDraft>
  ) => {
    const next = {
      ...draft,
      ...patch,
    };

    setDraft(next);

    await saveDraft(patch);
  };

  const pickPhotos = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Allow Birthday Meow to access your photos."
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: 8,
        quality: 0.9,
      });

    if (
      result.canceled ||
      !result.assets?.length
    ) {
      return;
    }

    const savedUris: string[] = [];

    for (const asset of result.assets) {
      const savedUri =
        await persistLocalFile(
          asset.uri,
          "jpg"
        );

      savedUris.push(savedUri);
    }

    await update({
      photos: [
        ...draft.photos,
        ...savedUris,
      ],
    });
  };

  const removePhoto = async (
    index: number
  ) => {
    const photos = draft.photos.filter(
      (_, i) => i !== index
    );

    await update({ photos });
  };

  const openCalendar = () => {
    if (draft.birthday) {
      const existing = new Date(
        draft.birthday
      );

      if (!Number.isNaN(existing.getTime())) {
        setCalendarMonth(existing);
      }
    }

    setCalendarOpen(true);
  };

  const selectDate = async (
    date: Date
  ) => {
    await update({
      birthday: date.toISOString(),
    });
  };

  const saveAndPreview = async () => {
    if (!draft.name.trim()) {
      Alert.alert(
        "Missing name",
        "Please enter their name."
      );
      return;
    }

    if (!draft.age.trim()) {
      Alert.alert(
        "Missing age",
        "Please enter the age they're turning."
      );
      return;
    }

    if (!draft.relationship) {
      Alert.alert(
        "Missing relationship",
        "Please select your relationship."
      );
      return;
    }

    if (!draft.birthday) {
      Alert.alert(
        "Missing birthday",
        "Please select their birthday."
      );
      return;
    }

    await saveDraft({
      ...draft,
      id: draft.id || Date.now().toString(),
    });

    router.push("/preview");
  };

  const birthdayDate = draft.birthday
    ? new Date(draft.birthday)
    : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={
          draft.name
            ? "Edit Birthday"
            : "Create Birthday"
        }
        subtitle="Make it special ✨"
        onBack={() => router.back()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.intro}>
          <Text style={styles.introEmoji}>
            🎂
          </Text>

          <Text style={styles.title}>
            Tell us about{"\n"}their birthday.
          </Text>

          <Text style={styles.subtitle}>
            We'll use these details to build their
            personalized birthday experience.
          </Text>
        </View>

        <Text style={styles.label}>
          Their name
        </Text>

        <TextInput
          value={draft.name}
          onChangeText={(name) =>
            update({ name })
          }
          placeholder="e.g. Harshitha"
          placeholderTextColor="#B8A9AE"
          style={styles.input}
        />

        <Text style={styles.label}>
          Age they're turning
        </Text>

        <TextInput
          value={draft.age}
          onChangeText={(age) =>
            update({
              age: age.replace(
                /[^0-9]/g,
                ""
              ),
            })
          }
          placeholder="21"
          placeholderTextColor="#B8A9AE"
          keyboardType="number-pad"
          maxLength={3}
          style={styles.input}
        />

        <Text style={styles.label}>
          They're your...
        </Text>

        <View style={styles.relationships}>
          {RELATIONSHIPS.map((item) => {
            const selected =
              draft.relationship === item;

            return (
              <Pressable
                key={item}
                onPress={() =>
                  update({
                    relationship: item,
                  })
                }
                style={[
                  styles.relationship,
                  selected &&
                    styles.relationshipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.relationshipText,
                    selected &&
                      styles.relationshipTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>
          Their birthday
        </Text>

        <Pressable
          onPress={openCalendar}
          style={styles.dateButton}
        >
          <View style={styles.dateIcon}>
            <Text style={styles.dateEmoji}>
              📅
            </Text>
          </View>

          <View style={styles.dateInfo}>
            <Text
              style={[
                styles.dateText,
                !birthdayDate &&
                  styles.datePlaceholder,
              ]}
            >
              {birthdayDate
                ? formatDate(birthdayDate)
                : "Select birthday"}
            </Text>

            <Text style={styles.dateHint}>
              Tap to choose their special day
            </Text>
          </View>

          <Text style={styles.dateArrow}>
            ›
          </Text>
        </Pressable>

        <Text style={styles.label}>
          Their photos
        </Text>

        <Pressable
          onPress={pickPhotos}
          style={styles.uploadButton}
        >
          <Text style={styles.uploadEmoji}>
            📸
          </Text>

          <View style={styles.uploadText}>
            <Text style={styles.uploadTitle}>
              Add photos
            </Text>

            <Text style={styles.uploadSubtitle}>
              Choose up to 8 memories
            </Text>
          </View>

          <Text style={styles.uploadArrow}>
            +
          </Text>
        </Pressable>

        {draft.photos.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.photoRow}
          >
            {draft.photos.map(
              (uri, index) => (
                <View
                  key={`${uri}-${index}`}
                  style={styles.photoWrap}
                >
                  <Image
                    source={{ uri }}
                    style={styles.photo}
                  />

                  <Pressable
                    onPress={() =>
                      removePhoto(index)
                    }
                    style={styles.removePhoto}
                  >
                    <Text
                      style={styles.removeText}
                    >
                      ×
                    </Text>
                  </Pressable>
                </View>
              )
            )}
          </ScrollView>
        ) : null}

        <Text style={styles.label}>
          Continue building
        </Text>

        <BuildRow
          emoji="🎀"
          title="Template"
          value={
            draft.templateId
              .replace("-", " ")
              .toUpperCase()
          }
          onPress={() =>
            router.push("/templates")
          }
        />

        <BuildRow
          emoji="💌"
          title="Birthday wish"
          value={
            draft.wish
              ? "Added"
              : "Not added yet"
          }
          onPress={() =>
            router.push("/wishes")
          }
        />

        <BuildRow
          emoji="🎵"
          title="Music"
          value={
            draft.musicName
              ? draft.musicName
              : "Not added yet"
          }
          onPress={() =>
            router.push("/music")
          }
        />

        <BuildRow
          emoji="🎉"
          title="GIFs & Stickers"
          value={
            draft.stickers.length
              ? `${draft.stickers.length} selected`
              : "Not added yet"
          }
          onPress={() =>
            router.push("/gifs")
          }
        />

        <BuildRow
          emoji="✨"
          title="Customize"
          value="Colors & style"
          onPress={() =>
            router.push("/customize")
          }
        />

        <PrimaryButton
          title="Preview Birthday"
          onPress={saveAndPreview}
        />
      </ScrollView>

      <CalendarModal
        visible={calendarOpen}
        value={birthdayDate}
        month={calendarMonth}
        onClose={() =>
          setCalendarOpen(false)
        }
        onMonthChange={setCalendarMonth}
        onSelect={selectDate}
      />
    </SafeAreaView>
  );
}

function BuildRow({
  emoji,
  title,
  value,
  onPress,
}: {
  emoji: string;
  title: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.buildRow}
    >
      <View style={styles.buildIcon}>
        <Text style={styles.buildEmoji}>
          {emoji}
        </Text>
      </View>

      <View style={styles.buildText}>
        <Text style={styles.buildTitle}>
          {title}
        </Text>

        <Text style={styles.buildValue}>
          {value}
        </Text>
      </View>

      <Text style={styles.buildArrow}>
        ›
      </Text>
    </Pressable>
  );
}

function CalendarModal({
  visible,
  value,
  month,
  onClose,
  onMonthChange,
  onSelect,
}: {
  visible: boolean;
  value: Date | null;
  month: Date;
  onClose: () => void;
  onMonthChange: (date: Date) => void;
  onSelect: (date: Date) => void;
}) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  const daysInMonth = new Date(
    year,
    monthIndex + 1,
    0
  ).getDate();

  const firstDay = new Date(
    year,
    monthIndex,
    1
  ).getDay();

  const days: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    days.push(day);
  }

  const previousMonth = () => {
    onMonthChange(
      new Date(
        year,
        monthIndex - 1,
        1
      )
    );
  };

  const nextMonth = () => {
    onMonthChange(
      new Date(
        year,
        monthIndex + 1,
        1
      )
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.calendarModal}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>
                Birthday
              </Text>

              <Text style={styles.modalSubtitle}>
                Select their special day
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>
                ×
              </Text>
            </Pressable>
          </View>

          <View style={styles.monthHeader}>
            <Pressable
              onPress={previousMonth}
              style={styles.monthArrow}
            >
              <Text>‹</Text>
            </Pressable>

            <Text style={styles.monthTitle}>
              {month.toLocaleDateString(
                "en-US",
                {
                  month: "long",
                  year: "numeric",
                }
              )}
            </Text>

            <Pressable
              onPress={nextMonth}
              style={styles.monthArrow}
            >
              <Text>›</Text>
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {[
              "S",
              "M",
              "T",
              "W",
              "T",
              "F",
              "S",
            ].map((day, index) => (
              <Text
                key={`${day}-${index}`}
                style={styles.weekDay}
              >
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {days.map((day, index) => {
              if (day === null) {
                return (
                  <View
                    key={`empty-${index}`}
                    style={styles.dayCell}
                  />
                );
              }

              const selected =
                value &&
                value.getFullYear() ===
                  year &&
                value.getMonth() ===
                  monthIndex &&
                value.getDate() === day;

              return (
                <Pressable
                  key={day}
                  onPress={() =>
                    onSelect(
                      new Date(
                        year,
                        monthIndex,
                        day
                      )
                    )
                  }
                  style={[
                    styles.dayCell,
                    selected &&
                      styles.daySelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      selected &&
                        styles.dayTextSelected,
                    ]}
                  >
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={onClose}
            style={styles.doneButton}
          >
            <Text style={styles.doneText}>
              Done
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function formatDate(date: Date) {
  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 45,
  },

  intro: {
    marginTop: 8,
    marginBottom: 24,
  },

  introEmoji: {
    fontSize: 42,
    marginBottom: 10,
  },

  title: {
    color: COLORS.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
  },

  label: {
    color: "#403438",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 18,
    marginBottom: 9,
  },

  input: {
    height: 56,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 17,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },

  relationships: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  relationship: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  relationshipSelected: {
    backgroundColor: COLORS.pinkSoft,
    borderColor: COLORS.pink,
  },

  relationshipText: {
    color: "#817378",
    fontSize: 11,
    fontWeight: "800",
  },

  relationshipTextSelected: {
    color: COLORS.pinkDark,
  },

  dateButton: {
    minHeight: 70,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  dateIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: COLORS.pinkLighter,
    alignItems: "center",
    justifyContent: "center",
  },

  dateEmoji: {
    fontSize: 22,
  },

  dateInfo: {
    flex: 1,
    marginLeft: 13,
  },

  dateText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "900",
  },

  datePlaceholder: {
    color: "#B8A9AE",
  },

  dateHint: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 4,
  },

  dateArrow: {
    color: "#B5A5AA",
    fontSize: 28,
  },

  uploadButton: {
    minHeight: 70,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  uploadEmoji: {
    fontSize: 28,
  },

  uploadText: {
    flex: 1,
    marginLeft: 13,
  },

  uploadTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },

  uploadSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },

  uploadArrow: {
    color: COLORS.pink,
    fontSize: 27,
    fontWeight: "400",
    marginRight: 5,
  },

  photoRow: {
    marginTop: 12,
  },

  photoWrap: {
    width: 92,
    height: 92,
    borderRadius: 18,
    overflow: "hidden",
    marginRight: 10,
  },

  photo: {
    width: "100%",
    height: "100%",
  },

  removePhoto: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },

  removeText: {
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 19,
  },

  buildRow: {
    minHeight: 66,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },

  buildIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: COLORS.pinkLighter,
    alignItems: "center",
    justifyContent: "center",
  },

  buildEmoji: {
    fontSize: 22,
  },

  buildText: {
    flex: 1,
    marginLeft: 12,
  },

  buildTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "900",
  },

  buildValue: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },

  buildArrow: {
    color: "#B5A5AA",
    fontSize: 27,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.42)",
    justifyContent: "flex-end",
  },

  calendarModal: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 30,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "900",
  },

  modalSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
  },

  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  closeText: {
    color: COLORS.text,
    fontSize: 26,
  },

  monthHeader: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  monthTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
  },

  monthArrow: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  weekRow: {
    flexDirection: "row",
    marginTop: 18,
  },

  weekDay: {
    width: "14.2857%",
    textAlign: "center",
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "900",
  },

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },

  dayCell: {
    width: "14.2857%",
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },

  daySelected: {
    backgroundColor: COLORS.pink,
  },

  dayText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "700",
  },

  dayTextSelected: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  doneButton: {
    height: 55,
    borderRadius: 18,
    backgroundColor: COLORS.pink,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 17,
  },

  doneText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
});