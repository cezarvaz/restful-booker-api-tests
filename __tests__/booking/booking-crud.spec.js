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

describe('Booking CRUD', () => {
  const cleanup = new CleanupRegistry();
  let authToken;

  beforeAll(async () => {
    authToken = await authClient.getToken();
  });

  afterAll(async () => {
    await cleanup.cleanup(bookingClient, authToken);
  });

  test('creates a booking and retrieves it by id', async () => {
    const payload = buildBooking();
    const createResponse = await bookingClient.createBooking(payload);

    expectJsonSchemaResponse(createResponse, 200, bookingCreatedSchema);
    cleanup.trackBooking(createResponse.body.bookingid);
    expect(createResponse.body.booking.firstname).toBe(payload.firstname);

    const getResponse = await bookingClient.getBooking(createResponse.body.bookingid);

    expectJsonSchemaResponse(getResponse, 200, bookingSchema);
    expect(getResponse.body.lastname).toBe(payload.lastname);
  });

  test('updates a booking with PUT using token auth', async () => {
    const createResponse = await bookingClient.createBooking(buildBooking());
    cleanup.trackBooking(createResponse.body.bookingid);

    const replacement = buildBooking({
      firstname: 'Updated',
      lastname: 'Booking',
      totalprice: 345,
      depositpaid: false,
      bookingdates: {
        checkin: '2026-06-01',
        checkout: '2026-06-15',
      },
      additionalneeds: 'Late checkout',
    });

    const updateResponse = await bookingClient.updateBooking(
      createResponse.body.bookingid,
      replacement,
      { token: authToken },
    );

    expectJsonSchemaResponse(updateResponse, 200, bookingSchema);
    expect(updateResponse.body.firstname).toBe('Updated');
    expect(updateResponse.body.depositpaid).toBe(false);
  });

  test('partially updates a booking with PATCH using token auth', async () => {
    const createResponse = await bookingClient.createBooking(buildBooking());
    cleanup.trackBooking(createResponse.body.bookingid);

    const patchResponse = await bookingClient.patchBooking(
      createResponse.body.bookingid,
      {
        firstname: 'Patched',
        bookingdates: {
          checkin: '2026-07-01',
          checkout: '2026-07-20',
        },
      },
      { token: authToken },
    );

    expectJsonSchemaResponse(patchResponse, 200, bookingSchema);
    expect(patchResponse.body.firstname).toBe('Patched');
    expect(patchResponse.body.lastname).toBe(createResponse.body.booking.lastname);
  });

  test('deletes a booking with token auth', async () => {
    const createResponse = await bookingClient.createBooking(buildBooking());
    const bookingId = createResponse.body.bookingid;

    const deleteResponse = await bookingClient.deleteBooking(bookingId, {
      token: authToken,
    });

    expect(deleteResponse.status).toBe(201);

    const getResponse = await bookingClient.getBooking(bookingId);
    expectNotFound(getResponse);
  });
});
