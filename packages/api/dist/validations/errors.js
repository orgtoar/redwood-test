"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UniquenessValidationError = exports.TypeNumericalityValidationError = exports.ServiceValidationError = exports.PresenceValidationError = exports.PositiveNumericalityValidationError = exports.OtherThanNumericalityValidationError = exports.OddNumericalityValidationError = exports.NegativeNumericalityValidationError = exports.MinLengthValidationError = exports.MaxLengthValidationError = exports.LessThanOrEqualNumericalityValidationError = exports.LessThanNumericalityValidationError = exports.IntegerNumericalityValidationError = exports.InclusionValidationError = exports.GreaterThanOrEqualNumericalityValidationError = exports.GreaterThanNumericalityValidationError = exports.FormatValidationError = exports.ExclusionValidationError = exports.EvenNumericalityValidationError = exports.EqualNumericalityValidationError = exports.EqualLengthValidationError = exports.EmailValidationError = exports.BetweenLengthValidationError = exports.AcceptanceValidationError = exports.AbsenceValidationError = void 0;

var _replaceAll = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/replace-all"));

var _humanizeString = _interopRequireDefault(require("humanize-string"));

var _titleCase = require("title-case");

var _errors = require("../errors");

class ServiceValidationError extends _errors.RedwoodError {
  constructor(message, substitutions = {}) {
    let errorMessage = message;
    let extensions = {}; // in the main error message, replace instances of a string like
    // `{max}` with any substituted values that are titlecased and humanized

    for (const [key, value] of Object.entries(substitutions)) {
      errorMessage = (0, _replaceAll.default)(errorMessage).call(errorMessage, `\${${key}}`, (0, _titleCase.titleCase)((0, _humanizeString.default)(String(value)))); // this mimics the Apollo Server use of error codes and extensions needed
      // for the web side FormError handlings to show the message at the field level
      // with an UserInputError (aka 'BAD_USER_INPUT" code) style error
      // @see: https://www.apollographql.com/docs/apollo-server/data/errors/#including-custom-error-details

      extensions = {
        code: 'BAD_USER_INPUT',
        properties: {
          messages: {
            [String(value)]: [errorMessage]
          }
        }
      };
    }

    super(errorMessage, extensions);
    this.name = 'ServiceValidationError';
  }

}

exports.ServiceValidationError = ServiceValidationError;

class AbsenceValidationError extends ServiceValidationError {
  constructor(name, message = '${name} is not absent', substitutions = {}) {
    super(message, Object.assign(substitutions, {
      name
    }));
    this.name = 'AbsenceValidationError';
  }

}

exports.AbsenceValidationError = AbsenceValidationError;

class AcceptanceValidationError extends ServiceValidationError {
  constructor(name, message = '${name} must be accepted', substitutions = {}) {
    super(message, Object.assign(substitutions, {
      name
    }));
    this.name = 'AcceptanceValidationError';
  }

}

exports.AcceptanceValidationError = AcceptanceValidationError;

class EmailValidationError extends ServiceValidationError {
  constructor(name, message = '${name} must be formatted like an email address', substitutions = {}) {
    super(message, Object.assign(substitutions, {
      name
    }));
    this.name = 'EmailValidationError';
  }

}

exports.EmailValidationError = EmailValidationError;

class ExclusionValidationError extends ServiceValidationError {
  constructor(name, message = '${name} is reserved', substitutions = {}) {
    super(message, Object.assign(substitutions, {
      name
    }));
    this.name = 'ExclusionValidationError';
  }

}

exports.ExclusionValidationError = ExclusionValidationError;

class FormatValidationError extends ServiceValidationError {
  constructor(name, message = '${name} is not formatted correctly', substitutions = {}) {
    super(message, Object.assign(substitutions, {
      name
    }));
    this.name = 'FormatValidationError';
  }

}

exports.FormatValidationError = FormatValidationError;

class InclusionValidationError extends ServiceValidationError {
  constructor(name, message = '${name} is reserved', substitutions = {}) {
    super(message, Object.assign(substitutions, {
      name
    }));
    this.name = 'InclusionValidationError';
  }

}

exports.InclusionValidationError = InclusionValidationError;

class MinLengthValidationError extends ServiceValidationError {
  constructor(name, message = '${name} must have at least ${min} characters', substitutions = {}) {
    super(message, Object.assign(substitutions, {
      name
    }));
    this.name = 'MinLengthValidationError';
  }

}

exports.MinLengthValidationError = MinLengthValidationError;

class MaxLengthValidationError extends ServiceValidationError {
  constructor(name, message = '${name} must have no more than ${max} characters', substitutions = {}) {
    super(message, Object.assign(substitutions, {
      name
    }));
    this.name = 'MaxLengthValidationError';
  }

}

exports.MaxLengthValidationError = MaxLengthValidationError;

class EqualLengthValidationError extends ServiceValidationError {
  constructor(name, message = '${name} must have exactly ${equal} characters', substitutions = {}) {
    super(message, Object.assign(substitutions, {
      name
    }));
    this.name = 'EqualLengthValidationError';
  }

}

exports.EqualLengthValidationError = EqualLengthValidationError;

class BetweenLengthValidationError extends ServiceValidationError {
  constructor(name, message = '${name} must be between ${min} and ${max} characters', substitutions = {}) {
    super(message, Object.assign(substitutions, {
      name
    }));
    this.name = 'BetweenLengthValidationError';
  }

}

exports.BetweenLengthValidationError = BetweenLengthValidationError;

class PresenceValidationError extends ServiceValidationError {
  constructor(name, message = '${name} must be present', substitutions = {}) {
    super(message, Object.assign(substitutions, {
      name
    }));
    this.name = 'PresenceValidationError';
  }

}

exports.PresenceValidationError = PresenceValidationError;

class TypeNumericalityValidationError extends ServiceValidationError {
  constructor(name, message = '${name} must by a number', substitutions = {}) {
    super(message, Object.assign(substitutions, {
      name
    }));
    this.name = 'TypeNumericalityValidationError';
  }

}

exports.TypeNumericalityValidationError = TypeNumericalityValidationError;

class IntegerNumericalityValidationError extends ServiceValidationError {
  constructor(name, message = '${name} must be an integer', substitutions = {}) {
    super(message, Object.assign(substitutions, {
      name
    }));
    this.name = 'IntegerNumericalityValidationError';
  }

}

exports.IntegerNumericalityValidationError = IntegerNumericalityValidationError;

class LessThanNumericalityValidationError extends ServiceValidationError {
  constructor(name, message = '${name} must be less than ${lessThan}', substitutions = {}) {
    super(message, Object.assign(substitutions, {
      name
    }));
    this.name = 'LessThanNumericalityValidationError';
  }

}

exports.LessThanNumericalityValidationError = LessThanNumericalityValidationError;

class LessThanOrEqualNumericalityValidationError extends ServiceValidationError {
  constructor(name, message = '${name} must be less than or equal to ${lessThanOrEqual}', substitutions = {}) {
    super(message, Object.assign(substitutions, {
      name
    }));
    this.name = 'LessThanOrEqualNumericalityValidationError';
  }

}

exports.LessThanOrEqualNumericalityValidationError = LessThanOrEqualNumericalityValidationError;

class GreaterThanNumericalityValidationError extends ServiceValidationError {
  constructor(name, message = '${name} must be greater than ${greaterThan}', substitutions = {}) {
    super(message, Object.assign(substitutions, {
      name
    }));
    this.name = 'GreaterThanNumericalityValidationError';
  }

}

exports.GreaterThanNumericalityValidationError = GreaterThanNumericalityValidationError;

class GreaterThanOrEqualNumericalityValidationError extends ServiceValidationError {
  constructor(name, message = '${name} must be greater than or equal to ${greaterThanOrEqual}', substitutions = {}) {
    super(message, Object.assign(substitutions, {
      name
    }));
    this.name = 'GreaterThanOrEqualNumericalityValidationError';
  }

}

exports.GreaterThanOrEqualNumericalityValidationError = GreaterThanOrEqualNumericalityValidationError;

class EqualNumericalityValidationError extends ServiceValidationError {
  constructor(name, message = '${name} must equal ${equal}', substitutions = {}) {
    super(message, Object.assign(substitutions, {
      name
    }));
    this.name = 'EqualNumericalityValidationError';
  }

}

exports.EqualNumericalityValidationError = EqualNumericalityValidationError;

class OtherThanNumericalityValidationError extends ServiceValidationError {
  constructor(name, message = '${name} must not equal ${otherThan}', substitutions = {}) {
    super(message, Object.assign(substitutions, {
      name
    }));
    this.name = 'OtherThanNumericalityValidationError';
  }

}

exports.OtherThanNumericalityValidationError = OtherThanNumericalityValidationError;

class EvenNumericalityValidationError extends ServiceValidationError {
  constructor(name, message = '${name} must be even', substitutions = {}) {
    super(message, Object.assign(substitutions, {
      name
    }));
    this.name = 'EvenNumericalityValidationError';
  }

}

exports.EvenNumericalityValidationError = EvenNumericalityValidationError;

class OddNumericalityValidationError extends ServiceValidationError {
  constructor(name, message = '${name} must be odd', substitutions = {}) {
    super(message, Object.assign(substitutions, {
      name
    }));
    this.name = 'OddNumericalityValidationError';
  }

}

exports.OddNumericalityValidationError = OddNumericalityValidationError;

class PositiveNumericalityValidationError extends ServiceValidationError {
  constructor(name, message = '${name} must be positive', substitutions = {}) {
    super(message, Object.assign(substitutions, {
      name
    }));
    this.name = 'PositiveNumericalityValidationError';
  }

}

exports.PositiveNumericalityValidationError = PositiveNumericalityValidationError;

class NegativeNumericalityValidationError extends ServiceValidationError {
  constructor(name, message = '${name} must be negative', substitutions = {}) {
    super(message, Object.assign(substitutions, {
      name
    }));
    this.name = 'NegativeNumericalityValidationError';
  }

}

exports.NegativeNumericalityValidationError = NegativeNumericalityValidationError;

class UniquenessValidationError extends ServiceValidationError {
  constructor(name, message, _substitutions = {}) {
    const errorMessage = message ? message : `${name} must be unique`;
    super(errorMessage);
    this.name = 'UniquenessValidationError';
  }

}

exports.UniquenessValidationError = UniquenessValidationError;