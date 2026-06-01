'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const PRESETS = [
  { label: '1분', seconds: 60 },
  { label: '5분', seconds: 300 },
  { label: '10분', seconds: 600 },
];

type State = 'idle' | 'running' | 'paused' | 'done';

export default function SilenceBlock({ defaultDuration = 300 }: { defaultDuration?: number }) {
  const [selected, setSelected] = useState(defaultDuration);
  const [customInput, setCustomInput] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [timerState, setTimerState] = useState<State>('idle');
  const [remaining, setRemaining] = useState(defaultDuration);

  const endTimeRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wakeLockRef = useRef<{ release(): Promise<void> } | null>(null);

  const clearTick = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const acquireWakeLock = async () => {
    try {
      const nav = navigator as Navigator & { wakeLock?: { request(t: string): Promise<{ release(): Promise<void> }> } };
      if (nav.wakeLock) wakeLockRef.current = await nav.wakeLock.request('screen');
    } catch (_) {}
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) { await wakeLockRef.current.release(); wakeLockRef.current = null; }
  };

  const complete = useCallback(() => {
    clearTick();
    setTimerState('done');
    setRemaining(0);
    releaseWakeLock();
    navigator.vibrate?.([300, 150, 300, 150, 300]);
  }, []);

  const startTick = useCallback(() => {
    clearTick();
    intervalRef.current = setInterval(() => {
      if (endTimeRef.current === null) return;
      const rem = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setRemaining(rem);
      if (rem === 0) complete();
    }, 250);
  }, [complete]);

  // 화면 복귀 시 타이머 재동기화 + wake lock 재취득
  useEffect(() => {
    const onVisible = async () => {
      if (document.visibilityState !== 'visible') return;
      if (timerState === 'running') {
        startTick();
        if (!wakeLockRef.current) await acquireWakeLock();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [timerState, startTick]);

  useEffect(() => {
    return () => { clearTick(); releaseWakeLock(); };
  }, []);

  async function handleStart() {
    endTimeRef.current = Date.now() + selected * 1000;
    setRemaining(selected);
    setTimerState('running');
    startTick();
    await acquireWakeLock();
  }

  function handlePause() {
    clearTick();
    pausedAtRef.current = remaining;
    endTimeRef.current = null;
    setTimerState('paused');
    releaseWakeLock();
  }

  async function handleResume() {
    endTimeRef.current = Date.now() + pausedAtRef.current * 1000;
    setTimerState('running');
    startTick();
    await acquireWakeLock();
  }

  function handleStop() {
    clearTick();
    endTimeRef.current = null;
    setTimerState('idle');
    setRemaining(selected);
    releaseWakeLock();
  }

  function applyCustom() {
    const mins = parseInt(customInput, 10);
    if (!mins || mins < 1 || mins > 180) return;
    const secs = mins * 60;
    setSelected(secs);
    setRemaining(secs);
    setShowCustom(false);
  }

  function selectPreset(seconds: number) {
    setSelected(seconds);
    setRemaining(seconds);
    setShowCustom(false);
    setCustomInput('');
  }

  function fmt(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  const isPreset = PRESETS.some(p => p.seconds === selected);

  return (
    <div className="mx-5 bg-card border border-border rounded-2xl p-5">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.18em] mb-2">침묵</p>

      {/* 안내 문구 */}
      {timerState === 'idle' && (
        <p className="text-xs text-muted-foreground/70 leading-relaxed mb-4">
          읽은 말씀을 마음에 품고 조용히 머무세요. 기도해도 좋고, 그저 침묵해도 됩니다.
        </p>
      )}

      {/* 시간 선택 */}
      {timerState === 'idle' && (
        <div className="space-y-2.5 mb-5">
          <div className="flex gap-2">
            {PRESETS.map(({ label, seconds }) => (
              <button
                key={seconds}
                onClick={() => selectPreset(seconds)}
                className={`flex-1 py-2 text-xs font-medium rounded-xl liquid-transition-fast ${
                  selected === seconds && !showCustom
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/60 text-muted-foreground'
                }`}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => { setShowCustom(v => !v); }}
              className={`flex-1 py-2 text-xs font-medium rounded-xl liquid-transition-fast ${
                showCustom || (!isPreset && selected > 0)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/60 text-muted-foreground'
              }`}
            >
              직접
            </button>
          </div>

          {showCustom && (
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={180}
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyCustom()}
                placeholder="분 입력 (최대 180)"
                className="flex-1 bg-muted/60 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              />
              <button
                onClick={applyCustom}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium"
              >
                설정
              </button>
            </div>
          )}
        </div>
      )}

      {/* 타이머 표시 */}
      {timerState !== 'idle' && (
        <div className="text-center py-5 mb-4">
          {timerState === 'done' ? (
            <>
              <p className="text-4xl font-light text-primary mb-1">아멘</p>
              <p className="text-xs text-muted-foreground">기도가 끝났습니다</p>
            </>
          ) : (
            <>
              <p className="text-5xl font-light tabular-nums text-foreground">{fmt(remaining)}</p>
              {timerState === 'paused' && (
                <p className="text-xs text-muted-foreground mt-2">일시정지됨</p>
              )}
            </>
          )}
        </div>
      )}

      {/* 버튼 */}
      {timerState === 'idle' && (
        <button
          onClick={handleStart}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium active:scale-[0.98] liquid-transition"
        >
          시작
        </button>
      )}

      {timerState === 'running' && (
        <div className="flex gap-2">
          <button
            onClick={handlePause}
            className="flex-1 py-3 border border-border text-foreground rounded-xl text-sm font-medium active:scale-[0.98] liquid-transition"
          >
            일시정지
          </button>
          <button
            onClick={handleStop}
            className="flex-1 py-3 bg-muted text-muted-foreground rounded-xl text-sm font-medium active:scale-[0.98] liquid-transition"
          >
            정지
          </button>
        </div>
      )}

      {timerState === 'paused' && (
        <div className="flex gap-2">
          <button
            onClick={handleResume}
            className="flex-[2] py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium active:scale-[0.98] liquid-transition"
          >
            계속하기
          </button>
          <button
            onClick={handleStop}
            className="flex-1 py-3 bg-muted text-muted-foreground rounded-xl text-sm font-medium active:scale-[0.98] liquid-transition"
          >
            정지
          </button>
        </div>
      )}

      {timerState === 'done' && (
        <button
          onClick={handleStop}
          className="w-full py-3 bg-muted text-foreground rounded-xl text-sm font-medium active:scale-[0.98] liquid-transition"
        >
          닫기
        </button>
      )}
    </div>
  );
}
