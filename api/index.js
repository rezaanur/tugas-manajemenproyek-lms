// Vercel Serverless Function entry point for EduSmart LMS Express API
const app = require('../backend/dist/server.js').default || require('../backend/dist/server.js');

module.exports = app;
