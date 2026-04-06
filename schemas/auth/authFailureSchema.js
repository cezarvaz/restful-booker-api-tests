module.exports = {
  $id: 'auth-failure',
  type: 'object',
  required: ['reason'],
  properties: {
    reason: {
      type: 'string',
    },
  },
  additionalProperties: true,
};
