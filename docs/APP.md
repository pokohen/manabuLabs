# MANABU LABS - 애플리케이션 구조

## 페이지 구성

### 학습 페이지

| 경로 | 설명 | 인증 |
|------|------|------|
| `/` | 홈 — 학습 메뉴 + 배너 캐러셀 | 불필요 |
| `/base-study` | 히라가나/가타카나 기초 학습 | 불필요 |
| `/grammar-study` | 문법 학습 (동사, 형용사, 조사) | 불필요 |
| `/kanji-study` | 한자 학습 (beta) | 불필요 |
| `/word-sentence` | AI 예시 문장 생성 | **필요** |
| `/quiz-setup` | 퀴즈 설정 | 불필요 |
| `/quiz` | 퀴즈 진행 | 불필요 |
| `/quiz-result` | 퀴즈 결과 | 불필요 |

### 사용자 페이지

| 경로 | 설명 | 인증 |
|------|------|------|
| `/login` | Google 로그인 | 불필요 |
| `/profile` | 프로필 설정 / 회원 탈퇴 | **필요** |

### 파트너 시스템

| 경로 | 설명 | 인증 |
|------|------|------|
| `/partner/[slug]` | 공개 단체 페이지 (카테고리 slug 조회, 링크트리 스타일) | 불필요 |
| `/partner-dashboard` | 단체 대시보드 (프로필/링크/배너 공유 편집 + Presence 표시) | **필요** (partner role) |

### 관리자

| 경로 | 설명 | 인증 |
|------|------|------|
| `/admin` | 관리자 대시보드 (회원/카테고리/파트너/배너) | **필요** (admin role) |

---

## API 라우트

### 공개 API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/banners?position=home\|drawer` | 활성 배너 조회 (위치별 필터) |
| POST | `/api/example-sentence` | AI 예시 문장 생성 |
| POST | `/api/particle-mask` | 조사 마스킹 |
| POST | `/api/tokenize` | 일본어 토큰화 |
| POST | `/api/tts` | TTS 음성 합성 |

### 사용자 API (인증 필요)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| DELETE | `/api/account` | 회원 탈퇴 (소프트 삭제) |

### 파트너 API (partner role 필요)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/partner/profile` | 소속 단체 프로필 조회 (partner_categories) |
| PATCH | `/api/partner/profile` | 단체 프로필 수정 (display_name, bio) |
| GET | `/api/partner/links` | 소속 단체 링크 목록 (category_id 기반) |
| POST | `/api/partner/links` | 단체 링크 추가 |
| PATCH | `/api/partner/links` | 단체 링크 수정 |
| DELETE | `/api/partner/links` | 단체 링크 삭제 |
| GET | `/api/partner/banners` | 소속 단체 배너 목록 (category_id 기반) |
| POST | `/api/partner/banners` | 단체 배너 추가 |
| PATCH | `/api/partner/banners` | 단체 배너 수정 |
| DELETE | `/api/partner/banners` | 단체 배너 삭제 |

### 관리자 API (admin role 필요)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/admin/users` | 전체 회원 목록 (RPC) |
| PATCH | `/api/admin/users` | 회원 역할 변경 |
| GET | `/api/admin/categories` | 파트너 카테고리 목록 |
| POST | `/api/admin/categories` | 카테고리 추가 |
| PATCH | `/api/admin/categories` | 카테고리 수정 |
| DELETE | `/api/admin/categories` | 카테고리 삭제 (파트너 연쇄 삭제) |
| GET | `/api/admin/partners` | 전체 파트너 목록 |
| POST | `/api/admin/partners` | 파트너 등록 |
| PATCH | `/api/admin/partners` | 파트너 수정 |
| DELETE | `/api/admin/partners` | 파트너 삭제 |
| GET | `/api/admin/banners` | 전체 배너 목록 |
| POST | `/api/admin/banners` | 배너 등록 |
| PATCH | `/api/admin/banners` | 배너 수정 |
| DELETE | `/api/admin/banners` | 배너 삭제 |

---

## 컴포넌트

### 공통 컴포넌트 (`src/components/`)

| 컴포넌트 | 설명 |
|----------|------|
| `Header` | 네비게이션 헤더 + 서랍 메뉴 (배너, 파트너/관리자 링크 포함) |
| `AuthProvider` | 인증 상태 초기화, 사용자 설정 로드, 파트너/카테고리 정보 로드 |
| `BannerCarousel` | 배너 캐러셀 (자동 슬라이드, 수동 이동, 반응형) |
| `BannerEditor` | 배너 이미지 편집 (크롭/텍스트 오버레이/WebP 업로드) |
| `PresenceIndicator` | Supabase Realtime Presence로 동시 편집 중인 멤버 표시 |
| `StoreHydrator` | 서버 데이터를 클라이언트 Zustand 스토어에 주입 |
| `ThemeProvider` / `ThemeToggle` | 테마 관리 (light/dark/auto) |
| `Logo` / `LogoIcon` | 로고 컴포넌트 |
| `Button` | 공통 버튼 |

### 관리자 대시보드 (`src/app/admin/_components/`)

| 컴포넌트 | 설명 |
|----------|------|
| `AdminDashboardClient` | 메인 컴포넌트 (탭 라우팅) |
| `types` | 공유 인터페이스 (UserItem, CategoryItem, PartnerItem, BannerItem) |
| `UsersTab` | 회원 목록 + UserEditModal (역할 변경, 파트너 등록) |
| `CategoriesTab` | 카테고리 CRUD (slug, display_name, bio 입력) |
| `PartnersTab` | 파트너 목록 관리 (user_id + category_id) |
| `AdminBannersTab` | 배너 CRUD (카테고리 선택 + BannerEditor) |

### 파트너 대시보드 (`src/app/partner-dashboard/_components/`)

| 컴포넌트 | 설명 |
|----------|------|
| `PartnerDashboardClient` | 메인 컴포넌트 (탭 라우팅 + PresenceIndicator) |
| `ProfileTab` | 단체 프로필 편집 (display_name, bio) |
| `LinksTab` | 단체 링크 CRUD |
| `PartnerBannersTab` | 단체 배너 CRUD (BannerEditor 포함) |

### 상태 관리 (`src/store/`)

| 스토어 | 상태 |
|--------|------|
| `authStore` | `user`, `isLoading`, `lastStudiedMenu`, `role` |
| `partnerStore` | `isPartner`, `partner`, `category` |
| `themeStore` | `mode`, `resolvedTheme` |
| `quizStore` | 퀴즈 설정 및 진행 상태 |

---

## 인증 / 권한 흐름

### 로그인 흐름 (Google OAuth + PKCE)

```
1. 사용자가 /login 에서 "Google로 로그인" 클릭
   │
2. supabase.auth.signInWithOAuth({ provider: 'google' })
   │  redirectTo: /auth/callback?next=<redirectTo>
   │
3. Google 인증 → Supabase Auth → /auth/callback?code=...&next=...
   │
4. /auth/callback (서버 Route Handler)
   │  supabase.auth.exchangeCodeForSession(code)
   │  → 세션 쿠키 설정 후 next 경로로 redirect
   │
5. 리다이렉트된 페이지 로드
   │
6. AuthProvider (onAuthStateChange)
   │  SIGNED_IN 이벤트 수신 → setUser(user), setLoading(false)
   │
7. 별도 useEffect에서 DB 데이터 로드 (auth lock 해제 후)
   ├─ user_preferences → role, theme, last_studied_menu
   └─ partners + partner_categories → 파트너/단체 정보
```

### AuthProvider 구조 (중요)

`onAuthStateChange` 콜백 안에서 Supabase DB 쿼리를 직접 `await`하면
`navigator.locks` 기반 auth lock과 deadlock이 발생할 수 있음 (프로덕션 환경에서 확인됨).

따라서 다음과 같이 2단계로 분리:

1. **`onAuthStateChange` 콜백 (동기)** — user/loading 상태만 업데이트, DB 쿼리 안 함
2. **별도 `useEffect` (user 의존)** — user 변경 시 `loadUserPreferences` / `loadPartnerInfo` 실행

```
onAuthStateChange (동기 콜백)
  ├─ INITIAL_SESSION + StoreHydrator 이미 주입 → 스킵
  ├─ INITIAL_SESSION + 세션 없음 → setUser(null), setLoading(false)
  ├─ SIGNED_IN / TOKEN_REFRESHED → setUser(user), setLoading(false), pendingUserId 설정
  └─ SIGNED_OUT → clearPartner(), setRole('default')

useEffect([user]) — onAuthStateChange 완료 후 실행
  ├─ loadUserPreferences(userId) → role, theme 적용
  └─ loadPartnerInfo(userId) → 파트너/카테고리 정보 적용
```

### 로그아웃 흐름

```
Header에서 "로그아웃" 클릭
  → supabase.auth.signOut()
  → window.location.href = '/' (풀 리로드로 서버 쿠키 정리)
```

`router.push()`가 아닌 `window.location.href`를 사용해야
서버 미들웨어가 만료된 세션 쿠키를 정리할 수 있음.

### 서버 사이드 인증 (StoreHydrator)

보호 페이지(`/admin`, `/profile`, `/partner-dashboard`, `/word-sentence`)는
서버 컴포넌트에서 `getServerAuthData()`로 인증 데이터를 미리 로드하고
`StoreHydrator`로 클라이언트 Zustand 스토어에 주입:

```
서버 컴포넌트 (page.tsx)
  ├─ getServerAuthData() → user, role, partner, category
  ├─ role 체크 (admin/partner) → 실패 시 redirect
  └─ <StoreHydrator user={...} role={...} /> → 클라이언트 스토어 초기화
```

이 경우 AuthProvider의 `INITIAL_SESSION`에서 StoreHydrator가 이미 데이터를
주입했음을 감지하고 중복 fetch를 스킵.

### 역할 시스템

| 역할 | 접근 가능 |
|------|-----------|
| `default` | 일반 학습 기능 |
| `partner` | + 파트너 대시보드 (`/partner-dashboard`) |
| `admin` | + 관리자 대시보드 (`/admin`) |

### 보호 경로 (middleware)

비로그인 시 `/login?redirectTo=<현재경로>`로 리다이렉트:
- `/word-sentence`
- `/profile`
- `/partner-dashboard`
- `/admin`

역할 체크는 각 페이지의 서버 컴포넌트와 API 라우트에서 수행.

---

## 배너 시스템

1. 배너는 파트너 또는 관리자가 등록
2. `position` 필드로 홈/서랍/둘 다 표시 위치 지정
3. `BannerCarousel` 컴포넌트가 마운트 시 `/api/banners?position=` 호출
4. 여러 배너: 5초 자동 슬라이드 + 좌우 화살표 + 인디케이터
5. 단일 배너: 슬라이드 없이 표시
6. 클릭 시 `link_url`로 이동 (파트너 페이지 또는 외부 링크)
