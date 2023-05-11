import { merge } from '../merge'
import { concatUnique } from '../merge/strategy'

import { unindented } from './fixtures/unindented'

const expectMerged = (base, ext, merged, strategy = {}) => {
  expect(merge(unindented(base), unindented(ext), strategy)).toBe(
    unindented(merged)
  )
}

const expectTrivialConcat = (base, ext, strategy = {}) => {
  const ubase = unindented(base)
  const uext = unindented(ext)
  expect(merge(ubase, uext, strategy)).toBe(`${ubase}\n${uext}\n`)
}

describe('the basics', () => {
  it('Inserts extension declarations in the last possible position', () => {
    // Notice how 'y' is reordered above 'list' to ensure its reference in 'list' is valid.
    expectMerged(
      `\
      const x = 'x'
      const list = [x]
      `,
      `\
       const y = 'y'
       const list = [y]
       `,
      `\
      const x = 'x'
      const y = 'y'
      const list = [x, y]
      `,
      { ArrayExpression: concatUnique }
    )
  })
})

describe('Import behavior', () => {
  it('keeps both identical namespace imports', () => {
    expectTrivialConcat(
      "import * as React from 'react'",
      "import * as React from 'react'"
    )
  })

  it('keeps both identical specifier imports', () => {
    expectTrivialConcat(
      "import { foo } from 'source'",
      "import { foo } from 'source'"
    )
  })

  it('keeps both differing import specifiers in separate imports', () => {
    expectTrivialConcat(
      "import { bar } from 'source'",
      "import { foo } from 'source'"
    )
  })

  it('keeps both differing sets of import specifiers, even with an overlap.', () => {
    expectTrivialConcat(
      "import { foo, bar } from 'source'",
      "import { bar, baz } from 'source'"
    )
  })

  it('keeps both default and specifier imports', () => {
    expectTrivialConcat(
      "import def from 'source'",
      "import { foo } from 'source'"
    )
  })

  it('keeps both default + specifier and specifier imports', () => {
    expectTrivialConcat(
      "import def, { foo } from 'source'",
      "import { bar } from 'source'"
    )
  })

  it('keeps both specifier and default imports', () => {
    expectTrivialConcat(
      "import { foo } from 'source'",
      "import def from 'source'"
    )
  })

  it('does not merge import namespace identifiers with conflicting local names', () => {
    expectTrivialConcat(
      "import * as One from 'source'",
      "import * as Two from 'source'"
    )
  })

  it('does not merge default specifiers with conflicting local names', () => {
    expectTrivialConcat("import One from 'source'", "import Two from 'source'")
  })

  it('does not merge side-effect imports and default imports', () => {
    expectTrivialConcat("import 'source'", "import Def from 'source'")
  })

  it('does not merge side-effect imports and namespace imports', () => {
    expectTrivialConcat("import 'source'", "import * as Name from 'source'")
  })

  it('does not merge side-effect imports import specifiers', () => {
    expectTrivialConcat("import 'source'", "import { foo, bar } from 'source'")
  })

  it('Does not merge side-effect imports with other import types', () => {
    expectTrivialConcat(
      "import def, { foo, bar } from 'source'",
      "import 'source'"
    )
  })

  it('keeps both import default specifiers and import namespace identifiers', () => {
    expectTrivialConcat(
      "import src from 'source'",
      "import * as Source from 'source'"
    )
  })

  it('keeps all imports with the same source', () => {
    expectTrivialConcat(
      "import { foo } from 'source'",
      "import { bar } from 'source'\nimport { baz } from 'source'"
    )
  })

  it('keeps multiple default imports with the same source', () => {
    expectTrivialConcat(
      "import default1 from 'source'",
      "import default2 from 'source'\nimport { foo } from 'source'"
    )
  })

  it('keeps multiple types of imports with the same source', () => {
    expectTrivialConcat(
      "import default1 from 'source'\nimport * as namespace from 'source'",
      "import default2 from 'source'\nimport { foo } from 'source'"
    )
  })
})
