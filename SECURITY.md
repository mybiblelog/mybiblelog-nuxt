# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in My Bible Log, please report it responsibly:

1. **DO NOT** create a public GitHub issue
2. Email security concerns to: [mybiblelog.com@gmail.com](mailto:mybiblelog.com@gmail.com)
3. Include as much detail as possible about the vulnerability
4. We will respond within 48 hours and work with you to resolve the issue

## Security Features

### Authentication & Authorization

- JWT-based authentication with configurable expiration
- Password hashing using bcrypt with salt factor 10
- Email verification required for new accounts
- Google OAuth2 integration with CSRF protection
- Rate limiting on authentication endpoints
- Account lockout protection for failed login attempts

### API Security

- CORS configured to only allow specific origins
- Security headers via Helmet.js
- Input validation and sanitization
- NoSQL injection prevention through Mongoose schema validation and parameterized queries
- Rate limiting on sensitive endpoints

### Data Protection

- Passwords never stored in plain text
- Sensitive data excluded from API responses
- Email verification codes expire after 24 hours
- Password reset codes expire after 1 hour
- Secure session management

## Security Best Practices for Deployment

### Environment Variables

- Use strong, unique JWT secrets (minimum 32 characters)
- Never commit `.env` files to version control
- Use different secrets for each environment
- Regularly rotate secrets in production

### HTTPS

- Always use HTTPS in production
- Configure proper SSL certificates
- Enable HSTS headers
- Redirect HTTP to HTTPS

### Database Security

- Use MongoDB authentication
- Enable network encryption
- Regular security updates
- Backup encryption

### Server Security

- Keep dependencies updated
- Use security scanning tools
- Monitor for suspicious activity
- Implement proper logging

## Known Security Considerations

### Auto-Login After Email Verification

The application automatically logs users in after email verification. This is a design choice that balances security with user experience. If someone gains access to a user's email, they could potentially access the account. Consider your threat model when deploying.

### Password Reset Flow

Password reset links automatically log users in after successful password change. This is standard practice but means anyone with access to the reset email can take over the account.

### Rate Limiting

The current rate limiting implementation uses in-memory storage and only works with single server instances. For load-balanced deployments, implement Redis-based rate limiting.

## Security Updates

We are committed to:

- Promptly addressing security vulnerabilities
- Providing clear communication about security issues
- Maintaining backward compatibility when possible
- Following responsible disclosure practices

## Third-Party Dependencies

We regularly audit and update dependencies. Known vulnerabilities in dependencies are addressed in security updates.

## Contact

For security-related questions or concerns, please contact:

- Email: [mybiblelog.com@gmail.com](mailto:mybiblelog.com@gmail.com)
- GitHub: [Create a private security advisory](https://github.com/mybiblelog/mybiblelog-v2-nuxt2/security/advisories/new)

---

*This security policy is effective as of the latest release and may be updated as needed.*
