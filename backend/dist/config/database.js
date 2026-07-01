"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.getClient = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = new pg_1.Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'aitest_db',
});
pool.on('error', (err) => {
    console.error('❌ Database pool error:', err);
});
const getClient = async () => {
    return pool.connect();
};
exports.getClient = getClient;
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log(`✅ Query executed in ${duration}ms`);
        return result;
    }
    catch (error) {
        console.error('❌ Query error:', error);
        throw error;
    }
};
exports.query = query;
exports.default = pool;
