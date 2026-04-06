const authClient = require('../../helpers/authClient');
const authTokenSchema = require('../../schemas/auth/authTokenSchema');
const authFailureSchema = require('../../schemas/auth/authFailureSchema');
const { expectJsonSchemaResponse } = require('../../helpers/responseAssertions');

describe('Auth', () => {
  test('creates a token with valid credentials', async () => {
    const response = await authClient.createToken();

    expectJsonSchemaResponse(response, 200, authTokenSchema);
  });

  test('returns bad credentials for invalid credentials', async () => {
    const response = await authClient.createToken({
      password: 'wrong-password',
    });

    expectJsonSchemaResponse(response, 200, authFailureSchema);
    expect(response.body.reason).toBe('Bad credentials');
  });
});
