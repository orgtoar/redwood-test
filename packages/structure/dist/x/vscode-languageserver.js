"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Connection_suppressErrors = Connection_suppressErrors;

/**
 * will monkey patch the connection object
 * so that any errors thrown by subsequently installed handlers are caught and logged
 * (ex: connection.onHover(() => throw new Error('oops!')))
 * this prevents the LSP client, on the other end, to receive errors
 * which can sometimes cause error messages to pop-up uncontrollably
 *
 * @param conn
 */
function Connection_suppressErrors(conn) {
  for (const k of Object.keys(conn)) {
    if (!k.startsWith('on')) {
      continue;
    } // only onHover, onCodeLens, etc?


    const v = conn[k];

    if (typeof v !== 'function') {
      continue;
    }

    conn[k] = (...args) => {
      const args2 = args.map(arg => typeof arg === 'function' ? with_catch2(arg, (e, fargs) => {
        const data = {
          handler: k,
          handlerInstallParams: args,
          handlerExecParams: fargs,
          error: e + ''
        };
        const dd = JSON.stringify(data, null, 2);
        conn.console.error(dd);
        return null;
      }) : arg);
      return v.apply(conn, args2);
    };
  }
}

function with_catch2(f, clause) {
  return (...args) => catch2(() => f(...args), e => clause(e, args));

  function catch2(f, clause2) {
    try {
      const res = f();

      if (typeof (res === null || res === void 0 ? void 0 : res.then) === 'function') {
        var _res$catch;

        // promise
        return (_res$catch = res.catch) === null || _res$catch === void 0 ? void 0 : _res$catch.call(res, clause2);
      }

      return res;
    } catch (e) {
      return clause2(e);
    }
  }
}