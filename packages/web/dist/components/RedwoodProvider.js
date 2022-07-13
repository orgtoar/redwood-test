"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.RedwoodProvider = void 0;

var _react = _interopRequireDefault(require("react"));

var _reactHelmetAsync = require("react-helmet-async");

const RedwoodProvider = _ref => {
  let {
    children,
    titleTemplate
  } = _ref;
  const appTitle = global.__REDWOOD__APP_TITLE;

  const template = () => {
    if (titleTemplate) {
      let template = titleTemplate.replace(/%AppTitle/g, appTitle);
      template = template.replace(/%PageTitle/g, '%s');
      return template;
    }

    return '';
  };

  return /*#__PURE__*/_react.default.createElement(_reactHelmetAsync.HelmetProvider, {
    context: global.__REDWOOD__HELMET_CONTEXT
  }, /*#__PURE__*/_react.default.createElement(_reactHelmetAsync.Helmet, {
    titleTemplate: template(),
    defaultTitle: appTitle
  }, /*#__PURE__*/_react.default.createElement("title", null, appTitle)), children);
};

exports.RedwoodProvider = RedwoodProvider;