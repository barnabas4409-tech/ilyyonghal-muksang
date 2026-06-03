import type { LectionaryReading, DailyReading, Reflection, BibleVersion } from '.';

export interface ScriptureBlock {
  type: 'scripture';
  lectionary: LectionaryReading;
  bibleVersion: BibleVersion;
}

export interface DailyScriptureBlock {
  type: 'dailyScripture';
  reading: DailyReading;
  bibleVersion: BibleVersion;
}

export interface QuoteBlock {
  type: 'quote';
}

export interface SilenceBlock {
  type: 'silence';
  defaultDuration?: number;
}

export interface JournalBlock {
  type: 'journal';
  readingId: string;
  reflectionQuestion: string | null;
  existingReflection: Reflection | null;
  userId: string | null;
  isAnonymous: boolean;
  groupId: string | null;
}

export interface PrayerBlock {
  type: 'prayer';
  readingId: string;
  existingReflection: Reflection | null;
  userId: string | null;
}

export interface OneLineBlock {
  type: 'oneline';
  readingId: string;
  existingReflection: Reflection | null;
  userId: string | null;
  displayName: string | null;
  handle: string | null;
}

export interface PracticeBlock {
  type: 'practice';
  readingId: string;
  existingReflection: Reflection | null;
  userId: string | null;
}

export interface GratitudeBlock {
  type: 'gratitude';
  readingId: string;
  existingReflection: Reflection | null;
  userId: string | null;
}

export interface FreenoteBlock {
  type: 'freenote';
  readingId: string;
  existingReflection: Reflection | null;
  userId: string | null;
}

export type MeditationBlock =
  | ScriptureBlock
  | DailyScriptureBlock
  | QuoteBlock
  | SilenceBlock
  | JournalBlock
  | PrayerBlock
  | OneLineBlock
  | PracticeBlock
  | GratitudeBlock
  | FreenoteBlock;
