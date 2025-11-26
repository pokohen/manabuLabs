# MyJapaneseStudy

日本語の単語帳 - Japanese vocabulary study app built with Next.js, Supabase, and OpenAI.

## Features

- 🇯🇵 Translate text to Japanese using OpenAI
- 📚 Store and manage vocabulary with Supabase
- ⚡ Built with Next.js for fast performance

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/pokohen/MyJapaneseStudy.git
cd MyJapaneseStudy
```

2. Install dependencies:

```bash
npm install
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
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [OpenAI](https://openai.com/) - AI translation
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
