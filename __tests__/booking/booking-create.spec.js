const authClient = require('../../helpers/authClient');
const bookingClient = require('../../helpers/bookingClient');
const CleanupRegistry = require('../../helpers/cleanupRegistry');
const { buildBooking } = require('../../factories/bookingFactory');
const bookingCreatedSchema = require('../../schemas/booking/bookingCreatedSchema');
const {
  expectJsonResponse,
  expectJsonSchemaResponse,
} = require('../../helpers/responseAssertions');

describe('Booking Create Variants', () => {
  const cleanup = new CleanupRegistry();
  let authToken;

  beforeAll(async () => {
    authToken = await authClient.getToken();
  });

  afterAll(async () => {
    await cleanup.cleanup(bookingClient, authToken);
  });

  test('creates a booking without additional needs', async () => {
    const response = await bookingClient.createBooking(
      buildBooking({ additionalneeds: undefined }),
    );

    expectJsonSchemaResponse(response, 200, bookingCreatedSchema);
    cleanup.trackBooking(response.body.bookingid);
    expect(response.body.booking).not.toHaveProperty('additionalneeds');
  });

  test('creates a booking with deposit paid set to false', async () => {
    const response = await bookingClient.createBooking(
      buildBooking({ depositpaid: false }),
    );

    expectJsonSchemaResponse(response, 200, bookingCreatedSchema);
    cleanup.trackBooking(response.body.bookingid);
    expect(response.body.booking.depositpaid).toBe(false);
  });

  test('creates a booking with long and special-character names', async () => {
    const response = await bookingClient.createBooking(
      buildBooking({
        firstname: 'Ana-Maria da Silva QA Specialist',
        lastname: "O'Connor / Test",
      }),
    );

    expectJsonSchemaResponse(response, 200, bookingCreatedSchema);
    cleanup.trackBooking(response.body.bookingid);
    expect(response.body.booking.firstname).toContain('QA Specialist');
    expect(response.body.booking.lastname).toContain("O'Connor");
  });

  test('creates a booking with zero total price', async () => {
    const response = await bookingClient.createBooking(
      buildBooking({ totalprice: 0 }),
    );

    expectJsonSchemaResponse(response, 200, bookingCreatedSchema);
    cleanup.trackBooking(response.body.bookingid);
    expect(response.body.booking.totalprice).toBe(0);
  });

  test('accepts a malformed payload and exposes weak validation', async () => {
    const response = await bookingClient.createBooking({
      firstname: 'Weak',
      lastname: 'Validation',
      totalprice: 'free',
      depositpaid: 'yes',
      bookingdates: {
        checkin: 'tomorrow',
        checkout: 'yesterday',
      },
      additionalneeds: null,
    });

    expectJsonResponse(response, 200);
    cleanup.trackBooking(response.body.bookingid);
    expect(response.body.booking.firstname).toBe('Weak');
    expect(response.body.booking.totalprice).toBeNull();
    expect(response.body.booking.depositpaid).toBe(true);
    expect(response.body.booking.bookingdates.checkin).toBe('0NaN-aN-aN');
    expect(() =>
      expectJsonSchemaResponse(response, 200, bookingCreatedSchema),
    ).toThrow();
  });
});
