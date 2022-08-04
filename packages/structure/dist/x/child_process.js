"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.CancellablePromise_then = CancellablePromise_then;
exports.spawnCancellable = spawnCancellable;

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var child_process = _interopRequireWildcard(require("child_process"));

function spawnCancellable(cmd, args, opts) {
  let cp;
  const promise = new _promise.default((resolve, reject) => {
    cp = child_process.spawn(cmd, args, opts);
    let stderr = '',
        stdout = '';
    cp.stdout.on('data', data => {
      var _opts$stdout_cb;

      stdout += data;
      opts === null || opts === void 0 ? void 0 : (_opts$stdout_cb = opts.stdout_cb) === null || _opts$stdout_cb === void 0 ? void 0 : _opts$stdout_cb.call(opts, data);
    });
    cp.stderr.on('data', data => {
      var _opts$stderr_cb;

      stderr += data;
      opts === null || opts === void 0 ? void 0 : (_opts$stderr_cb = opts.stderr_cb) === null || _opts$stderr_cb === void 0 ? void 0 : _opts$stderr_cb.call(opts, data);
    });
    cp.on('close', code => {
      resolve({
        stdout,
        stderr,
        code
      });
    });
    cp.on('error', err => {
      reject(err);
    });
  });

  promise.cancel = () => {
    try {
      cp.kill();
    } catch (e) {// intentionally left empty
    }
  };

  return promise;
}

function CancellablePromise_then(p, f) {
  const p2 = p.then(f);
  p2.cancel = p.cancel;
  return p2;
}