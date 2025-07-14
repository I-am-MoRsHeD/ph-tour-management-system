import dotenv from 'dotenv';

dotenv.config();

interface EnvVars {
    PORT: string;
    DB_URL: string;
    NODE_ENV: 'development' | 'production';
};

const requiredEnvVariables: string[] = ['PORT', 'DB_URL', 'NODE_ENV'];

const loadEnvVariables = (): EnvVars => {
    requiredEnvVariables.forEach((envVar) => {
        if (!process.env[envVar]) {
            throw new Error(`Missing environment variable ${envVar}`);
        };
    });
    return {
        PORT: process.env.PORT as string,
        DB_URL: process.env.DB_URL as string,
        NODE_ENV: process.env.NODE_ENV as 'development' | 'production'
    }
}

export const envVars = loadEnvVariables()