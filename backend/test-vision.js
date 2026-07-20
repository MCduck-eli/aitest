const https = require('https');
require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const options = {
    hostname: 'api.groq.com',
    path: '/openai/v1/models',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        const models = JSON.parse(data);
        console.log("AVAILABLE MODELS:");
        models.data.forEach(m => {
            if (m.id.includes('vision') || m.id.includes('llama')) {
                console.log(m.id);
            }
        });
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
