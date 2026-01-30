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
| `/partner/[slug]` | 공개 파트너 페이지 (링크트리 스타일) | 불필요 |
| `/partner-dashboard` | 파트너 대시보드 (프로필/링크/배너 관리) | **필요** (partner role) |

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
| GET | `/api/partner/profile` | 본인 파트너 프로필 조회 |
| PATCH | `/api/partner/profile` | 프로필 수정 (display_name, bio) |
| GET | `/api/partner/links` | 본인 링크 목록 |
| POST | `/api/partner/links` | 링크 추가 |
| PATCH | `/api/partner/links` | 링크 수정 |
| DELETE | `/api/partner/links` | 링크 삭제 |
| GET | `/api/partner/banners` | 본인 배너 목록 |
| POST | `/api/partner/banners` | 배너 추가 |
| PATCH | `/api/partner/banners` | 배너 수정 |
| DELETE | `/api/partner/banners` | 배너 삭제 |

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
| `AuthProvider` | 인증 상태 초기화, 사용자 설정 로드, 파트너 정보 로드 |
| `BannerCarousel` | 배너 캐러셀 (자동 슬라이드, 수동 이동, 반응형) |
| `ThemeProvider` / `ThemeToggle` | 테마 관리 (light/dark/auto) |
| `Logo` / `LogoIcon` | 로고 컴포넌트 |
| `Button` | 공통 버튼 |

### 상태 관리 (`src/store/`)

| 스토어 | 상태 |
|--------|------|
| `authStore` | `user`, `isLoading`, `lastStudiedMenu`, `role` |
| `partnerStore` | `isPartner`, `partner` |
| `themeStore` | `mode`, `resolvedTheme` |
| `quizStore` | 퀴즈 설정 및 진행 상태 |

---

## 인증 / 권한 흐름

```
사용자 로그인 (Google OAuth)
  │
  ├─ AuthProvider: user_preferences에서 theme, role 로드
  ├─ AuthProvider: partners 테이블에서 파트너 정보 로드
  │
  ├─ role = 'default'  → 일반 사용자
  ├─ role = 'partner'  → 파트너 대시보드 접근 가능
  └─ role = 'admin'    → 관리자 대시보드 접근 가능
```

### 보호 경로 (middleware)

비로그인 시 `/login`으로 리다이렉트:
- `/word-sentence`
- `/profile`
- `/partner-dashboard`
- `/admin`

역할 체크는 각 페이지 컴포넌트와 API 라우트에서 수행합니다.

---

## 배너 시스템

1. 배너는 파트너 또는 관리자가 등록
2. `position` 필드로 홈/서랍/둘 다 표시 위치 지정
3. `BannerCarousel` 컴포넌트가 마운트 시 `/api/banners?position=` 호출
4. 여러 배너: 5초 자동 슬라이드 + 좌우 화살표 + 인디케이터
5. 단일 배너: 슬라이드 없이 표시
6. 클릭 시 `link_url`로 이동 (파트너 페이지 또는 외부 링크)
