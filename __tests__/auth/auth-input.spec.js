const request = require('../../config/request');
const authClient = require('../../helpers/authClient');
const authFailureSchema = require('../../schemas/auth/authFailureSchema');
const {
  expectJsonSchemaResponse,
  expectPlainTextResponse,
} = require('../../helpers/responseAssertions');

describe('Auth Input Handling', () => {
  test('returns bad credentials when auth fields are missing', async () => {
    const response = await authClient.createToken({
      username: undefined,
      password: undefined,
    });

    expectJsonSchemaResponse(response, 200, authFailureSchema);
    expect(response.body.reason).toBe('Bad credentials');
  });

  test('returns bad credentials when auth fields are empty', async () => {
    const response = await authClient.createToken({
      username: '',
      password: '',
    });

    expectJsonSchemaResponse(response, 200, authFailureSchema);
    expect(response.body.reason).toBe('Bad credentials');
  });

  test('rejects malformed auth json with a plain-text bad request response', async () => {
    const response = await request
      .post('/auth')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send('{');

    expectPlainTextResponse(response, 400, 'Bad Request');
  });
});
