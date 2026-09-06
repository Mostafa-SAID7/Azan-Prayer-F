# Contributing to Azan Prayer Times

Thank you for your interest in contributing! This document provides guidelines and instructions.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/Azan-Prayer-F.git`
3. Add upstream: `git remote add upstream https://github.com/Mostafa-SAID7/Azan-Prayer-F.git`
4. Create a branch: `git checkout -b feature/your-feature`

## Development Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run linter
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, missing semicolons, etc.)
- `refactor:` - Code refactoring without feature changes
- `perf:` - Performance improvements
- `test:` - Test additions/changes
- `chore:` - Build, dependencies, tooling changes
- `ci:` - CI/CD configuration changes

Examples:
```
feat: add dark mode support
fix: resolve prayer time calculation for DST
docs: update API documentation
chore: upgrade dependencies
```

## Pull Request Process

1. Update `CHANGELOG.md` with your changes
2. Ensure all tests pass: `npm run lint`
3. Write clear PR description explaining the change
4. Reference any related issues: "Fixes #123"
5. Ensure branch is up to date with main

## Code Style

- Use ESLint config (run `npm run lint`)
- Use Prettier via ESLint for formatting
- Follow React best practices
- Add JSDoc comments for complex functions
- Use meaningful variable names

## Testing

While full test suites aren't implemented yet:
- Test your changes locally with `npm run dev`
- Verify no linting errors with `npm run lint`
- Build and preview with `npm run build && npm run preview`

## Documentation

- Update relevant docs in `/docs` folder
- Update README if user-facing features change
- Add comments for non-obvious code sections

## Reporting Issues

Use GitHub Issues for bug reports and feature requests:

- **Bug Report**: Include steps to reproduce, expected vs actual behavior
- **Feature Request**: Explain the use case and expected behavior
- **Question**: Search existing discussions first

## Code of Conduct

- Be respectful and inclusive
- No harassment, discrimination, or inappropriate content
- Focus on constructive feedback
- Respect different perspectives

## Questions?

- Check existing issues and discussions
- Review documentation in `/docs`
- Contact: dev.mohamedsakr@gmail.com

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing! 🙏
