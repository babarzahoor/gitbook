# Docsify - Documentation Platform

A modern documentation platform built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- User authentication with Supabase Auth
- Create and manage documentation spaces
- Markdown editor with live preview
- Organize pages in a hierarchical structure
- Public documentation viewer
- Dark mode support
- Responsive design
- Real-time updates

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase account

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up your Supabase project:
   - Create a new project at [supabase.com](https://supabase.com)
   - The database schema has already been created with migrations
   - Copy your project URL and anon key

4. Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Creating Documentation

1. Sign up for an account
2. Create a new documentation space
3. Add pages with markdown content
4. Publish pages to make them visible on the public site
5. Share the public URL with your users

### Viewing Documentation

Published documentation can be accessed at:
```
/docs/[space-slug]/[page-slug]
```

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Markdown**: react-markdown with syntax highlighting
- **Deployment**: Vercel (recommended)

## Project Structure

```
docsify/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   └── lib/             # Utilities and configurations
├── public/              # Static assets
└── package.json
```

## Database Schema

The application uses two main tables:

- `spaces`: Documentation workspaces
- `pages`: Individual documentation pages

Row Level Security (RLS) is enabled to ensure users can only access their own data or published public content.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License
