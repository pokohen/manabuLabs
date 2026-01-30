# MANABU LABS - 데이터베이스 구조

Supabase (PostgreSQL) 기반. 모든 테이블에 Row Level Security(RLS) 적용.

---

## 테이블 목록

| 테이블 | 설명 |
|--------|------|
| `user_preferences` | 사용자 설정 (테마, 최근 학습, 역할) |
| `partner_categories` | 파트너 카테고리 |
| `partners` | 파트너 프로필 |
| `partner_links` | 파트너 링크 목록 |
| `banners` | 광고 배너 |

---

## ERD

```
auth.users (Supabase 내장)
  │
  ├── 1:1 ── user_preferences
  │             └─ role: default | admin | partner
  │
  └── 1:1 ── partners
                ├── N:1 ── partner_categories
                ├── 1:N ── partner_links
                └── 1:N ── banners
```

---

## 테이블 상세

### `user_preferences`

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `user_id` | UUID (PK, FK → auth.users) | 사용자 ID |
| `theme` | TEXT | 테마 설정 (light/dark/auto) |
| `last_studied_menu` | TEXT | 최근 학습 메뉴 경로 |
| `role` | TEXT | 역할 (default/admin/partner) |
| `deleted_at` | TIMESTAMPTZ | 소프트 삭제 일시 |
| `updated_at` | TIMESTAMPTZ | 수정 일시 |

### `partner_categories`

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | UUID (PK) | 카테고리 ID |
| `name` | TEXT (UNIQUE) | 카테고리 이름 |
| `description` | TEXT | 설명 |
| `sort_order` | INT | 정렬 순서 |
| `created_at` | TIMESTAMPTZ | 생성 일시 |

### `partners`

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | UUID (PK) | 파트너 ID |
| `user_id` | UUID (UNIQUE, FK → auth.users) | 사용자 ID |
| `slug` | TEXT (UNIQUE) | URL 슬러그 (/partner/[slug]) |
| `display_name` | TEXT | 표시 이름 |
| `bio` | TEXT | 소개글 |
| `avatar_url` | TEXT | 프로필 이미지 URL |
| `category_id` | UUID (FK → partner_categories) | 카테고리 |
| `is_active` | BOOLEAN | 활성 여부 |
| `created_at` | TIMESTAMPTZ | 생성 일시 |
| `updated_at` | TIMESTAMPTZ | 수정 일시 |

### `partner_links`

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | UUID (PK) | 링크 ID |
| `partner_id` | UUID (FK → partners) | 파트너 ID |
| `title` | TEXT | 링크 제목 |
| `url` | TEXT | 링크 URL |
| `sort_order` | INT | 정렬 순서 |
| `is_active` | BOOLEAN | 활성 여부 |
| `created_at` | TIMESTAMPTZ | 생성 일시 |

### `banners`

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | UUID (PK) | 배너 ID |
| `partner_id` | UUID (FK → partners) | 파트너 ID |
| `title` | TEXT | 배너 제목 |
| `image_url` | TEXT | 배너 이미지 URL |
| `link_url` | TEXT | 클릭 시 이동 URL |
| `position` | TEXT | 표시 위치 (home/drawer/both) |
| `is_active` | BOOLEAN | 활성 여부 |
| `sort_order` | INT | 정렬 순서 |
| `created_at` | TIMESTAMPTZ | 생성 일시 |

---

## CASCADE 삭제 관계

```
partner_categories 삭제
  └─ partners 삭제 (category_id ON DELETE CASCADE)
       ├─ partner_links 삭제 (partner_id ON DELETE CASCADE)
       ├─ banners 삭제 (partner_id ON DELETE CASCADE)
       └─ 트리거: user_preferences.role → 'default'

partners 삭제 (직접 삭제 시에도 동일)
  ├─ partner_links 삭제
  ├─ banners 삭제
  └─ 트리거: user_preferences.role → 'default'

auth.users 삭제
  └─ partners 삭제 (user_id ON DELETE CASCADE)
       └─ (위와 동일한 연쇄)
```

---

## RLS 정책 요약

### `user_preferences`

기존 프로젝트 정책 유지.

### `partner_categories`

| 정책 | 대상 | 조건 |
|------|------|------|
| SELECT | 모든 사용자 | 항상 허용 |
| ALL | 관리자 | `role = 'admin'` |

### `partners`

| 정책 | 대상 | 조건 |
|------|------|------|
| SELECT | 모든 사용자 | `is_active = true` |
| ALL | 관리자 | `role = 'admin'` |
| UPDATE | 파트너 본인 | `auth.uid() = user_id` |

### `partner_links`

| 정책 | 대상 | 조건 |
|------|------|------|
| SELECT | 모든 사용자 | `is_active = true` |
| ALL | 관리자 | `role = 'admin'` |
| ALL | 파트너 본인 | `partner_id` 가 본인 파트너 |

### `banners`

| 정책 | 대상 | 조건 |
|------|------|------|
| SELECT | 모든 사용자 | `is_active = true` |
| ALL | 관리자 | `role = 'admin'` |
| ALL | 파트너 본인 | `partner_id` 가 본인 파트너 |

---

## 함수 & 트리거

### `admin_list_users()` (RPC)

관리자 전용. `auth.users`와 `user_preferences`를 조인하여 회원 목록 반환.
`SECURITY DEFINER`로 `auth.users` 접근.

반환 컬럼: `user_id`, `email`, `display_name`, `avatar_url`, `role`, `created_at`

### `reset_user_role_on_partner_delete()` (트리거)

`partners` 테이블 `BEFORE DELETE` 시 실행.
해당 `user_id`의 `user_preferences.role`을 `'default'`로 변경.

---

## 초기 설정 SQL

전체 SQL은 프로젝트 설정 시 Supabase SQL Editor에서 순서대로 실행:

1. `partner_categories` 테이블 생성 + RLS
2. `partners` 테이블 생성 + RLS
3. `partner_links` 테이블 생성 + RLS
4. `banners` 테이블 생성 + RLS
5. `user_preferences`에 `role` 컬럼 추가
6. `admin_list_users()` 함수 생성
7. `reset_user_role_on_partner_delete()` 트리거 생성
8. 본인 계정에 `role = 'admin'` 부여
