import AsyncStorage from "@react-native-async-storage/async-storage";
import { File, Paths } from "expo-file-system";

export type BirthdayDraft = {
  id: string | null;

  name: string;
  age: string;
  relationship: string;
  birthday: string | null;

  photos: string[];

  templateId: string;
  background: string;
  accent: string;
  fontStyle: "bold" | "soft" | "elegant";

  wish: string;

  musicUri: string | null;
  musicName: string;

  stickers: string[];

  updatedAt: string;
};

const STORAGE_KEY = "@birthday_meow_draft";

export const EMPTY_DRAFT: BirthdayDraft = {
  id: null,

  name: "",
  age: "",
  relationship: "",
  birthday: null,

  photos: [],

  templateId: "cute",
  background: "#FFE3EA",
  accent: "#E85D75",
  fontStyle: "bold",

  wish: "",

  musicUri: null,
  musicName: "",

  stickers: [],

  updatedAt: "",
};

export async function loadDraft(): Promise<BirthdayDraft> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return { ...EMPTY_DRAFT };
    }

    const parsed = JSON.parse(raw);

    return {
      ...EMPTY_DRAFT,
      ...parsed,
    };
  } catch (error) {
    console.log("LOAD DRAFT ERROR:", error);

    return { ...EMPTY_DRAFT };
  }
}

export async function saveDraft(
  patch: Partial<BirthdayDraft>
): Promise<BirthdayDraft> {
  const current = await loadDraft();

  const next: BirthdayDraft = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(next)
  );

  return next;
}

export async function replaceDraft(
  draft: BirthdayDraft
): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...draft,
      updatedAt: new Date().toISOString(),
    })
  );
}

export async function clearDraft(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

/*
 * Copies a selected file into the app's document
 * directory so the app keeps its own copy.
 */
export async function persistLocalFile(
  uri: string,
  extension = "jpg"
): Promise<string> {
  try {
    if (uri.startsWith(Paths.document.uri)) {
      return uri;
    }

    const source = new File(uri);

    const filename =
      `birthday-meow-${Date.now()}-${Math.floor(
        Math.random() * 100000
      )}.${extension}`;

    const destination = new File(
      Paths.document,
      filename
    );

    await source.copy(destination);

    return destination.uri;
  } catch (error) {
    console.log(
      "FILE COPY ERROR:",
      error
    );

    // Fall back to original URI.
    return uri;
  }
}