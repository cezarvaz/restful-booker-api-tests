const bookingClient = require('../../helpers/bookingClient');
const { buildBooking } = require('../../factories/bookingFactory');
const { useAuthenticatedSuite } = require('../../helpers/authenticatedSuite');
const {
  expectJsonResponse,
  expectPlainTextResponse,
} = require('../../helpers/responseAssertions');
const bookingCreatedSchema = require('../../schemas/booking/bookingCreatedSchema');
const {
  expectJsonSchemaResponse,
} = require('../../helpers/responseAssertions');

describe('Booking Known Quirks', () => {
  const { trackBooking } = useAuthenticatedSuite();

  test('returns a server error when firstname is missing instead of a validation error', async () => {
    const response = await bookingClient.createBooking({
      lastname: 'OnlyLast',
      totalprice: 1,
      depositpaid: true,
      bookingdates: {
        checkin: '2026-01-01',
        checkout: '2026-01-02',
      },
    });

    expectPlainTextResponse(response, 500, 'Internal Server Error');
  });

  test('returns a server error when bookingdates is missing instead of a validation error', async () => {
    const response = await bookingClient.createBooking({
      firstname: 'OnlyFirst',
      lastname: 'NoDates',
      totalprice: 1,
      depositpaid: true,
    });

    expectPlainTextResponse(response, 500, 'Internal Server Error');
  });

  test('accepts empty names instead of validating them', async () => {
    const response = await bookingClient.createBooking(
      buildBooking({
        firstname: '',
        lastname: '',
        totalprice: 1,
      }),
    );

    expectJsonResponse(response, 200);
    trackBooking(response.body.bookingid);
    expect(response.body.booking.firstname).toBe('');
    expect(response.body.booking.lastname).toBe('');
    expect(() =>
      expectJsonSchemaResponse(response, 200, bookingCreatedSchema),
    ).toThrow();
  });

  test('accepts reversed checkin and checkout dates instead of rejecting them', async () => {
    const response = await bookingClient.createBooking(
      buildBooking({
        firstname: 'Reverse',
        lastname: 'Dates',
        totalprice: 1,
        bookingdates: {
          checkin: '2026-01-10',
          checkout: '2026-01-02',
        },
      }),
    );

    expectJsonSchemaResponse(response, 200, bookingCreatedSchema);
    trackBooking(response.body.bookingid);
    expect(response.body.booking.bookingdates.checkin).toBe('2026-01-10');
    expect(response.body.booking.bookingdates.checkout).toBe('2026-01-02');
  });
});
