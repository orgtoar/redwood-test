"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.DirectiveType = void 0;
exports.getDirectiveByName = getDirectiveByName;
exports.hasDirective = hasDirective;
exports.isPromise = isPromise;
exports.useRedwoodDirective = void 0;

var _symbol = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/symbol"));

var _utils = require("@graphql-tools/utils");

var _graphql = require("graphql");

// @NOTE don't use unspecified enums, because !type would === true
let DirectiveType;
exports.DirectiveType = DirectiveType;

(function (DirectiveType) {
  DirectiveType["VALIDATOR"] = "VALIDATOR_DIRECTIVE";
  DirectiveType["TRANSFORMER"] = "TRANSFORMER_DIRECTIVE";
})(DirectiveType || (exports.DirectiveType = DirectiveType = {}));

function hasDirective(info) {
  try {
    const {
      parentType,
      fieldName,
      schema
    } = info;
    const schemaType = schema.getType(parentType.name);
    const field = schemaType.getFields()[fieldName];
    const astNode = field.astNode; // if directives array exists, we check the length
    // other wise false

    return !!astNode?.directives?.length;
  } catch (error) {
    console.error(error);
    return false;
  }
}

function getDirectiveByName(fieldConfig, directiveName) {
  const associatedDirective = fieldConfig.astNode?.directives?.find(directive => directive.name.value === directiveName);
  return associatedDirective ?? null;
}

function isPromise(value) {
  return typeof value?.then === 'function';
}

function wrapAffectedResolvers(schema, options) {
  return (0, _utils.mapSchema)(schema, {
    [_utils.MapperKind.OBJECT_FIELD](fieldConfig, _, __, schema) {
      const directiveNode = getDirectiveByName(fieldConfig, options.name);
      const directive = directiveNode ? schema.getDirective(directiveNode.name.value) : null;

      if (directiveNode && directive) {
        const directiveArgs = (0, _graphql.getDirectiveValues)(directive, {
          directives: [directiveNode]
        }) || {};
        const originalResolve = fieldConfig.resolve ?? _graphql.defaultFieldResolver;

        if (_isValidator(options)) {
          return { ...fieldConfig,
            resolve: function useRedwoodDirectiveValidatorResolver(root, args, context, info) {
              const result = options.onResolverCalled({
                root,
                args,
                context,
                info,
                directiveNode,
                directiveArgs
              });

              if (isPromise(result)) {
                return result.then(() => originalResolve(root, args, context, info));
              }

              return originalResolve(root, args, context, info);
            }
          };
        }

        if (_isTransformer(options)) {
          return { ...fieldConfig,
            resolve: function useRedwoodDirectiveTransformerResolver(root, args, context, info) {
              const resolvedValue = originalResolve(root, args, context, info);

              if (isPromise(resolvedValue)) {
                return resolvedValue.then(resolvedValue => options.onResolverCalled({
                  root,
                  args,
                  context,
                  info,
                  directiveNode,
                  directiveArgs,
                  resolvedValue
                }));
              }

              return options.onResolverCalled({
                root,
                args,
                context,
                info,
                directiveNode,
                directiveArgs,
                resolvedValue
              });
            }
          };
        }
      }

      return fieldConfig;
    }

  });
}

const useRedwoodDirective = options => {
  /**
   * This symbol is added to the schema extensions for checking whether the transform got already applied.
   */
  const didMapSchemaSymbol = (0, _symbol.default)('useRedwoodDirective.didMapSchemaSymbol');
  return {
    onSchemaChange({
      schema,
      replaceSchema
    }) {
      /**
       * Currently graphql-js extensions typings are limited to string keys.
       * We are using symbols as each useRedwoodDirective plugin instance should use its own unique symbol.
       */
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error See https://github.com/graphql/graphql-js/pull/3511 - remove this comments once merged
      if (schema.extensions?.[didMapSchemaSymbol] === true) {
        return;
      }

      const transformedSchema = wrapAffectedResolvers(schema, options);
      transformedSchema.extensions = { ...schema.extensions,
        [didMapSchemaSymbol]: true
      };
      replaceSchema(transformedSchema);
    }

  };
}; // For narrowing types


exports.useRedwoodDirective = useRedwoodDirective;

const _isValidator = options => {
  return options.type === DirectiveType.VALIDATOR;
};

const _isTransformer = options => {
  return options.type === DirectiveType.TRANSFORMER;
};