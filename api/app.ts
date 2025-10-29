import createError from 'http-errors';
import express from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import errorhandler from 'errorhandler';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import config from './config';
import apiRouter from './router/router';
import mongooseErrorHandler from './router/middleware/mongoose-error-handler';

const isProduction = config.nodeEnv === 'production';
const isTesting = config.nodeEnv === 'test';

const buildApp = (): express.Application => {
  const app = express();

  app.use(compression());

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Disable COEP to avoid issues with external resources
  }));

  // Configure CORS to only allow specific origins
  const corsOptions = {
    origin(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) { return callback(null, true); }

      // Allow the configured site URL
      if (origin === config.siteUrl) {
        return callback(null, true);
      }

      // In development, allow localhost with any port
      if (!isProduction && origin && origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }

      // In development, also allow 127.0.0.1 with any port
      if (!isProduction && origin && origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200,
  };
  app.use(cors(corsOptions));

  app.use(morgan('dev'));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  if (!isProduction) {
    app.use(errorhandler());
  }

  // Trust security claims of proxy in front of app
  app.set('trust proxy', true);

  // Redirect insecure requests
  app.use((req, res, next) => {
    if (
      isProduction &&
      config.siteUrl.includes('https://') &&
      !req.secure &&
      !req.get('host')?.includes('localhost')
    ) {
      console.log('Redirecting API request to HTTPS');
      return res.redirect('https://' + req.headers.host + req.originalUrl);
    }
    next();
  });

  if (!isProduction) {
    // Swagger API Documentation
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Serve Swagger JSON
    app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
  }

  // Router
  app.use('/api', apiRouter);

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    next(createError(404));
  });

  // Handle recognized Mongoose errors
  app.use(mongooseErrorHandler);

  // apiRouter error handler
  // will not leak stacktrace to user in production
  const apiRouterErrorHandler = (err, req, res, next) => {
    if (!isProduction && !isTesting) {
      console.log(err.stack);
    }

    res
      .status(err.status || 500)
      .json({
        errors: {
          message: err.message,
          error: isProduction ? {} : err,
        },
      });
  };

  app.use(apiRouterErrorHandler);

  return app;
};

// Export the server middleware
export default buildApp;
