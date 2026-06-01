import Link from 'next/link';

export default function AnonymousNotice() {
  return (
    <div className="mx-5 mt-4 px-4 py-3 rounded-2xl bg-primary/5 border border-primary/15 flex items-start gap-3">
      <span className="text-base">🔐</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground">로그인하지 않은 상태예요</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
          묵상은 이 기기에만 보존돼요. 로그인하면 영구 저장되고 기기 간 동기화돼요.
        </p>
      </div>
      <Link
        href="/auth/login"
        className="text-xs text-primary font-medium shrink-0 mt-0.5"
      >
        로그인 →
      </Link>
    </div>
  );
}
