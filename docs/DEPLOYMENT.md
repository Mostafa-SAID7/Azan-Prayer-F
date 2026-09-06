# 🚀 Deployment Guide

Deploy Payer to production.

## Deployment Options

| Platform | Effort | Cost | Recommendation |
|----------|--------|------|-----------------|
| **Vercel** | Easy | Free | ⭐ Recommended |
| **Netlify** | Easy | Free | Good alternative |
| **GitHub Pages** | Medium | Free | Static only |
| **AWS** | Hard | Paid | Enterprise |
| **Docker** | Medium | Varies | Self-hosted |

## Vercel (Recommended) ⭐

### Prerequisites

- GitHub account with repository pushed
- Vercel account (free at [vercel.com](https://vercel.com))
- Vercel CLI installed (optional, for local testing): `npm i -g vercel`

### Step-by-Step

#### 1. Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Authorize Vercel with your GitHub account
5. Select the `Azan-Prayer-F` repository
6. Vercel auto-detects Vite framework ✓

#### 2. Configure Environment Variables

In the Vercel dashboard, go to **Project Settings → Environment Variables** and add:

**Required Variables** (production):

| Variable | Value | Example |
|----------|-------|---------|
| `VITE_ALADHAN_API_URL` | Aladhan API endpoint | `https://api.aladhan.com/v1` |
| `VITE_DEFAULT_CITY` | Default city for prayers | `Cairo` |
| `VITE_DEFAULT_COUNTRY` | Default country | `Egypt` |
| `VITE_DEFAULT_METHOD` | Prayer calculation method | `5` |
| `VITE_DEBUG` | Debug mode | `false` |

**Optional Variables** (feature flags):

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_ENABLE_NOTIFICATIONS` | `true` | Enable/disable notifications |
| `VITE_ENABLE_PWA` | `true` | Enable/disable PWA features |
| `VITE_ENABLE_QURAN` | `true` | Enable/disable Quran reader |
| `VITE_ENABLE_SERVICE_WORKER` | `true` | Enable/disable service worker |

**Quick Setup**:
```
VITE_ALADHAN_API_URL=https://api.aladhan.com/v1
VITE_DEFAULT_CITY=Cairo
VITE_DEFAULT_COUNTRY=Egypt
VITE_DEFAULT_METHOD=5
VITE_DEBUG=false
```

**Note**: All variables are automatically available at build time (Vite prefixes them with `VITE_` for client-side exposure).

#### 3. Review Configuration

Vercel auto-detects from `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

Configuration includes:
- ✅ Build command (npm run build)
- ✅ Output directory (dist)
- ✅ Security headers (X-Frame-Options, CSP, etc.)
- ✅ Caching rules (31536000s for assets, 0s for service worker)
- ✅ SPA rewrite (/* → /index.html for client-side routing)

#### 4. Deploy

1. Click **"Deploy"** button in Vercel
2. Vercel will:
   - Clone repository
   - Install dependencies (`npm ci`)
   - Build app (`npm run build`)
   - Deploy to CDN (auto-generated URL)
   - Run post-deployment health checks

3. Your app is live at: `https://<project-name>.vercel.app`

#### 5. Custom Domain (Optional)

1. Project Settings → **Domains**
2. Click "Add Domain"
3. Enter your domain (e.g., `prayertimes.com`)
4. Follow DNS configuration instructions:
   - Point nameservers to Vercel, OR
   - Add CNAME record to `cname.vercel.app`
5. Vercel auto-configures SSL/TLS

### Automatic & Preview Deployments

**Production Deployments** (auto on `main` push):
```bash
git push origin main  # Automatically deploys to production
```

**Preview Deployments** (auto on every PR):
- Every pull request gets a unique preview URL: `https://payer-pr-123.vercel.app`
- Perfect for testing before merging
- Auto-deleted after PR is closed

**Manual Deployment** (using CLI):
```bash
# Login to Vercel
vercel login

# Deploy from project root
vercel --prod  # Production deployment
vercel         # Preview deployment
```

### Rollback to Previous Deployment

1. Go to project **Deployments** tab
2. Find previous stable deployment
3. Click "..." menu → **"Promote to Production"**
4. Done! Previous version is now live

### Monitor Deployment

**Real-time Logs**:
1. Go to **Deployments** tab
2. Click active deployment
3. View build logs and runtime errors

**Performance Analytics**:
1. **Analytics** tab shows:
   - Page load times
   - Core Web Vitals
   - Error rates
   - Geographic distribution

2. **Insights** tab provides:
   - Build performance
   - Function execution time
   - Cache hit rates

## GitHub Pages

### Prerequisites

- Repository on GitHub
- Public repository

### Step-by-Step

#### 1. Create Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### 2. Update vite.config.js

```javascript
export default {
  base: '/payer/',  // Match repository name
  // ... other config
}
```

#### 3. Enable Pages

1. Go to repository settings
2. Scroll to "GitHub Pages"
3. Select "gh-pages" branch
4. Save

App deploys to: `https://yourusername.github.io/payer/`

## Using GitHub Secrets with Vercel (Optional for Advanced Setup)

If you want to manage secrets through GitHub and sync to Vercel, or use GitHub Actions as part of your CI/CD pipeline:

### 1. Add GitHub Secrets

Repository Settings → **Secrets and Variables** → **Actions**

Add these secrets:

```
VITE_ALADHAN_API_URL=https://api.aladhan.com/v1
VITE_DEFAULT_CITY=Cairo
VITE_DEFAULT_COUNTRY=Egypt
VITE_DEFAULT_METHOD=5
VITE_DEBUG=false
```

### 2. Create GitHub Actions Workflow for Vercel

Create `.github/workflows/vercel-deployment.yml`:

```yaml
name: Vercel Deployment

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
        continue-on-error: true
      
      - name: Build
        env:
          VITE_ALADHAN_API_URL: ${{ secrets.VITE_ALADHAN_API_URL }}
          VITE_DEFAULT_CITY: ${{ secrets.VITE_DEFAULT_CITY }}
          VITE_DEFAULT_COUNTRY: ${{ secrets.VITE_DEFAULT_COUNTRY }}
          VITE_DEFAULT_METHOD: ${{ secrets.VITE_DEFAULT_METHOD }}
          VITE_DEBUG: ${{ secrets.VITE_DEBUG }}
        run: npm run build
      
      - name: Deploy to Vercel
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        run: |
          npm i -g vercel
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

### 3. Add Vercel Token to GitHub

1. Go to [Vercel Dashboard](https://vercel.com) → **Settings** → **Tokens**
2. Create new token
3. Go to GitHub repo → **Settings** → **Secrets** → **New repository secret**
4. Name: `VERCEL_TOKEN`
5. Value: Paste your Vercel token

**Note**: This is optional. Vercel natively integrates with GitHub and deploys automatically without this setup. Use this approach only if you need custom CI/CD workflows or additional testing before deployment.

## Netlify

### Prerequisites

- GitHub account connected to Netlify

### Step-by-Step

#### 1. Import Site

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site"
3. Select "Import an existing project"
4. Choose GitHub
5. Select `payer` repository

#### 2. Configure Build

```
Build command: npm run build
Publish directory: dist
```

#### 3. Environment Variables

Add in Netlify dashboard:

```
VITE_ALADHAN_API_URL=https://api.aladhan.com/v1
```

#### 4. Deploy

Click "Deploy". Netlify handles the rest!

## Docker Deployment

To build and run the application as a Docker container, we use a secure multi-stage build configuration.

For the complete definition, refer directly to the root **[Dockerfile](../Dockerfile)**.

### Build & Run Locally

```bash
# Build image
docker build -t payer:latest .

# Run container
docker run -p 3000:8080 payer:latest
```

### Deploy to Docker Hub

```bash
# Tag image
docker tag payer:latest yourusername/payer:latest

# Push to Docker Hub
docker push yourusername/payer:latest
```

## Production Optimization

### Build Optimization

```bash
# Create optimized build
npm run build

# Check bundle size
npm install -g serve
serve -s dist
```

Expected sizes:

- JavaScript: ~200KB (gzipped)
- CSS: ~50KB (gzipped)
- Total: ~250KB

### Environment Variables

Production `.env.production`:

```env
VITE_ALADHAN_API_URL=https://api.aladhan.com/v1
VITE_DEBUG=false
VITE_ENABLE_PWA=true
```

### Performance Checklist

- [ ] Build completes without warnings
- [ ] Bundle size < 500KB gzipped
- [ ] All images optimized
- [ ] Service worker working offline
- [ ] PWA installable
- [ ] Dark mode working
- [ ] All languages working
- [ ] No console errors

## Pre-Deployment Checklist

**Before deploying to Vercel**, verify everything works locally:

### Local Build & Preview

```bash
# Clean build
rm -rf dist node_modules
npm ci
npm run build
npm run preview
```

Visit `http://localhost:4173` and test:

- [ ] All prayer times display correctly
- [ ] Date/time selections work
- [ ] Dark mode toggle works
- [ ] Language switcher works (Arabic ↔ English)
- [ ] RTL layout correct for Arabic
- [ ] Responsive design on mobile (375px width)
- [ ] No console errors or warnings
- [ ] Network tab shows API calls to `api.aladhan.com`

### Production Readiness

**Code Quality**:
- [ ] Run `npm run lint` (no errors)
- [ ] All console errors cleared
- [ ] No unused imports or variables
- [ ] Git status clean (no uncommitted changes)

**Performance**:
- [ ] Bundle size < 500KB gzipped (`npm run build` output)
- [ ] Build completes in < 60 seconds
- [ ] Lighthouse score > 90 (optional: `npm run lighthouse`)

**PWA & Offline**:
- [ ] Service worker registered (DevTools → Application → Service Worker)
- [ ] App works offline (toggle network in DevTools)
- [ ] PWA installable (address bar has install button)

**Environment & Configuration**:
- [ ] `.env.example` updated with all required variables
- [ ] `vercel.json` configured (already done ✓)
- [ ] No secrets or API keys in code (only in env vars)
- [ ] All environment variables documented

**Before Clicking Deploy on Vercel**:
- [ ] Environment variables added to Vercel dashboard
- [ ] Repository pushed to GitHub (`git push origin main`)
- [ ] No pending pull requests that shouldn't be deployed
- [ ] Version number updated in `package.json` (optional)

## Monitoring

### Vercel Monitoring

- Dashboard shows real-time metrics
- Performance insights
- Error tracking
- Analytics

### Error Tracking

Optional: Add error tracking service

```bash
npm install @sentry/react
```

Initialize in `main.jsx`:

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## Troubleshooting Deployments

### Vercel-Specific Issues

#### Build Fails with "VITE_ALADHAN_API_URL is undefined"

**Solution**: Environment variable not set in Vercel dashboard.

1. Go to Vercel Dashboard → **Project Settings**
2. Click **Environment Variables**
3. Verify all `VITE_*` variables are present
4. Redeploy: **Deployments** → click previous deployment → **Redeploy**

#### Service Worker Not Updating

**Issue**: Users get stale service worker after deployment.

**Solution**: Vercel headers are configured correctly in `vercel.json`:
- Service worker (`/service-worker.js`) has `Cache-Control: max-age=0, must-revalidate`
- This forces browsers to check for updates on every page load ✓

**If issue persists**:
```bash
# Clear Vercel cache manually
vercel env pull  # Pull current environment
vercel --prod    # Redeploy with fresh cache
```

#### 404 on Routes (React Router)

**Issue**: Refresh page on non-root routes returns 404.

**Solution**: Already configured in `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This rewrites all routes to `index.html`, letting React Router handle them. No action needed.

#### Slow Performance or High Build Times

**Check**:
1. Bundle size: `npm run build` and check `dist/` folder
2. Dependencies: `npm ls` to find duplicates
3. Vercel logs: **Deployments** → click build → view logs

**Optimize**:
```bash
# Analyze bundle
npm install -g vite-plugin-visualizer
npm run build  # Creates visualization
```

Expected build time: **30-60 seconds**

#### Functions/API Routes Not Working

**Note**: This is a static SPA with no backend. All API calls go directly to `api.aladhan.com`. If you need Vercel Functions later:

```bash
# Create API route
mkdir api
echo 'export default (req, res) => res.json({ hello: "world" })' > api/hello.js
vercel --prod
```

### General Build Issues

#### Build Fails Locally But Works on Vercel

**Cause**: Node version mismatch or missing dependencies.

**Fix**:
```bash
# Match Vercel's Node version (20.x)
node --version
nvm use 20  # If using nvm

# Clean install
rm -rf node_modules package-lock.json
npm ci
npm run build
```

#### Wrong Environment Variables

```bash
# Verify in hosting dashboard:
# - VITE_ALADHAN_API_URL set correctly
# - All required vars present
# - No typos in names
```

#### 404 on Custom Domain

```bash
# Check DNS records point to hosting
# Wait 24 hours for propagation
# Verify domain in hosting dashboard
```

#### Slow Performance

- Check bundle size with `npm run build`
- Enable compression on server
- Add CDN caching headers
- Optimize images

### Pre-Deployment Checklist

## Rollback

### Vercel

1. Go to deployments
2. Click "Rollback" on previous deployment
3. Confirm

### GitHub Pages

```bash
# Revert commit
git revert <commit-hash>
git push origin main
```

## Health Checks

### Monthly

- [ ] Test all prayer times display correctly
- [ ] Check dark mode works
- [ ] Test on different devices
- [ ] Review error logs
- [ ] Check performance metrics

### Quarterly

- [ ] Update dependencies
- [ ] Security audit
- [ ] Performance review
- [ ] User feedback review

---

**Deployed successfully!** 🎉

[⬆ Back to Top](#-deployment-guide)
