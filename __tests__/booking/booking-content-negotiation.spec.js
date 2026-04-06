const bookingClient = require('../../helpers/bookingClient');
const { buildBooking } = require('../../factories/bookingFactory');
const { useAuthenticatedSuite } = require('../../helpers/authenticatedSuite');
const { expectPlainTextResponse } = require('../../helpers/responseAssertions');
const bookingCreatedSchema = require('../../schemas/booking/bookingCreatedSchema');
const {
  expectJsonSchemaResponse,
} = require('../../helpers/responseAssertions');

describe('Booking Content Negotiation', () => {
  const { trackBooking } = useAuthenticatedSuite();

  test('returns an xml payload when the booking is requested as xml', async () => {
    const createResponse = await bookingClient.createBooking(buildBooking());
    expectJsonSchemaResponse(createResponse, 200, bookingCreatedSchema);
    trackBooking(createResponse.body.bookingid);

    const response = await bookingClient.getBookingAsXml(createResponse.body.bookingid);

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/html');
    expect(response.text).toContain('<?xml version');
    expect(response.text).toContain('<booking>');
    expect(response.text).toContain('<firstname>');
    expect(response.text).toContain(
      `<firstname>${createResponse.body.booking.firstname}</firstname>`,
    );
    expect(response.text).toContain(
      `<lastname>${createResponse.body.booking.lastname}</lastname>`,
    );
  });

  test('returns a plain-text server error for text/plain booking creation', async () => {
    const response = await bookingClient.createPlainTextBooking('hello');

    expectPlainTextResponse(response, 500, 'Internal Server Error');
  });
});
