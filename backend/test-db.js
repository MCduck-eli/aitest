const { Client } = require('pg');

const client = new Client({
    user: process.env.DB_USER || 'eldorabdukhalikov',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'aitest_db',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '5432'),
});

client.connect()
    .then(() => {
        console.log('✅ Successfully connected to database');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Connection error details:');
        console.error('Message:', err.message);
        console.error('Code:', err.code);
        console.error('Stack:', err.stack);
        process.exit(1);
    });
