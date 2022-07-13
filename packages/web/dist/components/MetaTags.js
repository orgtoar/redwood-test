"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.MetaTags = void 0;

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/array/is-array"));

var _react = _interopRequireDefault(require("react"));

var _index = require("../index");

/**
 * Add commonly used <meta> tags for unfurling/seo purposes
 * using the open graph protocol https://ogp.me/
 * @example
 * <MetaTags title="About Page" ogContentUrl="/static/about-og.png"/>
 */
const MetaTags = props => {
  const {
    tag = 'og:image',
    ogType = 'website',
    ogContentUrl,
    robots,
    contentType,
    ogWidth,
    ogHeight,
    ogUrl,
    title,
    locale,
    description,
    author,
    children
  } = props;
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, title && /*#__PURE__*/_react.default.createElement(_index.Head, null, /*#__PURE__*/_react.default.createElement("title", null, title), /*#__PURE__*/_react.default.createElement("meta", {
    property: "og:title",
    content: title,
    key: "title"
  }), /*#__PURE__*/_react.default.createElement("meta", {
    property: "twitter:title",
    content: title
  })), description && /*#__PURE__*/_react.default.createElement(_index.Head, null, /*#__PURE__*/_react.default.createElement("meta", {
    name: "description",
    content: description
  }), /*#__PURE__*/_react.default.createElement("meta", {
    name: "twitter:description",
    content: description
  }), /*#__PURE__*/_react.default.createElement("meta", {
    property: "og:description",
    content: description
  })), author && /*#__PURE__*/_react.default.createElement(_index.Head, null, /*#__PURE__*/_react.default.createElement("meta", {
    name: "author",
    content: author
  }), /*#__PURE__*/_react.default.createElement("meta", {
    name: "twitter:site",
    content: author
  }), /*#__PURE__*/_react.default.createElement("meta", {
    name: "twitter:creator",
    content: author
  })), ogUrl && /*#__PURE__*/_react.default.createElement(_index.Head, null, /*#__PURE__*/_react.default.createElement("meta", {
    property: "og:url",
    content: ogUrl
  })), locale && /*#__PURE__*/_react.default.createElement(_index.Head, null, /*#__PURE__*/_react.default.createElement("html", {
    lang: locale
  }), /*#__PURE__*/_react.default.createElement("meta", {
    property: "og:locale",
    content: locale
  })), /*#__PURE__*/_react.default.createElement(_index.Head, null, /*#__PURE__*/_react.default.createElement("meta", {
    property: "og:type",
    content: ogType
  })), ogContentUrl && /*#__PURE__*/_react.default.createElement(_index.Head, null, /*#__PURE__*/_react.default.createElement("meta", {
    property: tag,
    content: ogContentUrl
  })), contentType && /*#__PURE__*/_react.default.createElement(_index.Head, null, /*#__PURE__*/_react.default.createElement("meta", {
    property: "".concat(tag, ":type"),
    content: contentType
  })), tag === 'og:image' && /*#__PURE__*/_react.default.createElement(_index.Head, null, ogWidth && /*#__PURE__*/_react.default.createElement("meta", {
    property: "image:width",
    content: ogWidth
  }), ogHeight && /*#__PURE__*/_react.default.createElement("meta", {
    property: "image:height",
    content: ogHeight
  }), /*#__PURE__*/_react.default.createElement("meta", {
    property: "twitter:card",
    content: "summary_large_image"
  }), /*#__PURE__*/_react.default.createElement("meta", {
    property: "twitter:image",
    content: ogContentUrl
  })), robots && /*#__PURE__*/_react.default.createElement(_index.Head, null, /*#__PURE__*/_react.default.createElement("meta", {
    name: "robots",
    content: (0, _isArray.default)(robots) ? robots.join(', ') : robots
  })), children);
};

exports.MetaTags = MetaTags;