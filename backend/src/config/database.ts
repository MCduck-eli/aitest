import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'aitest_db',
});

pool.on('error', (err: Error) => {
    console.error('❌ Database pool error:', err);
});

export const getClient = async (): Promise<PoolClient> => {
    return pool.connect();
};

export const query = async (text: string, params?: any[]): Promise<any> => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log(`✅ Query executed in ${duration}ms`);
        return result;
    } catch (error) {
        console.error('❌ Query error:', error);
        throw error;
    }
};

export default pool;
