const bookingSchema = require('./bookingSchema');

module.exports = {
  $id: 'booking-created',
  type: 'object',
  required: ['bookingid', 'booking'],
  properties: {
    bookingid: {
      type: 'integer',
    },
    booking: bookingSchema,
  },
  additionalProperties: true,
};
