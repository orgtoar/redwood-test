"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.parseGqlQueryToAst = exports.parseDocumentAST = exports.listQueryTypeFieldsInProject = void 0;

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

var _codeFileLoader = require("@graphql-tools/code-file-loader");

var _load = require("@graphql-tools/load");

var _graphql = require("graphql");

var _graphqlServer = require("@redwoodjs/graphql-server");

var _paths = require("./paths");

const parseGqlQueryToAst = gqlQuery => {
  const ast = (0, _graphql.parse)(gqlQuery);
  return parseDocumentAST(ast);
};

exports.parseGqlQueryToAst = parseGqlQueryToAst;

const parseDocumentAST = document => {
  const operations = [];
  (0, _graphql.visit)(document, {
    OperationDefinition(node) {
      var _context, _node$name;

      const fields = [];
      (0, _forEach.default)(_context = node.selectionSet.selections).call(_context, field => {
        fields.push(getFields(field));
      });
      operations.push({
        operation: node.operation,
        name: (_node$name = node.name) === null || _node$name === void 0 ? void 0 : _node$name.value,
        fields
      });
    }

  });
  return operations;
};

exports.parseDocumentAST = parseDocumentAST;

const getFields = field => {
  // base
  if (!field.selectionSet) {
    return field.name.value;
  } else {
    const obj = {
      [field.name.value]: []
    };

    const lookAtFieldNode = node => {
      var _node$selectionSet, _context2;

      (_node$selectionSet = node.selectionSet) === null || _node$selectionSet === void 0 ? void 0 : (0, _forEach.default)(_context2 = _node$selectionSet.selections).call(_context2, subField => {
        switch (subField.kind) {
          case 'Field':
            obj[field.name.value].push(getFields(subField));
            break;

          case 'FragmentSpread':
            // TODO: Maybe this will also be needed, right now it's accounted for to not crash in the tests
            break;

          case 'InlineFragment':
            lookAtFieldNode(subField);
        }
      });
    };

    lookAtFieldNode(field);
    return obj;
  }
};

const listQueryTypeFieldsInProject = async () => {
  try {
    var _mergedSchema$getQuer;

    const schemaPointerMap = {
      [(0, _graphql.print)(_graphqlServer.rootSchema.schema)]: {},
      'graphql/**/*.sdl.{js,ts}': {},
      'directives/**/*.{js,ts}': {}
    };
    const mergedSchema = await (0, _load.loadSchema)(schemaPointerMap, {
      loaders: [new _codeFileLoader.CodeFileLoader({
        noRequire: true,
        pluckConfig: {
          globalGqlIdentifierName: 'gql'
        }
      })],
      cwd: (0, _paths.getPaths)().api.src,
      assumeValidSDL: true
    });
    const queryTypeFields = (_mergedSchema$getQuer = mergedSchema.getQueryType()) === null || _mergedSchema$getQuer === void 0 ? void 0 : _mergedSchema$getQuer.getFields(); // Return empty array if no schema found

    return (0, _keys.default)(queryTypeFields !== null && queryTypeFields !== void 0 ? queryTypeFields : {});
  } catch (e) {
    console.error(e);
    return [];
  }
};

exports.listQueryTypeFieldsInProject = listQueryTypeFieldsInProject;