import express from 'express';
import status from 'http-status';
import config from '../../config';
import rateLimit from '../helpers/rateLimit';
import authCurrentUser, { AUTH_COOKIE_NAME, setAuthTokenCookie } from '../helpers/authCurrentUser';
import googleOauth2 from '../helpers/google-oauth2';
import { I18nError, makeI18nError } from '../helpers/i18n-error';
import useMongooseModels from '../../mongoose/useMongooseModels';
import useMailgunService from '../../services/mailgun.service';
import checkTestBypass from '../helpers/checkTestBypass';
import UserSettings from '../../mongoose/schemas/UserSettings';
import { isEmailVerified } from '../../mongoose/schemas/User';

const { requireEmailVerification } = config;

const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: |
 *         JWT token-based authentication.
 *
 *         ## Authentication Flow
 *         1. Obtain a JWT token by logging in via `/auth/login` or `/auth/google` endpoints
 *         2. Include the token in the Authorization header of subsequent requests:
 *            `Authorization: Bearer YOUR_TOKEN_HERE`
 *         3. The token contains user identity and permissions
 *
 *         ## Protected Endpoints
 *         Most endpoints in this API require authentication. Protected endpoints are marked with the lock icon 🔒 in the Swagger UI.
 *
 *         ## Token Expiration
 *         Tokens expire after 60 days. You'll need to log in again to obtain a new token.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the user
 *         email:
 *           type: string
 *           description: The user's email
 *         emailVerified:
 *           type: boolean
 *           description: Whether the user's email has been verified
 *         token:
 *           type: string
 *           description: JWT token for authentication
 *         settings:
 *           type: object
 *           description: User settings
 */

/**
 * @swagger
 * /auth/user:
 *   get:
 *     summary: Get the currently logged-in user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The current user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */
router.get('/auth/user', async (req, res, next) => {
  try {
    const currentUser = await authCurrentUser(req, { optional: true });
    if (!currentUser) { return res.json({ user: null }); }
    return res.json({ user: currentUser.toAuthJSON() });
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     description: |
 *       Authenticates a user with email and password, returning a JWT token.
 *       This token should be included in the Authorization header of subsequent requests.
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             description: |
 *               Authentication cookie containing the JWT token.
 *               - Cookie name: `auth_token`
 *               - HttpOnly: true
 *               - Secure: true (in production)
 *               - Max-Age: 2592000 seconds (30 days)
 *             schema:
 *               type: string
 *               example: auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; Max-Age=2592000
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token for authentication
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: object
 */
router.post('/auth/login', async (req, res, next) => {
  // Rate limiting for login attempts
  const authBypass = checkTestBypass(req);
  if (!authBypass) {
    await rateLimit(req, { maxRequests: 5, windowMs: 60 * 1000 }); // 5 attempts per minute
  }

  const { email, password } = req.body;

  if (!email) {
    return res.status(422).json({ errors: { email: makeI18nError(I18nError.Required, 'email') } });
  }

  if (!password) {
    return res.status(422).json({ errors: { password: makeI18nError(I18nError.Required, 'password') } });
  }

  const { User } = await useMongooseModels();
  const user = await User.findOne({ email });
  if (!user) {
    // definitely invalid email, but not giving that away
    return res.status(422).json({ errors: { _form: makeI18nError(I18nError.InvalidLogin, '_form') } });
  }

  const passwordValid = await user.authenticate(password);
  if (!passwordValid) {
    // definitely invalid password, but not giving that away
    return res.status(422).json({ errors: { _form: makeI18nError(I18nError.InvalidLogin, '_form') } });
  }
  const bypass = checkTestBypass(req);
  if (requireEmailVerification && !isEmailVerified(user) && !bypass) {
    return res.status(422).json({ errors: { _form: makeI18nError(I18nError.VerifyEmail, '_form', { email: user.email }) } });
  }
  const userData = user.toAuthJSON();
  const token = user.generateJWT();
  setAuthTokenCookie(res, token);
  return res.json({
    token,
    user: userData,
  });
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout the current user
 *     description: |
 *       Ends the current user session. This endpoint doesn't actually invalidate the JWT token
 *       since JWTs are stateless, but it can be used to track when a user explicitly logs out.
 *
 *       The client should remove the JWT token from storage after calling this endpoint.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully
 *         headers:
 *           Set-Cookie:
 *             description: |
 *               Clears the authentication cookie by setting it to expire immediately.
 *               - Cookie name: `auth_token`
 *             schema:
 *               type: string
 *               example: auth_token=; HttpOnly; Secure; Max-Age=0
 */
router.post('/auth/logout', async (req, res, next) => {
  try {
    await authCurrentUser(req);
    res.clearCookie(AUTH_COOKIE_NAME);
    return res.json(true);
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user account
 *     description: |
 *       Creates a new user account with the provided email and password.
 *       Returns a JWT token that can be used for authentication.
 *
 *       If email verification is enabled, the user will need to verify their email
 *       before they can access protected endpoints.
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                   description: Success message
 *                 emailVerificationCode:
 *                   type: string
 *                   description: Email verification code (only returned when test bypass header is present)
 *       422:
 *         description: Validation error (e.g., email already in use, invalid email format)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: object
 */
router.post('/auth/register', async (req, res, next) => {
  // If the request is coming from a test, bypass restrictions
  const authBypass = checkTestBypass(req);

  if (!authBypass) {
    await rateLimit(req, { maxRequests: 5, windowMs: 60 * 1000 });
  }

  const {
    email,
    password,
    isAdmin,
    locale,
    emailVerificationCode,
  } = req.body;

  const { User } = await useMongooseModels();
  const user = new User();
  try {
    user.email = email;
    user.password = password;
    // remaining settings will be set by Mongoose default
    user.settings = new UserSettings({ locale });

    if (authBypass) {
      // setting emailVerificationCode to null will mark the user as email verified
      user.emailVerificationCode = emailVerificationCode || '';
      if (isAdmin) {
        user.isAdmin = true;
      }
    }

    await user.save();

    res.json({ success: true });

    // Send a verification email
    const mailgunService = await useMailgunService();
    mailgunService.sendUserEmailVerification(email, user.emailVerificationCode, locale);
  }
  catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /auth/oauth2/google/url:
 *   get:
 *     summary: Get Google OAuth2 URL
 *     description: |
 *       Returns the URL to redirect the user to for Google OAuth2 authentication.
 *       This is the first step in the Google OAuth2 flow.
 *
 *       ## Google OAuth2 Flow:
 *       1. Frontend calls this endpoint to get the Google OAuth2 URL
 *       2. Frontend redirects the user to this URL
 *       3. User authenticates with Google and grants permissions
 *       4. Google redirects back to the application with a code
 *       5. Frontend passes this code to the /auth/oauth2/google/verify endpoint
 *       6. Backend verifies the code and returns a JWT token
 *     tags: [Authentication]
 *     security: []
 *     responses:
 *       200:
 *         description: Google OAuth2 URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: URL to redirect the user to for Google authentication
 */
router.get('/auth/oauth2/google/url', (req, res, next) => {
  const { url, state } = googleOauth2.getGoogleLoginUrl();
  res.send({ url, state });
});

/**
 * @swagger
 * /auth/oauth2/google/verify:
 *   get:
 *     summary: Verify Google OAuth2 code
 *     description: |
 *       Verifies the code returned by Google OAuth2 and returns a JWT token.
 *       This is the second step in the Google OAuth2 flow.
 *
 *       If the user doesn't exist, a new account will be created.
 *       If the user exists but hasn't used Google authentication before,
 *       the Google ID will be linked to their account.
 *     tags: [Authentication]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: The code returned by Google OAuth2
 *     responses:
 *       200:
 *         description: Google OAuth2 verification successful
 *         headers:
 *           Set-Cookie:
 *             description: |
 *               Authentication cookie containing the JWT token.
 *               - Cookie name: `auth_token`
 *               - HttpOnly: true
 *               - Secure: true (in production)
 *               - Max-Age: 2592000 seconds (30 days)
 *             schema:
 *               type: string
 *               example: auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; Max-Age=2592000
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token for authentication
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid code or OAuth2 error
 */
router.get('/auth/oauth2/google/verify', async (req, res, next) => {
  try {
    const { code, state, locale } = req.query;

    // Verify state parameter to prevent CSRF attacks
    if (!state || !googleOauth2.verifyState(state)) {
      return res.status(400).json({
        errors: { _form: makeI18nError(I18nError.InvalidRequest, '_form') },
      });
    }

    const { User } = await useMongooseModels();
    const accessToken = await googleOauth2.getAccessTokenFromCode(code);
    const profile = await googleOauth2.getUserProfileFromToken(accessToken);

    /* eslint-disable camelcase */
    const {
      id,
      email,
      verified_email,
    } = profile;

    // Only accept verified Google emails
    if (verified_email !== true) {
      return res.status(400).json({
        errors: { _form: makeI18nError(I18nError.EmailNotVerified, '_form') },
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Link Google account to existing account if not already linked
      if (!existingUser.googleId) {
        existingUser.googleId = id;
        await existingUser.save();
      }

      const token = existingUser.generateJWT();
      setAuthTokenCookie(res, token);
      return res.send({ token });
    }

    // Create new user account
    const user = new User();
    user.email = email;
    user.emailVerificationCode = ''; // Google verified emails don't need verification
    user.password = null;
    user.googleId = id;

    // remaining settings will be set by Mongoose default
    user.settings = new UserSettings({ locale });

    await user.save();
    const token = user.generateJWT();
    setAuthTokenCookie(res, token);
    res.send({ token });
  }
  catch (err) {
    next(err);
  }
  /* eslint-enable camelcase */
});

/**
 * @swagger
 * /auth/verify-email/{emailVerificationCode}:
 *   get:
 *     summary: Verify email via link
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: emailVerificationCode
 *         schema:
 *           type: string
 *         required: true
 *         description: The email verification code
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         headers:
 *           Set-Cookie:
 *             description: |
 *               Authentication cookie containing the JWT token.
 *               - Cookie name: `auth_token`
 *               - HttpOnly: true
 *               - Secure: true (in production)
 *               - Max-Age: 2592000 seconds (30 days)
 *             schema:
 *               type: string
 *               example: auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; Max-Age=2592000
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token for authentication
 *       404:
 *         description: Verification code not found
 */
router.get('/auth/verify-email/:emailVerificationCode', async (req, res) => {
  const { emailVerificationCode } = req.params;
  // Find the user (if not found, error)
  const { User } = await useMongooseModels();
  const user = await User.findOne({ emailVerificationCode });
  if (!user) {
    return res.sendStatus(404);
  }

  // Verify the code and check expiration
  if (!user.verifyEmailVerificationCode(emailVerificationCode)) {
    return res.status(400).json({
      errors: { _form: makeI18nError(I18nError.VerificationCodeExpired, '_form') },
    });
  }

  // Mark the user's email as verified by setting the verification code to null
  user.emailVerificationCode = '';
  user.emailVerificationExpires = new Date(0);
  await user.save();

  // Send a JWT back for auto-login
  const token = user.generateJWT();
  setAuthTokenCookie(res, token);
  res.json({ token });
});

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Current password is incorrect
 */
router.post('/auth/change-password', async (req, res, next) => {
  try {
    const currentUser = await authCurrentUser(req);
    const { currentPassword, newPassword } = req.body;

    // If the user's password is invalid, throw error
    const passwordValid = await currentUser.authenticate(currentPassword);
    if (!passwordValid) {
      return res.status(status.BAD_REQUEST).send({
        errors: {
          currentPassword: makeI18nError(I18nError.PasswordIncorrect, 'currentPassword'),
        },
      });
    }

    // Set new password
    currentUser.password = newPassword;
    try {
      await currentUser.save();
      res.send(status.OK);
    }
    catch (err) {
      // Any 'password' validation errors should be seen on the 'newPassword' field
      if (err.name === 'ValidationError' && err.errors.password) {
        err.errors.newPassword = err.errors.password;
      }
      return next(err);
    }
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/change-email:
 *   post:
 *     summary: Initiate email change process
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newEmail
 *               - password
 *             properties:
 *               newEmail:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email change process initiated successfully
 *       422:
 *         description: Validation error
 */
router.post('/auth/change-email', async (req, res, next) => {
  // If the request is coming from a test, bypass restrictions
  const authBypass = checkTestBypass(req);

  try {
    const { User } = await useMongooseModels();
    const currentUser = await authCurrentUser(req);
    const { newEmail, password } = req.body;

    // disallow newEmail to be current email
    if (newEmail === currentUser.email) {
      return res.status(422).json({ errors: { newEmail: makeI18nError(I18nError.NewEmailRequired, 'newEmail') } });
    }

    // disallow newEmail to be an email currently in use by another user
    const existingUserWithEmail = await User.findOne({ email: newEmail });
    if (existingUserWithEmail) {
      return res.status(422).json({ errors: { newEmail: makeI18nError(I18nError.EmailInUse, 'newEmail') } });
    }

    // confirm password
    const passwordValid = await currentUser.authenticate(password);
    if (!passwordValid) {
      return res.status(422).json({ errors: { password: makeI18nError(I18nError.PasswordIncorrect, 'password') } });
    }

    // have the new email confirmation expire in 1 hour
    currentUser.enableEmailUpdate(newEmail);
    await currentUser.save();

    // send success response
    const response: { success: boolean; newEmailVerificationCode?: string } = { success: true };
    if (authBypass && currentUser.newEmailVerificationCode) {
      response.newEmailVerificationCode = currentUser.newEmailVerificationCode;
    }
    res.send(response);

    // send an email update confirmation code
    const mailgunService = await useMailgunService();
    mailgunService.sendEmailUpdateLink(currentUser.email, newEmail, currentUser.newEmailVerificationCode, currentUser.settings.locale);
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/change-email:
 *   get:
 *     summary: Check if there is an email change request in progress
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email change request status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 newEmail:
 *                   type: string
 *                 expires:
 *                   type: string
 *                   format: date-time
 */
router.get('/auth/change-email', async (req, res, next) => {
  try {
    const currentUser = await authCurrentUser(req);

    if (currentUser.newEmail) {
      return res.send({
        newEmail: currentUser.newEmail,
        expires: currentUser.newEmailVerificationExpires,
      });
    }

    return res.send({
      newEmail: null,
      expires: null,
    });
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/change-email/{newEmailVerificationCode}:
 *   get:
 *     summary: Get email change request by verification code
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: newEmailVerificationCode
 *         schema:
 *           type: string
 *         required: true
 *         description: The new email verification code
 *     responses:
 *       200:
 *         description: Email change request found
 *       404:
 *         description: Email change request not found
 */
router.get('/auth/change-email/:newEmailVerificationCode', async (req, res, next) => {
  const { newEmailVerificationCode } = req.params;
  const { User } = await useMongooseModels();
  const user = await User.findOne({ newEmailVerificationCode });

  if (user) {
    return res.send({
      newEmail: user.newEmail,
      expires: user.newEmailVerificationExpires,
    });
  }

  return res.send(null);
});

/**
 * @swagger
 * /auth/change-email:
 *   delete:
 *     summary: Cancel email change process
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email change process cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: boolean
 */
router.delete('/auth/change-email', async (req, res, next) => {
  try {
    const currentUser = await authCurrentUser(req);

    if (currentUser.newEmail) {
      currentUser.disableEmailUpdate();
      await currentUser.save();
      return res.send(true);
    }

    return res.send(false);
  }
  catch (err) {
    console.log(err);
    return res.send(false);
  }
});

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Initiate password reset process
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset process initiated successfully
 *       422:
 *         description: Account not found
 */
router.post('/auth/reset-password', async (req, res) => {
  // Rate limiting for password reset requests
  const authBypass = checkTestBypass(req);
  if (!authBypass) {
    await rateLimit(req, { maxRequests: 3, windowMs: 60 * 60 * 1000 }); // 3 attempts per hour
  }

  const { email } = req.body;
  const { User } = await useMongooseModels();
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(422).json({ errors: { email: makeI18nError(I18nError.AccountNotFound, 'email') } });
  }
  // have the password reset expire in 1 hour
  user.enablePasswordReset();
  await user.save();

  // send success response, but don't `return` here so the email can be sent
  const response: { success: boolean; passwordResetCode?: string } = { success: true };
  if (authBypass && user.passwordResetCode) {
    response.passwordResetCode = user.passwordResetCode;
  }
  res.send(response);

  // send password reset code via email
  const mailgunService = await useMailgunService();
  mailgunService.sendUserPasswordResetLink(user.email, user.passwordResetCode, user.settings.locale);
});

/**
 * @swagger
 * /auth/reset-password/{passwordResetCode}/valid:
 *   get:
 *     summary: Check if password reset code is valid
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: passwordResetCode
 *         schema:
 *           type: string
 *         required: true
 *         description: The password reset code
 *     responses:
 *       200:
 *         description: Password reset code validity check
 *         content:
 *           application/json:
 *             schema:
 *               type: boolean
 */
router.get('/auth/reset-password/:passwordResetCode/valid', async (req, res, next) => {
  const { passwordResetCode } = req.params;

  // Look for the user to determine if reset code is valid
  const { User } = await useMongooseModels();
  const user = await User.findOne({ passwordResetCode });
  if (user) {
    return res.send(true);
  }
  else {
    return res.send(false);
  }
});

/**
 * @swagger
 * /auth/reset-password/{passwordResetCode}:
 *   post:
 *     summary: Reset password using reset code
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: passwordResetCode
 *         schema:
 *           type: string
 *         required: true
 *         description: The password reset code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *         headers:
 *           Set-Cookie:
 *             description: |
 *               Authentication cookie containing the JWT token.
 *               - Cookie name: `auth_token`
 *               - HttpOnly: true
 *               - Secure: true (in production)
 *               - Max-Age: 2592000 seconds (30 days)
 *             schema:
 *               type: string
 *               example: auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; Max-Age=2592000
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token for authentication
 *       400:
 *         description: Password reset link expired
 *       404:
 *         description: Password reset code not found
 */
router.post('/auth/reset-password/:passwordResetCode', async (req, res, next) => {
  const { passwordResetCode } = req.params;
  const { newPassword } = req.body;

  // Find the user (if not found, error)
  const { User } = await useMongooseModels();
  const user = await User.findOne({ passwordResetCode });
  if (!user) {
    return res.sendStatus(404);
  }

  // Ensure the password reset is not expired
  if (!user.verifyPasswordResetCode(passwordResetCode)) {
    return res.status(status.BAD_REQUEST).send({
      errors: { _form: makeI18nError(I18nError.PasswordResetLinkExpired, '_form') },
    });
  }

  // Set new password and disable the password reset link
  try {
    user.password = newPassword;
    user.disablePasswordReset();
    await user.save();
  }
  catch (err) {
    // Any 'password' validation errors should be seen on the 'newPassword' field
    if (err.name === 'ValidationError' && err.errors.password) {
      err.errors.newPassword = err.errors.password;
    }
    return next(err);
  }
  // Send a JWT back for auto-login
  const token = user.generateJWT();
  setAuthTokenCookie(res, token);
  res.json({ token });
});

/**
 * @swagger
 * /auth/change-email/{newEmailVerificationCode}:
 *   post:
 *     summary: Complete email change process using verification code
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: newEmailVerificationCode
 *         schema:
 *           type: string
 *         required: true
 *         description: The new email verification code
 *     responses:
 *       200:
 *         description: Email change completed successfully
 *         headers:
 *           Set-Cookie:
 *             description: |
 *               Authentication cookie containing the JWT token.
 *               - Cookie name: `auth_token`
 *               - HttpOnly: true
 *               - Secure: true (in production)
 *               - Max-Age: 2592000 seconds (30 days)
 *             schema:
 *               type: string
 *               example: auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; Max-Age=2592000
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token for authentication
 *       404:
 *         description: Email verification code not found
 *       422:
 *         description: Email already in use
 */
router.post('/auth/change-email/:newEmailVerificationCode', async (req, res, next) => {
  const { newEmailVerificationCode } = req.params;
  // Find the user (if not found, error)
  const { User } = await useMongooseModels();
  const user = await User.findOne({ newEmailVerificationCode });
  if (!user) {
    return res.sendStatus(404);
  }

  // Verify the code and check expiration
  if (!user.verifyNewEmailVerificationCode(newEmailVerificationCode)) {
    return res.status(400).json({
      error: makeI18nError(I18nError.VerificationCodeExpired),
    });
  }

  const { newEmail } = user;

  // Ensure the new email isn't in use by another user.
  // This would be an unlikely situation, but is still technically possible.
  // We validate at this point to ensure the owner of a given email address
  // will not lose control of that email address because another user
  // happened to request to change their email to that address first.
  const existingUserWithEmail = await User.findOne({ email: newEmail });
  if (existingUserWithEmail) {
    return res.status(422).json({ error: makeI18nError(I18nError.EmailInUse) });
  }

  // Keep track of the user's current (now old) email address.
  // Mark the user's email as verified by setting the verification code to null.
  user.oldEmails.push(user.email);
  user.email = newEmail as string;
  user.newEmail = null;
  user.newEmailVerificationCode = '';
  user.newEmailVerificationExpires = new Date(0);
  await user.save();

  // Send a JWT back for auto-login
  const token = user.generateJWT();
  setAuthTokenCookie(res, token);
  res.json({ token });
});

export default router;
