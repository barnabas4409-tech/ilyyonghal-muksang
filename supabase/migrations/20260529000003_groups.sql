-- profiles에 meditation_mode 추가
alter table public.profiles
  add column if not exists meditation_mode text default 'standard';

-- 그룹
create table public.groups (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  invite_code text unique not null,
  created_by  uuid references auth.users(id),
  created_at  timestamptz default now()
);

-- 멤버십
create table public.group_members (
  id         uuid default gen_random_uuid() primary key,
  group_id   uuid references public.groups(id) on delete cascade,
  user_id    uuid references auth.users(id),
  role       text default 'member' check (role in ('leader','member')),
  joined_at  timestamptz default now(),
  unique(group_id, user_id)
);

-- 인증
create table public.devotion_checks (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id),
  group_id   uuid references public.groups(id) on delete cascade,
  date       date not null,
  photo_url  text,
  caption    text,
  created_at timestamptz default now(),
  unique(user_id, group_id, date)
);

-- 스티커 반응
create table public.check_reactions (
  id         uuid default gen_random_uuid() primary key,
  check_id   uuid references public.devotion_checks(id) on delete cascade,
  user_id    uuid references auth.users(id),
  sticker    text not null,
  created_at timestamptz default now(),
  unique(check_id, user_id)
);

-- RLS
alter table public.groups          enable row level security;
alter table public.group_members   enable row level security;
alter table public.devotion_checks enable row level security;
alter table public.check_reactions enable row level security;

-- groups: 누구나 읽기, 로그인 사용자만 만들기
create policy "groups_select" on public.groups for select using (true);
create policy "groups_insert" on public.groups for insert with check (auth.uid() = created_by);
create policy "groups_delete" on public.groups for delete using (auth.uid() = created_by);

-- group_members: 멤버는 같은 그룹 행 읽기, 본인 행만 삽입/삭제
create policy "gm_select" on public.group_members for select
  using (user_id = auth.uid() or group_id in (
    select group_id from public.group_members where user_id = auth.uid()
  ));
create policy "gm_insert" on public.group_members for insert with check (user_id = auth.uid());
create policy "gm_delete" on public.group_members for delete using (user_id = auth.uid());

-- devotion_checks: 같은 그룹 멤버만 읽기, 본인만 삽입
create policy "dc_select" on public.devotion_checks for select
  using (group_id in (
    select group_id from public.group_members where user_id = auth.uid()
  ));
create policy "dc_insert" on public.devotion_checks for insert with check (user_id = auth.uid());
create policy "dc_delete" on public.devotion_checks for delete using (user_id = auth.uid());

-- check_reactions: 같은 그룹 멤버만 읽기, 본인만 삽입/삭제
create policy "cr_select" on public.check_reactions for select
  using (check_id in (
    select dc.id from public.devotion_checks dc
    join public.group_members gm on gm.group_id = dc.group_id
    where gm.user_id = auth.uid()
  ));
create policy "cr_insert" on public.check_reactions for insert with check (user_id = auth.uid());
create policy "cr_delete" on public.check_reactions for delete using (user_id = auth.uid());
