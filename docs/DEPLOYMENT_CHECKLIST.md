# 🚀 Deployment Checklist

Complete checklist for deploying Azan Prayer app to Vercel. Use this before every production deployment.

## Pre-Deployment Phase (24 hours before)

### Code & Dependencies

- [ ] All code committed and pushed to feature branch
- [ ] Pull request created and reviewed
- [ ] ESLint check passed: `npm run lint` (or linting warnings acknowledged)
- [ ] No console errors in development: `npm run dev`
- [ ] No security vulnerabilities: `npm audit` (or known/non-critical)
- [ ] Dependencies up-to-date: `npm update` (optional but recommended)
- [ ] `package-lock.json` not modified manually

### Testing & Verification

- [ ] Clean local build succeeds:
  ```bash
  rm -rf node_modules dist
  npm ci
  npm run build
  ```
- [ ] Build completes in < 60 seconds ✓
- [ ] Bundle size check:
  ```bash
  # Should see JavaScript assets total < 500KB gzipped
  npm run build  # Check console output
  ```
- [ ] Preview works locally:
  ```bash
  npm run preview
  # Visit http://localhost:4173
  ```

### Local Testing in Preview

Visit `http://localhost:4173` and verify:

**Core Functionality:**
- [ ] Page loads without 404 errors
- [ ] No red errors in DevTools → Console
- [ ] Prayer times display for default city (Cairo/your configured city)
- [ ] Times are correctly formatted (HH:MM)

**User Interactions:**
- [ ] Can search and select different cities
- [ ] City selection updates prayer times
- [ ] Language toggle works (Arabic ↔ English)
- [ ] Text direction changes (RTL for Arabic, LTR for English)
- [ ] Dark mode toggle works and persists
- [ ] All tabs functional (Prayer, Monthly, Quran if enabled)

**Navigation & UI:**
- [ ] Date/time picker works (if present)
- [ ] Monthly view calendar displays
- [ ] Quran tab loads surahs
- [ ] Responsive design on mobile (DevTools → Toggle device toolbar)
- [ ] No UI elements cut off or overlapping

**Performance & Network:**
- [ ] DevTools → Network: All requests successful (no 404/500)
- [ ] API calls to `https://api.aladhan.com/v1` succeed
- [ ] No failed/slow requests (green status codes)
- [ ] Page load completes in < 3 seconds

**PWA & Offline:**
- [ ] DevTools → Application → Service Worker: Registered ✓
- [ ] DevTools → Application → Cache: Content cached
- [ ] Toggle offline mode → App still functional (shows cached data)
- [ ] Toggle back online → App fetches fresh data
- [ ] Install prompt appears (mobile/PWA view)

### Environment Configuration

- [ ] `.env.example` exists and is up-to-date with all variables
- [ ] No secrets or API keys in code
- [ ] `.env.example` contains:
  ```
  VITE_ALADHAN_API_URL=https://api.aladhan.com/v1
  VITE_DEFAULT_CITY=Cairo
  VITE_DEFAULT_COUNTRY=Egypt
  VITE_DEFAULT_METHOD=5
  VITE_DEBUG=false
  VITE_ENABLE_NOTIFICATIONS=true
  VITE_ENABLE_PWA=true
  VITE_ENABLE_QURAN=true
  VITE_ENABLE_SERVICE_WORKER=true
  ```
- [ ] All required variables documented in `.env.example`

### GitHub & Repository

- [ ] Repository is clean: `git status` shows no uncommitted changes
- [ ] All code pushed to feature branch: `git push origin feature-branch`
- [ ] Pull request opened with description of changes
- [ ] PR title is concise (< 70 characters)
- [ ] PR passes all GitHub Actions checks (CI workflow green ✓)
- [ ] No merge conflicts
- [ ] Ready to merge to `main`

### Documentation

- [ ] CHANGELOG.md updated with new features/fixes
- [ ] README.md reflects current state (if changes affect it)
- [ ] DEPLOYMENT.md is accurate (or updated with new info)
- [ ] Comments added to complex code
- [ ] No TODO comments left unaddressed (unless intentional)

---

## Pre-Merge Phase (Before merging PR to main)

- [ ] Approvals received (if required by team)
- [ ] All review comments addressed
- [ ] Squash or rebase commits (if team standard)
- [ ] Final sanity check: Build succeeds locally
- [ ] Merge to `main` with message: `chore: merge release v0.X.X` or `fix: description`

---

## Post-Merge Phase (After pushing to main)

### Verify Vercel Deployment

- [ ] Navigate to Vercel Dashboard
- [ ] **Deployments** tab shows new deployment (should appear within 10 seconds)
- [ ] Status shows "Building" then "Ready" (or "Canceled"/"Error")
- [ ] Build logs show no errors:
  - `npm ci` succeeded
  - `npm run build` completed successfully
  - No timeout errors

**If build fails:**
1. Click deployment to view logs
2. Look for error messages (usually missing env vars or build errors)
3. Check **Project Settings** → **Environment Variables** for missing entries
4. Fix and redeploy or debug locally

### Verify Environment Variables

- [ ] **Project Settings** → **Environment Variables** has all required vars:
  - ✅ `VITE_ALADHAN_API_URL=https://api.aladhan.com/v1`
  - ✅ `VITE_DEFAULT_CITY=Cairo` (or your configured city)
  - ✅ `VITE_DEFAULT_COUNTRY=Egypt` (or your configured country)
  - ✅ `VITE_DEFAULT_METHOD=5`
  - ✅ `VITE_DEBUG=false`

### Test Deployed Application

**Immediate Post-Deploy** (within 1 minute):

1. Visit your Vercel deployment URL (shown in dashboard):
   - Production: `https://azan-prayer.vercel.app` (or your custom domain)
   - Preview: `https://project-pr-XXX.vercel.app` (for PRs)

2. **Initial Page Load:**
   - [ ] Page loads completely (no stalled requests)
   - [ ] Loads within 2-3 seconds
   - [ ] No 404 or 503 errors
   - [ ] No blank page or "Failed to fetch" messages

3. **Check Console Errors:**
   - DevTools → Console
   - [ ] No red error messages
   - [ ] No undefined variable errors
   - [ ] No CORS errors

4. **Verify API Connectivity:**
   - DevTools → Network
   - Look for requests to `api.aladhan.com`
   - [ ] Requests show 200 status (successful)
   - [ ] Response contains prayer times data
   - [ ] No 403/401 (permission) errors

**Core Functionality Test** (3-5 minutes):

- [ ] Prayer times display for default city
- [ ] Times formatted correctly (HH:MM format)
- [ ] All five prayers visible (Fajr, Dhuhr, Asr, Maghrib, Isha)
- [ ] Times are for today's date
- [ ] Can select different city (search and select)
- [ ] City change updates times correctly
- [ ] Language toggle works (Arabic/English)
- [ ] Dark mode works
- [ ] Quran tab loads (if enabled)
- [ ] Monthly view displays calendar

**Performance Check** (2 minutes):

- DevTools → Lighthouse → Run audit
- [ ] Performance score > 80 (aim for > 90)
- [ ] Accessibility score > 85
- [ ] Best Practices score > 85
- [ ] SEO score > 85
- [ ] No errors in audit

**Security Headers Check** (1 minute):

- DevTools → Network → Click `index.html`
- Response Headers section should show:
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `X-Frame-Options: DENY`
  - [ ] `Cache-Control: ...` (appropriate caching)

**PWA & Offline Check** (2 minutes):

- DevTools → Application → Service Worker
  - [ ] Status: "activated and running"
- DevTools → Application → Cache Storage
  - [ ] Multiple caches present (`aladhan-api`, `google-fonts`, etc.)
- Toggle offline mode:
  - [ ] App still displays prayer times (from cache)
  - [ ] Shows cached/offline indicator (if implemented)
- Toggle back online:
  - [ ] App fetches fresh data
  - [ ] Times update if date changed

**Mobile & Responsive Design:**

- DevTools → Toggle Device Toolbar (Ctrl+Shift+M)
- Test at 375px (iPhone SE):
  - [ ] All content visible
  - [ ] No horizontal scroll needed
  - [ ] Buttons/links easily tappable (> 48px)
  - [ ] Text readable
  - [ ] RTL layout correct for Arabic
- Test at 768px (iPad):
  - [ ] Layout adapts properly
  - [ ] All features accessible
- Test at 1920px (Desktop):
  - [ ] Centered and readable
  - [ ] Good use of whitespace

### Geographic & API Testing

- [ ] Prayer times are for correct city (default or selected)
- [ ] Times match official prayer time sources for that city
  - (You can verify against major Islamic app or mosque announcements)
- [ ] Hijri date displayed correctly (if shown)
- [ ] Multiple cities work (try 3-5 different cities):
  - Cairo
  - London
  - New York
  - Sydney
  - Dubai

### Feature-Specific Tests

**If Notifications Enabled:**
- [ ] Request notification permission displays
- [ ] Can grant/deny permission
- [ ] Notification settings accessible in UI

**If Quran Reader Enabled:**
- [ ] Surahs load and display
- [ ] Can select different surah
- [ ] Verses display with translation (if available)
- [ ] Font size adjustable (if feature exists)

**If Dark Mode Enabled:**
- [ ] Dark mode toggle works
- [ ] Colors are readable (contrast ratio > 4.5:1)
- [ ] Preference persists on reload

---

## Post-Deployment Phase (After 1 hour)

### Monitor for Errors

- [ ] Vercel Dashboard → Insights: No runtime errors
- [ ] Visit app again and repeat core tests
- [ ] Check network requests still successful

### Update Status

- [ ] PR merged confirmation visible in GitHub
- [ ] Deployment marked as production
- [ ] Update team Slack/communication channel with deployment link

### Documentation & Announcement

- [ ] Update release notes
- [ ] Announce to users (if applicable):
  - New features explained
  - Bug fixes listed
  - Known issues noted
- [ ] Create GitHub release (if versioned)

### Monitoring Setup

- [ ] Bookmark Vercel Dashboard link
- [ ] Set calendar reminder for weekly monitoring
- [ ] Enable Vercel email notifications (optional)

---

## Rollback Plan (If Issues Detected)

### If Deployment Is Broken

**First 10 minutes (Before users see it):**
1. Vercel Dashboard → Deployments
2. Find previous stable deployment
3. Click "..." menu → "Promote to Production"
4. Confirm rollback
5. App reverts to previous version immediately

**After rollback:**
- [ ] Test app again to confirm rollback worked
- [ ] Investigate what went wrong
- [ ] Create GitHub issue to track problem
- [ ] Fix locally and test thoroughly before re-deploying

---

## 30-Day Post-Deployment Checks

Schedule these checks weekly or after deployment:

- [ ] Vercel Dashboard: Check for errors/warnings in Insights
- [ ] Performance: Core Web Vitals still good?
- [ ] Functionality: All features working?
- [ ] User Reports: Any complaints or issues?
- [ ] Dependencies: Any security updates needed? `npm audit`
- [ ] Build: `npm run build` still succeeds?

---

## Quarterly Maintenance

Every 3 months, perform:

- [ ] Dependency update: `npm update` → test → deploy
- [ ] Security audit: `npm audit fix` (if safe)
- [ ] Code review: Scan for technical debt
- [ ] Performance baseline: Compare Lighthouse scores
- [ ] User feedback: Any feature requests?

---

## Key Reminders

✅ **Always test locally before deploying**
```bash
npm run build
npm run preview
```

✅ **Check environment variables are set in Vercel**
- Missing env vars = build failure or broken features

✅ **Verify build logs for errors**
- Vercel shows detailed logs if build fails

✅ **Test on actual device/browser**
- Desktop + mobile (iPhone/Android)

✅ **Have a rollback plan ready**
- Previous deployment just one click away

✅ **Monitor for 1 hour post-deployment**
- Catch early issues before users complain

---

## Pre-Deployment Sign-Off

Before deploying to production, confirm:

- [ ] **Code Quality**: Linting passed ✅
- [ ] **Testing**: Preview works locally ✅
- [ ] **Performance**: Bundle size < 500KB ✅
- [ ] **Environment**: All variables configured ✅
- [ ] **Documentation**: README/changelog updated ✅
- [ ] **Security**: No secrets in code ✅

**Ready to deploy!** 🚀

---

**Questions?** See [DEPLOYMENT.md](./DEPLOYMENT.md) or [VERCEL_SETUP.md](./VERCEL_SETUP.md)
