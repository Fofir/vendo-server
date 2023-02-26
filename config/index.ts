export interface AppProcessEnv extends NodeJS.ProcessEnv {
  HOST: string;
  PORT: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  COOKIE_NAME: string;
  COOKIE_PASSWORD: string;
  ALLOWED_ORIGIN: string;
}

const env = process.env as AppProcessEnv;

interface AppConfig {
  [index: string]: any;
  host: string;
  port: number;
  db: string;
  jwtSecret: string;
  httpsOnly: boolean;
  debug: boolean;
  isLoggingActive: boolean;
  cookieName: string;
  cookiePassword: string;
  isCookieSecure: boolean;
  isCookieSameSite: boolean;
  allowedOrigin: string;
}

const baseConfig = {
  db: env.DATABASE_URL,
  jwtSecret: env.JWT_SECRET,
  cookieName: env.COOKIE_NAME,
  cookiePassword: env.COOKIE_PASSWORD,
  host: env.HOST || "0.0.0.0",
  allowedOrigin: env.ALLOWED_ORIGIN,
};

const envToConfigMap: { [index: string]: AppConfig } = {
  development: {
    ...baseConfig,
    port: parseInt(env.PORT, 10) || 8000,
    httpsOnly: false,
    debug: true,
    isLoggingActive: false,
    isCookieSecure: false,
    isCookieSameSite: false,
  },
  test: {
    ...baseConfig,
    host: "localhost",
    port: 8081,
    httpsOnly: false,
    debug: true,
    isLoggingActive: false,
    isCookieSecure: false,
    isCookieSameSite: false,
  },
  staging: {
    ...baseConfig,
    port: parseInt(env.PORT, 10) || 8000,
    httpsOnly: true,
    debug: false,
    isLoggingActive: true,
    isCookieSecure: true,
    isCookieSameSite: false,
  },
  production: {
    ...baseConfig,
    port: parseInt(env.PORT, 10),
    httpsOnly: true,
    debug: false,
    isLoggingActive: true,
    isCookieSecure: true,
    isCookieSameSite: false,
  },
};

export const nodeEnv = process.env.NODE_ENV as
  | "production"
  | "test"
  | "development"
  | "staging";

export default envToConfigMap[nodeEnv || "development"];
