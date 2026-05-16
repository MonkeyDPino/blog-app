export interface Env {
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_DB: string;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  JWT_SECRET: string;
  JWT_ISSUER: string;
  JWT_AUDIENCE: string;
  JWT_REFRESH_SECRET: string;
  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;
  THROTTLE_TTL: number;
  THROTTLE_LIMIT: number;
  FRONTEND_URL: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
}
