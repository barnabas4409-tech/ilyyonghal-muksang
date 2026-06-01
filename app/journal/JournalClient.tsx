'use client';

import { useState, useMemo } from 'react';
import type { Reflection, DailyReading } from '@/types';
import ContributionGrid from '@/components/journey/ContributionGrid';
import EmptyState from '@/components/ui/EmptyState';
import { toKstDateString } from '@/utils/date';

type ReflectionWithReading = Omit<Reflection, 'daily_readings'> & {
  title?: string | null;
  tags?: string[];
  daily_readings?: Pick<DailyReading, 'date' | 'passage' | 'title'> | null;
  lectionary_readings?: { sunday_date: string; week_name: string; gospel_passage: string | null } | null;
};

interface Props {
  reflections: ReflectionWithReading[];
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function passageLabel(r: ReflectionWithReading) {
  return r.daily_readings?.passage
    ?? r.lectionary_readings?.gospel_passage
    ?? r.lectionary_readings?.week_name
    ?? '—';
}

/* ─── 자주 등장한 단어 ─── */
function WordFrequency({ tags, activeTag, onSelect }: {
  tags: { tag: string; count: number }[];
  activeTag: string | null;
  onSelect: (t: string | null) => void;
}) {
  if (tags.length === 0) return null;
  const max = tags[0].count;

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-2 items-baseline">
      {tags.map(({ tag, count }) => {
        const intensity = count / max; // 0~1
        const size =
          intensity > 0.7 ? 'text-xl' :
          intensity > 0.4 ? 'text-base' :
          'text-sm';
        const opacity =
          intensity > 0.7 ? 'text-foreground' :
          intensity > 0.4 ? 'text-foreground/80' :
          'text-muted-foreground';
        const isActive = activeTag === tag;
        return (
          <button
            key={tag}
            onClick={() => onSelect(isActive ? null : tag)}
            className={`${size} ${isActive ? 'text-primary font-medium' : opacity} liquid-transition-fast`}
          >
            {tag}
            <span className="text-[10px] text-muted-foreground/60 ml-0.5">·{count}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── 한 줄 말씀 아카이브 ─── */
function OneLineArchive({ items }: { items: ReflectionWithReading[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="space-y-5">
      {items.map((r) => (
        <li key={r.id} className="border-l-2 border-primary/30 pl-4">
          <p className="font-serif-kr text-base leading-relaxed text-foreground">
            &ldquo;{r.one_line_word}&rdquo;
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-1.5 tracking-wide">
            {formatShortDate(r.created_at)} · {passageLabel(r)}
          </p>
        </li>
      ))}
    </ul>
  );
}

export default function JournalClient({ reflections }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showAllWords, setShowAllWords] = useState(false);

  // 잔디용 묵상 날짜 (KST 기준 — DB 트리거와 일관)
  const reflectionDates = useMemo(
    () => new Set(reflections.map((r) => toKstDateString(r.created_at))),
    [reflections],
  );

  // 한 줄 말씀이 있는 reflection만
  const oneLineWords = useMemo(
    () => reflections.filter((r) => r.one_line_word).slice(0, showAllWords ? undefined : 6),
    [reflections, showAllWords],
  );

  // 태그 빈도 (상위 12개)
  const tagFrequency = useMemo(() => {
    const map = new Map<string, number>();
    reflections.forEach((r) => r.tags?.forEach((t) => map.set(t, (map.get(t) ?? 0) + 1)));
    return [...map.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [reflections]);

  // 필터링된 목록
  const filtered = useMemo(() => {
    let list = reflections;
    if (activeTag) list = list.filter((r) => r.tags?.includes(activeTag));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((r) =>
        (r.content ?? '').toLowerCase().includes(q) ||
        (r.title ?? '').toLowerCase().includes(q) ||
        (r.one_line_word ?? '').toLowerCase().includes(q) ||
        passageLabel(r).toLowerCase().includes(q)
      );
    }
    return list;
  }, [reflections, query, activeTag]);

  const totalOneLine = reflections.filter((r) => r.one_line_word).length;

  // ─── Empty state ───
  if (reflections.length === 0) {
    return (
      <EmptyState
        title="아직 묵상 기록이 없어요"
        hint="첫 묵상을 시작하면 여정이 쌓여요"
        cta={{ label: '오늘의 묵상 →', href: '/today' }}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-dvh px-5 pt-7 pb-10 space-y-10">

      {/* ─── 헤더 ─── */}
      <header className="space-y-1">
        <h1 className="text-xl font-medium text-foreground">내 여정</h1>
        <p className="text-xs text-muted-foreground">
          총 {reflections.length}개의 묵상
          {totalOneLine > 0 && ` · ${totalOneLine}개의 한 줄 말씀`}
        </p>
      </header>

      {/* ─── 영성 잔디 ─── */}
      <section className="pt-2 border-t border-border/40">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.18em] mb-4">
          최근 16주
        </p>
        <ContributionGrid dates={reflectionDates} weeks={16} />
      </section>

      {/* ─── 자주 등장한 단어 ─── */}
      {tagFrequency.length > 0 && (
        <section className="pt-2 border-t border-border/40">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.18em] mb-4">
            자주 등장한 단어
          </p>
          <WordFrequency
            tags={tagFrequency}
            activeTag={activeTag}
            onSelect={setActiveTag}
          />
          {activeTag && (
            <p className="text-[10px] text-primary mt-3">
              #{activeTag} 필터링 중 · 탭하여 해제
            </p>
          )}
        </section>
      )}

      {/* ─── 한 줄 말씀 아카이브 ─── */}
      {totalOneLine > 0 && (
        <section className="pt-2 border-t border-border/40">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.18em]">
              받은 말씀
            </p>
            {totalOneLine > 6 && (
              <button
                onClick={() => setShowAllWords((v) => !v)}
                className="text-xs text-primary font-medium"
              >
                {showAllWords ? '접기' : `모두 ${totalOneLine}개`}
              </button>
            )}
          </div>
          <OneLineArchive items={oneLineWords} />
        </section>
      )}

      {/* ─── 묵상 기록 (검색/필터/목록) ─── */}
      <section className="pt-2 border-t border-border/40 space-y-4">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.18em]">
          묵상 기록
        </p>

        {/* 검색 */}
        <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-muted-foreground shrink-0">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="제목, 내용, 본문, 한 줄 말씀 검색"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-muted-foreground/60 text-xs">✕</button>
          )}
        </div>

        {/* 결과 없음 */}
        {filtered.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">검색 결과가 없어요</p>
          </div>
        )}

        {/* 목록 */}
        <div className="space-y-3">
          {filtered.map((reflection) => {
            const isExpanded = expanded === reflection.id;
            const content = reflection.content ?? '';
            const firstLine = content.split('\n')[0];

            return (
              <button
                key={reflection.id}
                onClick={() => setExpanded(isExpanded ? null : reflection.id)}
                className="w-full text-left card-float p-5 liquid-transition active:scale-[0.99]"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-[11px] font-medium text-primary uppercase tracking-[0.12em] truncate">
                      {passageLabel(reflection)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatShortDate(reflection.created_at)}</p>
                  </div>
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    className={`text-muted-foreground mt-1 shrink-0 liquid-transition-fast ${isExpanded ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>

                {reflection.title && (
                  <p className="text-sm font-medium text-foreground mb-1">{reflection.title}</p>
                )}

                {reflection.one_line_word && (
                  <p className="font-serif-kr text-base text-foreground leading-relaxed mb-2 italic">
                    &ldquo;{reflection.one_line_word}&rdquo;
                  </p>
                )}

                {content && (
                  <p className="text-sm text-foreground leading-relaxed">
                    {isExpanded
                      ? content
                      : (firstLine.length > 60 ? firstLine.slice(0, 60) + '...' : firstLine)}
                  </p>
                )}

                {reflection.tags && reflection.tags.length > 0 && (
                  <div className="flex gap-1 mt-3 flex-wrap">
                    {reflection.tags.map((t) => (
                      <span key={t} className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {isExpanded && reflection.prayer && (
                  <div className="mt-4 pt-3 border-t border-border/40">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.18em] mb-1">기도</p>
                    <p className="text-sm text-foreground leading-relaxed">{reflection.prayer}</p>
                  </div>
                )}

                {isExpanded && reflection.practice && (
                  <div className="mt-3 pt-3 border-t border-border/40">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.18em] mb-1">실천</p>
                    <p className="text-sm text-foreground leading-relaxed">{reflection.practice}</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
