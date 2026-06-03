'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ko">
      <body className="min-h-dvh flex flex-col items-center justify-center bg-background text-foreground p-6 text-center">
        <p className="text-2xl mb-3">🙏</p>
        <p className="text-base font-medium text-foreground mb-2">잠시 오류가 생겼어요</p>
        <p className="text-sm text-muted-foreground mb-6">
          말씀 앞에 머무는 여정은 이어집니다.<br />
          새로고침 후 다시 시도해 보세요.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-2xl btn-gold text-sm font-medium"
        >
          다시 시도
        </button>
      </body>
    </html>
  );
}
