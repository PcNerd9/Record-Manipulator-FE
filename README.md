# Dataset Manipulator Platform - Frontend

A schema-driven, API-first dataset manipulation platform built with React, TypeScript, Vite, and Tailwind CSS.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Styling

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

Build for production:

```bash
npm run build
```

### Preview Production Build

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── api/                    # Domain API modules
├── lib/                    # Core utilities (API client, env, constants)
├── state/                  # State management
├── engines/                # Core logic engines (autosave, dirty, pagination, etc.)
├── components/             # UI components
│   ├── layout/
│   ├── auth/
│   ├── dataset/
│   ├── table/
│   ├── search/
│   └── common/
├── pages/                  # Page-level composition
├── routes/                 # Routing configuration
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
└── utils/                  # Helper utilities
```

## Architecture

This project follows a layered architecture:

1. **Transport Layer** - API client with cookie-aware requests
2. **Domain API Layer** - Separated by domain (auth, dataset, record)
3. **State Layer** - Centralized state management
4. **UI Layer** - Pure rendering components

See `context.md` and `docs/frontend_bootstrap_pack.md` for detailed architecture documentation.
