const authClient = require('../../helpers/authClient');
const bookingClient = require('../../helpers/bookingClient');
const { buildBooking } = require('../../factories/bookingFactory');
const { expectNotFound } = require('../../helpers/knownQuirks');
const bookingCreatedSchema = require('../../schemas/booking/bookingCreatedSchema');
const {
  expectJsonSchemaResponse,
} = require('../../helpers/responseAssertions');

describe('Booking Delete Edge Cases', () => {
  let authToken;

  beforeAll(async () => {
    authToken = await authClient.getToken();
  });

  test('deletes a booking with basic auth', async () => {
    const createResponse = await bookingClient.createBooking(buildBooking());
    const bookingId = createResponse.body.bookingid;
    expectJsonSchemaResponse(createResponse, 200, bookingCreatedSchema);

    const deleteResponse = await bookingClient.deleteBookingRobust(bookingId, {
      useBasicAuth: true,
    });

    expect(deleteResponse.status).toBe(201);
    expectNotFound(await bookingClient.getBooking(bookingId));
  });

  test('returns a not found style response when deleting a nonexistent booking', async () => {
    const deleteResponse = await bookingClient.deleteBookingRobust(999999999, {
      token: authToken,
    });

    expectNotFound(deleteResponse);
    expect([404, 405]).toContain(deleteResponse.status);
  });

  test('does not treat a second delete as a successful repeat operation', async () => {
    const createResponse = await bookingClient.createBooking(buildBooking());
    const bookingId = createResponse.body.bookingid;
    expectJsonSchemaResponse(createResponse, 200, bookingCreatedSchema);

    const firstDelete = await bookingClient.deleteBookingRobust(bookingId, {
      token: authToken,
    });
    const secondDelete = await bookingClient.deleteBookingRobust(bookingId, {
      token: authToken,
    });

    expect(firstDelete.status).toBe(201);
    expectNotFound(secondDelete);
  });
});
