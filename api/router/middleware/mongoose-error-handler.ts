import { type Request, type Response, type NextFunction } from 'express';
import { ApiErrorCode, ApiErrorDetailCode } from '../errors/error-codes';
import { Error } from 'mongoose';
import { ApiErrorDetail, ApiError, ApiResponse } from '../response';
import { ValidationError } from 'router/errors/validation-errors';

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
  [MongooseErrorKinds.REQUIRED]: ApiErrorDetailCode.Required,
  [MongooseErrorKinds.NOT_VALID]: ApiErrorDetailCode.NotValid,
  [MongooseErrorKinds.UNIQUE]: ApiErrorDetailCode.Unique,
  [MongooseErrorKinds.MIN_LENGTH]: ApiErrorDetailCode.MinLength, // err.properties.minlength
  [MongooseErrorKinds.MAX_LENGTH]: ApiErrorDetailCode.MaxLength, // err.properties.maxlength
  [MongooseErrorKinds.DEFAULT]: ApiErrorDetailCode.Review,
};

// A reference for which error detail properties from Mongoose will be included in the API error response
const ErrorPropertiesMap = {
  [MongooseErrorKinds.REQUIRED]: [],
  [MongooseErrorKinds.NOT_VALID]: [],
  [MongooseErrorKinds.UNIQUE]: [],
  [MongooseErrorKinds.MIN_LENGTH]: ['minlength'],
  [MongooseErrorKinds.MAX_LENGTH]: ['maxlength'],
  [MongooseErrorKinds.DEFAULT]: [],
}

const mongooseErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (!(err instanceof Error.ValidationError)) {
    return next(err);
  }

  const errors: ApiErrorDetail[] = [];
  for (const field in err.errors) {
    const validatorError = err.errors[field];

    // skip CastError instances
    if (!(validatorError instanceof Error.ValidatorError)) {
      continue;
    }
    const { kind, properties: mongooseErrorProperties } = validatorError;
    const errorCode = ErrorMap[kind] || ErrorMap[MongooseErrorKinds.DEFAULT] as string;

    // Map Mongoose error properties to API error properties,
    // ensuring only relevant properties are included.
    const allowedErrorProperties = ErrorPropertiesMap[kind] || [];
    const properties: Record<string, any> = {};
    for (const prop of allowedErrorProperties) {
      properties[prop] = mongooseErrorProperties[prop];
    }

    errors.push({ code: errorCode, field, properties });
  }

  throw new ValidationError(errors);
};

export default mongooseErrorHandler;
