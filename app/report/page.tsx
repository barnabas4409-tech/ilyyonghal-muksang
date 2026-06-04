import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ReportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) redirect('/auth/login');

  const year = new Date().getFullYear();
  const yearStart = `${year}-01-01`;

  const { count: totalThisYear } = await supabase
    .from('reflections')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', yearStart + 'T00:00:00Z');

  const { data: tags } = await supabase
    .from('reflections')
    .select('tags')
    .eq('user_id', user.id)
    .gte('created_at', yearStart + 'T00:00:00Z')
    .not('tags', 'is', null);

  // 태그 빈도
  const tagCount: Record<string, number> = {};
  for (const r of tags ?? []) {
    for (const tag of r.tags ?? []) {
      tagCount[tag] = (tagCount[tag] ?? 0) + 1;
    }
  }
  const topTags = Object.entries(tagCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const { data: words } = await supabase
    .from('reflections')
    .select('one_line_word, created_at')
    .eq('user_id', user.id)
    .gte('created_at', yearStart + 'T00:00:00Z')
    .not('one_line_word', 'is', null)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="px-5 py-10 space-y-10">
      <div>
        <p className="text-[10px] font-medium text-primary uppercase tracking-[0.25em] mb-2">형성 리포트</p>
        <h1 className="text-2xl font-medium text-foreground">{year}년 묵상 여정</h1>
        <p className="text-sm text-muted-foreground mt-1">말씀 앞에 머문 시간들</p>
      </div>

      {/* 핵심 수치 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-float p-5 text-center">
          <p className="text-4xl font-bold text-primary">{totalThisYear ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">올해 묵상 횟수</p>
        </div>
        <div className="card-float p-5 text-center">
          <p className="text-4xl font-bold text-primary">{topTags.length}</p>
          <p className="text-xs text-muted-foreground mt-1">사용한 태그</p>
        </div>
      </div>

      {/* 자주 쓴 태그 */}
      {topTags.length > 0 && (
        <section className="space-y-3">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.18em]">자주 만난 말씀</p>
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
                style={{ opacity: 0.5 + Math.min(count / (topTags[0]?.[1] ?? 1), 1) * 0.5 }}
              >
                #{tag} <span className="text-primary/60">{count}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 최근 한 줄 말씀 */}
      {(words ?? []).length > 0 && (
        <section className="space-y-4">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.18em]">올해 받은 말씀들</p>
          <ul className="space-y-5">
            {(words ?? []).map((w) => (
              <li key={w.created_at}>
                <p className="font-serif-kr text-base leading-relaxed text-foreground">
                  &ldquo;{w.one_line_word}&rdquo;
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                  {new Date(w.created_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(totalThisYear ?? 0) === 0 && (
        <div className="text-center py-12 space-y-2">
          <p className="text-sm text-muted-foreground">아직 올해 묵상 기록이 없어요</p>
          <p className="text-xs text-muted-foreground/60">첫 묵상부터 시작해보세요</p>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground/50 text-center">
        더 상세한 연간 리포트 기능은 준비 중이에요
      </p>
    </div>
  );
}
