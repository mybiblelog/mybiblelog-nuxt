# Contributing to My Bible Log

Thank you for your interest in contributing to My Bible Log! This project is a Nuxt.js application for tracking personal Bible reading, and we welcome contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Testing](#testing)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Internationalization](#internationalization)
- [Security](#security)
- [Questions?](#questions)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [mybiblelog.com@gmail.com](mailto:mybiblelog.com@gmail.com).

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 24.2.0 (use `nvm use 24.2.0` if you have nvm)
- **MongoDB**: Local instance for development
- **Git**: For version control

### Development Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/mybiblelog-nuxt/mybiblelog-nuxt.git
   cd mybiblelog-nuxt
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file at the root of the project.

   Refer to the Environment Variables section of the README for a template of this file.

4. **Start the development servers**

   ```bash
   npm run dev
   ```

   This will start both the API server (Express) and the Nuxt.js frontend with hot reload.

5. **Access the application**
   - Frontend: <http://localhost:3000>
   - API: <http://localhost:3000/api>

## Testing

We have comprehensive API and core utility file testing in place.
Please ensure all tests pass before submitting a pull request.

Note that API tests that result in a value being incremented/decremented
sometimes suffer from race conditions with other tests and fail with an off-by-one expected value.

All tests should consistently pass when run in isolation or serially.

### API Tests (Jest)

```bash
# Run all API tests
npm run test:api

# Run tests in watch mode
npm run test:watch

# Run a specific test file
npx jest -- ./test/auth.test.js
```

### End-to-End Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Test Requirements

- All new features should include appropriate tests
- Bug fixes should include tests that verify the fix
- API endpoints should have corresponding Jest tests
- Ideally, UI changes should have corresponding Playwright tests
- Tests should pass in both development and any CI environments (currently there is no CI environment)

## Code Style

We use ESLint for code quality and consistency:

```bash
# Check code style
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### Style Guidelines

- Follow the existing ESLint configuration
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and single-purpose
- Use consistent indentation (2 spaces)
- Follow Vue.js and Nuxt.js best practices

## Pull Request Process

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes**

   - Write clean, well-tested code
   - Update documentation if needed
   - Add tests for new functionality

3. **Test your changes**

   ```bash
   npm run test # shared project
   npm run test:api
   npm run test:e2e
   npm run lint
   ```

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add new feature description"
   # or
   git commit -m "fix: resolve issue with description"
   ```

5. **Push and create a Pull Request**

   ```bash
   git push origin feature/your-feature-name
   ```

### Pull Request Guidelines

- Provide a clear description of what the PR does
- Reference any related issues
- Ensure all tests pass
- Request review from maintainers
- Be responsive to feedback

## Issue Reporting

Before creating an issue, please check if it already exists.

### Bug Reports

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) and include:

- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node.js version, browser)
- Screenshots if applicable

### Feature Requests

Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) and include:

- Clear description of the feature
- Use case and motivation
- Proposed implementation (if you have ideas)
- Any alternatives considered

### Questions

Use the [question template](.github/ISSUE_TEMPLATE/question.md) for:

- General questions about the project
- Help with setup or configuration
- Clarification on existing features

## Internationalization

My Bible Log supports multiple languages. When contributing to i18n features:

### Adding a New Locale

Refer to the README for a checklist of how to add a new locale.

### Translation Guidelines

- Use the `$t` helper for component translations
- Use the `$terr` helper for server error translations
- Keep translations consistent across all files
- Test translations in the target language
- Consider cultural context, not just literal translation

## Security

### Reporting Security Vulnerabilities

**DO NOT** create public GitHub issues for security vulnerabilities.

Instead, please:

1. Email security concerns to: [mybiblelog.com@gmail.com](mailto:mybiblelog.com@gmail.com)
2. Include detailed information about the vulnerability
3. We will respond within 48 hours

For more information, see our [Security Policy](SECURITY.md).

## Questions?

- **General questions**: Use the [question template](.github/ISSUE_TEMPLATE/question.md)
- **Security concerns**: Email [mybiblelog.com@gmail.com](mailto:mybiblelog.com@gmail.com)
- **Code of Conduct violations**: Contact [mybiblelog.com@gmail.com](mailto:mybiblelog.com@gmail.com)

## License

By contributing to My Bible Log, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

Thank you for contributing to My Bible Log! 🙏
