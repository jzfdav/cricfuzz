# CricFuzz 🏏

A premium cricket match simulation engine built with Vanilla JS and Tailwind CSS. Experience realistic, ball-by-ball simulations across T20, ODI, and Test match formats.

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
│   ├── main.js          # Main application logic
│   └── style.css        # Tailwind directives + custom styles
├── public/
│   └── teams/           # Team JSON data files
├── index.html           # Entry HTML file
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json         # Dependencies and scripts
```

## Technologies

- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Vanilla JavaScript**: No heavy frameworks, pure JS
- **PostCSS**: CSS processing with Autoprefixer

## License

ISC

