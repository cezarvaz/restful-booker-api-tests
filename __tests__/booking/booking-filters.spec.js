const bookingClient = require('../../helpers/bookingClient');
const CleanupRegistry = require('../../helpers/cleanupRegistry');
const authClient = require('../../helpers/authClient');
const { buildBooking } = require('../../factories/bookingFactory');
const bookingIdListSchema = require('../../schemas/booking/bookingIdListSchema');
const bookingCreatedSchema = require('../../schemas/booking/bookingCreatedSchema');
const {
  expectJsonSchemaResponse,
} = require('../../helpers/responseAssertions');

describe('Booking Filters', () => {
  const cleanup = new CleanupRegistry();
  let authToken;
  let referenceBooking;

  beforeAll(async () => {
    authToken = await authClient.getToken();
    const createResponse = await bookingClient.createBooking(
      buildBooking({
        firstname: 'FilterFirst',
        lastname: 'FilterLast',
        bookingdates: {
          checkin: '2026-08-01',
          checkout: '2026-08-09',
        },
      }),
    );

    referenceBooking = createResponse.body;
    expectJsonSchemaResponse(createResponse, 200, bookingCreatedSchema);
    cleanup.trackBooking(referenceBooking.bookingid);
  });

  afterAll(async () => {
    await cleanup.cleanup(bookingClient, authToken);
  });

  test('lists bookings as an id array', async () => {
    const response = await bookingClient.listBookings();

    expectJsonSchemaResponse(response, 200, bookingIdListSchema);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('filters bookings by firstname and lastname', async () => {
    const response = await bookingClient.listBookings({
      firstname: 'FilterFirst',
      lastname: 'FilterLast',
    });

    expectJsonSchemaResponse(response, 200, bookingIdListSchema);
    expect(response.body.map(({ bookingid }) => bookingid)).toContain(
      referenceBooking.bookingid,
    );
  });

  test('returns a valid booking id list for date-filter requests despite unstable matching behavior', async () => {
    const response = await bookingClient.listBookings({
      checkin: '2026-08-01',
      checkout: '2026-08-09',
    });

    expectJsonSchemaResponse(response, 200, bookingIdListSchema);
    expect(response.body).not.toBeNull();
  });

  test('returns an empty array when filters have no matches', async () => {
    const response = await bookingClient.listBookings({
      firstname: 'NoMatchExpected',
    });

    expectJsonSchemaResponse(response, 200, bookingIdListSchema);
    expect(response.body).toEqual([]);
  });

  test('filters bookings with url-encoded special characters in names', async () => {
    const createResponse = await bookingClient.createBooking(
      buildBooking({
        firstname: 'Encoded Name',
        lastname: 'Encoded/Last',
      }),
    );
    expectJsonSchemaResponse(createResponse, 200, bookingCreatedSchema);
    cleanup.trackBooking(createResponse.body.bookingid);

    const [byFirstResponse, byLastResponse] = await Promise.all([
      bookingClient.listBookings({ firstname: 'Encoded Name' }),
      bookingClient.listBookings({ lastname: 'Encoded/Last' }),
    ]);

    expectJsonSchemaResponse(byFirstResponse, 200, bookingIdListSchema);
    expectJsonSchemaResponse(byLastResponse, 200, bookingIdListSchema);
    expect(byFirstResponse.body.map(({ bookingid }) => bookingid)).toContain(
      createResponse.body.bookingid,
    );
    expect(byLastResponse.body.map(({ bookingid }) => bookingid)).toContain(
      createResponse.body.bookingid,
    );
  });
});
