declare module 'react-server-dom-webpack/node-loader'

declare module 'react-server-dom-webpack/client' {
  // https://github.com/facebook/react/blob/dfaed5582550f11b27aae967a8e7084202dd2d90/packages/react-server-dom-webpack/src/ReactFlightDOMClientBrowser.js#L31
  export type Options<A, T> = {
    callServer?: (id: string, args: A) => Promise<T>
  }

  export function createFromFetch<A, T>(
    // `Response` is a Web Response:
    // https://developer.mozilla.org/en-US/docs/Web/API/Response
    promiseForResponse: Promise<Response>,
    options?: Options<A, T>,
  ): Thenable<T>

  export function encodeReply(
    // https://github.com/facebook/react/blob/dfaed5582550f11b27aae967a8e7084202dd2d90/packages/react-client/src/ReactFlightReplyClient.js#L65
    value: ReactServerValue,
  ): Promise<string | URLSearchParams | FormData>
}

declare module 'react-server-dom-webpack/server' {
  // The types for these functions were taken from react-server-dom-webpack/src/ReactFlightDOMServerNode.js
  // which is what 'react-server-dom-webpack/server' resolves to with the 'react-server' condition.
  // See https://github.com/facebook/react/blob/b09e102ff1e2aaaf5eb6585b04609ac7ff54a5c8/packages/react-server-dom-webpack/src/ReactFlightDOMServerNode.js#L120.
  //
  // It's difficult to know the true type of `ServerManifest`.
  // A lot of react's source files are stubs that are replaced at build time.
  // Going off this reference for now: https://github.com/facebook/react/blob/b09e102ff1e2aaaf5eb6585b04609ac7ff54a5c8/packages/react-server-dom-webpack/src/ReactFlightClientConfigBundlerWebpack.js#L40
  export type ImportManifestEntry = {
    id: string
    // chunks is a double indexed array of chunkId / chunkFilename pairs
    chunks: Array<string>
    name: string
  }

  export type ServerManifest = {
    [id: string]: ImportManifestEntry
  }

  /**
   * WARNING: The types for this were handwritten by looking at React's source and could be wrong.
   */
  export function decodeReply<T>(
    body: string | FormData,
    webpackMap?: ServerManifest,
  ): Promise<T>

  import type { Busboy } from 'busboy'

  /**
   * WARNING: The types for this were handwritten by looking at React's source and could be wrong.
   */
  export function decodeReplyFromBusboy<T>(
    busboyStream: Busboy,
    webpackMap?: ServerManifest,
  ): Promise<T>
}

declare module 'acorn-loose'
declare module 'vite-plugin-cjs-interop'
