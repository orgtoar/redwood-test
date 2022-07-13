"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.description = exports.command = void 0;

var _path = _interopRequireDefault(require("path"));

var _fastGlob = _interopRequireDefault(require("fast-glob"));

var _tasuku = _interopRequireDefault(require("tasuku"));

var _getRWPaths = _interopRequireDefault(require("../../../lib/getRWPaths"));

var _runTransform = _interopRequireDefault(require("../../../lib/runTransform"));

const command = 'rename-verifier-timestamp';
exports.command = command;
const description = '(v0.47.x->v0.48.x) Renames the timestamp webhook verifier option';
/**
 * The functions dir can look like like...
 *
 * functions
 * ├── graphql.js
 * ├── healthz.js
 * ├── jsonproduct.js
 * ├── payment.js
 * ├── paysonCallback.js
 * ├── prisma.js
 * ├── shipping
 * │   ├── shipping.scenarios.ts
 * │   ├── shipping.test.ts
 * │   └── shipping.ts
 * ├── snipcartWebhooks.js
 * ├── swishCallback.js
 * └── swishCheckout.js
 */

exports.description = description;

const handler = () => {
  (0, _tasuku.default)('Rename timestamp to currentTimestampOverride', async ({
    setError
  }) => {
    try {
      await (0, _runTransform.default)({
        transformPath: _path.default.join(__dirname, 'renameVerifierTimestamp.js'),
        targetPaths: _fastGlob.default.sync('/**/*.{js,ts}', {
          cwd: (0, _getRWPaths.default)().api.functions,
          absolute: true
        })
      });
    } catch (e) {
      setError('Failed to codemod your project \n' + e?.message);
    }
  });
};

exports.handler = handler;