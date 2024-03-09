import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from './errors/error-handler';
import { DbConnection } from './db';
import './global';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT;

dotenv.config({
  path: './.env',
});

app.use(
  cors({
    origin: '*',
    methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD', 'DELETE'],
    credentials: true,
  }),
);

if (process.env.NODE_ENV === 'dev') {
  app.use(morgan('dev'));
}

app.use('/working', (_req: Request, res: Response) => {
  return res.json({
    status: 'OK',
    message: 'Server is running sucessfully.',
    // Please Update this date when you update the server.
    updated: 'Dec 1 2023 1pm',
    ...(process.env.NODE_ENV === 'dev' && {
      // Please Update this date when you update the server.
      latestChanges: 'Added pagination',
    }),
  });
});

app.use(errorHandler);

DbConnection.initialize()
  .then(async () => {
    app.listen(PORT, () =>
      console.log(`Server Running at: http://localhost:${PORT}`),
    );
  })
  .catch((e: unknown) => console.error(e));
