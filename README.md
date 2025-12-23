# CricFuzz 🏏

A premium cricket match simulation engine built with TypeScript, Preact, and Tailwind CSS. Experience realistic, ball-by-ball simulations across T20, ODI, and Test match formats.

## Features

- **Multiple Match Formats**: T20 (20 overs), ODI (50 overs), and Test (4 innings)
- **Realistic Simulation**: Probability-based engine with dynamic modifiers based on player attributes and match format
- **Live Commentary**: Ball-by-ball commentary feed with real-time score updates
- **Detailed Scorecards**: Cricbuzz-style post-match scorecards with batting and bowling statistics
- **10 International Teams**: India, Australia, England, Afghanistan, Bangladesh, Ireland, New Zealand, Sri Lanka, West Indies, and Zimbabwe

## Development

### Prerequisites

- Node.js 20.19+ or 22.12+ (Vite requirement)
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
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
│   ├── engine/          # Game Logic (Simulation, MatchController, Stats)
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

## Technologies

- **Vite**: Fast build tool
- **TypeScript**: Strictly typed development
- **Preact**: Lightweight React alternative
- **Signals**: High-performance reactive state management
- **Tailwind CSS**: Utility-first CSS

## New Features (Post-Migration)

- **X-Factor Mechanic**: Lucky players get a random 10-30% skill boost each match.
- **Randomize Teams**: One-click instant matchup generation.
- **Test Match Support**: Full 4-innings simulation support.
- **Detailed Scorecards**: Expanded views for all players.
- **Phased Gameplay**: Realistic Powerplay, Middle, and Death over phases for T20 and ODI.
- **Match Summary**: Dynamic "Man of the Match" announcer and impact summary.

## License

ISC

## Deployment

This project uses **GitHub Actions** for deployment.
Any push to the `main` branch automatically builds and deploys the Preact app to GitHub Pages.

- **URL**: `https://jzfdav.github.io/cricfuzz/`
- **Workflow**: `.github/workflows/deploy.yml`

> **Note**: Changes may take a few minutes to appear while the Action is running. Check the **Actions** tab on GitHub for status.

