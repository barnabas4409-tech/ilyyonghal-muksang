'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import type { BibleVersion, ReadingTrack, Challenge, ChallengeLog } from '@/types';
import ChallengeList from '@/components/challenges/ChallengeList';

interface Props {
  user: User | null;
  userName: string | null;
  readingTrack: ReadingTrack;
  todayLabel: string | null;
  bibleVersion: BibleVersion;
  hasReflectionToday: boolean;
  hasCheckInToday: boolean;
  streakCount: number;
  weeklyCount: number;
  userGroup: { id: string; name: string; todayCount: number } | null;
  recentWords: { id: string; one_line_word: string; created_at: string }[];
  todayVerse: { passage: string; text: string } | null;
  challenges: Challenge[];
  todayLogs: ChallengeLog[];
  challengeStreaks: Record<string, number>;
  todayKst: string;
}

function greetingSub(name: string | null): string {
  const h = new Date().getHours();
  const who = name ? `${name}님` : '반가워요';
  if (h >= 5 && h < 12)  return `좋은 아침이에요, ${who}`;
  if (h >= 12 && h < 17) return `오후의 인사를 드려요, ${who}`;
  if (h >= 17 && h < 21) return `저녁이에요, ${who}`;
  return `밤이 깊었네요, ${who}`;
}

function todayKey() {
  return `celebrated_${new Date().toISOString().split('T')[0]}`;
}

function formatWordDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return '오늘';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return '어제';
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/* 완료 축하 오버레이 */
function CelebrationOverlay({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<'in' | 'stay' | 'out'>('in');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('stay'), 500);
    const t2 = setTimeout(() => setPhase('out'), 2800);
    const t3 = setTimeout(onClose, 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onClose]);

  const particles = Array.from({ length: 12 }, (_, i) => ({
    x: 15 + (i % 6) * 14,
    delay: (i * 0.08).toFixed(2),
    size: i % 3 === 0 ? 8 : 5,
    color: ['#8B7355', '#C4A882', '#D4B896', '#6B5840', '#A89070', '#E8D5BC'][i % 6],
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="absolute inset-x-0 top-1/3 flex justify-center pointer-events-none">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              width: p.size, height: p.size,
              background: p.color,
              animation: `particle-float 1.2s ${p.delay}s ease-out forwards`,
            }}
          />
        ))}
      </div>

      <div className={`card-float px-8 py-7 text-center mx-6 ${
        phase === 'in' ? 'animate-celebrate-in' :
        phase === 'out' ? 'animate-celebrate-out' : ''
      }`}>
        <p className="text-4xl mb-3">🙏</p>
        <p className="text-lg font-medium text-foreground mb-1">오늘 묵상 완료!</p>
        <p className="text-sm text-muted-foreground">말씀 앞에 충실히 머물렀어요</p>
      </div>
    </div>
  );
}

/* Streak 띠 — 최상단 */
function StreakStrip({ count, hasToday, hour }: { count: number; hasToday: boolean; hour: number }) {
  // 케이스: streak=0 → 격려, streak>0 + hasToday → 자축, streak>0 + !hasToday + 저녁 → 경고
  const isWarning = count > 0 && !hasToday && hour >= 19;
  const isCelebrating = count > 0 && hasToday;

  if (count === 0 && !hasToday) {
    return (
      <div className="flex items-center justify-center gap-2 py-3">
        <span className="text-sm text-muted-foreground">오늘 첫 묵상으로 시작해요</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center gap-3 py-4 ${isCelebrating ? 'animate-streak-glow' : ''}`}>
      <span className={`text-3xl ${isWarning ? 'animate-streak-pulse-icon' : ''}`}>🔥</span>
      <div>
        <p className="text-3xl font-bold text-foreground leading-none">
          {count}<span className="text-base font-medium text-muted-foreground ml-1">일</span>
        </p>
        <p className={`text-xs mt-1 ${isWarning ? 'text-orange-600 dark:text-orange-400 font-medium' : 'text-muted-foreground'}`}>
          {isWarning ? '오늘 묵상해야 이어져요' : hasToday ? '연속 묵상 중' : '연속 묵상 중'}
        </p>
      </div>
    </div>
  );
}

/* 오늘의 여정 미니 리스트 */
function JourneyList({ hasReflection, hasCheckIn, hasGroup }: {
  hasReflection: boolean; hasCheckIn: boolean; hasGroup: boolean;
}) {
  const items = [
    { label: '말씀 읽기', done: hasReflection },
    { label: '한 줄 말씀 받기', done: hasReflection },
    { label: '기도와 실천', done: hasReflection },
    ...(hasGroup ? [{ label: '소그룹 인증', done: hasCheckIn }] : []),
  ];
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-3">
          <span
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              item.done ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
          />
          <span
            className={`text-sm transition-colors ${
              item.done ? 'text-muted-foreground line-through' : 'text-foreground'
            }`}
          >
            {item.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function HomeClient({
  user, userName, todayLabel,
  hasReflectionToday, hasCheckInToday, streakCount, userGroup, recentWords, todayVerse,
  challenges, todayLogs, challengeStreaks, todayKst,
}: Props) {
  const sub = greetingSub(userName);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const prevHadReflection = useRef<boolean | null>(null);

  // 묵상 완료 시 한 번만 축하 (오늘 첫 완료일 때)
  useEffect(() => {
    if (!hasReflectionToday) { prevHadReflection.current = false; return; }
    if (prevHadReflection.current === false) {
      setShowCelebration(true);
      localStorage.setItem(todayKey(), '1');
      prevHadReflection.current = true;
      return;
    }
    if (prevHadReflection.current === null) {
      prevHadReflection.current = true;
      if (!localStorage.getItem(todayKey())) {
        setShowCelebration(true);
        localStorage.setItem(todayKey(), '1');
      }
    }
  }, [hasReflectionToday]);

  // 시간대 업데이트
  useEffect(() => {
    const id = setInterval(() => setCurrentHour(new Date().getHours()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {showCelebration && <CelebrationOverlay onClose={() => setShowCelebration(false)} />}

      <div className="px-5 pt-4 pb-10 space-y-10">

        {/* Streak — 최상단, 항상 */}
        <StreakStrip count={streakCount} hasToday={hasReflectionToday} hour={currentHour} />

        {/* 오늘의 말씀 — 가장 큰 시각적 비중 */}
        <section className="text-center space-y-6">
          <div className="space-y-1">
            <p className="text-[10px] font-medium text-primary uppercase tracking-[0.25em]">
              오늘의 말씀
            </p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>

          {todayVerse ? (
            <blockquote className="space-y-3">
              <p className="font-serif-kr text-2xl leading-[1.7] text-foreground px-2">
                &ldquo;{todayVerse.text}&rdquo;
              </p>
              <p className="text-xs text-muted-foreground tracking-wide">
                ─ {todayVerse.passage}
              </p>
            </blockquote>
          ) : (
            <p className="text-sm text-muted-foreground py-6">
              {todayLabel ?? '오늘의 말씀을 준비 중입니다'}
            </p>
          )}

          <Link
            href="/today"
            className="inline-block px-8 py-4 btn-gold rounded-2xl text-sm font-medium liquid-transition active:scale-[0.98]"
          >
            {hasReflectionToday ? '오늘의 묵상 이어가기 →' : '묵상 시작하기 →'}
          </Link>
        </section>

        {/* 오늘의 여정 — 가벼운 리스트 */}
        {user && (
          <section className="pt-2 border-t border-border/40">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.18em] mb-4">
              오늘의 여정
            </p>
            <JourneyList
              hasReflection={hasReflectionToday}
              hasCheckIn={hasCheckInToday}
              hasGroup={!!userGroup}
            />
          </section>
        )}

        {/* 함께 걷는 훈련 — 챌린지. 묵상은 위에 있음, 여기는 동반 훈련 */}
        {user && !user.is_anonymous && (
          <section className="pt-2 border-t border-border/40">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.18em]">
                함께 걷는 훈련
              </p>
              <Link
                href="/challenges/explore"
                className="text-xs text-primary font-medium"
              >
                탐색 →
              </Link>
            </div>
            <ChallengeList
              challenges={challenges}
              logs={todayLogs}
              streaks={challengeStreaks}
              userId={user.id}
              todayKst={todayKst}
            />
          </section>
        )}

        {/* 최근 받은 말씀 — 영성 데이터의 누적 */}
        {user && recentWords.length > 0 && (
          <section className="pt-2 border-t border-border/40">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.18em]">
                최근 받은 말씀
              </p>
              <Link href="/journal" className="text-xs text-primary font-medium">
                전체 →
              </Link>
            </div>
            <ul className="space-y-4">
              {recentWords.map((w) => (
                <li key={w.id}>
                  <p className="font-serif-kr text-base leading-relaxed text-foreground">
                    &ldquo;{w.one_line_word}&rdquo;
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1.5 tracking-wide">
                    {formatWordDate(w.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 소그룹 — 가벼운 footer */}
        {userGroup && (
          <section className="pt-2 border-t border-border/40">
            <Link
              href={`/group/${userGroup.id}`}
              className="flex items-center justify-between active:opacity-60 liquid-transition"
            >
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.18em]">
                  함께 걷는 사람들
                </p>
                <p className="text-sm text-foreground mt-1">
                  {userGroup.name} · 오늘 {userGroup.todayCount}명
                </p>
              </div>
              <span className="text-xs text-primary">→</span>
            </Link>
          </section>
        )}

        {/* 소그룹 시작 유도 — 로그인했지만 그룹 없을 때 */}
        {user && !user.is_anonymous && !userGroup && (
          <section className="pt-2 border-t border-border/40">
            <Link
              href="/group"
              className="flex items-center justify-between active:opacity-60 liquid-transition"
            >
              <div>
                <p className="text-sm text-foreground">소그룹과 함께 걷기</p>
                <p className="text-xs text-muted-foreground mt-0.5">서로 격려하며 묵상해요</p>
              </div>
              <span className="text-xs text-primary">시작 →</span>
            </Link>
          </section>
        )}

        {/* 비로그인 안내 */}
        {!user && (
          <section className="pt-2 border-t border-border/40 text-center">
            <p className="text-xs text-muted-foreground leading-relaxed px-4">
              매일 말씀을 받고, 한 문장으로 새기고,<br />
              살아내는 영성 여정을 시작해요.
            </p>
          </section>
        )}
      </div>
    </>
  );
}
