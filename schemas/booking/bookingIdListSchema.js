module.exports = {
  $id: 'booking-id-list',
  type: 'array',
  items: {
    type: 'object',
    required: ['bookingid'],
    properties: {
      bookingid: {
        type: 'integer',
      },
    },
    additionalProperties: false,
  },
};
