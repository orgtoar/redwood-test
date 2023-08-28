import path from 'path'

import { prebuildApiFile } from '../api'

const RWJS_CWD = path.join(__dirname, '__fixtures__/redwood-app')
process.env.RWJS_CWD = RWJS_CWD

let code

describe('api prebuild ', () => {
  describe('polyfills unsupported functionality', () => {
    beforeAll(() => {
      const apiFile = path.join(RWJS_CWD, 'api/src/lib/polyfill.js')
      const result = prebuildApiFile(apiFile)

      if (!result) {
        throw new Error(`Couldn't prebuild ${apiFile}`)
      }

      code = result.code
    })

    describe('ES features', () => {
      describe('Node.js 13', () => {
        it('polyfills Math.hypot', () => {
          expect(code).toContain(
            `import _Math$hypot from "@babel/runtime-corejs3/core-js/math/hypot"`
          )
        })
      })

      describe('Node.js 14', () => {
        it('polyfills String.matchAll', () => {
          expect(code).toContain(
            `import _matchAllInstanceProperty from "@babel/runtime-corejs3/core-js/instance/match-all"`
          )
        })
      })

      describe('Node.js 15', () => {
        it('polyfills AggregateError', () => {
          expect(code).toContain(
            `import _AggregateError from "@babel/runtime-corejs3/core-js/aggregate-error"`
          )
        })

        // The reason we're testing it this way is that core-js polyfills the entire Promise built in.
        //
        // So this...
        //
        // ```js
        // Promise.any([
        //   Promise.resolve(1),
        //   Promise.reject(2),
        //   Promise.resolve(3),
        // ]).then(console.log)
        //
        // ↓↓↓
        //
        // import _Promise from "@babel/runtime-corejs3/core-js/promise";
        //
        // _Promise.any([
        //   _Promise.resolve(1),
        //   _Promise.reject(2),
        //   _Promise.resolve(3)])
        // .then(console.log);
        // ```
        //
        // Compared to the Reflect polyfills, which only polyfill the method used,
        // just checking that the Promise polyfill is imported isn't enough:
        //
        // ```js
        // Reflect.defineMetadata(metadataKey, metadataValue, target)
        //
        // ↓↓↓
        //
        // import _Reflect$defineMetadata from "@babel/runtime-corejs3/core-js/reflect/define-metadata";

        // _Reflect$defineMetadata(metadataKey, metadataValue, target);
        // ```
        it('polyfills Promise.any', () => {
          expect(code).toContain(
            `import _Promise from "@babel/runtime-corejs3/core-js/promise"`
          )
          const _Promise = require('@babel/runtime-corejs3/core-js/promise')
          expect(_Promise).toHaveProperty('any')
        })

        it('polyfills String.replaceAll', () => {
          expect(code).toContain(
            `import _replaceAllInstanceProperty from "@babel/runtime-corejs3/core-js/instance/replace-all"`
          )
        })
      })

      describe('Node.js 17', () => {
        // core-js-pure overrides this. See https://github.com/zloirock/core-js/blob/master/packages/core-js-pure/override/modules/es.typed-array.set.js.
        it("doesn't polyfill TypedArray.set", () => {
          expect(code).toContain(
            [
              `const buffer = new ArrayBuffer(8);`,
              `const uint8 = new Uint8Array(buffer);`,
              `uint8.set([1, 2, 3], 3);`,
            ].join('\n')
          )
        })
      })
    })

    describe('ES Next features', () => {
      describe('Pre-stage 0 proposals', () => {
        // Reflect metadata
        // See https://github.com/zloirock/core-js#reflect-metadata
        it('polyfills Reflect methods', () => {
          expect(code).toContain(
            `import _Reflect$defineMetadata from "@babel/runtime-corejs3/core-js/reflect/define-metadata"`
          )
          expect(code).toContain(
            `import _Reflect$deleteMetadata from "@babel/runtime-corejs3/core-js/reflect/delete-metadata"`
          )
          expect(code).toContain(
            `import _Reflect$getMetadata from "@babel/runtime-corejs3/core-js/reflect/get-metadata"`
          )
          expect(code).toContain(
            `import _Reflect$getMetadataKeys from "@babel/runtime-corejs3/core-js/reflect/get-metadata-keys"`
          )
          expect(code).toContain(
            `import _Reflect$getOwnMetadata from "@babel/runtime-corejs3/core-js/reflect/get-own-metadata"`
          )
          expect(code).toContain(
            `import _Reflect$getOwnMetadataKeys from "@babel/runtime-corejs3/core-js/reflect/get-own-metadata-keys"`
          )
          expect(code).toContain(
            `import _Reflect$hasMetadata from "@babel/runtime-corejs3/core-js/reflect/has-metadata"`
          )
          expect(code).toContain(
            `import _Reflect$hasOwnMetadata from "@babel/runtime-corejs3/core-js/reflect/has-own-metadata"`
          )
          expect(code).toContain(
            `import _Reflect$metadata from "@babel/runtime-corejs3/core-js/reflect/metadata"`
          )
        })
      })

      describe('Stage 1 proposals', () => {
        // Getting last item from Array
        // See https://github.com/zloirock/core-js#getting-last-item-from-array
        //
        // core-js-pure overrides these. See...
        // - https://github.com/zloirock/core-js/blob/master/packages/core-js-pure/override/modules/esnext.array.last-index.js,
        // - https://github.com/zloirock/core-js/blob/master/packages/core-js-pure/override/modules/esnext.array.last-item.js
        it("doesn't polyfill Getting last item from Array", () => {
          expect(code).toContain(
            [
              `[1, 2, 3].lastIndex;`,
              `[1, 2, 3].lastItem;`,
              `const array = [1, 2, 3];`,
              `array.lastItem = 4;`,
              `new Array(1, 2, 3).lastIndex;`,
              `new Array(1, 2, 3).lastItem;`,
            ].join('\n')
          )
        })

        // compositeKey and compositeSymbol
        // See https://github.com/zloirock/core-js#compositekey-and-compositesymbol
        it('polyfills compositeKey and compositeSymbol', () => {
          expect(code).toContain(
            `import _compositeKey from "@babel/runtime-corejs3/core-js/composite-key"`
          )
          expect(code).toContain(
            `import _compositeSymbol from "@babel/runtime-corejs3/core-js/composite-symbol"`
          )
        })

        // New collections methods
        // See https://github.com/zloirock/core-js#new-collections-methods
        it('polyfills New collections methods', () => {
          expect(code).toContain(
            `import _Map from "@babel/runtime-corejs3/core-js/map"`
          )
          // See the comments on Promise.any above for more of an explanation
          // of why we're testing for properties.
          const _Map = require('@babel/runtime-corejs3/core-js/map')
          expect(_Map).toHaveProperty('deleteAll')
          expect(_Map).toHaveProperty('every')
          expect(_Map).toHaveProperty('filter')
          expect(_Map).toHaveProperty('find')
          expect(_Map).toHaveProperty('findKey')
          expect(_Map).toHaveProperty('from')
          expect(_Map).toHaveProperty('groupBy')
          expect(_Map).toHaveProperty('includes')
          expect(_Map).toHaveProperty('keyBy')
          expect(_Map).toHaveProperty('keyOf')
          expect(_Map).toHaveProperty('mapKeys')
          expect(_Map).toHaveProperty('mapValues')
          expect(_Map).toHaveProperty('merge')
          expect(_Map).toHaveProperty('of')
          expect(_Map).toHaveProperty('reduce')
          expect(_Map).toHaveProperty('some')
          expect(_Map).toHaveProperty('update')

          expect(code).toContain(
            `import _Set from "@babel/runtime-corejs3/core-js/set"`
          )
          const _Set = require('@babel/runtime-corejs3/core-js/set')
          expect(_Set).toHaveProperty('addAll')
          expect(_Set).toHaveProperty('deleteAll')
          expect(_Set).toHaveProperty('difference')
          expect(_Set).toHaveProperty('every')
          expect(_Set).toHaveProperty('filter')
          expect(_Set).toHaveProperty('find')
          expect(_Set).toHaveProperty('from')
          expect(_Set).toHaveProperty('intersection')
          expect(_Set).toHaveProperty('isDisjointFrom')
          expect(_Set).toHaveProperty('isSubsetOf')
          expect(_Set).toHaveProperty('isSupersetOf')
          expect(_Set).toHaveProperty('join')
          expect(_Set).toHaveProperty('map')
          expect(_Set).toHaveProperty('of')
          expect(_Set).toHaveProperty('reduce')
          expect(_Set).toHaveProperty('some')
          expect(_Set).toHaveProperty('symmetricDifference')
          expect(_Set).toHaveProperty('union')

          expect(code).toContain(
            `import _WeakMap from "@babel/runtime-corejs3/core-js/weak-map"`
          )
          const _WeakMap = require('@babel/runtime-corejs3/core-js/weak-map')
          expect(_WeakMap).toHaveProperty('deleteAll')
          expect(_WeakMap).toHaveProperty('from')
          expect(_WeakMap).toHaveProperty('of')

          expect(code).toContain(
            `import _WeakSet from "@babel/runtime-corejs3/core-js/weak-set"`
          )
          const _WeakSet = require('@babel/runtime-corejs3/core-js/weak-set')
          expect(_WeakSet).toHaveProperty('addAll')
          expect(_WeakSet).toHaveProperty('deleteAll')
          expect(_WeakSet).toHaveProperty('from')
          expect(_WeakSet).toHaveProperty('of')
        })

        // Math extensions
        // See https://github.com/zloirock/core-js#math-extensions
        it('polyfills Math extensions', () => {
          expect(code).toContain(
            `import _Math$clamp from "@babel/runtime-corejs3/core-js/math/clamp"`
          )
          expect(code).toContain(
            `import _Math$DEG_PER_RAD from "@babel/runtime-corejs3/core-js/math/deg-per-rad"`
          )
          expect(code).toContain(
            `import _Math$degrees from "@babel/runtime-corejs3/core-js/math/degrees"`
          )
          expect(code).toContain(
            `import _Math$fscale from "@babel/runtime-corejs3/core-js/math/fscale"`
          )
          expect(code).toContain(
            `import _Math$RAD_PER_DEG from "@babel/runtime-corejs3/core-js/math/rad-per-deg"`
          )
          expect(code).toContain(
            `import _Math$radians from "@babel/runtime-corejs3/core-js/math/radians"`
          )
          expect(code).toContain(
            `import _Math$scale from "@babel/runtime-corejs3/core-js/math/scale"`
          )
        })

        // Math.signbit
        // See https://github.com/zloirock/core-js#mathsignbit
        it('polyfills Math.signbit', () => {
          expect(code).toContain(
            `import _Math$signbit from "@babel/runtime-corejs3/core-js/math/signbit"`
          )
        })

        // Number.fromString
        // See https://github.com/zloirock/core-js#numberfromstring
        it('polyfills Number.fromString', () => {
          expect(code).toContain(
            `import _Number$fromString from "@babel/runtime-corejs3/core-js/number/from-string"`
          )
        })

        // Observable
        // See https://github.com/zloirock/core-js#observable
        it('polyfills Observable', () => {
          expect(code).toContain(
            `import _Observable from "@babel/runtime-corejs3/core-js/observable"`
          )
          expect(code).toContain(
            `import _Symbol$observable from "@babel/runtime-corejs3/core-js/symbol/observable"`
          )
        })

        // String.prototype.codePoints
        // See https://github.com/zloirock/core-js#stringprototypecodepoints
        it('polyfills String.prototype.codePoints', () => {
          expect(code).toContain(
            `import _codePointsInstanceProperty from "@babel/runtime-corejs3/core-js/instance/code-points"`
          )
        })

        // Symbol.matcher for pattern matching
        // See https://github.com/zloirock/core-js#symbolmatcher-for-pattern-matching
        // This one's been renamed to Symbol.matcher since core-js v3.0.0. But Symbol.patternMatch still works
        it('polyfills Symbol.matcher', () => {
          expect(code).toContain(
            `import _Symbol$patternMatch from "@babel/runtime-corejs3/core-js/symbol/pattern-match"`
          )
        })
      })

      describe('Stage 2 proposals', () => {
        // Symbol.{ asyncDispose, dispose } for using statement
        // See https://github.com/zloirock/core-js#symbol-asyncdispose-dispose--for-using-statement
        it('polyfills Symbol.{ asyncDispose, dispose } for using statement', () => {
          expect(code).toContain(
            `import _Symbol$dispose from "@babel/runtime-corejs3/core-js/symbol/dispose"`
          )
        })
      })
    })

    describe('Withdrawn proposals (will be removed in core-js 4)', () => {
      // Efficient 64 bit arithmetic
      // See https://github.com/zloirock/core-js#efficient-64-bit-arithmetic
      it('polyfills efficient 64 bit arithmetic', () => {
        expect(code).toContain(
          `import _Math$iaddh from "@babel/runtime-corejs3/core-js/math/iaddh"`
        )
        expect(code).toContain(
          `import _Math$imulh from "@babel/runtime-corejs3/core-js/math/imulh"`
        )
        expect(code).toContain(
          `import _Math$isubh from "@babel/runtime-corejs3/core-js/math/isubh"`
        )
        expect(code).toContain(
          `import _Math$umulh from "@babel/runtime-corejs3/core-js/math/umulh"`
        )
      })

      // Promise.try
      // See https://github.com/zloirock/core-js#promisetry
      it('polyfills Promise.try', () => {
        const _Promise = require('@babel/runtime-corejs3/core-js/promise')
        expect(_Promise).toHaveProperty('try')
      })

      // String#at
      // See https://github.com/zloirock/core-js#stringat
      it('polyfills String#at', () => {
        expect(code).toContain(
          `import _atInstanceProperty from "@babel/runtime-corejs3/core-js/instance/at"`
        )
      })
    })

    describe('Unstable (will be removed in core-js 4)', () => {
      // Seeded pseudo-random numbers
      // See https://github.com/zloirock/core-js#seeded-pseudo-random-numbers
      it('polyfills Seeded pseudo-random numbers', () => {
        expect(code).toContain(
          `import _Math$seededPRNG from "@babel/runtime-corejs3/core-js/math/seeded-prng"`
        )
      })
    })

    it('includes source maps', () => {
      const sourceMaps = code.split('\n').pop()

      const sourceMapsMatcher =
        '//# sourceMappingURL=data:application/json;charset=utf-8;base64,'

      expect(sourceMaps).toMatch(sourceMapsMatcher)

      const [_, base64EncodedFile] = sourceMaps.split(sourceMapsMatcher)

      const { sources } = JSON.parse(
        Buffer.from(base64EncodedFile, 'base64').toString('utf-8')
      )

      expect(sources).toMatchInlineSnapshot(`
        [
          "../../../../../api/src/lib/polyfill.js",
        ]
      `)
    })
  })

  describe('uses core-js3 aliasing', () => {
    beforeAll(() => {
      process.env.RWJS_CWD = RWJS_CWD

      const apiFile = path.join(RWJS_CWD, 'api/src/lib/transform.js')
      const result = prebuildApiFile(apiFile)

      if (!result) {
        throw new Error(`Couldn't prebuild ${apiFile}`)
      }

      code = result.code
    })

    it('works', () => {
      // See https://babeljs.io/docs/en/babel-plugin-transform-runtime#core-js-aliasing
      // This is because we configure the transform runtime plugin corejs

      // Polyfill for Symbol
      expect(code).toContain(
        `import _Symbol from "@babel/runtime-corejs3/core-js/symbol"`
      )

      // Polyfill for Promise
      expect(code).toContain(
        `import _Promise from "@babel/runtime-corejs3/core-js/promise"`
      )

      // Polyfill for .includes
      expect(code).toContain(
        'import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes"'
      )

      // Polyfill for .iterator
      expect(code).toContain(
        `import _getIterator from "@babel/runtime-corejs3/core-js/get-iterator"`
      )
    })
  })

  describe('typescript', () => {
    beforeAll(() => {
      const apiFile = path.join(RWJS_CWD, 'api/src/lib/typescript.ts')
      const result = prebuildApiFile(apiFile)

      if (!result) {
        throw new Error(`Couldn't prebuild ${apiFile}`)
      }

      code = result.code
    })

    it('transpiles ts to js', () => {
      expect(code).toContain('const x = 0')
      expect(code).not.toContain('const x: number = 0')
    })
  })

  // also test for opposite?
  describe('auto imports', () => {
    beforeAll(() => {
      const apiFile = path.join(RWJS_CWD, 'api/src/lib/autoImports.ts')
      const result = prebuildApiFile(apiFile)

      if (!result) {
        throw new Error(`Couldn't prebuild ${apiFile}`)
      }

      code = result.code
    })

    it('auto imports', () => {
      expect(code).toContain(
        'import { context } from "@redwoodjs/graphql-server"'
      )
      expect(code).toContain('import gql from "graphql-tag"')
    })
  })

  // better test...
  describe('directory glob imports', () => {
    beforeAll(() => {
      const apiFile = path.join(RWJS_CWD, 'api/src/lib/directoryGlobImports.ts')
      const result = prebuildApiFile(apiFile)

      if (!result) {
        throw new Error(`Couldn't prebuild ${apiFile}`)
      }

      code = result.code
    })

    it('directory glob imports', () => {
      console.log({
        code,
      })

      expect(code).toContain('export {}')
    })
  })
})
