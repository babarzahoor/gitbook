# Fusiobook - Advanced Documentation Platform

A modern, feature-rich documentation platform built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

### Team Collaboration
- Create teams and invite members with role-based access control (Owner, Admin, Editor, Viewer)
- Manage multiple workspaces per team
- Real-time collaboration with comments and mentions

### Advanced Documentation
- Organize content in collections and nested documents
- Rich Markdown editor with syntax highlighting
- Document versioning and change history
- Templates for consistent documentation
- Icon support for visual organization

### Search & Discovery
- Full-text search across all documentation
- Quick navigation with keyboard shortcuts
- SEO-optimized public documentation

### Analytics & Insights
- Track page views and user engagement
- Understand how your documentation is being used
- Anonymous visitor tracking

### Customization
- Custom themes per workspace
- Custom domain support
- Public or private workspaces
- Flexible permissions system

## Database Schema

The platform uses a comprehensive schema with the following tables:
- `teams` - Team organizations
- `team_members` - Team membership with roles
- `workspaces` - Documentation spaces
- `collections` - Document groupings
- `documents` - Documentation pages with nesting support
- `document_versions` - Version history
- `comments` - Collaborative feedback
- `templates` - Content templates
- `page_views` - Analytics data

## Getting Started

### Prerequisites
- Node.js 20+
- A Supabase account

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - The database schema has been created with migrations
   - Copy your project URL and anon key

3. Create `.env` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Usage

### Creating Documentation

1. Sign up and create a team
2. Create a workspace for your documentation
3. Add collections to organize your content
4. Create documents with Markdown
5. Publish to make content public
6. Share with your team or the world

### Team Management

- **Owners** - Full control over team and workspaces
- **Admins** - Manage workspaces and members
- **Editors** - Create and edit documentation
- **Viewers** - Read-only access

### Public Documentation

Published documentation can be accessed at:
```
/docs/[workspace-slug]/[document-slug]
```

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Markdown**: react-markdown with extensions
- **Icons**: Lucide React

## Project Structure

```
fusiobook/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   └── lib/             # Utilities and configurations
├── public/              # Static assets
└── package.json
```

## Key Features Implementation

### Version Control
Every document save creates a new version with change tracking. Revert to any previous version easily.

### Nested Documents
Documents can have parent-child relationships for hierarchical organization.

### Real-time Comments
Team members can comment on documents with resolution tracking.

### Templates
Create reusable content templates for consistency across documentation.

### Analytics
Track how your documentation is being used with page view analytics.

### Security
- Row Level Security (RLS) enabled on all tables
- Role-based access control
- Secure authentication with Supabase Auth
- Private workspaces with team-only access

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License
