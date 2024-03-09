import { NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';
import { QueryFailedError } from 'typeorm';
import winston from 'winston';

import { CODE } from '../@types/status';
import { ApiError } from './ApiError';
import { Regex } from '../constants/regex';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log' }),
  ],
});

export const errorHandler = (
  error: (MulterError | Partial<Error>) & { status: string; code: CODE },
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let err = { ...error };
  err.message = error.message;
  err.status = 'Failed';

  if (!err.code) err.code = 500;
  if (process.env.NODE_ENV === 'dev') console.log(error);

  if (error instanceof QueryFailedError) {
    // Duplicated key Code 23505
    if (error.driverError.code === '23505') {
      const [_, key, value] = error.driverError.detail.match(
        Regex.duplicateKey,
      );
      const message = `${(key as string).toTitleCase()} of ${value} already exists.`;
      err = ApiError.duplicateField(message);
    } else {
      if (process.env.NODE_ENV === 'prod') {
        err = {
          status: 'Failed',
          code: 500,
          message: 'Something went wrong on server. Please try again.',
        };
      } else
        err = {
          ...err,
          code: 500,
          name: err.name,
          message: 'Query Failed Error',
        };
    }
  }

  if (error instanceof MulterError) {
    if (process.env.NODE_ENV === 'prod') {
      err = {
        status: 'Failed',
        code: 500,
        message: 'Something went wrong on server. Please try again.',
      };
    } else
      err = {
        ...err,
        code: 500,
        message: 'Multer Error',
      };
  }

  if (process.env.NODE_ENV === 'prod') {
    // Set a error log.
    logger.info(
      `Received a ${req.method} request for ${
        req.url
      } info ${req.rawHeaders.join()}`,
    );

    //TODO: In DB, we can save the error log.
  }
  return res.status(err.code).json(err);
};
