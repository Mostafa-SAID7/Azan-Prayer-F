# Security Policy

## Reporting Security Vulnerabilities

**Please do not publicly report security vulnerabilities through GitHub Issues.**

If you discover a security vulnerability, please email **dev.mohamedsakr@gmail.com** with:

- Description of the vulnerability
- Steps to reproduce (if applicable)
- Affected versions
- Proposed fix (if any)

We will acknowledge your email within 48 hours and work with you on a fix.

## Security Updates

We release security patches as soon as they are available. Please keep your dependencies up to date by:

1. Running `npm audit` regularly
2. Updating to the latest patch version when security fixes are released
3. Monitoring GitHub Security Advisories

## Supported Versions

| Version | Status | Security Support |
|---------|--------|------------------|
| 0.1.x   | Active | ✅ Latest        |

## Best Practices

When using this application:

1. **Keep Node.js and npm updated** - Security fixes come with platform updates
2. **Use HTTPS** - Always deploy behind HTTPS in production
3. **Environment Variables** - Never commit secrets; use environment variable injection
4. **API Rate Limiting** - The Aladhan API is rate-limited; implement client-side caching
5. **Content Security Policy** - Headers are configured; review `vercel.json` for CSP rules

## Security Headers

This application includes:

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: geolocation=(), microphone=(), camera=()
- Cache-Control: public, max-age=3600, s-maxage=3600
