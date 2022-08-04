"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.netlify = void 0;

var _jsonwebtoken = _interopRequireWildcard(require("jsonwebtoken"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const netlify = (token, req) => {
  // Netlify verifies and decodes the JWT before the request is passed to our
  // Serverless function, so the decoded JWT is already available in production.
  // For development and test we can't verify the token because we don't have
  // the signing key. Just decoding the token is the best we can do to emulate
  // the native Netlify experience
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    // In dev, we don't have access to the JWT private key to verify
    // So we simulate a verification
    const decodedToken = _jsonwebtoken.default.decode(token);

    const nowTimestamp = Math.floor(Date.now() / 1000);

    if (nowTimestamp >= decodedToken.exp) {
      throw new _jsonwebtoken.TokenExpiredError('jwt expired', new Date(decodedToken.exp * 1000));
    }

    return decodedToken;
  } else {
    const clientContext = req.context.clientContext;
    return (clientContext === null || clientContext === void 0 ? void 0 : clientContext.user) || null;
  }
};

exports.netlify = netlify;