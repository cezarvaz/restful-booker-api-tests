const request = require('../config/request');
const env = require('../config/env');
const validateSchema = require('./validateSchema');
const authSchema = require('../schemas/auth/authTokenSchema');

class AuthClient {
  async createToken(overrides = {}) {
    const payload = {
      username: env.bookerUsername,
      password: env.bookerPassword,
      ...overrides,
    };

    const response = await request
      .post('/auth')
      .set('Accept', 'application/json')
      .send(payload);

    if (response.status === 200 && response.body.token) {
      validateSchema.assert(response.body, authSchema);
    }

    return response;
  }

  async getToken() {
    const response = await this.createToken();

    if (response.status !== 200 || !response.body.token) {
      throw new Error(
        `Unable to create auth token. Status: ${response.status}. Body: ${response.text}`,
      );
    }

    return response.body.token;
  }
}

module.exports = new AuthClient();
