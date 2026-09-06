# 🔄 CI/CD Pipeline & GitHub Actions

Comprehensive guide to the automated testing and deployment workflows for the Azan Prayer application.

## Overview

The repository uses GitHub Actions for:
- **Continuous Integration (CI)**: Code quality, security scanning, performance testing on every PR and push
- **Continuous Deployment (CD)**: Automated deployments to Netlify, Vercel, and Docker/GHCR on main branch

## CI/CD Workflow Architecture

```
Pull Request / Push to main/develop
    ↓
┌─────────────────────────────────────────────┐
│ CI Pipeline (runs on every PR & push)       │
├─────────────────────────────────────────────┤
│ ✓ Lint Code (ESLint)                        │
│ ✓ Build Application (Vite)                  │
│ ✓ Security Scanning (npm audit, OWASP)      │
│ ✓ Performance Testing (Lighthouse CI)       │
│ ✓ Docker Build Test                         │
└─────────────────────────────────────────────┘
    ↓ (if all pass)
┌─────────────────────────────────────────────┐
│ CD Pipeline (runs only on push to main)     │
├─────────────────────────────────────────────┤
│ → Netlify Production Deploy                 │
│ → Deployment Verification                   │
│ → Docker Image Push to GHCR                 │
│ → Preview Deployment (on PR)                │
└─────────────────────────────────────────────┘
```

---

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers:** Every push to `main`/`develop`, every pull request, manual (`workflow_dispatch`)

**Jobs:**

#### Lint
- **Purpose:** Enforce code quality standards
- **Action:** ESLint via `npm run lint`
- **Failure:** Blocks build if linting fails ❌ (no bypass)
- **Artifact:** ESLint JSON report (debugging)

#### Build
- **Purpose:** Compile application with Vite
- **Action:** `npm run build`
- **Dependencies:** Lint must pass first
- **Output:** `dist/` folder
- **Checks:**
  - Build completes successfully
  - Bundle size monitored (warning if >1MB)
- **Artifact:** dist/ folder (7-day retention for debugging)

#### Security
- **Purpose:** Detect vulnerable dependencies
- **Actions:**
  - `npm audit --audit-level=moderate` (fails if moderate+ vulnerabilities)
  - `npm audit fix --dry-run` (shows fixable vulnerabilities)
  - OWASP Dependency-Check (comprehensive scan)
- **Failure:** Blocks build if moderate+ vulnerabilities detected ❌
- **Artifact:** Dependency-Check JSON report

#### Performance
- **Purpose:** Test production application performance
- **Dependencies:** Build must pass first
- **Steps:**
  1. Download build artifacts
  2. Start `serve` server on port 3000
  3. Wait for server readiness
  4. Run Lighthouse CI with 3 concurrent runs
- **Artifact:** Lighthouse HTML reports, JSON results
- **Thresholds:**
  - Performance: ≥ 50% (can be improved)
  - Accessibility: ≥ 80%
  - Best Practices: ≥ 80%
  - SEO: ≥ 80%
  - PWA: ≥ 60%

#### Docker Build Test
- **Purpose:** Verify Docker image builds successfully
- **Action:** Build Docker image with cache optimization
- **Benefit:** Early detection of Docker build issues
- **No push:** Image not pushed to registry

#### Summary
- **Purpose:** Report overall CI status
- **Shows:** All job results in GitHub Actions UI
- **Failure:** Fails if lint, build, or security failed

**Runtime:** ~15-20 minutes total

### 2. Production Deployment (`.github/workflows/cd-netlify.yml`)

**Triggers:** Push to `main` branch, manual (`workflow_dispatch`)

**Environment:** Production (`https://azan-prayer.netlify.app`)

**Jobs:**

#### Build & Deploy
1. **Install dependencies** (npm ci)
2. **Build application** with environment variables:
   - `VITE_ALADHAN_API_URL`: Prayer times API
   - `VITE_DEFAULT_CITY`: Default city
   - `VITE_DEFAULT_COUNTRY`: Default country
3. **Deploy to Netlify** using npx netlify-cli@14.11.0
4. **Comment on commit** with deployment link
5. **Verify deployment:**
   - Wait for site to be live
   - Check critical pages accessibility
   - Verify service worker
   - Check asset availability

#### Deployment Verification
1. **Wait** 10 seconds for Netlify propagation
2. **Check site availability** (30 attempts, 5s intervals)
3. **Verify critical pages** (homepage, assets)
4. **Check Service Worker** availability

#### Notifications
- **Slack notification** (if `SLACK_WEBHOOK` configured):
  - Deployment status
  - Live URL
  - Link to GitHub Container Registry (if using Docker)
- **Commit comment** with deployment confirmation

**Runtime:** ~10 minutes

**Concurrency:** Single concurrent deployment (prevents conflicts)

### 3. Preview Deployment (`.github/workflows/cd-netlify-preview.yml`)

**Triggers:** Pull request to `main`, manual (`workflow_dispatch`)

**Purpose:** Deploy PR changes to preview URL for testing before merging

**Jobs:**

1. **Build application** (same as production)
2. **Deploy to Netlify** preview site
3. **Extract preview URL** from JSON output (robust parsing)
4. **Comment on PR** with:
   - Preview link
   - Comparison link to production
5. **Verify preview** is live

**Features:**
- ✅ Robust JSON parsing (no fragile regex)
- ✅ Concurrency control (one preview per PR)
- ✅ Automatic cleanup when PR closed

**Runtime:** ~10 minutes

### 4. Docker Image Build & Push (`.github/workflows/cd-docker.yml`)

**Triggers:** Push to `main` branch, tags (`v*`), manual (`workflow_dispatch`)

**Purpose:** Build production Docker image and publish to GitHub Container Registry (GHCR)

**Jobs:**

#### Build & Push
1. **Log in** to GHCR
2. **Extract metadata** (tags, labels, semver versioning)
3. **Build Docker image** from `Dockerfile`
4. **Push** to GHCR with tags:
   - `latest` (default branch)
   - `sha-xxxxx` (short commit SHA)
   - Semantic versions (`v1.0.0`)
5. **Output image digest** for verification

#### Test Image
1. **Pull** published image from GHCR
2. **Start container** on port 3000
3. **Health check** (curl test)
4. **Verify artifacts** exist in container
5. **Cleanup** test container

#### Security Scan
1. **Pull** published image
2. **Run Trivy vulnerability scanner** (v0.24.0, pinned)
3. **Scan for** CRITICAL & HIGH severity issues
4. **Upload SARIF results** to GitHub Security tab

#### Deployment Status
- **Summary** displayed in GitHub
- **Registry link** to view published images

**Runtime:** ~15-20 minutes

**Permissions:** Minimal required for each job

---

## Environment Variables & Secrets

### Required Secrets

Add these to GitHub repository (`Settings → Secrets and variables → Actions`):

#### Netlify Deployment
```
NETLIFY_AUTH_TOKEN
  ├─ Get from: https://app.netlify.com/user/applications/personal
  ├─ How: Create personal access token
  └─ Used in: cd-netlify.yml, cd-netlify-preview.yml

NETLIFY_SITE_ID
  ├─ Get from: Netlify site settings → Site ID
  ├─ Format: UUID (e.g., a1b2c3d4-e5f6-7890-abcd-ef1234567890)
  └─ Used in: cd-netlify.yml, cd-netlify-preview.yml
```

#### Build Configuration (Public, not secrets)
```
VITE_ALADHAN_API_URL
  ├─ Value: https://api.aladhan.com/v1
  ├─ Type: Public build-time variable (exposed to browser)
  └─ Used in: ci.yml, cd-netlify.yml, cd-netlify-preview.yml

VITE_DEFAULT_CITY
  ├─ Value: Cairo (or your preferred city)
  ├─ Type: Public build-time variable
  └─ Used in: ci.yml, cd-netlify.yml, cd-netlify-preview.yml

VITE_DEFAULT_COUNTRY
  ├─ Value: Egypt (or your preferred country)
  ├─ Type: Public build-time variable
  └─ Used in: ci.yml, cd-netlify.yml, cd-netlify-preview.yml
```

#### Optional
```
SLACK_WEBHOOK
  ├─ Get from: Slack workspace → Apps → Incoming Webhooks
  ├─ Optional: Deployment notifications
  └─ Used in: cd-netlify.yml (fails gracefully if not set)
```

### Secret Setup Steps

1. **Generate Netlify Token:**
   ```
   1. Go to https://app.netlify.com/user/applications/personal
   2. Click "New access token"
   3. Name: "GitHub Actions"
   4. Copy token
   ```

2. **Get Netlify Site ID:**
   ```
   1. Go to Netlify site dashboard
   2. Settings → General
   3. Find "Site ID"
   4. Copy it
   ```

3. **Add to GitHub:**
   ```
   1. Go to GitHub repository
   2. Settings → Secrets and variables → Actions
   3. Click "New repository secret"
   4. Add NETLIFY_AUTH_TOKEN
   5. Add NETLIFY_SITE_ID
   6. Add VITE_* variables (or use defaults)
   ```

See [DEPLOYMENT_SECRETS.md](./.github/DEPLOYMENT_SECRETS.md) for detailed setup and troubleshooting.

---

## Node.js Version & Runtime

### Version Pinning

The repository uses **Node.js 20.11.0** across all environments:

| Environment | Version | File/Location |
|-------------|---------|------|
| **Development** | 20.11.0 | `.nvmrc` |
| **CI** | 20.11.0 | `ci.yml` (NODE_VERSION env var) |
| **Production** | 20.x (alpine) | `Dockerfile` (node:20-alpine) |
| **Netlify** | 20.11.0 | `netlify.toml` (NODE_VERSION) |
| **Vercel** | Default (20.x) | `vercel.json` (uses platform default) |

### Local Development

Use `.nvmrc` to ensure correct version:

```bash
# With nvm:
nvm use

# Or manually:
nvm install 20.11.0
```

---

## Quality Gates & Failure Handling

### Required Gates (Build Fails If)

❌ **ESLint errors** → Code quality violations  
❌ **Build fails** → Syntax or compilation errors  
❌ **npm audit** detects moderate+ vulnerabilities  
❌ **OWASP Dependency-Check** finds issues  
❌ **Docker build fails** → Image cannot build  

### Advisory Gates (Non-blocking)

⚠️ **Lighthouse** thresholds not met → Warning in PR  
⚠️ **Bundle size** >1MB → Warning in build log  
⚠️ **Preview deployment** fails → Noted in PR comment  

### No Bypass Mechanism

- ❌ No `|| true` to hide failures
- ❌ No skipping security checks
- ❌ No fake passing builds

---

## Deployment Concurrency & Safety

### CI Pipeline
- **Concurrency:** `ci-${{ github.ref }}` with `cancel-in-progress: true`
- **Purpose:** Cancel old builds when new push received on same branch
- **Safety:** Only applies to CI, not deployments

### Production Deployment
- **Concurrency:** Single concurrent deployment (Netlify handles this)
- **Purpose:** Prevent overlapping deployments
- **Protection:** Environment protection rules enforced

### Preview Deployment
- **Concurrency:** `preview-${{ github.event.pull_request.number }}`
- **Purpose:** One preview per PR, cancel old previews
- **Cleanup:** Automatic when PR closed

---

## Security & Permissions

### Least Privilege

Each workflow has minimal required permissions:

```yaml
# CI Workflow
permissions:
  contents: read

# Docker Workflow
permissions:
  contents: read
  packages: write      # Only for push job
  security-events: write  # Only for scan job

# Netlify Workflow
permissions:
  contents: read
```

### No Secrets in PR Code

- ❌ Secrets NOT exposed to PR code
- ✅ Secrets only available to main branch deployments
- ✅ PR preview deployments use public URLs

### Action Versions

- ✅ All GitHub Actions pinned to specific versions
- ❌ No `@main`, `@master`, or floating versions
- ✅ Security actions (Trivy, CodeQL) pinned to stable versions

---

## Artifacts & Retention

### What Gets Retained

| Artifact | Retention | Purpose |
|----------|-----------|---------|
| ESLint Report | 7 days | Debugging linting issues |
| Dist Folder | 7 days | Build debugging, artifact verification |
| Dependency-Check Report | 7 days | Security audit trail |
| Lighthouse Reports | (LHCI temporary storage) | Performance baseline |
| Trivy SARIF | (GitHub Security) | Vulnerability tracking |

### How to Access

1. Go to GitHub repo → Actions
2. Click workflow run
3. Scroll to "Artifacts" section
4. Download report

---

## Troubleshooting

### Lint Failures in CI

**Issue:** Workflow fails on lint step

**Check:**
```bash
npm run lint
```

**Fix:** Address linting errors locally before pushing

### Build Failures

**Issue:** Workflow fails on build step

**Check:**
```bash
npm ci
npm run build
```

**Common causes:**
- Missing environment variables
- TypeScript errors
- Dependency conflicts

**Fix:** Check logs in GitHub Actions UI

### Deployment Not Triggering

**Issue:** CD workflow doesn't run after CI passes

**Check:**
1. Verify push is to `main` branch
2. Check workflow file exists: `.github/workflows/cd-netlify.yml`
3. Verify secrets are set: `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`

**Fix:**
1. Enable workflow: Actions tab → Workflow name → Enable
2. Manually trigger: workflow_dispatch button

### Preview Deployment URL Not Showing

**Issue:** PR comment doesn't show preview URL

**Causes:**
- Netlify token invalid or expired
- Site ID incorrect
- Rate limiting

**Fix:**
1. Verify secrets
2. Check Netlify site settings
3. Manually redeploy

---

## Monitoring & Logs

### GitHub Actions UI

View all workflow runs:
```
GitHub repo → Actions tab
```

### Real-time Logs

1. Click workflow run
2. Click job
3. Expand steps to see detailed logs

### Performance Metrics

Check build/deployment times:
```
Actions → Workflow name → All runs
```

---

## Updating Workflows

### Adding New Step

1. Edit `.github/workflows/*.yml`
2. Test locally with `act` (optional):
   ```bash
   npm install -g act
   act push --job lint
   ```
3. Commit and push
4. Workflow updates automatically

### Updating Action Versions

1. Find action in workflow
2. Check latest version: GitHub Marketplace
3. Update version (e.g., `v3` → `v4`)
4. Test by running workflow
5. Commit changes

### Adding New Secrets

1. GitHub repo → Settings → Secrets
2. Click "New repository secret"
3. Update workflow to use secret: `${{ secrets.SECRET_NAME }}`
4. Test deployment

---

## Links & References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Netlify CI/CD](https://docs.netlify.com/configure-builds/get-started/)
- [Vercel Deployments](https://vercel.com/docs)
- [Docker & GHCR](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [ESLint](https://eslint.org)
- [Lighthouse CI](https://github.com/treosh/lighthouse-ci-action)
- [Trivy Scanner](https://github.com/aquasecurity/trivy-action)

---

## FAQs

**Q: How often do CI jobs run?**
A: On every push and pull request to any branch (main/develop)

**Q: Can I skip CI?**
A: Not recommended, but you can disable workflows (not recommended)

**Q: How do I re-run a failed deployment?**
A: GitHub Actions UI → Click workflow → Re-run jobs

**Q: Can I deploy without CI passing?**
A: No - CD depends on CI success

**Q: How long do artifacts stay?**
A: 7 days by default, configurable per artifact

**Q: What if Netlify token expires?**
A: Update `NETLIFY_AUTH_TOKEN` secret, re-run workflow

---

For detailed setup, see:
- [DEPLOYMENT_SECRETS.md](./.github/DEPLOYMENT_SECRETS.md) - Secret configuration
- [docs/DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment strategies
- [docs/VERCEL_SETUP.md](./VERCEL_SETUP.md) - Vercel-specific guide
