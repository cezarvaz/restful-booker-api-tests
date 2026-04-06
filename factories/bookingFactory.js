const { randomUUID } = require('crypto');

function buildBooking(overrides = {}) {
  const suffix = randomUUID().slice(0, 8);

  return {
    firstname: `SDET-${suffix}`,
    lastname: `Booker-${suffix}`,
    totalprice: 150,
    depositpaid: true,
    bookingdates: {
      checkin: '2026-05-01',
      checkout: '2026-05-10',
    },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}

module.exports = {
  buildBooking,
};
