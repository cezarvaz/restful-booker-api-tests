const supertest = require('supertest');
const env = require('./env');

module.exports = supertest(env.bookerBaseUrl);
