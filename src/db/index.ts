import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config({
  path: './.env',
});

export const DbConnection = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +String(process.env.DB_PORT) || 5432, // default port of postgres
  username: process.env.DB_USERNAME, // our created username, you can have your own user name
  password: String(process.env.DB_PASSWORD), // our created username, you can have your own password
  database: process.env.DB_DATABASE, // our created database name, you can have your own
  entities: [],
  synchronize: true,
  logging: false,
  ssl: {
    rejectUnauthorized: false,
  },
});
