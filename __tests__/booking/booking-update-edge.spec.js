const authClient = require('../../helpers/authClient');
const bookingClient = require('../../helpers/bookingClient');
const CleanupRegistry = require('../../helpers/cleanupRegistry');
const { buildBooking } = require('../../factories/bookingFactory');
const bookingSchema = require('../../schemas/booking/bookingSchema');
const bookingCreatedSchema = require('../../schemas/booking/bookingCreatedSchema');
const { expectNotFound } = require('../../helpers/knownQuirks');
const {
  expectJsonSchemaResponse,
  expectPlainTextResponse,
} = require('../../helpers/responseAssertions');

describe('Booking Update Edge Cases', () => {
  const cleanup = new CleanupRegistry();
  let authToken;

  beforeAll(async () => {
    authToken = await authClient.getToken();
  });

  afterAll(async () => {
    await cleanup.cleanup(bookingClient, authToken);
  });

  test('updates a booking with basic auth using PUT', async () => {
    const createResponse = await bookingClient.createBooking(buildBooking());
    expectJsonSchemaResponse(createResponse, 200, bookingCreatedSchema);
    cleanup.trackBooking(createResponse.body.bookingid);

    const updateResponse = await bookingClient.updateBooking(
      createResponse.body.bookingid,
      buildBooking({
        firstname: 'BasicPut',
        lastname: 'Updated',
      }),
      { useBasicAuth: true },
    );

    expectJsonSchemaResponse(updateResponse, 200, bookingSchema);
    expect(updateResponse.body.firstname).toBe('BasicPut');
  });

  test('returns a not found style response when updating a nonexistent booking', async () => {
    const updateResponse = await bookingClient.updateBooking(
      999999999,
      buildBooking(),
      { token: authToken },
    );

    expectNotFound(updateResponse);
    expect([404, 405]).toContain(updateResponse.status);
  });

  test('returns a not found style response when patching a nonexistent booking', async () => {
    const patchResponse = await bookingClient.patchBooking(
      999999999,
      { firstname: 'Ghost' },
      { token: authToken },
    );

    expectNotFound(patchResponse);
    expect([404, 405]).toContain(patchResponse.status);
  });

  test('rejects partial put payloads with a bad request response', async () => {
    const createResponse = await bookingClient.createBooking(buildBooking());
    expectJsonSchemaResponse(createResponse, 200, bookingCreatedSchema);
    cleanup.trackBooking(createResponse.body.bookingid);

    const updateResponse = await bookingClient.updateBooking(
      createResponse.body.bookingid,
      { firstname: 'PartialPutOnly' },
      { token: authToken },
    );

    expectPlainTextResponse(updateResponse, 400, 'Bad Request');
  });
});
