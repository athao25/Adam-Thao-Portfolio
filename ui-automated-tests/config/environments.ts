import { config } from 'dotenv';
import { resolve } from 'path';

export interface EnvironmentConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  headless: boolean;
}

export type Environment = 'development' | 'staging' | 'production';

/**
 * Load environment variables from the appropriate .env file
 * @param env - The environment to load (development, staging, production)
 */
function loadEnvironmentConfig(env: Environment = 'development'): void {
  const envFile = `.env.${env}`;
  const envPath = resolve(process.cwd(), 'env', envFile);
  
  // Load the specific environment file
  config({ path: envPath });
  
  // Also load the default .env file as fallback
  config({ path: resolve(process.cwd(), 'env', '.env') });
}

/**
 * Get environment configuration from environment variables
 * @param env - The environment to get config for
 * @returns EnvironmentConfig object
 */
export function getEnvironmentConfig(env: Environment = 'development'): EnvironmentConfig {
  // Load environment variables
  loadEnvironmentConfig(env);
  
  return {
    baseUrl: process.env.BASE_URL || 'https://www.saucedemo.com',
    timeout: parseInt(process.env.TIMEOUT || '30000', 10),
    retries: parseInt(process.env.RETRIES || '2', 10),
    headless: process.env.HEADLESS === 'true'
  };
}

/**
 * Get all available environments
 */
export const environments = {
  development: getEnvironmentConfig('development'),
  staging: getEnvironmentConfig('staging'),
  production: getEnvironmentConfig('production')
} as const;