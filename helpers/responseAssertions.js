const validateSchema = require('./validateSchema');

function expectJsonResponse(response, status) {
  expect(response.status).toBe(status);
  expect(response.headers['content-type']).toContain('application/json');
}

function expectJsonSchemaResponse(response, status, schema) {
  expectJsonResponse(response, status);
  validateSchema.assert(response.body, schema);
}

function expectPlainTextResponse(response, status, bodyText) {
  expect(response.status).toBe(status);
  expect(response.headers['content-type']).toContain('text/plain');
  expect(response.text).toBe(bodyText);
}

module.exports = {
  expectJsonResponse,
  expectJsonSchemaResponse,
  expectPlainTextResponse,
};
