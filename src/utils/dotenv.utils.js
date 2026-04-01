import dotenv from 'dotenv'

dotenv.config({
 path: './.env'
})

const env = Object.freeze({
  PORT: process.env.PORT,
  DB_DATABASE: process.env.DB_DATABASE,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_TYPE: process.env.DB_TYPE,
  CREATED_BY_DEFAULT: process.env.CREATED_BY_DEFAULT,
  UPDATED_BY_DEFAULT: process.env.UPDATED_BY_DEFAULT,
})

export default env
