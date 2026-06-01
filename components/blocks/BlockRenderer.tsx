'use client';

import { useState, useEffect, useRef } from 'react';
import type { MeditationBlock } from '@/types/blocks';
import { blockRegistry } from './blockRegistry';

interface Props {
  blocks: MeditationBlock[];
}

export default function BlockRenderer({ blocks }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleSet, setVisibleSet] = useState<Set<number>>(new Set([0]));
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = refs.current.findIndex((r) => r === entry.target);
          if (idx < 0) return;
          if (entry.isIntersecting) {
            setVisibleSet((prev) => (prev.has(idx) ? prev : new Set(prev).add(idx)));
            if (entry.intersectionRatio > 0.3) setActiveIndex(idx);
          }
        });
      },
      { threshold: [0.15, 0.3, 0.6], rootMargin: '-10% 0px -30% 0px' },
    );
    refs.current.forEach((r) => r && observer.observe(r));
    return () => observer.disconnect();
  }, [blocks.length]);

  const progressPct = blocks.length > 0 ? ((activeIndex + 1) / blocks.length) * 100 : 0;

  return (
    <>
      {/* 상단 진행 바 — Hallow 스타일 얇은 라인, iOS notch 대응 */}
      <div
        className="fixed left-0 right-0 h-[2px] z-40 bg-border/40 pointer-events-none"
        style={{ top: 'env(safe-area-inset-top)' }}
      >
        <div
          className="h-full bg-primary transition-all duration-700 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex flex-col pb-16">
        {blocks.map((block, i) => {
          const Component = blockRegistry[block.type];
          const isVisible = visibleSet.has(i);
          return (
            <div
              key={`${block.type}-${i}`}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className={`${i > 0 ? 'mt-14 md:mt-20' : 'mt-2'} transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Component {...block} />
            </div>
          );
        })}
      </div>
    </>
  );
}
