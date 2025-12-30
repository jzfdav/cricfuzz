# CricFuzz Development Guide 🛠️

This document covers the setup, build process, and architecture for developers contributing to CricFuzz.

## Technologies

- **Vite**: Fast build tool
- **TypeScript**: Strictly typed development
- **Preact**: Lightweight React alternative
- **Signals**: High-performance reactive state management
- **Tailwind CSS**: Utility-first CSS
- **Biome**: Fast formatter and linter
- **Lucide Icons**: Consistent, beautiful icons
- **Framer Motion**: Smooth UI animations

## Prerequisites

- Node.js 20.19+ or 22.12+ (Vite requirement)
- npm or yarn

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint and Format with Biome
npx @biomejs/biome check --write src/
```

## Production Build

The production build is optimized with:
- **Minification**: JavaScript and CSS are minified using Terser
- **Tree Shaking**: Unused code is eliminated
- **Asset Optimization**: Tailwind CSS is purged to include only used classes
- **Code Splitting**: Optimized bundle sizes

Build output is in the `dist/` directory, ready for deployment to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

## Project Structure

```
cricfuzz/
├── src/
│   ├── engine/          # Game Logic (Simulation, MatchController, Stats, Commentary)
│   ├── utils/           # Shared Math Utilities
│   ├── components/      # Preact Components (UI)
│   ├── App.tsx          # Main App Component
│   ├── main.tsx         # Entry Point
│   ├── types/           # Support Interfaces
│   └── style.css        # Tailwind directives
├── public/
│   └── teams/           # Team JSON data
├── index.html           # Entry HTML
├── tsconfig.json        # TypeScript Config
├── vite.config.js       # Vite + Preact
└── package.json         # Dependencies
```
