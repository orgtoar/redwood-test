"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

/**
 * Big error message at the top of the page explaining everything that's wrong
 * with the form fields in this form
 */
const FormError = _ref => {
  var _error$graphQLErrors;

  let {
    error,
    wrapperClassName,
    wrapperStyle,
    titleClassName,
    titleStyle,
    listClassName,
    listStyle,
    listItemClassName,
    listItemStyle
  } = _ref;

  if (!error) {
    return null;
  }

  let rootMessage = error.message;
  const messages = [];
  const hasGraphQLError = !!((_error$graphQLErrors = error.graphQLErrors) !== null && _error$graphQLErrors !== void 0 && _error$graphQLErrors[0]);
  const hasNetworkError = !!error.networkError && Object.keys(error.networkError).length > 0;

  if (hasGraphQLError) {
    var _error$graphQLErrors$, _error$graphQLErrors$2, _error$graphQLErrors$3, _error$graphQLErrors$4;

    rootMessage = (_error$graphQLErrors$ = error.graphQLErrors[0].message) !== null && _error$graphQLErrors$ !== void 0 ? _error$graphQLErrors$ : 'Something went wrong'; // override top-level message for ServiceValidation errorrs

    if (((_error$graphQLErrors$2 = error.graphQLErrors[0]) === null || _error$graphQLErrors$2 === void 0 ? void 0 : (_error$graphQLErrors$3 = _error$graphQLErrors$2.extensions) === null || _error$graphQLErrors$3 === void 0 ? void 0 : _error$graphQLErrors$3.code) === 'BAD_USER_INPUT') {
      rootMessage = 'Errors prevented this form from being saved';
    }

    const properties = (_error$graphQLErrors$4 = error.graphQLErrors[0].extensions) === null || _error$graphQLErrors$4 === void 0 ? void 0 : _error$graphQLErrors$4['properties'];
    const propertyMessages = properties && properties['messages'];

    if (propertyMessages) {
      for (const e in propertyMessages) {
        propertyMessages[e].forEach(fieldError => {
          messages.push(fieldError);
        });
      }
    }
  } else if (hasNetworkError) {
    var _rootMessage;

    rootMessage = (_rootMessage = rootMessage) !== null && _rootMessage !== void 0 ? _rootMessage : 'An error has occurred';

    if (Object.prototype.hasOwnProperty.call(error.networkError, 'bodyText')) {
      const netErr = error.networkError;
      messages.push("".concat(netErr.name, ": ").concat(netErr.bodyText));
    } else if (Object.prototype.hasOwnProperty.call(error.networkError, 'result')) {
      var _netErr$result$errors;

      const netErr = error.networkError;
      (_netErr$result$errors = netErr.result.errors) === null || _netErr$result$errors === void 0 ? void 0 : _netErr$result$errors.forEach(error => {
        if (typeof error.message === 'string') {
          if (error.message.indexOf(';') >= 0) {
            var _error$message;

            messages.push((_error$message = error.message) === null || _error$message === void 0 ? void 0 : _error$message.split(';')[1]);
          } else {
            messages.push(error.message);
          }
        }
      });
    }
  }

  if (!rootMessage) {
    return null;
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    className: wrapperClassName,
    style: wrapperStyle
  }, /*#__PURE__*/_react.default.createElement("p", {
    className: titleClassName,
    style: titleStyle
  }, rootMessage), messages.length > 0 && /*#__PURE__*/_react.default.createElement("ul", {
    className: listClassName,
    style: listStyle
  }, messages.map((message, index) => /*#__PURE__*/_react.default.createElement("li", {
    key: index,
    className: listItemClassName,
    style: listItemStyle
  }, message))));
};

var _default = FormError;
exports.default = _default;