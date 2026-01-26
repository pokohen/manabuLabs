# MANABU LABS

일본어 학습 앱 - Next.js, Supabase, OpenAI 기반의 일본어 학습 애플리케이션

## Features

- あ **히라가나/가타카나** - 기초 문자 학습
- 漢 **한자 학습** - 한자 획순 및 읽기 학습
- 📖 **문법 학습** - 동사, 형용사, 조사 퀴즈
- 💬 **예문 학습** - AI 기반 예문 생성

## Logo & Brand

MANABU LABS의 로고는 성장과 학습을 상징하는 나뭇잎 모티브를 사용합니다.

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#667EEA` | 메인 그라데이션 시작 |
| Secondary | `#764BA2` | 메인 그라데이션 끝 |
| Light Primary | `#818CF8` | 다크모드 그라데이션 시작 |
| Light Secondary | `#A78BFA` | 다크모드 그라데이션 끝 |
| Dark BG | `#1A202C` | 다크모드 배경 |

### Icon Sizes

- **512px** - App Store, Play Store
- **192px** - PWA, Android
- **48px** - 고해상도 파비콘
- **32px** - 표준 파비콘
- **16px** - 최소 파비콘

로고 패키지 전체 보기: `/public/manabu-labs-final.html`

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/pokohen/manabuLabs.git
cd manabuLabs
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `OPENAI_API_KEY` - Your OpenAI API key

4. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [OpenAI](https://openai.com/) - AI-powered features
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Credits

Logo design by pokohen
