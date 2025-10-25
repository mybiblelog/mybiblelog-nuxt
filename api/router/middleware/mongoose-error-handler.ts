import { type Request, type Response, type NextFunction } from 'express';
import { I18nError, makeI18nError } from '../helpers/i18n-error';
import { Error } from 'mongoose';

// Maps mongoose validation errors to i18n keys
const MongooseErrorKinds = {
  REQUIRED: 'required',
  NOT_VALID: 'is invalid',
  UNIQUE: 'unique',
  MIN_LENGTH: 'minlength',
  MAX_LENGTH: 'maxlength',
  DEFAULT: Symbol('default'),
};

// A reference for which additional properties are available to help translate specific errors
const ErrorMap = {
  [MongooseErrorKinds.REQUIRED]: I18nError.Required,
  [MongooseErrorKinds.NOT_VALID]: I18nError.NotValid,
  [MongooseErrorKinds.UNIQUE]: I18nError.Unique,
  [MongooseErrorKinds.MIN_LENGTH]: I18nError.MinLength, // err.properties.minlength
  [MongooseErrorKinds.MAX_LENGTH]: I18nError.MaxLength, // err.properties.maxlength
  [MongooseErrorKinds.DEFAULT]: I18nError.Review,
};

const mongooseErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (!(err instanceof Error.ValidationError)) {
    return next(err);
  }
  const errors: Record<string, ReturnType<typeof makeI18nError>> = {};
  for (const field in err.errors) {
    const validatorError = err.errors[field];

    // skip CastError instances
    if (!(validatorError instanceof Error.ValidatorError)) {
      continue;
    }
    const { kind, properties } = validatorError;
    const i18nErrorKind = ErrorMap[kind] || ErrorMap[MongooseErrorKinds.DEFAULT] as string;
    errors[field] = makeI18nError(i18nErrorKind, field, properties);
  }
  return res.status(422).json({ errors });
};

export default mongooseErrorHandler;
