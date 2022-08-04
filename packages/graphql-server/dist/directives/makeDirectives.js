"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeDirectivesForPlugin = exports.getDirectiveName = exports.createValidatorDirective = exports.createTransformerDirective = void 0;

var _useRedwoodDirective = require("../plugins/useRedwoodDirective");

const makeDirectivesForPlugin = directiveGlobs => {
  return Object.entries(directiveGlobs).flatMap(([importedGlobName, exports]) => {
    // Incase the directives get nested, their name comes as nested_directory_filename_directive
    // directiveName is the filename without the directive extension
    // slice gives us ['fileName', 'directive'], so we take the first one
    const [directiveNameFromFile] = importedGlobName.split('_').slice(-2); // We support exporting both directive name and default
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
  var _definition$name;

  const definition = schema.definitions.find(definition => definition.kind === 'DirectiveDefinition');
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