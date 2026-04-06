const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const betterAjvErrors = require('better-ajv-errors');

class SchemaValidator {
  assert(data, schema) {
    const ajv = new Ajv({
      allErrors: true,
      strict: true,
      strictRequired: false,
    });
    addFormats(ajv);
    const validate = ajv.compile(schema);

    const valid = validate(data);

    if (!valid) {
      const details = betterAjvErrors(schema, data, validate.errors, {
        format: 'js',
      });
      throw new Error(Array.isArray(details) ? details.join('\n') : String(details));
    }
  }
}

module.exports = new SchemaValidator();
