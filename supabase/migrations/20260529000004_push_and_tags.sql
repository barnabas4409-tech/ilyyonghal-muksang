-- Push 알림 구독 정보 (Web Push VAPID endpoint + keys)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS push_subscription jsonb,
  ADD COLUMN IF NOT EXISTS push_time         text DEFAULT '07:00';

-- 묵상 기록 태그
ALTER TABLE public.reflections
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- 묵상 블록 직접 조립 (사용자 커스텀 블록 설정)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS custom_blocks jsonb;

-- 그룹 공지 게시판
CREATE TABLE IF NOT EXISTS public.group_posts (
  id         uuid default gen_random_uuid() primary key,
  group_id   uuid references public.groups(id) on delete cascade,
  author_id  uuid references auth.users(id),
  content    text not null,
  created_at timestamptz default now()
);

ALTER TABLE public.group_posts ENABLE ROW LEVEL SECURITY;

-- 같은 그룹 멤버면 읽기 가능, 리더만 쓰기
CREATE POLICY "gp_select" ON public.group_posts FOR SELECT
  USING (group_id IN (
    SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
  ));
CREATE POLICY "gp_insert" ON public.group_posts FOR INSERT
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = group_posts.group_id AND user_id = auth.uid() AND role = 'leader'
    )
  );
CREATE POLICY "gp_delete" ON public.group_posts FOR DELETE
  USING (author_id = auth.uid());
