'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Challenge, ChallengeLog } from '@/types';
import { CATEGORY_META } from '@/lib/challenges';
import ContributionGrid from '@/components/journey/ContributionGrid';

interface LinkedReflection {
  id: string;
  one_line_word: string | null;
  reading_id: string | null;
  passage: string | null;
  date: string;
}

interface OriginInfo {
  display_name: string | null;
  handle: string | null;
}

interface Props {
  challenge: Challenge;
  logs: ChallengeLog[];
  streakInfo: { current: number; longest: number; lastDate: string | null };
  linkedReflections: LinkedReflection[];
  todayKst: string;
  userId: string;
  originInfo: OriginInfo | null;
  copiedCount: number;
}

function fmtKoreanDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function daysSince(iso: string): number {
  const d = new Date(iso + 'T00:00:00Z');
  const t = new Date(new Date().toISOString().split('T')[0] + 'T00:00:00Z');
  return Math.round((t.getTime() - d.getTime()) / 86400000);
}

/* 회복 톤 — 정죄가 아니라 환대 */
function welcomeMessage(
  current: number,
  longest: number,
  lastDate: string | null,
  doneToday: boolean,
): { title: string; sub: string } {
  if (doneToday && current >= 2) {
    return {
      title: `${current}일 연속 함께 걸었어요`,
      sub: '오늘도 한 걸음.',
    };
  }
  if (doneToday) {
    return {
      title: '오늘 함께 걸었어요',
      sub: '꾸준함은 한 걸음에서 시작해요.',
    };
  }
  if (current > 0) {
    return {
      title: `${current}일 이어가는 중`,
      sub: '오늘도 이어갈 수 있어요.',
    };
  }
  if (!lastDate) {
    return {
      title: '오늘 첫 걸음을 떼어볼까요',
      sub: '작은 시작이 형성의 출발이에요.',
    };
  }
  const days = daysSince(lastDate);
  if (days < 7) {
    return {
      title: '잠시 멈췄던 길이에요',
      sub: '오늘 다시 이어갈 수 있어요.',
    };
  }
  return {
    title: `${days}일 만에 돌아왔어요`,
    sub: longest > 0 ? `이전엔 ${longest}일까지 이어가셨어요. 다시 시작해도 좋아요.` : '오늘부터 다시 시작해요.',
  };
}

export default function ChallengeDetailClient({
  challenge, logs, streakInfo, linkedReflections, todayKst, userId,
  originInfo, copiedCount,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [showActions, setShowActions] = useState(false);
  const [editing, setEditing] = useState(false);

  // 편집 폼 state
  const [name, setName] = useState(challenge.name);
  const [emoji, setEmoji] = useState(challenge.emoji ?? '');
  const [targetValue, setTargetValue] = useState(
    challenge.target_value != null ? String(challenge.target_value) : '',
  );
  const [targetUnit, setTargetUnit] = useState(challenge.target_unit ?? '');
  const [isPublic, setIsPublic] = useState(challenge.is_public);
  const [busy, setBusy] = useState(false);

  const doneToday = logs.some((l) => l.date === todayKst);
  const dates = new Set(logs.map((l) => l.date));
  const totalDays = dates.size;
  const message = welcomeMessage(streakInfo.current, streakInfo.longest, streakInfo.lastDate, doneToday);

  const emojiDisplay = challenge.emoji || CATEGORY_META[challenge.category].defaultEmoji;
  const targetLabel = challenge.target_value
    ? `${challenge.target_value}${challenge.target_unit ?? ''}`
    : null;

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function saveEdit() {
    if (!name.trim() || busy) return;
    setBusy(true);
    const supabase = createClient();
    await supabase
      .from('challenges')
      .update({
        name: name.trim(),
        emoji: emoji.trim() || null,
        target_value: targetValue ? Number(targetValue) : null,
        target_unit: targetUnit.trim() || null,
        is_public: isPublic,
      })
      .eq('id', challenge.id);
    setBusy(false);
    setEditing(false);
    refresh();
  }

  async function endChallenge() {
    if (!confirm('이 훈련을 오늘 마치시겠어요? 기록은 그대로 보존돼요.')) return;
    setBusy(true);
    const supabase = createClient();
    await supabase.from('challenges').update({ ended_at: todayKst, is_pinned: false }).eq('id', challenge.id);
    setBusy(false);
    router.push('/');
    router.refresh();
  }

  async function deleteChallenge() {
    if (!confirm('이 훈련과 모든 기록을 삭제할까요? 되돌릴 수 없어요.')) return;
    setBusy(true);
    const supabase = createClient();
    await supabase.from('challenges').delete().eq('id', challenge.id);
    setBusy(false);
    router.push('/');
    router.refresh();
  }

  return (
    <div className="flex flex-col min-h-dvh px-5 pt-4 pb-10 space-y-8">

      {/* 헤더 — 뒤로 + 액션 */}
      <header className="flex items-center justify-between -mx-2">
        <Link
          href="/"
          className="px-2 py-1 text-sm text-muted-foreground hover:text-foreground liquid-transition-fast"
        >
          ← 홈
        </Link>
        <button
          onClick={() => { setShowActions((v) => !v); setEditing(false); }}
          className="px-3 py-1 text-base text-muted-foreground hover:text-foreground"
          aria-label="더 보기"
        >
          ⋯
        </button>
      </header>

      {/* 타이틀 */}
      <section className="space-y-2">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl">{emojiDisplay}</span>
          <h1 className="text-xl font-medium text-foreground">{challenge.name}</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          {CATEGORY_META[challenge.category].label}
          {' · '}매일
          {targetLabel && ` · ${targetLabel}`}
          {challenge.ended_at && (
            <span className="ml-2 text-primary">· {fmtKoreanDate(challenge.ended_at)} 마침</span>
          )}
        </p>
      </section>

      {/* 액션 메뉴 (펼침) */}
      {showActions && !editing && (
        <section className="bg-muted/30 rounded-2xl p-3 space-y-1">
          <button
            onClick={() => setEditing(true)}
            className="w-full text-left px-3 py-2.5 text-sm text-foreground hover:bg-muted/50 rounded-xl liquid-transition-fast"
          >
            편집
          </button>
          {!challenge.ended_at && (
            <button
              onClick={endChallenge}
              disabled={busy}
              className="w-full text-left px-3 py-2.5 text-sm text-foreground hover:bg-muted/50 rounded-xl liquid-transition-fast disabled:opacity-50"
            >
              훈련 마치기
              <span className="text-[11px] text-muted-foreground ml-2">기록은 그대로 보존돼요</span>
            </button>
          )}
          <button
            onClick={deleteChallenge}
            disabled={busy}
            className="w-full text-left px-3 py-2.5 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-xl liquid-transition-fast disabled:opacity-50"
          >
            삭제
            <span className="text-[11px] text-muted-foreground ml-2">모든 기록 함께 사라져요</span>
          </button>
        </section>
      )}

      {/* 편집 폼 */}
      {editing && (
        <section className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value.slice(0, 2))}
              placeholder={CATEGORY_META[challenge.category].defaultEmoji}
              className="w-12 h-10 text-center text-lg bg-muted/40 rounded-xl focus:outline-none"
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 30))}
              placeholder="훈련 이름"
              className="flex-1 h-10 px-3 text-sm bg-muted/40 rounded-xl focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="목표"
              className="flex-1 h-9 px-3 text-sm bg-muted/40 rounded-xl focus:outline-none"
            />
            <input
              type="text"
              value={targetUnit}
              onChange={(e) => setTargetUnit(e.target.value.slice(0, 4))}
              placeholder="단위"
              className="w-20 h-9 px-3 text-sm bg-muted/40 rounded-xl focus:outline-none"
            />
          </div>
          <button
            onClick={() => setIsPublic((v) => !v)}
            className="w-full flex items-center justify-between gap-3 px-1 py-1.5 text-left"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground">다른 분들도 보게 공개</p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                같은 카테고리에서 영감으로 시작할 수 있어요
              </p>
            </div>
            <span
              className={`relative w-9 h-5 rounded-full liquid-transition-fast shrink-0 ${
                isPublic ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  isPublic ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </span>
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="flex-1 py-2.5 text-sm text-muted-foreground"
            >
              취소
            </button>
            <button
              onClick={saveEdit}
              disabled={!name.trim() || busy}
              className="flex-[2] py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium disabled:opacity-40"
            >
              {busy ? '저장 중...' : '저장'}
            </button>
          </div>
        </section>
      )}

      {/* 공유 메타 — 원본 또는 함께 시작한 분들 */}
      {(originInfo || copiedCount > 0) && (
        <section className="text-center text-[11px] text-muted-foreground/80 leading-relaxed">
          {originInfo && (
            <p>
              <span className="text-primary">{originInfo.display_name ?? '벗'}</span>
              <span className="text-muted-foreground">님의 훈련에서 영감을 받았어요</span>
            </p>
          )}
          {copiedCount > 0 && (
            <p className="mt-1">
              <span className="text-primary">{copiedCount}명</span>이 이 훈련을 함께 시작했어요 🌱
            </p>
          )}
        </section>
      )}

      {/* 환대 메시지 — 회복 톤의 중심 */}
      <section className="text-center py-6 space-y-2 border-y border-border/40">
        <p className="text-2xl font-medium text-foreground">{message.title}</p>
        <p className="text-sm text-muted-foreground">{message.sub}</p>
      </section>

      {/* 잔디 */}
      <section className="space-y-3">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.18em]">
          최근 16주
        </p>
        <ContributionGrid dates={dates} weeks={16} />
      </section>

      {/* 통계 */}
      <section className="space-y-3">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.18em]">
          형성의 기록
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div className="card-float p-4 text-center">
            <p className="text-2xl font-bold text-primary">{streakInfo.current}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">현재 연속</p>
          </div>
          <div className="card-float p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{streakInfo.longest}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">최장 연속</p>
          </div>
          <div className="card-float p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{totalDays}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">총 일수</p>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground/70 text-center">
          {fmtKoreanDate(challenge.started_at)} 시작
        </p>
      </section>

      {/* 말씀 안에서 — 묵상과 연결된 훈련 */}
      {linkedReflections.length > 0 && (
        <section className="space-y-3">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.18em]">
            말씀 안에서
          </p>
          <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
            이 훈련을 이어간 날, 받은 말씀이에요.
          </p>
          <ul className="space-y-4 pt-1">
            {linkedReflections.map((r) => (
              <li key={r.id} className="border-l-2 border-primary/30 pl-4">
                <p className="font-serif-kr text-base leading-relaxed text-foreground">
                  &ldquo;{r.one_line_word}&rdquo;
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                  {fmtKoreanDate(r.date)}
                  {r.passage && ` · ${r.passage}`}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
