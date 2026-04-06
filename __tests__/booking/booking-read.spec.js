const authClient = require('../../helpers/authClient');
const bookingClient = require('../../helpers/bookingClient');
const CleanupRegistry = require('../../helpers/cleanupRegistry');
const { buildBooking } = require('../../factories/bookingFactory');
const bookingSchema = require('../../schemas/booking/bookingSchema');
const bookingCreatedSchema = require('../../schemas/booking/bookingCreatedSchema');
const { expectNotFound } = require('../../helpers/knownQuirks');
const {
  expectJsonSchemaResponse,
} = require('../../helpers/responseAssertions');

describe('Booking Read Scenarios', () => {
  const cleanup = new CleanupRegistry();
  let authToken;

  beforeAll(async () => {
    authToken = await authClient.getToken();
  });

  afterAll(async () => {
    await cleanup.cleanup(bookingClient, authToken);
  });

  test('retrieves a created booking and matches key fields field-by-field', async () => {
    const payload = buildBooking({
      firstname: 'ReadCheck',
      lastname: 'FieldMatch',
    });
    const createResponse = await bookingClient.createBooking(payload);
    expectJsonSchemaResponse(createResponse, 200, bookingCreatedSchema);
    cleanup.trackBooking(createResponse.body.bookingid);

    const getResponse = await bookingClient.getBooking(createResponse.body.bookingid);

    expectJsonSchemaResponse(getResponse, 200, bookingSchema);
    expect(getResponse.body.firstname).toBe(payload.firstname);
    expect(getResponse.body.lastname).toBe(payload.lastname);
    expect(getResponse.body.totalprice).toBe(payload.totalprice);
    expect(getResponse.body.depositpaid).toBe(payload.depositpaid);
    expect(getResponse.body.bookingdates).toEqual(payload.bookingdates);
  });

  test('returns a not found style response for a nonexistent booking id', async () => {
    const response = await bookingClient.getBooking(999999999);

    expectNotFound(response);
    expect([404, 405]).toContain(response.status);
  });

  test('returns a not found style response for an invalid booking id format', async () => {
    const response = await bookingClient.getBooking('invalid-id');

    expectNotFound(response);
    expect([404, 405]).toContain(response.status);
  });
});
