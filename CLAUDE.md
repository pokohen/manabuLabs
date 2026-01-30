# CLAUDE.md

이 파일은 Claude Code가 프로젝트를 이해하는 데 사용하는 컨텍스트 문서입니다.

## 프로젝트 개요

MANABU LABS - 일본어 학습 웹 애플리케이션

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19, Tailwind CSS v4
- **Backend**: Supabase (Database, Auth)
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

## 디렉토리 구조

```
src/
├── app/
│   ├── api/                    # API 라우트
│   │   ├── example-sentence/   # AI 예문 생성
│   │   ├── particle-mask/      # 조사 마스킹
│   │   ├── tokenize/           # 토큰화
│   │   └── tts/                # 음성 합성
│   ├── base-study/             # 히라가나/가타카나 학습
│   ├── kanji-study/            # 한자 학습
│   ├── grammar-study/          # 문법 학습
│   ├── word-sentence/          # 단어/문장 학습
│   ├── quiz/                   # 퀴즈
│   ├── quiz-setup/             # 퀴즈 설정
│   ├── quiz-result/            # 퀴즈 결과
│   ├── layout.tsx              # 루트 레이아웃
│   └── page.tsx                # 홈페이지
├── scripts/                    # 유틸리티 스크립트
└── public/                     # 정적 파일
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

## 코드 컨벤션

- TypeScript 사용
- 컴포넌트는 함수형 컴포넌트 사용
- 상태 관리는 Zustand 사용
- 스타일링은 Tailwind CSS 유틸리티 클래스 사용
