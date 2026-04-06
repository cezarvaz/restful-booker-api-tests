const bookingClient = require('../../helpers/bookingClient');
const { expectPlainTextResponse } = require('../../helpers/responseAssertions');

describe('Smoke', () => {
  test('responds to ping', async () => {
    const response = await bookingClient.ping();

    expectPlainTextResponse(response, 201, 'Created');
  });
});
