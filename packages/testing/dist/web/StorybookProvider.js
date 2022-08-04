"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.StorybookProvider = exports.MockingLoader = void 0;

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/keys"));

var React = _interopRequireWildcard(require("react"));

var _MockProviders = require("./MockProviders");

var _mockRequests = require("./mockRequests");

const MockingLoader = async () => {
  var _context;

  const reqs = require.context('~__REDWOOD__USER_WEB_SRC', true, /.+(mock).(js|ts)$/);

  (0, _forEach.default)(_context = (0, _keys.default)(reqs).call(reqs)).call(_context, reqs);
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