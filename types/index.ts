export type BibleVersion = 'gaeyeok' | 'gongdong' | 'catholic';
export type ReadingTrack = 'curated' | 'lectionary' | 'chronological';
export type MeditationMode = 'simple' | 'standard' | 'deep';

export const BIBLE_VERSION_LABELS: Record<BibleVersion, string> = {
  gaeyeok: '개역개정',
  gongdong: '공동번역',
  catholic: '가톨릭성경',
};

export const READING_TRACK_LABELS: Record<ReadingTrack, string> = {
  curated: '일용할 묵상',
  lectionary: '교회력 성서정과',
  chronological: '1년 통독',
};

export const MEDITATION_MODE_LABELS: Record<MeditationMode, string> = {
  simple: '간단히',
  standard: '기본',
  deep: '깊이',
};

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  subscription_tier: 'free' | 'premium';
  subscription_status: 'active' | 'inactive' | 'cancelled' | null;
  subscription_expires_at: string | null;
  push_enabled: boolean;
  push_token: string | null;
  bible_version: BibleVersion;
  reading_track: ReadingTrack;
  meditation_mode: MeditationMode;
  display_name: string | null;
  handle: string | null;
  handle_changed_at: string | null;
}

export interface DailyReading {
  id: string;
  date: string;
  title: string;
  passage: string;
  content: string;
  content_gaeyeok: string | null;
  content_gongdong: string | null;
  content_catholic: string | null;
  reflection_question: string;
  illustration_type: 'dawn' | 'night' | 'spring';
  liturgical_season: string | null;
}

export interface Reflection {
  id: string;
  user_id: string;
  reading_id: string;
  title: string | null;
  content: string | null;
  highlighted_sentence: string | null;
  is_public: boolean;
  is_anonymous: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
  one_line_word: string | null;
  prayer: string | null;
  practice: string | null;
  extras?: { gratitude?: string; freenote?: string } | null;
  tags?: string[];
  daily_readings?: DailyReading;
}

export interface ReflectionReaction {
  id: string;
  reflection_id: string;
  user_id: string;
  sticker: 'pray' | 'sprout' | 'heart';
  created_at: string;
}

export interface Streak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_reflection_date: string | null;
}

export type ChallengeCategory = 'meditation' | 'study' | 'exercise' | 'prayer' | 'gratitude' | 'custom';
export type ChallengeCadence = 'daily' | 'weekly';

export interface Challenge {
  id: string;
  user_id: string;
  name: string;
  emoji: string | null;
  category: ChallengeCategory;
  cadence: ChallengeCadence;
  target_value: number | null;
  target_unit: string | null;
  is_pinned: boolean;
  is_public: boolean;
  copied_from: string | null;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface ChallengeLog {
  id: string;
  challenge_id: string;
  user_id: string;
  date: string;
  value: number | null;
  note: string | null;
  reflection_id: string | null;
  created_at: string;
}

export type IllustrationType = 'dawn' | 'night' | 'spring';

export interface LectionaryReading {
  id: string;
  sunday_date: string;
  liturgical_year: 'A' | 'B' | 'C';
  season: string;
  week_name: string;
  ot_passage: string | null;
  ot_content: string | null;
  psalm_passage: string | null;
  psalm_content: string | null;
  epistle_passage: string | null;
  epistle_content: string | null;
  gospel_passage: string | null;
  gospel_content: string | null;
  reflection_question: string | null;
  illustration_type: IllustrationType;
}
