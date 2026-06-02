'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ChallengeCategory } from '@/types';
import { CATEGORY_META, CATEGORY_ORDER } from '@/lib/challenges';

interface Props {
  userId: string;
  onCreated: () => void;
  onCancel: () => void;
}

export default function ChallengeEditor({ userId, onCreated, onCancel }: Props) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [category, setCategory] = useState<ChallengeCategory>('study');
  const [targetValue, setTargetValue] = useState('');
  const [targetUnit, setTargetUnit] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!name.trim() || saving) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const { error: err } = await supabase.from('challenges').insert({
      user_id: userId,
      name: name.trim(),
      emoji: emoji.trim() || null,
      category,
      cadence: 'daily',
      target_value: targetValue ? Number(targetValue) : null,
      target_unit: targetUnit.trim() || null,
      is_pinned: true,
      is_public: isPublic,
    });

    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onCreated();
  }

  // category 변경 시 emoji가 비어 있으면 기본값 미리보기
  const previewEmoji = emoji.trim() || CATEGORY_META[category].defaultEmoji;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      {/* 이모지 + 이름 */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value.slice(0, 2))}
          placeholder={previewEmoji}
          className="w-12 h-10 text-center text-lg bg-muted/40 rounded-xl focus:outline-none focus:bg-muted/60 liquid-transition"
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 30))}
          placeholder="훈련 이름 (예: IELTS 리딩)"
          autoFocus
          className="flex-1 h-10 px-3 text-sm bg-muted/40 rounded-xl focus:outline-none focus:bg-muted/60 liquid-transition"
        />
      </div>

      {/* 카테고리 선택 */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORY_ORDER.filter((c) => c !== 'meditation').map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`text-[11px] px-2.5 py-1 rounded-full liquid-transition-fast ${
              category === c
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/40 text-muted-foreground'
            }`}
          >
            {CATEGORY_META[c].defaultEmoji} {CATEGORY_META[c].label}
          </button>
        ))}
      </div>

      {/* 목표 (선택) */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          placeholder="목표"
          className="flex-1 h-9 px-3 text-sm bg-muted/40 rounded-xl focus:outline-none focus:bg-muted/60 liquid-transition"
        />
        <input
          type="text"
          value={targetUnit}
          onChange={(e) => setTargetUnit(e.target.value.slice(0, 4))}
          placeholder="단위"
          className="w-20 h-9 px-3 text-sm bg-muted/40 rounded-xl focus:outline-none focus:bg-muted/60 liquid-transition"
        />
      </div>

      {/* 공개 여부 */}
      <button
        onClick={() => setIsPublic((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-1 py-1.5 text-left"
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs text-foreground">다른 분들도 보게 공개</p>
          <p className="text-[10px] text-muted-foreground/70 mt-0.5">
            같은 카테고리 사람들이 이 훈련을 영감으로 시작할 수 있어요
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

      {error && (
        <p className="text-[11px] text-orange-600 dark:text-orange-400">{error}</p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 text-sm text-muted-foreground rounded-xl liquid-transition-fast"
        >
          취소
        </button>
        <button
          onClick={save}
          disabled={!name.trim() || saving}
          className="flex-[2] py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium disabled:opacity-40 active:scale-[0.98] liquid-transition"
        >
          {saving ? '만드는 중...' : '훈련 추가'}
        </button>
      </div>
    </div>
  );
}
