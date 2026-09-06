# 📦 Semantic Versioning & Releases

Azan Prayer F uses **semantic versioning** with **automatic releases** via GitHub Actions.

## Version Format

`MAJOR.MINOR.PATCH` (e.g., `1.2.3`)

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

## Single Source of Truth

**Version is defined in ONE place: `package.json`**

```json
{
  "version": "0.1.0"
}
```

- `.releaserc.json` - Semantic release configuration
- `release.yml` - Automatic release workflow
- Both read from `package.json`, never override it manually

## Automatic Releases

### Trigger

Every push to `main` with semantic commits triggers automatic version bump:

```bash
# Commit message formats:
git commit -m "fix: bug fix" # → PATCH bump (0.1.1)
git commit -m "feat: new feature" # → MINOR bump (0.2.0)
git commit -m "BREAKING CHANGE: api changed" # → MAJOR bump (1.0.0)
```

### What Happens Automatically

1. Analyzer reads commit messages
2. Determines version bump (PATCH/MINOR/MAJOR)
3. Updates `package.json` version
4. Updates `CHANGELOG.md`
5. Creates GitHub Release
6. Creates Git tag (e.g., `v0.1.1`)
7. Comments on PR/commit

## Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body

footer
```

### Valid Types

- `feat:` New feature → MINOR
- `fix:` Bug fix → PATCH
- `docs:` Documentation only → No release
- `style:` Code formatting → No release
- `refactor:` Code refactoring → No release
- `perf:` Performance improvement → PATCH
- `test:` Test changes → No release
- `chore:` Maintenance → No release

### Examples

```bash
# Bug fix (PATCH)
git commit -m "fix: resolve prayer time calculation error"

# New feature (MINOR)
git commit -m "feat: add dark mode toggle"

# Breaking change (MAJOR)
git commit -m "feat: redesign API response format

BREAKING CHANGE: prayer times now return ISO format instead of HH:MM"

# No release (documentation)
git commit -m "docs: update README with setup instructions"
```

## Viewing Releases

### GitHub Releases

All releases visible at:
```
https://github.com/Mostafa-SAID7/Azan-Prayer-F/releases
```

### Git Tags

List local tags:
```bash
git tag -l
```

Fetch latest tags:
```bash
git fetch --tags
```

Checkout specific version:
```bash
git checkout v0.1.5
```

## CHANGELOG

Automatically generated in `CHANGELOG.md` with:
- All features added
- All bugs fixed
- All breaking changes
- Grouped by version and date

Example entry:
```markdown
## [0.2.0](https://github.com/.../compare/v0.1.0...v0.2.0) (2025-01-15)

### Features

- **prayer:** add notification support ([abc123](https://github.com/.../commit/abc123))

### Bug Fixes

- **ui:** fix responsive layout on mobile ([def456](https://github.com/.../commit/def456))

### BREAKING CHANGES

- Prayer time format changed to ISO 8601
```

## No Manual Version Edits

❌ **Do NOT:**
- Edit `package.json` version manually
- Create tags manually
- Manually edit CHANGELOG.md

✅ **DO:**
- Use conventional commits
- Let semantic-release handle everything
- Update CHANGELOG via commits

## Workflow Diagram

```
Commit to main
    ↓
Semantic Release checks commits
    ↓
Version bump determined (MAJOR/MINOR/PATCH)
    ↓
package.json updated
    ↓
CHANGELOG.md generated
    ↓
GitHub Release created
    ↓
Git tag created (v0.2.0)
    ↓
Commit pushed with new version
    ↓
Done! Release live
```

## Required Secrets

For automatic releases to work, GitHub needs:

- `GITHUB_TOKEN` - Automatic (built-in, no setup needed)
- `NPM_TOKEN` - Optional (only if publishing to npm)

## Skipping Release

To skip automatic release for a commit:

```bash
git commit -m "chore: update dependencies" --no-verify
```

Or add `[skip ci]` or `[skip release]`:

```bash
git commit -m "docs: typo fix [skip release]"
```

## Troubleshooting

**No release created?**
- Check commit message format (must follow conventional commits)
- Verify workflow ran: Actions tab
- Check release logs for errors

**Version didn't bump?**
- Ensure commits follow conventional commit format
- `fix:` must have `fix:` prefix exactly
- `feat:` must have `feat:` prefix exactly

**Double-check version:**
```bash
npm version
# Shows: { 'azan-prayer-f': '0.1.0' }
```

## References

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [semantic-release](https://semantic-release.gitbook.io/)
