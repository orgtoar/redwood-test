"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/entries"));

var _every = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/every"));

var _api = require("@redwoodjs/api");

var _default = Base => {
  var _class;

  return _class = class extends Base {
    constructor(...args) {
      super(...args);
      this._errors = {
        base: []
      };
    }

    // Removes all error messages.
    _clearErrors() {
      for (const [attribute, _array] of (0, _entries.default)(this._errors)) {
        this._errors[attribute] = [];
      }
    } // Denotes validations that need to run for the given fields. Must be in the
    // form of { field: options } where `field` is the name of the field and
    // `options` are the validation options. See Service Validations docs for
    // usage examples: https://redwoodjs.com/docs/services.html#service-validations
    //
    //   static validates = {
    //     emailAddress: { email: true },
    //     name: { presence: true, length: { min: 2, max: 255 } }
    //   }


    // Whether or not this instance is valid and has no errors. Essentially the
    // opposite of `hasError`, but runs validations first. This means it will
    // reset any custom errors added with `addError()`
    get isValid() {
      this.validate();
      return !this.hasError;
    }

    get errors() {
      return this._errors;
    } // Whether or not this instance contains any errors according to validation
    // rules. Does not run valiations, (and so preserves custom errors) returns
    // the state of error objects. Essentially the opposite of `isValid`.


    get hasError() {
      var _context;

      return !(0, _every.default)(_context = (0, _entries.default)(this._errors)).call(_context, ([_name, errors]) => !errors.length);
    } // Adds an error to the _errors object. Can be called manually via instance,
    // however any errors added this way will be wiped out if calling `validate()`


    addError(attribute, message) {
      if (!this._errors[attribute]) {
        this._errors[attribute] = [];
      }

      this._errors[attribute].push(message);
    } // Checks each field against validate directives. Creates errors if so and
    // returns `false`, otherwise returns `true`.


    validate(options = {}) {
      this._clearErrors(); // If there are no validations, then we're valid! The database could still
      // throw an error though, but that's handled elsewhere.


      if (this.constructor.validates.length === 0) {
        return true;
      }

      const results = [];

      for (const [name, recipe] of (0, _entries.default)(this.constructor.validates)) {
        // TODO: Throw error if attribute is not present at all? Does that mess up undefined validation?
        try {
          (0, _api.validate)(this[name], name, recipe);
          results.push(true);
        } catch (e) {
          this.addError(name, e.message);

          if (options.throw) {
            throw e;
          } else {
            results.push(false);
          }
        }
      }

      return (0, _every.default)(results).call(results, result => result);
    }

  }, _class.validates = {}, _class;
};

exports.default = _default;