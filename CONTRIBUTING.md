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

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [AaronSmithX](https://github.com/AaronSmithX).

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 24.2.0 (use `nvm use 24.2.0` if you have nvm)
- **MongoDB**: Local instance for development
- **Git**: For version control

### Development Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/your-username/mybiblelog-nuxt.git
   cd mybiblelog-nuxt
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file at the root of the project:

   ```bash
   # Base site URL (used for canonical links)
   SITE_URL=https://localhost:3000

   # Connection URL for MongoDB
   MONGODB_URI=mongodb://localhost:27017/mybiblelog_dev

   # JSON Web Token secret
   JWT_SECRET=your-jwt-secret-here

   # The Mailgun API key and domain for sending email (optional for development of non-email features)
   MAILGUN_API_KEY=your-mailgun-api-key
   MAILGUN_DOMAIN=your-mailgun-domain

   # Whether email verification is required before users can sign in
   REQUIRE_EMAIL_VERIFICATION=false

   # Google OAuth2 (optional for development)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT=http://localhost:3000/google-login

   # Google Analytics ID (optional)
   GA_MEASUREMENT_ID=your-ga-id

   # Open AI API Key (for automatic i18n block translations)
   OPENAI_API_KEY=your-openai-api-key

   # Test Data
   TEST_SITE_URL=https://localhost:3000
   TEST_BYPASS_SECRET=your-test-secret
   ```

4. **Start the development servers**

   ```bash
   npm run dev
   ```

   This will start both the API server (Express) and the Nuxt.js frontend with hot reload.

   At times the proxy between the servers will disconnect during the hot reload process.
   Simply stop and restart the servers if this happens.

5. **Access the application**
   - Frontend: <http://localhost:3000>
   - API: <http://localhost:3000/api>

## Testing

We have comprehensive API and core utility file testing in place.
Please ensure all tests pass before submitting a pull request.

Note that API tests that result in a value being incremented/decremented
sometimes suffer from race conditions with other tests and fail with an off-by-one expected value.

Those tests should still consistently pass when run in isolation.

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

- All new features must include appropriate tests
- Bug fixes must include tests that verify the fix
- API endpoints must have corresponding Jest tests
- Ideally, UI changes must have corresponding Playwright tests
- Tests must pass in both development and any CI environments (currently there is no CI environment)

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

1. Define the locale in `i18n.config.js`
2. Add the locale to `locales/locales.js`
3. Import the locale for `dayjs` in `shared/date-helpers.js`
4. Add Bible book title translations to `shared/static/bible-books.js`
5. Add translations to all `.vue` files in `pages` and `components` directories
6. Add translations to email templates in `api/services/email-templates/`
7. Add translations to `api/services/mailgun.service.js` and `api/services/reminder.service.js`
8. Create content files in the appropriate `/content` directory
9. Add Bible translation options in `shared/util.js` and `pages/settings/reading.vue`

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

### Security Best Practices

- Never commit sensitive data (API keys, passwords, etc.)
- Use environment variables for configuration
- Validate all user inputs
- Follow OWASP guidelines
- Keep dependencies updated

## Questions?

- **General questions**: Use the [question template](.github/ISSUE_TEMPLATE/question.md)
- **Security concerns**: Email [mybiblelog.com@gmail.com](mailto:mybiblelog.com@gmail.com)
- **Code of Conduct violations**: Contact [AaronSmithX](https://github.com/AaronSmithX)

## License

By contributing to My Bible Log, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

Thank you for contributing to My Bible Log! 🙏
