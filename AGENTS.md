# Project Guidance for AI Agents

## 0. 필수 — PHILOSOPHY.md 먼저 읽기

**모든 작업 시작 전 [PHILOSOPHY.md](./PHILOSOPHY.md)를 반드시 읽으세요.**

이 문서는 일용할묵상의 제품 정체성, UX 가드레일, 신학적 원칙, 식별/공유 정책,
그리고 AI 협업 규칙을 정의합니다. Claude Code와 ChatGPT Codex 양쪽이 같은
기준 아래에서 움직이기 위한 단일 진리.

새 기능 또는 변경을 검토할 때 항상 PHILOSOPHY.md의 **Section 6 체크리스트**
에 비춰 자체 검토하세요.

<!-- BEGIN:nextjs-agent-rules -->
## 1. Next.js 버전 주의 — This is NOT the Next.js you know

이 프로젝트는 Next.js 16 (App Router) 기반이며 APIs/관습/파일 구조가 학습
데이터와 다를 수 있습니다. 필요 시 `node_modules/next/dist/docs/`의 가이드를
참고하세요. Deprecation 경고도 함께 확인.
<!-- END:nextjs-agent-rules -->

## 2. 기본 워크플로우

- 데이터 먼저, UI 나중에 — 매 phase는 DB 스키마 → 컴포넌트 → 페이지 순
- 하위 호환 — nullable 컬럼, optional props
- 시간대는 KST (`getTodayDateString`, `toKstDateString`, `public.kst_date()`)
- 실패 UX는 정죄가 아니라 회복 톤 ("오늘 다시 이어갈 수 있어요")
- 마이그레이션 파일명: `YYYYMMDDHHMMSS_short_name.sql`
