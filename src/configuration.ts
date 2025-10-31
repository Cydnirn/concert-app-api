export default () => ({
  NODE_ENV: process.env.NODE_ENV,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_HOST: process.env.DB_HOST,
  DATABASE_URL:
    process.env.DATABASE_URL ??
    `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:5432/${process.env.DB_NAME}?sslmode=${process.env.NODE_ENV === 'production' ? 'require' : 'disable'}`,
  FILE_DIRECTORY: process.env.FILE_DIRECTORY,
  DATABASE_SSL_CA: process.env.DATABASE_SSL_CA,
});
