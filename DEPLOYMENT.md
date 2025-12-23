# GitHub Pages Deployment Guide

This guide explains how to deploy CricFuzz to GitHub Pages.

## Prerequisites

- GitHub repository: `jzfdav/cricfuzz`
- GitHub Pages enabled in repository settings

## Deployment Methods

### Method 1: GitHub Actions (Active) ✅

**Current Configuration**: The project is using GitHub Actions via `.github/workflows/deploy.yml`.
**Trigger**: Pushing code to the `main` branch.

> **Note**: If you don't see changes immediately, check the **Actions** tab in your repository to ensure the `Deploy to GitHub Pages` workflow has finished successfully. Manual `npm run deploy` pushes to `gh-pages` branch, but if your repo is set to "Source: GitHub Actions", it ignores that branch.

#### Steps:

1. **Enable GitHub Pages in repository settings**:
   - Go to `Settings` → `Pages`
   - Under "Source", select `GitHub Actions`
   - Save

2. **Push to main branch**:
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```

3. **Automatic deployment**:
   - The workflow will trigger automatically on push to `main`
   - Check `Actions` tab to see deployment progress
   - Once complete, your app will be live at:
     - `https://jzfdav.github.io/cricfuzz/`

### Method 2: Manual Deployment (Alternative)

If you prefer manual control:

1. **Install gh-pages**:
   ```bash
   npm install -D gh-pages
   ```

2. **Deploy**:
   ```bash
   npm run deploy
   ```

   This will:
   - Build the app
   - Push `dist/` to `gh-pages` branch
   - GitHub Pages will serve from that branch

3. **Configure GitHub Pages**:
   - Go to `Settings` → `Pages`
   - Select `gh-pages` branch as source
   - Save

## Base Path Configuration

The app is configured for GitHub Pages with base path `/cricfuzz/`.

### If your repo name is different:

Edit `vite.config.js`:
```javascript
const base = process.env.NODE_ENV === 'production' ? '/your-repo-name/' : '/'
```

### If using custom domain or root GitHub Pages:

Edit `vite.config.js`:
```javascript
const base = '/'
```

Then update GitHub Pages settings to use custom domain or root path.

## Verification

After deployment:

1. Visit `https://jzfdav.github.io/cricfuzz/`
2. Verify:
   - ✅ App loads correctly
   - ✅ Team JSON files load (check Network tab)
   - ✅ All assets load (CSS, JS)
   - ✅ Match simulation works

## Troubleshooting

### 404 Errors on Routes

- Ensure `base` path in `vite.config.js` matches your GitHub Pages URL structure
- Check that all asset paths are relative (they should be with Vite)

### Team JSON Files Not Loading

- Verify `public/teams/` directory is included in build
- Check browser console for 404 errors
- Ensure paths use `/teams/` (not `teams/`)

### Build Fails

- Check Node.js version (requires 20.19+ or 22.12+)
- Verify all dependencies are in `package.json`
- Check GitHub Actions logs for errors

## Updating Deployment

Every push to `main` branch will automatically:
1. Build the app
2. Deploy to GitHub Pages
3. Make changes live within 1-2 minutes

No manual steps required! 🚀

