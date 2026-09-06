# Vercel Deployment Setup Guide

Complete step-by-step guide for deploying the Azan Prayer app to Vercel with proper configuration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Vercel Dashboard Setup](#vercel-dashboard-setup)
4. [Deploy Process](#deploy-process)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Monitoring & Maintenance](#monitoring--maintenance)

## Prerequisites

Before deploying to Vercel, ensure:

- ✅ Repository pushed to GitHub (public or private)
- ✅ Vercel account created (free at [vercel.com](https://vercel.com))
- ✅ GitHub account connected to Vercel
- ✅ Local build verified: `npm run build` completes successfully
- ✅ `.env.example` file exists in repository root

**Optional but Recommended:**
- Vercel CLI installed: `npm install -g vercel`
- Custom domain registered (for step 5)

## Environment Variables

### Required Variables (Must Set)

These variables are **required** for the app to function properly:

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_ALADHAN_API_URL` | `https://api.aladhan.com/v1` | Prayer times API endpoint (public) |
| `VITE_DEFAULT_CITY` | `Cairo` | Default city on first load (or your city) |
| `VITE_DEFAULT_COUNTRY` | `Egypt` | Default country on first load (or your country) |
| `VITE_DEFAULT_METHOD` | `5` | Prayer calculation method (Umm Al-Qura, Mecca) |
| `VITE_DEBUG` | `false` | Debug mode (keep false for production) |

**Quick Copy-Paste for Vercel Dashboard:**

```
VITE_ALADHAN_API_URL=https://api.aladhan.com/v1
VITE_DEFAULT_CITY=Cairo
VITE_DEFAULT_COUNTRY=Egypt
VITE_DEFAULT_METHOD=5
VITE_DEBUG=false
```

### Optional Variables (Feature Flags)

These variables control optional features (already set as defaults in `vercel.json`):

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_ENABLE_NOTIFICATIONS` | `true` | Enable browser notifications for prayer times |
| `VITE_ENABLE_PWA` | `true` | Enable Progressive Web App features |
| `VITE_ENABLE_QURAN` | `true` | Enable Quran reader tab |
| `VITE_ENABLE_SERVICE_WORKER` | `true` | Enable offline functionality |
| `VITE_PWA_CACHE_STRATEGY` | `network-first` | Caching strategy for API calls |
| `VITE_API_TIMEOUT` | `8000` | API timeout in milliseconds |
| `VITE_MAX_RETRIES` | `3` | Number of API retry attempts |
| `VITE_API_CACHE_TIME` | `3600` | API cache duration in seconds |

**Note:** Optional variables are pre-configured in `vercel.json`. Only override if you need different behavior.

### Understanding Vercel Variable References

In `vercel.json`, variables use the `@variable_name` syntax:

```json
{
  "env": {
    "VITE_ALADHAN_API_URL": "@vite_aladhan_api_url",
    "VITE_DEFAULT_CITY": "@vite_default_city"
  }
}
```

This means:
- `@vite_aladhan_api_url` references a Vercel secret named `VITE_ALADHAN_API_URL`
- Vercel automatically injects these at build time
- You set these values in the Vercel dashboard

## Vercel Dashboard Setup

### Step 1: Import Project

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Select **"Import Git Repository"**
4. Choose your GitHub account
5. Authorize Vercel if prompted
6. Search for and select `Azan-Prayer-F` repository
7. Click **"Import"**

### Step 2: Configure Project Settings

Vercel will auto-detect your project as Vite. Verify:

**Framework Preset**: Vite ✓
**Build Command**: `npm run build` ✓
**Output Directory**: `dist` ✓
**Root Directory**: `./` ✓

All these are auto-detected correctly!

### Step 3: Add Environment Variables

This is **CRITICAL** — your app won't work without these.

1. In the import screen, click **"Environment Variables"**
2. Or go to: **Project Settings** → **Environment Variables**

**Method A: Manual Entry (Recommended for First Deployment)**

Click **"Add New"** and enter each variable:

```
Name:  VITE_ALADHAN_API_URL
Value: https://api.aladhan.com/v1
Environment: Production

Name:  VITE_DEFAULT_CITY
Value: Cairo
Environment: Production

Name:  VITE_DEFAULT_COUNTRY
Value: Egypt
Environment: Production

Name:  VITE_DEFAULT_METHOD
Value: 5
Environment: Production

Name:  VITE_DEBUG
Value: false
Environment: Production
```

**Method B: Bulk Import (Faster)**

1. Prepare `.env.production` locally with all variables
2. Click **"Add New"** → **"Upload .env.production"**
3. Select your file
4. Vercel imports all variables

### Step 4: Set Environment per Context

For different behavior in preview vs production (optional):

**Production Deployments** (pushed to `main`):
- `VITE_DEBUG=false`
- `VITE_ENABLE_NOTIFICATIONS=true`

**Preview Deployments** (pull requests):
- `VITE_DEBUG=true` (optional, to debug issues)
- Same feature flags as production

To set per-context:
1. **Project Settings** → **Environment Variables**
2. Click variable → **"Edit"**
3. Choose which environments apply:
   - ✅ Production
   - ✅ Preview
   - ✅ Development (local only)

## Deploy Process

### Automatic Deployment

Once variables are configured, click **"Deploy"**:

1. Vercel clones your repository
2. Installs dependencies: `npm ci`
3. Builds your app: `npm run build`
4. Deploys to CDN: 30-60 seconds
5. Generates deployment URL: `https://<project-name>.vercel.app`

**Deployment is complete!** 🎉

### Subsequent Deployments

After your first deployment:

**Production Deployments** (automatic):
```bash
git push origin main
# Vercel automatically redeploys
```

**Preview Deployments** (automatic):
```bash
git push origin feature-branch
# Create a pull request
# Vercel creates preview at: https://project-pr-123.vercel.app
```

### Manual Redeployment (If Needed)

Using Vercel CLI:

```bash
# Login to Vercel
vercel login

# Deploy from project root
vercel --prod  # Production deployment
vercel         # Preview deployment
```

Or via dashboard:
1. Go to **Deployments** tab
2. Click previous deployment
3. Click **"..."** menu
4. Select **"Redeploy"**

## Post-Deployment Verification

### Immediate Checks (Right After Deploy)

1. **Visit Your App**
   - Click deployment URL or go to your domain
   - Should load within 2 seconds
   - No 404 or 503 errors

2. **Check Environment Variables Applied**
   - Open DevTools → Console
   - Should show no errors about missing variables
   - API calls should hit `https://api.aladhan.com/v1`

3. **Prayer Times Display**
   - Default city should show prayer times (Cairo or your configured city)
   - Times should be in Arabic by default
   - Dark/light mode toggle works

4. **Network Tab**
   - Check successful requests to Aladhan API
   - Service worker should be registered: `sw.js` in Network tab

### Functional Testing Checklist

- [ ] **Home Page**: Prayer times display for default city
- [ ] **City Search**: Can search and select cities
- [ ] **Language Switch**: Arabic ↔ English toggles correctly
- [ ] **Dark Mode**: Toggle works and persists
- [ ] **Monthly View**: Calendar view displays prayer times
- [ ] **Quran Reader**: Tab loads Quran with surah list
- [ ] **PWA Install**: Address bar shows install prompt (mobile/PWA view)
- [ ] **Offline Mode**: Disable network → app still shows cached content
- [ ] **No Console Errors**: DevTools → Console shows no red errors

### Performance Check

1. DevTools → Lighthouse
2. Run audit for Production
3. Should see:
   - Performance: > 85
   - Accessibility: > 90
   - Best Practices: > 90
   - SEO: > 90

If scores are low, check:
- Bundle size: `npm run build` locally
- API response times
- Image optimization

## Monitoring & Maintenance

### Real-Time Monitoring

**Vercel Dashboard Metrics:**

1. Go to **Analytics** tab
   - Page load times
   - Core Web Vitals (LCP, FID, CLS)
   - Error rates
   - Geographic distribution

2. Go to **Insights** tab
   - Build performance
   - Function execution time (if using)
   - Cache hit rates

### Error Tracking

**View Deployment Logs:**

1. **Deployments** tab
2. Click active deployment
3. Scroll through build logs
4. Look for errors or warnings

**Common Issues:**

| Issue | Cause | Fix |
|-------|-------|-----|
| Build fails | Missing env vars | Check VITE_ALADHAN_API_URL set |
| 404 on routes | Client routing issue | vercel.json rewrite configured ✓ |
| Slow performance | Large bundle | Check bundle size locally |
| Service worker stale | Cache not cleared | Redeploy or wait 24h |

### Scheduled Maintenance

**Weekly**: 
- Check Vercel analytics for errors
- Monitor error logs if any

**Monthly**:
- Test all features (prayer times, language, dark mode)
- Review performance metrics
- Check dependency security

**Quarterly**:
- Update dependencies: `npm update`
- Security audit: `npm audit`
- Rebuild and redeploy if updates applied

### Rollback to Previous Version

If something breaks after deployment:

1. Go to **Deployments** tab
2. Find the last stable deployment
3. Click **"..."** menu
4. Select **"Promote to Production"**

Done! Previous version is now live.

## Custom Domain (Optional)

### Adding Your Domain

1. **Project Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `prayertimes.com`)
4. Choose DNS setup:

**Option A: Nameservers** (easiest)
- Update domain registrar nameservers to Vercel's
- Wait 24-48 hours for DNS propagation

**Option B: CNAME** (faster)
- Add CNAME record to `cname.vercel.app`
- Propagation usually within 1 hour

5. Vercel auto-configures SSL/TLS (free HTTPS)

### Verifying Domain

```bash
# After adding domain, test it
curl https://yourdomain.com

# Check certificate
openssl s_client -connect yourdomain.com:443
```

## Troubleshooting

### Build Fails During Deployment

**Error**: `VITE_ALADHAN_API_URL is undefined`

**Fix**:
1. Go to **Project Settings** → **Environment Variables**
2. Verify `VITE_ALADHAN_API_URL` is set
3. Click **Deployments** → previous deployment → **Redeploy**

---

### App Shows Blank or 404

**Error**: Blank page or "Page not found"

**Fix**:
1. Check `vercel.json` is in repository root (should be)
2. Verify rewrite rule: `"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]`
3. Redeploy

---

### Wrong Prayer Times

**Error**: Showing times for wrong city

**Fix**:
1. Check `VITE_DEFAULT_CITY` environment variable
2. User's browser location detection might override (if enabled)
3. User can manually select city in app

---

### Service Worker Not Updating

**Error**: Stale service worker after new deployment

**Fix**: Already configured correctly in `vercel.json`
- Service worker headers: `Cache-Control: max-age=0, must-revalidate`
- Users will get fresh version on next page load
- Force update: Hard refresh (Ctrl+Shift+R)

---

### High Build Times or Performance Issues

**Debug**:
```bash
# Analyze bundle locally
npm run build
# Check dist/ folder sizes
ls -lh dist/
```

**Optimize**:
- Check for duplicate dependencies: `npm ls`
- Update dependencies: `npm update`
- Review bundle: `npm install -g vite-plugin-visualizer`

## Support & Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vite Docs**: [vitejs.dev](https://vitejs.dev)
- **React Docs**: [react.dev](https://react.dev)
- **Aladhan API**: [aladhan.com/api](https://aladhan.com/api)

---

**Ready to deploy?** Start with [Step 1: Import Project](#step-1-import-project) above!

Questions? Check the main [DEPLOYMENT.md](./DEPLOYMENT.md) guide.
