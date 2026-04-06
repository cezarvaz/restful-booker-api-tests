const bookingClient = require('../../helpers/bookingClient');
const { buildBooking } = require('../../factories/bookingFactory');
const { useAuthenticatedSuite } = require('../../helpers/authenticatedSuite');
const bookingCreatedSchema = require('../../schemas/booking/bookingCreatedSchema');
const bookingSchema = require('../../schemas/booking/bookingSchema');
const bookingIdListSchema = require('../../schemas/booking/bookingIdListSchema');
const {
  expectJsonSchemaResponse,
  expectPlainTextResponse,
} = require('../../helpers/responseAssertions');

describe('Booking Contract And Headers', () => {
  const { trackBooking } = useAuthenticatedSuite();

  test('returns a json envelope when creating a booking', async () => {
    const response = await bookingClient.createBooking(buildBooking());

    expectJsonSchemaResponse(response, 200, bookingCreatedSchema);
    trackBooking(response.body.bookingid);
  });

  test('returns a json booking document when retrieving a booking', async () => {
    const createResponse = await bookingClient.createBooking(buildBooking());
    trackBooking(createResponse.body.bookingid);
    expectJsonSchemaResponse(createResponse, 200, bookingCreatedSchema);

    const getResponse = await bookingClient.getBooking(createResponse.body.bookingid);

    expectJsonSchemaResponse(getResponse, 200, bookingSchema);
  });

  test('returns a json id list when listing bookings', async () => {
    const response = await bookingClient.listBookings();

    expectJsonSchemaResponse(response, 200, bookingIdListSchema);
  });

  test('rejects malformed booking json with a plain-text bad request response', async () => {
    const response = await bookingClient.createMalformedBookingJson();

    expectPlainTextResponse(response, 400, 'Bad Request');
  });
});
