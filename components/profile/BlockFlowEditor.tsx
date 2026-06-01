'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  BLOCK_META,
  DEFAULT_FLOWS,
  SILENCE_PRESETS,
  normalizeBlocks,
  serializeBlocks,
  type BlockConfig,
  type BlockKind,
} from '@/lib/blockFlow';
import type { MeditationMode } from '@/types';

interface Props {
  userId: string;
  mode: MeditationMode;
  initial: unknown;
}

export default function BlockFlowEditor({ userId, mode, initial }: Props) {
  const [blocks, setBlocks] = useState<BlockConfig[]>(() => normalizeBlocks(initial as never, mode));
  const [addOpen, setAddOpen] = useState(false);
  const [isCustomized, setIsCustomized] = useState(!!initial);

  async function persist(newBlocks: BlockConfig[]) {
    const supabase = createClient();
    await supabase
      .from('profiles')
      .update({ custom_blocks: serializeBlocks(newBlocks) })
      .eq('id', userId);
    setIsCustomized(true);
  }

  function update(newBlocks: BlockConfig[]) {
    setBlocks(newBlocks);
    persist(newBlocks);
  }

  function move(idx: number, delta: -1 | 1) {
    const target = idx + delta;
    if (target < 0 || target >= blocks.length) return;
    const copy = [...blocks];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    update(copy);
  }

  function remove(idx: number) {
    update(blocks.filter((_, i) => i !== idx));
  }

  function add(type: BlockKind) {
    const newBlock: BlockConfig =
      type === 'silence' ? { type: 'silence', mins: 5 } : ({ type } as BlockConfig);
    update([...blocks, newBlock]);
    setAddOpen(false);
  }

  function changeSilenceMins(idx: number, mins: number) {
    const copy = blocks.map((b, i) =>
      i === idx && b.type === 'silence' ? { ...b, mins } : b,
    );
    update(copy);
  }

  async function resetToDefault() {
    const supabase = createClient();
    await supabase.from('profiles').update({ custom_blocks: null }).eq('id', userId);
    setBlocks(DEFAULT_FLOWS[mode]);
    setIsCustomized(false);
  }

  const usedTypes = new Set(blocks.map((b) => b.type));
  const addable: BlockKind[] = (Object.keys(BLOCK_META) as BlockKind[]).filter(
    (k) => BLOCK_META[k].allowMultiple || !usedTypes.has(k),
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            묵상 블록 구성
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
            {isCustomized ? '내가 만든 흐름' : `${mode} 프리셋 사용 중`}
          </p>
        </div>
        {isCustomized && (
          <button
            onClick={resetToDefault}
            className="text-[10px] text-muted-foreground/60 underline"
          >
            프리셋으로 되돌리기
          </button>
        )}
      </div>

      {/* 현재 블록 목록 */}
      <ul className="space-y-1.5">
        <li className="flex items-center gap-2 py-2.5 px-3 bg-muted/30 rounded-xl opacity-60">
          <span className="text-[10px] text-muted-foreground/60 w-4">·</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">본문 (필수)</p>
          </div>
        </li>

        {blocks.map((block, idx) => (
          <li key={idx} className="flex items-start gap-2 py-2.5 px-3 bg-muted/40 rounded-xl">
            <span className="text-[10px] text-muted-foreground/60 w-4 mt-0.5">{idx + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{BLOCK_META[block.type].label}</p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                {BLOCK_META[block.type].description}
              </p>
              {block.type === 'silence' && (
                <div className="flex gap-1 mt-2">
                  {SILENCE_PRESETS.map((m) => (
                    <button
                      key={m}
                      onClick={() => changeSilenceMins(idx, m)}
                      className={`text-[10px] px-1.5 py-0.5 rounded liquid-transition-fast ${
                        (block.mins ?? 5) === m
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/60 text-muted-foreground'
                      }`}
                    >
                      {m}분
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={() => move(idx, -1)}
                disabled={idx === 0}
                className="text-muted-foreground disabled:opacity-30 px-1.5 py-1 text-sm"
                aria-label="위로"
              >
                ↑
              </button>
              <button
                onClick={() => move(idx, 1)}
                disabled={idx === blocks.length - 1}
                className="text-muted-foreground disabled:opacity-30 px-1.5 py-1 text-sm"
                aria-label="아래로"
              >
                ↓
              </button>
              <button
                onClick={() => remove(idx)}
                className="text-muted-foreground/60 px-1.5 py-1 text-sm"
                aria-label="삭제"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* 추가 */}
      {addable.length > 0 && (
        <>
          <button
            onClick={() => setAddOpen((v) => !v)}
            className="w-full py-2.5 text-xs text-primary border border-dashed border-primary/40 rounded-xl liquid-transition-fast hover:bg-primary/5"
          >
            {addOpen ? '닫기' : '+ 블록 추가'}
          </button>

          {addOpen && (
            <ul className="grid grid-cols-2 gap-1.5">
              {addable.map((kind) => (
                <li key={kind}>
                  <button
                    onClick={() => add(kind)}
                    className="w-full text-left bg-card border border-border rounded-xl p-3 hover:border-primary/40 liquid-transition-fast"
                  >
                    <p className="text-sm text-foreground">{BLOCK_META[kind].label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                      {BLOCK_META[kind].description}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {blocks.length === 0 && (
        <p className="text-[11px] text-muted-foreground text-center py-2">
          본문만 보이게 돼요. 블록을 추가해서 흐름을 만들어보세요.
        </p>
      )}
    </div>
  );
}
