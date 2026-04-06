const authClient = require('../../helpers/authClient');
const bookingClient = require('../../helpers/bookingClient');
const CleanupRegistry = require('../../helpers/cleanupRegistry');
const { buildBooking } = require('../../factories/bookingFactory');
const bookingSchema = require('../../schemas/booking/bookingSchema');
const bookingCreatedSchema = require('../../schemas/booking/bookingCreatedSchema');
const {
  expectJsonSchemaResponse,
} = require('../../helpers/responseAssertions');

describe('Booking Concurrency', () => {
  const cleanup = new CleanupRegistry();
  let authToken;

  beforeAll(async () => {
    authToken = await authClient.getToken();
  });

  afterAll(async () => {
    await cleanup.cleanup(bookingClient, authToken);
  });

  test('creates multiple bookings concurrently with unique data', async () => {
    const payloads = [
      buildBooking({ firstname: 'ConcurrentA' }),
      buildBooking({ firstname: 'ConcurrentB' }),
      buildBooking({ firstname: 'ConcurrentC' }),
    ];

    const responses = await Promise.all(
      payloads.map((payload) => bookingClient.createBooking(payload)),
    );

    responses.forEach((response, index) => {
      expectJsonSchemaResponse(response, 200, bookingCreatedSchema);
      cleanup.trackBooking(response.body.bookingid);
      expect(response.body.booking.firstname).toBe(payloads[index].firstname);
    });

    const ids = responses.map((response) => response.body.bookingid);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('updates separate bookings concurrently without cross-contamination', async () => {
    const [firstCreate, secondCreate] = await Promise.all([
      bookingClient.createBooking(buildBooking({ firstname: 'ParallelOne' })),
      bookingClient.createBooking(buildBooking({ firstname: 'ParallelTwo' })),
    ]);

    cleanup.trackBooking(firstCreate.body.bookingid);
    cleanup.trackBooking(secondCreate.body.bookingid);
    expectJsonSchemaResponse(firstCreate, 200, bookingCreatedSchema);
    expectJsonSchemaResponse(secondCreate, 200, bookingCreatedSchema);

    const [firstUpdate, secondUpdate] = await Promise.all([
      bookingClient.patchBooking(
        firstCreate.body.bookingid,
        { firstname: 'ParallelOneUpdated' },
        { token: authToken },
      ),
      bookingClient.patchBooking(
        secondCreate.body.bookingid,
        { firstname: 'ParallelTwoUpdated' },
        { token: authToken },
      ),
    ]);

    expectJsonSchemaResponse(firstUpdate, 200, bookingSchema);
    expectJsonSchemaResponse(secondUpdate, 200, bookingSchema);
    expect(firstUpdate.body.firstname).toBe('ParallelOneUpdated');
    expect(secondUpdate.body.firstname).toBe('ParallelTwoUpdated');
  });
});
