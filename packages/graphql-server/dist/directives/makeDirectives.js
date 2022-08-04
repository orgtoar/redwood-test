"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.makeDirectivesForPlugin = exports.getDirectiveName = exports.createValidatorDirective = exports.createTransformerDirective = void 0;

var _flatMap = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/flat-map"));

var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/entries"));

var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/slice"));

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

var _useRedwoodDirective = require("../plugins/useRedwoodDirective");

const makeDirectivesForPlugin = directiveGlobs => {
  var _context;

  return (0, _flatMap.default)(_context = (0, _entries.default)(directiveGlobs)).call(_context, ([importedGlobName, exports]) => {
    var _context2;

    // Incase the directives get nested, their name comes as nested_directory_filename_directive
    // directiveName is the filename without the directive extension
    // slice gives us ['fileName', 'directive'], so we take the first one
    const [directiveNameFromFile] = (0, _slice.default)(_context2 = importedGlobName.split('_')).call(_context2, -2); // We support exporting both directive name and default
    // e.g. export default createValidatorDirective(schema, validationFunc)
    // or export requireAuth = createValidatorDirective(schema, checkAuth)

    const directive = exports[directiveNameFromFile] || exports.default;

    if (!directive.type) {
      throw new Error('Please use `createValidatorDirective` or `createTransformerDirective` functions to define your directive');
    }

    return [directive];
  });
};

exports.makeDirectivesForPlugin = makeDirectivesForPlugin;

const getDirectiveName = schema => {
  var _context3, _definition$name;

  const definition = (0, _find.default)(_context3 = schema.definitions).call(_context3, definition => definition.kind === 'DirectiveDefinition');
  return (_definition$name = definition.name) === null || _definition$name === void 0 ? void 0 : _definition$name.value;
};

exports.getDirectiveName = getDirectiveName;

const createValidatorDirective = (schema, directiveFunc) => {
  const directiveName = getDirectiveName(schema);

  if (!directiveName) {
    throw new Error('Could not parse directive schema');
  }

  if (typeof directiveFunc !== 'function') {
    throw new Error(`Directive validation function not implemented for @${directiveName}`);
  }

  return {
    name: directiveName,
    schema,
    onResolverCalled: directiveFunc,
    type: _useRedwoodDirective.DirectiveType.VALIDATOR
  };
};

exports.createValidatorDirective = createValidatorDirective;

const createTransformerDirective = (schema, directiveFunc) => {
  const directiveName = getDirectiveName(schema);

  if (!directiveName) {
    throw new Error('Could not parse directive schema');
  }

  if (typeof directiveFunc !== 'function') {
    throw new Error(`Directive transformer function not implemented for @${directiveName}`);
  }

  return {
    name: directiveName,
    schema,
    onResolverCalled: directiveFunc,
    type: _useRedwoodDirective.DirectiveType.TRANSFORMER
  };
};

exports.createTransformerDirective = createTransformerDirective;