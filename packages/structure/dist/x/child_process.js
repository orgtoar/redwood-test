"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CancellablePromise_then = CancellablePromise_then;
exports.spawnCancellable = spawnCancellable;

var child_process = _interopRequireWildcard(require("child_process"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function spawnCancellable(cmd, args, opts) {
  let cp;
  const promise = new Promise((resolve, reject) => {
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