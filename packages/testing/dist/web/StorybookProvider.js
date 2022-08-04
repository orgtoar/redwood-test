"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StorybookProvider = exports.MockingLoader = void 0;

var React = _interopRequireWildcard(require("react"));

var _MockProviders = require("./MockProviders");

var _mockRequests = require("./mockRequests");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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