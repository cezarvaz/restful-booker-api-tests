const authClient = require('../../helpers/authClient');
const bookingClient = require('../../helpers/bookingClient');
const { buildBooking } = require('../../factories/bookingFactory');
const { expectNotFound } = require('../../helpers/knownQuirks');
const bookingCreatedSchema = require('../../schemas/booking/bookingCreatedSchema');
const bookingSchema = require('../../schemas/booking/bookingSchema');
const {
  expectJsonSchemaResponse,
} = require('../../helpers/responseAssertions');

describe('Auth Session Usage', () => {
  test('reuses one token across multiple authorized operations', async () => {
    const tokenResponse = await authClient.createToken();
    const token = tokenResponse.body.token;
    const createResponse = await bookingClient.createBooking(buildBooking());
    const bookingId = createResponse.body.bookingid;
    expectJsonSchemaResponse(createResponse, 200, bookingCreatedSchema);

    const patchResponse = await bookingClient.patchBooking(
      bookingId,
      { firstname: 'TokenReused' },
      { token },
    );

    expectJsonSchemaResponse(patchResponse, 200, bookingSchema);
    expect(patchResponse.body.firstname).toBe('TokenReused');

    const deleteResponse = await bookingClient.deleteBooking(bookingId, { token });

    expect(deleteResponse.status).toBe(201);

    const getResponse = await bookingClient.getBooking(bookingId);
    expectNotFound(getResponse);
  });
});
