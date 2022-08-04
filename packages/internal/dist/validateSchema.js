"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadAndValidateSdls = exports.DIRECTIVE_REQUIRED_ERROR_MESSAGE = exports.DIRECTIVE_INVALID_ROLE_TYPES_ERROR_MESSAGE = void 0;
exports.validateSchemaForDirectives = validateSchemaForDirectives;

require("core-js/modules/esnext.async-iterator.for-each.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.for-each.js");

require("core-js/modules/esnext.async-iterator.filter.js");

require("core-js/modules/esnext.iterator.filter.js");

require("core-js/modules/esnext.async-iterator.map.js");

require("core-js/modules/esnext.iterator.map.js");

var _codeFileLoader = require("@graphql-tools/code-file-loader");

var _load = require("@graphql-tools/load");

var _merge = require("@graphql-tools/merge");

var _graphql = require("graphql");

var _graphqlServer = require("@redwoodjs/graphql-server");

var _paths = require("./paths");

const DIRECTIVE_REQUIRED_ERROR_MESSAGE = 'You must specify one of @requireAuth, @skipAuth or a custom directive';
exports.DIRECTIVE_REQUIRED_ERROR_MESSAGE = DIRECTIVE_REQUIRED_ERROR_MESSAGE;
const DIRECTIVE_INVALID_ROLE_TYPES_ERROR_MESSAGE = 'Please check that the requireAuth roles is a string or an array of strings.';
exports.DIRECTIVE_INVALID_ROLE_TYPES_ERROR_MESSAGE = DIRECTIVE_INVALID_ROLE_TYPES_ERROR_MESSAGE;

function validateSchemaForDirectives(schemaDocumentNode, typesToCheck = ['Query', 'Mutation']) {
  const validationOutput = [];
  const directiveRoleValidationOutput = [];
  (0, _graphql.visit)(schemaDocumentNode, {
    ObjectTypeDefinition(typeNode) {
      if (typesToCheck.includes(typeNode.name.value)) {
        for (const field of typeNode.fields || []) {
          const fieldName = field.name.value;
          const fieldTypeName = typeNode.name.value;
          const isRedwoodQuery = fieldName === 'redwood' && fieldTypeName === 'Query';
          const isCurrentUserQuery = fieldName === 'currentUser' && fieldTypeName === 'Query'; // skip validation for redwood query and currentUser

          if (!(isRedwoodQuery || isCurrentUserQuery)) {
            var _field$directives, _field$directives2;

            const hasDirective = (_field$directives = field.directives) === null || _field$directives === void 0 ? void 0 : _field$directives.length;

            if (!hasDirective) {
              validationOutput.push(`${fieldName} ${fieldTypeName}`);
            } // we want to check that the requireAuth directive roles argument value
            // is a string or an array of strings


            (_field$directives2 = field.directives) === null || _field$directives2 === void 0 ? void 0 : _field$directives2.forEach(directive => {
              if (directive.name.value === 'requireAuth') {
                var _directive$arguments;

                (_directive$arguments = directive.arguments) === null || _directive$arguments === void 0 ? void 0 : _directive$arguments.forEach(arg => {
                  if (arg.name.value === 'roles') {
                    if (arg.value.kind !== _graphql.Kind.STRING && arg.value.kind !== _graphql.Kind.LIST) {
                      directiveRoleValidationOutput.push({
                        fieldName: fieldName,
                        invalid: arg.value.kind
                      });
                    } // check list (array)


                    if (arg.value.kind === _graphql.Kind.LIST) {
                      var _arg$value$values;

                      const invalidValues = (_arg$value$values = arg.value.values) === null || _arg$value$values === void 0 ? void 0 : _arg$value$values.filter(val => val.kind !== _graphql.Kind.STRING);

                      if (invalidValues.length > 0) {
                        invalidValues.forEach(invalid => {
                          directiveRoleValidationOutput.push({
                            fieldName: fieldName,
                            invalid: invalid.kind
                          });
                        });
                      }
                    }
                  }
                });
              }
            });
          }
        }
      }
    }

  });

  if (validationOutput.length > 0) {
    const fieldsWithoutDirectives = validationOutput.map(field => `- ${field}`);
    throw new Error(`${DIRECTIVE_REQUIRED_ERROR_MESSAGE} for\n${fieldsWithoutDirectives.join('\n')} \n`);
  }

  if (directiveRoleValidationOutput.length > 0) {
    const fieldWithInvalidRoleValues = directiveRoleValidationOutput.map(field => `- ${field.fieldName} has an invalid ${field.invalid}`);
    throw new RangeError(`${DIRECTIVE_INVALID_ROLE_TYPES_ERROR_MESSAGE}\n\n${fieldWithInvalidRoleValues.join('\n')} \n\nFor example: @requireAuth(roles: "admin") or @requireAuth(roles: ["admin", "editor"])`);
  }
}

const loadAndValidateSdls = async () => {
  const projectTypeSrc = await (0, _load.loadTypedefs)(['graphql/**/*.sdl.{js,ts}', 'directives/**/*.{js,ts}'], {
    loaders: [new _codeFileLoader.CodeFileLoader({
      noRequire: true,
      pluckConfig: {
        globalGqlIdentifierName: 'gql'
      }
    })],
    cwd: (0, _paths.getPaths)().api.src
  }); // The output of the above function doesn't give us the documents directly

  const projectDocumentNodes = Object.values(projectTypeSrc).map(({
    document
  }) => document).filter(documentNode => {
    return !!documentNode;
  }); // Merge in the rootSchema with JSON scalars, etc.

  const mergedDocumentNode = (0, _merge.mergeTypeDefs)([_graphqlServer.rootSchema.schema, projectDocumentNodes]);
  validateSchemaForDirectives(mergedDocumentNode);
};

exports.loadAndValidateSdls = loadAndValidateSdls;