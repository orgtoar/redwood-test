// This Babel plugin wraps a file that has the suffix `Cell` in Redwood's `createCell` function.
// The function returns a React component that handles the UI during a GraphQL query's lifecycle.
//
// ```tsx
// import { createCell } from '@redwoodjs/web'
//
// // ...
//
// export default createCell({
//   QUERY,
//   Loading,
//   Success,
//   Failure,
//   isEmpty,
//   Empty,
//   beforeQuery,
//   afterQuery,
//   displayName
// })
// ```

import { parse } from 'path'

import type { PluginObj, types } from '@babel/core'

// A Cell can export the following declarations:
const EXPECTED_EXPORTS_FROM_CELL = [
  'beforeQuery',
  'QUERY',
  'isEmpty',
  'afterQuery',
  'Loading',
  'Success',
  'Failure',
  'Empty',
]

export default function ({ types: t }: { types: typeof types }): PluginObj {
  // This array will
  // - collect exports from the Cell file during `ExportNamedDeclaration`
  // - collected exports will then be passed to `createCell`
  // - be cleared after `Program.exit` to prepare for the next file
  let exportNames: string[] = []
  let hasDefaultExport = false

  return {
    name: 'babel-plugin-redwood-cell',
    visitor: {
      ExportDefaultDeclaration() {
        hasDefaultExport = true
        return
      },
      ExportNamedDeclaration(path) {
        const declaration = path.node.declaration

        if (!declaration) {
          return
        }

        let name
        if (declaration.type === 'VariableDeclaration') {
          const id = declaration.declarations[0].id as types.Identifier
          name = id.name as string
        }
        if (declaration.type === 'FunctionDeclaration') {
          name = declaration?.id?.name
        }

        if (name && EXPECTED_EXPORTS_FROM_CELL.includes(name)) {
          exportNames.push(name)
        }
      },
      Program: {
        exit(path) {
          // Validate that this file has exports which are "cell-like":
          // If the user is not exporting `QUERY` and has a default export then
          // it's likely not a cell.
          if (hasDefaultExport && !exportNames.includes('QUERY')) {
            return
          }

          // Insert at the top of the file:
          // + import { createCell } from '@redwoodjs/web'
          path.node.body.unshift(
            t.importDeclaration(
              [
                t.importSpecifier(
                  t.identifier('createCell'),
                  t.identifier('createCell')
                ),
              ],
              t.stringLiteral('@redwoodjs/web')
            )
          )

          // Insert at the bottom of the file:
          // + export default createCell({ QUERY?, Loading?, Success?, Failure?, Empty?, beforeQuery?, isEmpty, afterQuery?, displayName? })
          path.node.body.push(
            t.exportDefaultDeclaration(
              t.callExpression(t.identifier('createCell'), [
                t.objectExpression([
                  ...exportNames.map((name) =>
                    t.objectProperty(
                      t.identifier(name),
                      t.identifier(name),
                      false,
                      true
                    )
                  ),
                  /**
                   * Add the `displayName` property
                   * so we can name the Cell after the filename.
                   */
                  t.objectProperty(
                    t.identifier('displayName'),
                    t.stringLiteral(
                      parse(this.file.opts.filename as string).name
                    ),
                    false,
                    true
                  ),
                ]),
              ])
            )
          )

          hasDefaultExport = false
          exportNames = []
        },
      },
    },
  }
}
