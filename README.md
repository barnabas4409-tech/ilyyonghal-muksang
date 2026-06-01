# 일용할묵상 — Spiritual Formation OS

매일 말씀을 받고, 한 문장으로 새기고, 살아내는 영적 형성 플랫폼.

> 단순한 묵상 앱이 아니라 신자의 삶을 형성하는 운영체제.

---

## 핵심 컨셉

```
말씀 읽기 → 묵상 → 기도 → 한 줄 말씀 → 실천 → 기억 → 반복 → 형성
```

- **한 줄 말씀**이 영성의 핵심 시그널 데이터
- 블록 기반 (Notion 스타일) — 사용자가 자기 묵상 흐름을 직접 조립
- 영성 잔디 + 단어 빈도 분석으로 형성 과정 시각화
- 소그룹 인증 (사진 + 스티커 반응)

---

## 기술 스택

| 영역 | 도구 |
|---|---|
| 프레임워크 | Next.js 16 (App Router, RSC + Client Components) |
| 스타일 | Tailwind CSS v4 (`@theme inline`, no config file) |
| DB / Auth | Supabase (Postgres + Auth + Storage) |
| 호스팅 | Vercel |
| 푸시 | Web Push API + Supabase Edge Functions (Deno) |
| 폰트 | Pretendard + Noto Serif KR |

**⚠️ Next.js 16 주의**: API/관습이 학습 데이터와 다를 수 있어요. `node_modules/next/dist/docs/` 참고.

---

## 디렉터리 구조

```
app/
  page.tsx                홈 (RSC)
  HomeClient.tsx          홈 클라이언트
  today/                  묵상 페이지 (스크롤형 여정)
  journal/                내 여정 (잔디 + 한 줄 아카이브)
  profile/                영적 자아 + 블록 흐름 편집기
  group/                  소그룹 + 인증 피드
  auth/                   로그인/콜백
components/
  blocks/                 묵상 블록 (Scripture, Journal, OneLine, Prayer 등)
  layout/                 BottomNav, SideNav, AuthProvider, ThemeProvider
  group/                  CheckInSheet
  journey/                ContributionGrid
  profile/                BlockFlowEditor
  ui/                     SettingRow, EmptyState, AnonymousNotice
lib/
  supabase/               server/client/middleware wrapper
  blockFlow.ts            블록 흐름 정규화 + 정의
  quotes.ts               신앙고전 인용
utils/
  date.ts                 KST 기준 날짜 (DB 트리거와 일관)
  bible.ts                본문 추출
  push.ts                 Web Push 구독
supabase/
  migrations/             SQL 마이그레이션 (시간 정렬)
  functions/send-push/    Edge Function (Deno) — 일일 푸시 발송
```

---

## 데이터 모델

핵심 테이블:
- `profiles` — 사용자 설정 (bible_version, reading_track, meditation_mode, custom_blocks, push_*)
- `reflections` — 묵상 기록 (content, one_line_word, prayer, practice, extras{gratitude, freenote})
  - **unique(user_id, reading_id)** — 같은 본문에 한 row, 블록별 upsert
- `streaks` — 연속 묵상 일수 (DB 트리거로 자동 갱신, KST 기준)
- `groups` / `group_members` / `devotion_checks` / `check_reactions` / `group_posts`

블록 설정 (`profiles.custom_blocks` JSONB):
```json
{ "v": 2, "blocks": [{"type": "quote"}, {"type": "silence", "mins": 5}, ...] }
```

레거시 v1도 런타임에서 자동 변환 (`lib/blockFlow.ts:normalizeBlocks`).

---

## 개발 워크플로우

### 로컬 개발
```bash
npm install
npm run dev          # http://localhost:3000
```

`.env.local`에 필요:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...        (Edge Function용)
SUPABASE_SERVICE_ROLE_KEY=... (Edge Function용)
```

### DB 마이그레이션
```bash
npx supabase migration list       # 로컬 vs 원격 비교
npx supabase db push              # 원격에 적용
```

### 배포 (현재: CLI 수동)
```bash
npx vercel --prod
```

**TODO**: GitHub 연결로 자동 배포 전환 (Vercel dashboard에서 `barnabas4409-tech/ilyyonghal-muksang` 연결)

---

## 코드 컨벤션

- **데이터 먼저, UI 나중에** — 매 phase는 DB 스키마 → 컴포넌트 → 페이지 순
- **하위 호환** — nullable 컬럼, optional props
- **각 블록 자급자족** — 자신의 데이터만 upsert (user_id+reading_id 충돌 시 자기 컬럼 갱신)
- **시간대는 KST** — `getTodayDateString()`, `toKstDateString()`, DB의 `public.kst_date()`가 같은 "오늘" 공유
- **에러 처리**: 사용자 행동(인증/업로드)은 명시적 메시지, 백그라운드 fetch는 silent fallback

---

## 베타 테스트 후 추적해야 할 항목

- [ ] Supabase Storage `devotion-photos` 버킷 (인증 사진용)
- [ ] VAPID 키 + Edge Function 배포 (`npx supabase functions deploy send-push`)
- [ ] Vercel ↔ GitHub 자동 배포 연결
- [ ] 분석 도구 (PostHog 등) — 사용자 행동 추적
- [ ] 그룹 리더 권한 (멤버 추방/역할 변경)
