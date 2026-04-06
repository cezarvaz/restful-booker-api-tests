const authClient = require('../../helpers/authClient');
const bookingClient = require('../../helpers/bookingClient');
const { buildBooking } = require('../../factories/bookingFactory');
const { useAuthenticatedSuite } = require('../../helpers/authenticatedSuite');
const authFailureSchema = require('../../schemas/auth/authFailureSchema');
const bookingCreatedSchema = require('../../schemas/booking/bookingCreatedSchema');
const {
  expectJsonResponse,
  expectJsonSchemaResponse,
} = require('../../helpers/responseAssertions');

describe('Booking Negative Cases', () => {
  const { trackBooking } = useAuthenticatedSuite();

  test('rejects update without auth', async () => {
    const createResponse = await bookingClient.createBooking(buildBooking());
    expectJsonSchemaResponse(createResponse, 200, bookingCreatedSchema);
    trackBooking(createResponse.body.bookingid);

    const updateResponse = await bookingClient.updateBooking(
      createResponse.body.bookingid,
      buildBooking({ firstname: 'Unauthorized' }),
    );

    expect(updateResponse.status).toBe(403);
  });

  test('rejects patch without auth', async () => {
    const createResponse = await bookingClient.createBooking(buildBooking());
    expectJsonSchemaResponse(createResponse, 200, bookingCreatedSchema);
    trackBooking(createResponse.body.bookingid);

    const patchResponse = await bookingClient.patchBooking(
      createResponse.body.bookingid,
      { firstname: 'Unauthorized' },
    );

    expect(patchResponse.status).toBe(403);
  });

  test('rejects delete without auth', async () => {
    const createResponse = await bookingClient.createBooking(buildBooking());
    expectJsonSchemaResponse(createResponse, 200, bookingCreatedSchema);
    trackBooking(createResponse.body.bookingid);

    const deleteResponse = await bookingClient.deleteBooking(
      createResponse.body.bookingid,
    );

    expect(deleteResponse.status).toBe(403);
  });

  test('returns bad credentials for invalid auth payload', async () => {
    const response = await authClient.createToken({
      username: 'invalid-user',
      password: 'invalid-password',
    });

    expectJsonSchemaResponse(response, 200, authFailureSchema);
  });

  test('shows weak validation for invalid booking payload types', async () => {
    const response = await bookingClient.createBooking({
      firstname: 'Bad',
      lastname: 'Payload',
      totalprice: 'not-a-number',
      depositpaid: 'not-a-boolean',
      bookingdates: {
        checkin: 'invalid-date',
        checkout: 'invalid-date',
      },
      additionalneeds: 123,
    });

    expectJsonResponse(response, 200);
    expect(response.body.booking.totalprice).toBeNull();
    expect(response.body.booking.bookingdates.checkin).toBe('0NaN-aN-aN');
    expect(() =>
      expectJsonSchemaResponse(response, 200, bookingCreatedSchema),
    ).toThrow();
  });
});
