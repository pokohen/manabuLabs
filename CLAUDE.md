# CLAUDE.md

이 파일은 Claude Code가 프로젝트를 이해하는 데 사용하는 컨텍스트 문서입니다.

## 프로젝트 개요

MANABU LABS - 일본어 학습 웹 애플리케이션 + 파트너/광고 배너 시스템

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19, Tailwind CSS v4
- **Backend**: Supabase (Database, Auth, RLS)
- **AI**: OpenAI API, Google Generative AI
- **TTS**: Google Cloud Text-to-Speech
- **State**: Zustand
- **Validation**: Zod
- **Package Manager**: pnpm

## 주요 기능

- 히라가나/가타카나 기초 학습
- 한자 획순 및 읽기 학습
- 문법 학습 (동사, 형용사, 조사 퀴즈)
- AI 기반 예문 생성
- TTS 음성 재생
- 단체(카테고리) 기반 파트너 시스템 (링크트리 스타일 공개 페이지)
- 광고 배너 캐러셀 (홈 + 서랍 메뉴)
- 역할 기반 접근 제어 (default / partner / admin)
- 관리자 대시보드 (회원/카테고리/파트너/배너 관리)
- Supabase Realtime Presence 기반 동시 편집 표시

## 디렉토리 구조

```
src/
├── app/
│   ├── api/
│   │   ├── account/              # 회원 탈퇴
│   │   ├── admin/
│   │   │   ├── banners/          # 관리자 배너 CRUD
│   │   │   ├── categories/       # 파트너 카테고리 CRUD
│   │   │   ├── partners/         # 파트너 관리 CRUD
│   │   │   └── users/            # 회원 역할 관리
│   │   ├── banners/              # 공개 배너 조회
│   │   ├── example-sentence/     # AI 예문 생성
│   │   ├── partner/
│   │   │   ├── banners/          # 단체 배너 관리 (category_id 기반)
│   │   │   ├── links/            # 단체 링크 관리 (category_id 기반)
│   │   │   └── profile/          # 단체 프로필 관리 (partner_categories 대상)
│   │   ├── particle-mask/        # 조사 마스킹
│   │   ├── tokenize/             # 토큰화
│   │   └── tts/                  # 음성 합성
│   ├── admin/                    # 관리자 대시보드
│   ├── base-study/               # 히라가나/가타카나 학습
│   ├── grammar-study/            # 문법 학습
│   ├── kanji-study/              # 한자 학습
│   ├── partner/[slug]/           # 공개 단체 페이지 (카테고리 slug 조회)
│   ├── partner-dashboard/        # 파트너 대시보드
│   ├── word-sentence/            # 단어/문장 학습
│   ├── quiz/                     # 퀴즈
│   ├── quiz-setup/               # 퀴즈 설정
│   ├── quiz-result/              # 퀴즈 결과
│   ├── profile/                  # 사용자 프로필
│   ├── login/                    # 로그인
│   ├── layout.tsx                # 루트 레이아웃
│   └── page.tsx                  # 홈페이지
├── components/
│   ├── AuthProvider.tsx           # 인증 + 역할 + 파트너/카테고리 상태 초기화
│   ├── BannerCarousel.tsx         # 배너 캐러셀 (홈/서랍)
│   ├── BannerEditor.tsx           # 배너 이미지 편집 (크롭/텍스트/업로드)
│   ├── Header.tsx                 # 네비게이션 + 서랍 메뉴
│   ├── PresenceIndicator.tsx      # Realtime Presence 동시 편집 표시
│   ├── StoreHydrator.tsx          # 서버 → 클라이언트 스토어 하이드레이션
│   ├── ThemeProvider.tsx          # 테마 관리
│   └── ...                        # 기타 UI 컴포넌트
├── lib/
│   ├── schemas/
│   │   ├── example-sentence.ts    # 예문 Zod 스키마
│   │   └── partner.ts             # 파트너/배너/카테고리 Zod 스키마
│   ├── supabase/
│   │   ├── client.ts              # 브라우저 Supabase 클라이언트
│   │   ├── server.ts              # 서버 Supabase 클라이언트
│   │   └── middleware.ts          # 세션 + 보호 경로 미들웨어
│   ├── supabase.ts                # 레거시 싱글톤 클라이언트
│   └── ...
├── store/
│   ├── authStore.ts               # 인증 상태 (user, role, lastStudiedMenu)
│   ├── partnerStore.ts            # 파트너 상태 (isPartner, partner, category)
│   ├── themeStore.ts              # 테마 상태
│   └── quizStore.ts               # 퀴즈 상태
├── data/                          # 정적 데이터 (문법, 한자)
└── middleware.ts                  # Next.js 미들웨어 진입점
```

## 개발 명령어

```bash
pnpm dev      # 개발 서버 실행
pnpm build    # 프로덕션 빌드
pnpm start    # 프로덕션 서버 실행
pnpm lint     # ESLint 검사
```

## 환경 변수

`.env.local` 파일에 다음 변수 필요:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- Google Cloud TTS 관련 설정

## 데이터베이스

Supabase PostgreSQL. 상세 스키마는 `docs/DATABASE.md` 참조.

### 주요 테이블

| 테이블 | 설명 |
|--------|------|
| `user_preferences` | 사용자 설정 + 역할 (role) |
| `partner_categories` | 단체 프로필 (slug, display_name, bio, avatar_url) |
| `partners` | 단체 멤버 (user ↔ category 연결) |
| `partner_links` | 단체 링크 (category_id FK) |
| `banners` | 광고 배너 (category_id FK) |

### 역할 시스템

`user_preferences.role` 필드로 관리:
- `default` — 일반 사용자
- `partner` — 파트너 (소속 단체의 프로필/링크/배너 공유 편집)
- `admin` — 관리자 (전체 관리)

### CASCADE 삭제

카테고리 삭제 → 소속 파트너 삭제 → 카테고리 소속 링크/배너 삭제 + 트리거로 role을 default로 리셋

## 코드 컨벤션

- TypeScript 사용
- 컴포넌트는 함수형 컴포넌트 사용
- 상태 관리는 Zustand 사용
- 스타일링은 Tailwind CSS 유틸리티 클래스 사용
- API 요청 검증은 Zod 스키마 사용
- 서버 컴포넌트와 클라이언트 컴포넌트 구분 (`'use client'` 명시)
- Supabase RLS로 데이터 접근 제어

## 참고 문서

- `docs/APP.md` — 앱 구조, 페이지, API, 컴포넌트 상세
- `docs/DATABASE.md` — DB 스키마, RLS 정책, 함수, 트리거 상세
