'use client';

import { useMemo } from 'react';

interface Props {
  dates: Set<string>;
  weeks?: number;
}

const DAY_LABELS = ['일', '', '화', '', '목', '', '토'];

function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

/* KST 기준 YYYY-MM-DD */
function fmt(d: Date): string {
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split('T')[0];
}

/* KST 기준 일요일 자정 */
function startOfWeek(d: Date): Date {
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  kst.setUTCDate(kst.getUTCDate() - kst.getUTCDay());
  kst.setUTCHours(0, 0, 0, 0);
  return new Date(kst.getTime() - 9 * 60 * 60 * 1000);
}

export default function ContributionGrid({ dates, weeks = 16 }: Props) {
  const cells = useMemo(() => {
    const today = new Date();
    const todayStr = fmt(today);
    const start = addDays(startOfWeek(today), -7 * (weeks - 1));

    const grid: { date: string; isFuture: boolean; isToday: boolean; has: boolean }[][] = [];
    for (let w = 0; w < weeks; w++) {
      const col: typeof grid[number] = [];
      for (let d = 0; d < 7; d++) {
        const cell = addDays(start, w * 7 + d);
        const cellStr = fmt(cell);
        col.push({
          date: cellStr,
          isFuture: cell > today,
          isToday: cellStr === todayStr,
          has: dates.has(cellStr),
        });
      }
      grid.push(col);
    }
    return grid;
  }, [dates, weeks]);

  // Month labels at top — show when month changes between weeks
  const monthLabels = useMemo(() => {
    const labels: { weekIndex: number; label: string }[] = [];
    let prevMonth = -1;
    cells.forEach((col, w) => {
      const firstDay = new Date(col[0].date);
      const m = firstDay.getMonth();
      if (m !== prevMonth) {
        labels.push({ weekIndex: w, label: `${m + 1}월` });
        prevMonth = m;
      }
    });
    return labels;
  }, [cells]);

  return (
    <div className="overflow-x-auto -mx-5 px-5 pb-1">
      <div className="inline-block">
        {/* Month labels */}
        <div className="flex gap-[3px] mb-1.5 pl-6">
          {cells.map((_, w) => {
            const lbl = monthLabels.find((m) => m.weekIndex === w);
            return (
              <div key={w} className="w-3 text-[9px] text-muted-foreground/60 tracking-tight">
                {lbl?.label ?? ''}
              </div>
            );
          })}
        </div>

        {/* Grid with day labels */}
        <div className="flex gap-[3px]">
          {/* Day labels column */}
          <div className="flex flex-col gap-[3px] pr-1">
            {DAY_LABELS.map((d, i) => (
              <div
                key={i}
                className="w-3 h-3 text-[9px] text-muted-foreground/60 flex items-center"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Week columns */}
          {cells.map((col, w) => (
            <div key={w} className="flex flex-col gap-[3px]">
              {col.map((cell, d) => (
                <div
                  key={d}
                  title={`${cell.date}${cell.has ? ' · 묵상' : ''}`}
                  className={`w-3 h-3 rounded-[3px] liquid-transition-fast ${
                    cell.isFuture
                      ? 'bg-transparent'
                      : cell.has
                      ? 'bg-primary'
                      : 'bg-muted/60'
                  } ${cell.isToday ? 'ring-1 ring-primary/60' : ''}`}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 pl-6 text-[10px] text-muted-foreground/70">
          <span>적음</span>
          <span className="w-3 h-3 rounded-[3px] bg-muted/60" />
          <span className="w-3 h-3 rounded-[3px] bg-primary/40" />
          <span className="w-3 h-3 rounded-[3px] bg-primary/70" />
          <span className="w-3 h-3 rounded-[3px] bg-primary" />
          <span>충실</span>
        </div>
      </div>
    </div>
  );
}
