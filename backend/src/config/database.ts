import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
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
