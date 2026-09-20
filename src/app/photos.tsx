import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
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
  persistLocalFile,
  saveDraft,
} from "@/lib/birthday-storage";

const MAX_PHOTOS = 8;

export default function PhotosScreen() {
  const router = useRouter();

  const [draft, setDraft] = useState<BirthdayDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const currentDraft = await loadDraft();
      setDraft(currentDraft);
    } catch (error) {
      console.error("Failed to load birthday draft:", error);
      Alert.alert(
        "Could not load photos",
        "Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const pickPhotos = async () => {
    try {
      setUploading(true);

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Photo permission needed",
          "Please allow photo access in Settings to select birthday photos."
        );
        return;
      }

      const existingPhotos = draft?.photos ?? [];
      const remainingSlots =
        MAX_PHOTOS - existingPhotos.length;

      if (remainingSlots <= 0) {
        Alert.alert(
          "Photo limit reached",
          `You can add up to ${MAX_PHOTOS} photos.`
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsMultipleSelection: true,
          selectionLimit: remainingSlots,
          quality: 0.9,
        });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const newPhotos: string[] = [];

      for (const asset of result.assets) {
        const savedUri = await persistLocalFile(
          asset.uri,
          "jpg"
        );

        newPhotos.push(savedUri);
      }

      const nextPhotos = [
        ...existingPhotos,
        ...newPhotos,
      ].slice(0, MAX_PHOTOS);

      const updatedDraft = await saveDraft({
        photos: nextPhotos,
      });

      setDraft(updatedDraft);
    } catch (error) {
      console.error("Photo picker error:", error);

      Alert.alert(
        "Could not add photos",
        "Something went wrong while selecting the photos."
      );
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async (index: number) => {
    if (!draft) {
      return;
    }

    const nextPhotos = draft.photos.filter(
      (_, photoIndex) => photoIndex !== index
    );

    try {
      const updatedDraft = await saveDraft({
        photos: nextPhotos,
      });

      setDraft(updatedDraft);
    } catch (error) {
      console.error("Remove photo error:", error);

      Alert.alert(
        "Could not remove photo",
        "Please try again."
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.pink}
        />
        <Text style={styles.loadingText}>
          Loading your photos...
        </Text>
      </View>
    );
  }

  const photos = draft?.photos ?? [];

  return (
    <Screen>
      <Header
        title="Your photos"
        subtitle={`${photos.length}/${MAX_PHOTOS} photos added`}
        onBack={() => router.back()}
      />

      <View style={styles.introCard}>
        <Text style={styles.introEmoji}>📸</Text>

        <View style={styles.introContent}>
          <Text style={styles.introTitle}>
            Add your favorite memories
          </Text>

          <Text style={styles.introText}>
            Pick up to {MAX_PHOTOS} photos for the birthday card.
          </Text>
        </View>
      </View>

      <PrimaryButton
        title={
          uploading
            ? "Adding photos..."
            : photos.length >= MAX_PHOTOS
              ? "Photo limit reached"
              : "＋ Add photos"
        }
        onPress={pickPhotos}
        disabled={
          uploading || photos.length >= MAX_PHOTOS
        }
      />

      {photos.length > 0 ? (
        <View style={styles.grid}>
          {photos.map((uri, index) => (
            <View
              key={`${uri}-${index}`}
              style={styles.photoWrapper}
            >
              <Image
                source={{ uri }}
                style={styles.photo}
              />

              <Pressable
                onPress={() => removePhoto(index)}
                style={styles.removeButton}
                hitSlop={8}
              >
                <Text style={styles.removeText}>×</Text>
              </Pressable>

              <View style={styles.photoNumber}>
                <Text style={styles.photoNumberText}>
                  {index + 1}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🖼️</Text>

          <Text style={styles.emptyTitle}>
            No photos yet
          </Text>

          <Text style={styles.emptyText}>
            Add photos and they will appear here.
          </Text>
        </View>
      )}

      <View style={styles.bottomSpacing} />

      <PrimaryButton
        title="Done"
        onPress={() => router.back()}
        secondary
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSoft,
  },

  introCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  introEmoji: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.pinkLighter,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 25,
    marginRight: 13,
    overflow: "hidden",
  },

  introContent: {
    flex: 1,
  },

  introTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },

  introText: {
    fontSize: 13,
    color: COLORS.textSoft,
    lineHeight: 19,
    marginTop: 4,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },

  photoWrapper: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 14,
    backgroundColor: COLORS.pinkLighter,
    position: "relative",
  },

  photo: {
    width: "100%",
    height: "100%",
  },

  removeButton: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },

  removeText: {
    color: COLORS.white,
    fontSize: 23,
    lineHeight: 24,
    marginTop: -2,
  },

  photoNumber: {
    position: "absolute",
    left: 9,
    bottom: 9,
    minWidth: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },

  photoNumberText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.text,
  },

  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 55,
  },

  emptyEmoji: {
    fontSize: 45,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },

  emptyText: {
    fontSize: 13,
    color: COLORS.textSoft,
    marginTop: 5,
  },

  bottomSpacing: {
    height: 10,
  },
});