const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const betterAjvErrors = require('better-ajv-errors');

class SchemaValidator {
  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      strict: true,
      strictRequired: false,
    });
    addFormats(this.ajv);
    this.validatorsById = new Map();
    this.validatorsBySchema = new WeakMap();
  }

  getValidator(schema) {
    if (schema.$id && this.validatorsById.has(schema.$id)) {
      return this.validatorsById.get(schema.$id);
    }

    if (schema.$id) {
      const existingValidator = this.ajv.getSchema(schema.$id);

      if (existingValidator) {
        this.validatorsById.set(schema.$id, existingValidator);
        this.validatorsBySchema.set(schema, existingValidator);

        return existingValidator;
      }
    }

    if (this.validatorsBySchema.has(schema)) {
      return this.validatorsBySchema.get(schema);
    }

    const validate = this.ajv.compile(schema);

    if (schema.$id) {
      this.validatorsById.set(schema.$id, validate);
    }

    this.validatorsBySchema.set(schema, validate);

    return validate;
  }

  assert(data, schema) {
    const validate = this.getValidator(schema);
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
