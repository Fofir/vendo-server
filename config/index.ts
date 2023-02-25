export interface AppProcessEnv extends NodeJS.ProcessEnv {
  HOST: string;
  PORT: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_ACCOUNT_SID: string;
  ROLLBAR_TOKEN?: string;
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
  rollbarToken?: string;
  isRollbarEnabled: boolean;
  cookieName: string;
  cookiePassword: string;
  isCookieSecure: boolean;
  isCookieSameSite: boolean;
  allowedOrigin: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioMessagingServiceSid: string;
  isTwilioEnabled: boolean;
}

const baseConfig = {
  db: env.DATABASE_URL,
  jwtSecret: env.JWT_SECRET,
  twilioAccountSid: env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: env.TWILIO_AUTH_TOKEN,
  rollbarToken: env.ROLLBAR_TOKEN,
  cookieName: env.COOKIE_NAME,
  cookiePassword: env.COOKIE_PASSWORD,
  host: env.HOST || "0.0.0.0",
  isRollbarEnabled: false,
  allowedOrigin: env.ALLOWED_ORIGIN,
  twilioMessagingServiceSid: "MG9fbed01501e70b8bf3f27c92ea1d8b96",
  isTwilioEnabled: false,
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
    isRollbarEnabled: true,
    isCookieSecure: true,
    isCookieSameSite: false,
    isTwilioEnabled: true,
  },
  production: {
    ...baseConfig,
    port: parseInt(env.PORT, 10),
    httpsOnly: true,
    debug: false,
    isLoggingActive: true,
    isRollbarEnabled: true,
    isCookieSecure: true,
    isCookieSameSite: false,
    isTwilioEnabled: true,
  },
};

export const nodeEnv = process.env.NODE_ENV as
  | "production"
  | "test"
  | "development"
  | "staging";

export default envToConfigMap[nodeEnv || "development"];
