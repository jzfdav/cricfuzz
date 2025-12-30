# CricFuzz 🏏

[![Deploy to GitHub Pages](https://github.com/jzfdav/cricfuzz/actions/workflows/deploy.yml/badge.svg)](https://github.com/jzfdav/cricfuzz/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![Preact](https://img.shields.io/badge/Preact-673AB7?style=for-the-badge&logo=preact&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Biome](https://img.shields.io/badge/Biome-60a5fa?style=for-the-badge&logo=biome&logoColor=white)

A premium cricket match simulation engine built with TypeScript, Preact, and Tailwind CSS. Experience realistic, ball-by-ball simulations across T20, ODI, and Test match formats.

## 🚀 Play Now

**Live Demo**: [https://jzfdav.github.io/cricfuzz/](https://jzfdav.github.io/cricfuzz/)

The latest version is automatically deployed to GitHub Pages.

## Features

- **Multiple Match Formats**: T20 (20 overs), ODI (50 overs), and Test (4 innings)
- **Realistic Simulation**: Probability-based engine with dynamic modifiers based on player attributes and match format.
- **Phased Gameplay**: Realistic "Powerplay", "Middle Overs", and "Death Overs" pacing.
- **Match Summary**: Dynamic "Man of the Match" announcer and impact summary.
- **Detailed Scorecards**: Visual worm graphs and detailed batting/bowling stats.
- **10 International Teams**: India, Australia, England and more.

## Disclaimer

**CricFuzz is a non-commercial, educational project.**

All player names, team names, and likenesses used in this simulation are for identification purposes only. This project is not affiliated with, endorsed by, or sponsored by the ICC, BCCI, Cricket Australia, or any other official cricket board or players' association.

All data is simulated and does not reflect real-world performance or events.

## Development

For instructions on setting up the project locally, building for production, or understanding the code architecture, please see the **[Development Guide](DEVELOPMENT.md)**.

## Deployment

This project uses **GitHub Actions** for deployment.
Any push to the `main` branch automatically builds and deploys the Preact app to GitHub Pages.

- **URL**: `https://jzfdav.github.io/cricfuzz/`
- **Workflow**: `.github/workflows/deploy.yml`

## License

MIT
