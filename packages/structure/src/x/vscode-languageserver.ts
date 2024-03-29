import type { Connection } from 'vscode-languageserver'

/**
 * will monkey patch the connection object
 * so that any errors thrown by subsequently installed handlers are caught and logged
 * (ex: connection.onHover(() => throw new Error('oops!')))
 * this prevents the LSP client, on the other end, to receive errors
 * which can sometimes cause error messages to pop-up uncontrollably
 *
 * @param conn
 */
export function Connection_suppressErrors<T extends Connection>(conn: T) {
  for (const k of Object.keys(conn)) {
    if (!k.startsWith('on')) {
      continue
    } // only onHover, onCodeLens, etc?
    const v = conn[k]
    if (typeof v !== 'function') {
      continue
    }
    conn[k] = (...args) => {
      const args2 = args.map((arg) =>
        typeof arg === 'function'
          ? with_catch2(arg, (e, fargs) => {
              const data = {
                handler: k,
                handlerInstallParams: args,
                handlerExecParams: fargs,
                error: e + '',
              }
              const dd = JSON.stringify(data, null, 2)
              conn.console.error(dd)
              return null
            })
          : arg,
      )
      return v.apply(conn, args2)
    }
  }
}

type CatchClause = (e?, args?) => unknown

function with_catch2(f, clause: CatchClause) {
  return (...args) =>
    catch2(
      () => f(...args),
      (e) => clause(e, args),
    )
  function catch2(f, clause2) {
    try {
      const res = f()
      if (typeof res?.then === 'function') {
        // promise
        return res.catch?.(clause2)
      }
      return res
    } catch (e) {
      return clause2(e)
    }
  }
}
