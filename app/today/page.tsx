import { createClient } from '@/lib/supabase/server';
import TodayClient from './TodayClient';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import type { DailyReading, Reflection, BibleVersion, LectionaryReading, MeditationMode } from '@/types';
import type { MeditationBlock } from '@/types/blocks';
import { getTodayDateString } from '@/utils/date';
import { normalizeBlocks, type BlockConfig } from '@/lib/blockFlow';
import EmptyState from '@/components/ui/EmptyState';
import AnonymousNotice from '@/components/ui/AnonymousNotice';

interface JournalProps {
  readingId: string;
  reflectionQuestion: string | null;
  existingReflection: Reflection | null;
  userId: string | null;
  isAnonymous: boolean;
  groupId: string | null;
  displayName: string | null;
  handle: string | null;
}

function configToBlock(cfg: BlockConfig, p: JournalProps): MeditationBlock {
  switch (cfg.type) {
    case 'quote':     return { type: 'quote' };
    case 'silence':   return { type: 'silence', defaultDuration: (cfg.mins ?? 5) * 60 };
    case 'journal':   return { type: 'journal', ...p };
    case 'oneline':   return { type: 'oneline',   readingId: p.readingId, existingReflection: p.existingReflection, userId: p.userId, displayName: p.displayName, handle: p.handle };
    case 'prayer':    return { type: 'prayer',    readingId: p.readingId, existingReflection: p.existingReflection, userId: p.userId };
    case 'practice':  return { type: 'practice',  readingId: p.readingId, existingReflection: p.existingReflection, userId: p.userId };
    case 'gratitude': return { type: 'gratitude', readingId: p.readingId, existingReflection: p.existingReflection, userId: p.userId };
    case 'freenote':  return { type: 'freenote',  readingId: p.readingId, existingReflection: p.existingReflection, userId: p.userId };
  }
}

function buildBlocks(
  mode: MeditationMode,
  scriptureBlock: MeditationBlock,
  journalProps: JournalProps,
  custom: unknown,
): MeditationBlock[] {
  const flow = normalizeBlocks(custom as never, mode);
  return [scriptureBlock, ...flow.map((cfg) => configToBlock(cfg, journalProps))];
}

export default async function TodayPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const today = getTodayDateString();
  let bibleVersion: BibleVersion = 'gaeyeok';
  let readingTrack = 'lectionary';
  let meditationMode: MeditationMode = 'standard';
  let groupId: string | null = null;
  let customBlocks: unknown = null;
  let displayName: string | null = null;
  let handle: string | null = null;

  if (user) {
    const [profileResult, groupResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('bible_version, reading_track, meditation_mode, custom_blocks, display_name, handle')
        .eq('id', user.id)
        .single(),
      supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)
        .limit(1)
        .single(),
    ]);

    if (profileResult.data?.bible_version) bibleVersion = profileResult.data.bible_version;
    if (profileResult.data?.reading_track) readingTrack = profileResult.data.reading_track;
    if (profileResult.data?.meditation_mode) meditationMode = profileResult.data.meditation_mode;
    customBlocks = profileResult.data?.custom_blocks ?? null;
    displayName = profileResult.data?.display_name ?? null;
    handle = profileResult.data?.handle ?? null;
    if (groupResult.data?.group_id) groupId = groupResult.data.group_id;
  }

  // 성서정과 트랙
  if (readingTrack === 'lectionary') {
    const { data: lectionary } = await supabase
      .from('lectionary_readings')
      .select('*')
      .lte('sunday_date', today)
      .order('sunday_date', { ascending: false })
      .limit(1)
      .single<LectionaryReading>();

    if (!lectionary) {
      return (
        <EmptyState
          title="이번 주 성서정과를 준비 중입니다"
          hint="잠시 후 다시 확인해주세요"
        />
      );
    }

    let existingReflection: Reflection | null = null;
    if (user) {
      const { data } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', user.id)
        .eq('reading_id', lectionary.id)
        .single<Reflection>();
      existingReflection = data;
    }

    const isAnon = user?.is_anonymous ?? true;
    return (
      <>
        {isAnon && <AnonymousNotice />}
        <BlockRenderer blocks={buildBlocks(
          meditationMode,
          { type: 'scripture', lectionary, bibleVersion },
          { readingId: lectionary.id, reflectionQuestion: lectionary.reflection_question, existingReflection, userId: user?.id ?? null, isAnonymous: isAnon, groupId, displayName, handle },
          customBlocks,
        )} />
      </>
    );
  }

  // 일용할 묵상 트랙
  if (readingTrack === 'curated') {
    const { data: reading } = await supabase
      .from('daily_readings')
      .select('*')
      .eq('date', today)
      .single<DailyReading>();

    if (!reading) {
      return (
        <EmptyState
          title="오늘의 말씀을 준비 중입니다"
          hint="잠시 후 다시 확인해주세요"
        />
      );
    }

    let existingReflection: Reflection | null = null;
    if (user) {
      const { data } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', user.id)
        .eq('reading_id', reading.id)
        .single<Reflection>();
      existingReflection = data;
    }

    const isAnon = user?.is_anonymous ?? true;
    return (
      <>
        {isAnon && <AnonymousNotice />}
        <BlockRenderer blocks={buildBlocks(
          meditationMode,
          { type: 'dailyScripture', reading, bibleVersion },
          { readingId: reading.id, reflectionQuestion: reading.reflection_question, existingReflection, userId: user?.id ?? null, isAnonymous: isAnon, groupId, displayName, handle },
          customBlocks,
        )} />
      </>
    );
  }

  // 통독 트랙 (준비중)
  const { data: reading } = await supabase
    .from('daily_readings')
    .select('*')
    .eq('date', today)
    .single<DailyReading>();

  let existingReflection: Reflection | null = null;
  if (reading && user) {
    const { data } = await supabase
      .from('reflections')
      .select('*')
      .eq('user_id', user.id)
      .eq('reading_id', reading.id)
      .single<Reflection>();
    existingReflection = data;
  }

  return (
    <TodayClient
      user={user}
      reading={reading}
      existingReflection={existingReflection}
      bibleVersion={bibleVersion}
    />
  );
}
