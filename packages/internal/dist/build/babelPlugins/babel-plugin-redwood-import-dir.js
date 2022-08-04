"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = _default;

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _path = _interopRequireDefault(require("path"));

var _fastGlob = _interopRequireDefault(require("fast-glob"));

var _paths = require("../../paths");

/**
 * This babel plugin will search for import statements that include star `**`
 * in the source part of the statement is a glob, the files that are matched are imported,
 * and appended to an object.
 *
 * @example:
 * Given a directory "src/services" that contains "a.js" and "b.ts", "nested/c.js",
 * will produce the following results:
 * ```js
 * import services from 'src/services/**\/*.{js,ts}'
 * console.log(services)
 * // services.a = require('src/services/a.js')
 * // services.b = require('src/services/b.ts')
 * // services.nested_c = require('src/services/nested/c.js')
 * ```
 */
function _default({
  types: t
}) {
  return {
    name: 'babel-plugin-redwood-import-dir',
    visitor: {
      ImportDeclaration(p, state) {
        var _context, _context2, _context3, _context4;

        // This code will only run when we find an import statement that includes a `**`.
        if (!(0, _includes.default)(_context = p.node.source.value).call(_context, '**')) {
          return;
        }

        const nodes = []; // import <node.specifiers[0].local.name> from <node.source.value>
        // + let importName = {}

        const importName = p.node.specifiers[0].local.name;
        nodes.push(t.variableDeclaration('let', [t.variableDeclarator(t.identifier(importName), t.objectExpression([]))]));
        const importGlob = (0, _paths.importStatementPath)(p.node.source.value);

        const cwd = _path.default.dirname(state.file.opts.filename);

        const dirFiles = (0, _filter.default)(_context2 = (0, _filter.default)(_context3 = (0, _filter.default)(_context4 = _fastGlob.default.sync(importGlob, {
          cwd
        })).call(_context4, n => !(0, _includes.default)(n).call(n, '.test.')) // ignore `*.test.*` files.
        ).call(_context3, n => !(0, _includes.default)(n).call(n, '.scenarios.')) // ignore `*.scenarios.*` files.
        ).call(_context2, n => !(0, _includes.default)(n).call(n, '.d.ts'));
        const staticGlob = importGlob.split('*')[0];

        const filePathToVarName = filePath => {
          return filePath.replace(staticGlob, '').replace(/\.(js|ts)$/, '').replace(/[^a-zA-Z0-9]/g, '_');
        };

        for (const filePath of dirFiles) {
          const {
            dir: fileDir,
            name: fileName
          } = _path.default.parse(filePath);

          const filePathWithoutExtension = fileDir + '/' + fileName;
          const fpVarName = filePathToVarName(filePath); // + import * as <importName>_<fpVarName> from <filePathWithoutExtension>
          // import * as a from './services/a

          nodes.push(t.importDeclaration([t.importNamespaceSpecifier(t.identifier(importName + '_' + fpVarName))], t.stringLiteral(filePathWithoutExtension))); // + <importName>.<fpVarName> = <importName_fpVarName>
          // services.a = a

          nodes.push(t.expressionStatement(t.assignmentExpression('=', t.memberExpression(t.identifier(importName), t.identifier(fpVarName)), t.identifier(importName + '_' + fpVarName))));
        }

        for (const node of nodes) {
          p.insertBefore(node);
        } // - import importName from "dirPath"


        p.remove();
      }

    }
  };
}