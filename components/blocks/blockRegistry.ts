import type { ComponentType } from 'react';
import type { MeditationBlock } from '@/types/blocks';
import ScriptureBlock from './ScriptureBlock';
import DailyScriptureBlock from './DailyScriptureBlock';
import QuoteBlock from './QuoteBlock';
import SilenceBlock from './SilenceBlock';
import JournalBlock from './JournalBlock';
import PrayerBlock from './PrayerBlock';
import OneLineBlock from './OneLineBlock';
import PracticeBlock from './PracticeBlock';
import GratitudeBlock from './GratitudeBlock';
import FreenoteBlock from './FreenoteBlock';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const blockRegistry: Record<MeditationBlock['type'], ComponentType<any>> = {
  scripture: ScriptureBlock,
  dailyScripture: DailyScriptureBlock,
  quote: QuoteBlock,
  silence: SilenceBlock,
  journal: JournalBlock,
  prayer: PrayerBlock,
  oneline: OneLineBlock,
  practice: PracticeBlock,
  gratitude: GratitudeBlock,
  freenote: FreenoteBlock,
};
