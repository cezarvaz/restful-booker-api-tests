module.exports = {
  $id: 'auth-token',
  type: 'object',
  required: ['token'],
  properties: {
    token: {
      type: 'string',
      minLength: 1,
    },
  },
  additionalProperties: true,
};
