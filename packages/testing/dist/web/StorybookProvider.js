"use strict";

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StorybookProvider = exports.MockingLoader = void 0;

require("core-js/modules/esnext.async-iterator.for-each.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.for-each.js");

var React = _interopRequireWildcard(require("react"));

var _MockProviders = require("./MockProviders");

var _mockRequests = require("./mockRequests");

const MockingLoader = async () => {
  const reqs = require.context('~__REDWOOD__USER_WEB_SRC', true, /.+(mock).(js|ts)$/);

  reqs.keys().forEach(reqs);
  await (0, _mockRequests.startMSW)('browsers');
  (0, _mockRequests.setupRequestHandlers)();
  return {};
};

exports.MockingLoader = MockingLoader;

const StorybookProvider = ({
  storyFn
}) => {
  // default to a non-existent user at the beginning of each story
  (0, _mockRequests.mockCurrentUser)(null);
  return /*#__PURE__*/React.createElement(_MockProviders.MockProviders, null, storyFn());
};

exports.StorybookProvider = StorybookProvider;