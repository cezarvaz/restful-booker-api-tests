const authClient = require('../../helpers/authClient');
const bookingClient = require('../../helpers/bookingClient');
const CleanupRegistry = require('../../helpers/cleanupRegistry');
const { buildBooking } = require('../../factories/bookingFactory');
const { expectNotFound } = require('../../helpers/knownQuirks');
const bookingSchema = require('../../schemas/booking/bookingSchema');
const bookingIdListSchema = require('../../schemas/booking/bookingIdListSchema');
const bookingCreatedSchema = require('../../schemas/booking/bookingCreatedSchema');
const {
  expectJsonSchemaResponse,
} = require('../../helpers/responseAssertions');

describe('Booking Workflow', () => {
  const cleanup = new CleanupRegistry();
  let authToken;

  async function listBookingIdsByFirstname(firstname, attempts = 4) {
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      const response = await bookingClient.listBookings({ firstname });

      expectJsonSchemaResponse(response, 200, bookingIdListSchema);

      const ids = response.body.map(({ bookingid }) => bookingid);

      if (ids.length > 0 || attempt === attempts) {
        return ids;
      }

      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    return [];
  }

  beforeAll(async () => {
    authToken = await authClient.getToken();
  });

  afterAll(async () => {
    await cleanup.cleanup(bookingClient, authToken);
  });

  test('runs create to get to update to patch to delete as a full workflow', async () => {
    const createPayload = buildBooking({
      firstname: 'Workflow',
      lastname: 'Original',
    });
    const createResponse = await bookingClient.createBooking(createPayload);
    const bookingId = createResponse.body.bookingid;

    expectJsonSchemaResponse(createResponse, 200, bookingCreatedSchema);
    cleanup.trackBooking(bookingId);

    const getResponse = await bookingClient.getBooking(bookingId);
    expectJsonSchemaResponse(getResponse, 200, bookingSchema);
    expect(getResponse.body.firstname).toBe('Workflow');

    const updateResponse = await bookingClient.updateBooking(
      bookingId,
      buildBooking({
        firstname: 'Workflow',
        lastname: 'Updated',
        totalprice: 999,
        depositpaid: false,
        bookingdates: {
          checkin: '2026-09-01',
          checkout: '2026-09-12',
        },
        additionalneeds: 'Dinner',
      }),
      { token: authToken },
    );

    expectJsonSchemaResponse(updateResponse, 200, bookingSchema);
    expect(updateResponse.body.lastname).toBe('Updated');

    const patchResponse = await bookingClient.patchBooking(
      bookingId,
      { firstname: 'WorkflowPatched' },
      { token: authToken },
    );

    expectJsonSchemaResponse(patchResponse, 200, bookingSchema);
    expect(patchResponse.body.firstname).toBe('WorkflowPatched');
    expect(patchResponse.body.lastname).toBe('Updated');

    const deleteResponse = await bookingClient.deleteBookingRobust(bookingId, {
      token: authToken,
    });

    expect(deleteResponse.status).toBe(201);
    cleanup.untrackBooking(bookingId);

    const afterDeleteResponse = await bookingClient.getBooking(bookingId);
    expectNotFound(afterDeleteResponse);
  });

  test('updates a booking with basic auth as an alternative auth mode', async () => {
    const createResponse = await bookingClient.createBooking(buildBooking());
    const bookingId = createResponse.body.bookingid;
    expectJsonSchemaResponse(createResponse, 200, bookingCreatedSchema);
    cleanup.trackBooking(bookingId);

    const patchResponse = await bookingClient.patchBooking(
      bookingId,
      { firstname: 'BasicAuthPatched' },
      { useBasicAuth: true },
    );

    expectJsonSchemaResponse(patchResponse, 200, bookingSchema);
    expect(patchResponse.body.firstname).toBe('BasicAuthPatched');

    const deleteResponse = await bookingClient.deleteBookingRobust(bookingId, {
      token: authToken,
    });

    expect(deleteResponse.status).toBe(201);
    cleanup.untrackBooking(bookingId);
  });

  test('makes a created booking discoverable through stable firstname filtering', async () => {
    const firstname = `WorkflowFilterable-${Date.now()}`;
    const createResponse = await bookingClient.createBooking(
      buildBooking({
        firstname,
      }),
    );
    const bookingId = createResponse.body.bookingid;
    expectJsonSchemaResponse(createResponse, 200, bookingCreatedSchema);
    cleanup.trackBooking(bookingId);

    const bookingIds = await listBookingIdsByFirstname(firstname);
    expect(bookingIds).toContain(bookingId);

    const deleteResponse = await bookingClient.deleteBookingRobust(bookingId, {
      token: authToken,
    });

    expect(deleteResponse.status).toBe(201);
    cleanup.untrackBooking(bookingId);
  });
});
