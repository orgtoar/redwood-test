"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.makeMergedSchema = void 0;

var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reduce"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _startsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/starts-with"));

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _values = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/values"));

var _merge = require("@graphql-tools/merge");

var _schema = require("@graphql-tools/schema");

var _lodash = _interopRequireDefault(require("lodash.merge"));

var _lodash2 = _interopRequireDefault(require("lodash.omitby"));

var rootGqlSchema = _interopRequireWildcard(require("../rootSchema"));

const mapFieldsToService = ({
  fields = {},
  resolvers: unmappedResolvers,
  services
}) => {
  var _context;

  return (0, _reduce.default)(_context = (0, _keys.default)(fields)).call(_context, (resolvers, name) => {
    // Does the function already exist in the resolvers from the schema definition?
    if (resolvers !== null && resolvers !== void 0 && resolvers[name]) {
      return resolvers;
    } // Does a function exist in the service?


    if (services !== null && services !== void 0 && services[name]) {
      return { ...resolvers,
        // Map the arguments from GraphQL to an ordinary function a service would
        // expect.
        [name]: (root, args, context, info) => services[name](args, {
          root,
          context,
          info
        })
      };
    }

    return resolvers;
  }, unmappedResolvers);
};
/**
 *
 * @param types on Union type: i.e for union Media =  Book | Movie, parameter = [Book, Movie]
 * @returns null | string: Type name of the union's type that is returned.
 * If null or invalid value is returned, will trigger a GQL error
 */


const resolveUnionType = types => ({
  __resolveType(obj) {
    var _maxIntersectionType$, _maxIntersectionType;

    // resolves type of object by looking for the largest intersection of common fields
    let maxIntersectionType;
    let maxIntersectionFields = 0;

    for (const type of types) {
      var _context2;

      const fieldIntersection = (0, _filter.default)(_context2 = (0, _keys.default)(type.getFields())).call(_context2, field => field in obj);

      if (fieldIntersection.length > maxIntersectionFields) {
        maxIntersectionFields = fieldIntersection.length;
        maxIntersectionType = type;
      }
    }

    return (_maxIntersectionType$ = (_maxIntersectionType = maxIntersectionType) === null || _maxIntersectionType === void 0 ? void 0 : _maxIntersectionType.name) !== null && _maxIntersectionType$ !== void 0 ? _maxIntersectionType$ : null;
  }

});
/**
 * This iterates over all the schemas definitions and figures out which resolvers
 * are missing, it then tries to add the missing resolvers from the corresponding
 * service.
 */


const mergeResolversWithServices = ({
  schema,
  resolvers,
  services
}) => {
  var _context3, _context4, _context5, _context6, _context7, _context8, _context9, _context10;

  const mergedServices = (0, _lodash.default)({}, ...(0, _map.default)(_context3 = (0, _keys.default)(services)).call(_context3, name => services[name])); // Get a list of types that have fields.
  // TODO: Figure out if this would interfere with other types: Interface types, etc.`

  const typesWithFields = (0, _filter.default)(_context4 = (0, _map.default)(_context5 = (0, _filter.default)(_context6 = (0, _filter.default)(_context7 = (0, _keys.default)(schema.getTypeMap())).call(_context7, name => !(0, _startsWith.default)(name).call(name, '_'))).call(_context6, name => typeof schema.getType(name).getFields !== 'undefined')).call(_context5, name => {
    return schema.getType(name);
  })).call(_context4, type => type !== undefined && type !== null); // gets union types, which does not have fields but has types. i.e union Media = Book | Movie

  const unionTypes = (0, _filter.default)(_context8 = (0, _map.default)(_context9 = (0, _filter.default)(_context10 = (0, _keys.default)(schema.getTypeMap())).call(_context10, name => typeof schema.getType(name).getTypes !== 'undefined')).call(_context9, name => {
    return schema.getType(name);
  })).call(_context8, type => type !== undefined && type !== null);
  const mappedResolvers = (0, _reduce.default)(typesWithFields).call(typesWithFields, (acc, type) => {
    var _context11;

    // Services export Query and Mutation field resolvers as named exports,
    // but other GraphQLObjectTypes are exported as an object that are named
    // after the type.
    // Example: export const MyType = { field: () => {} }
    let servicesForType = mergedServices;

    if (!(0, _includes.default)(_context11 = ['Query', 'Mutation']).call(_context11, type.name)) {
      servicesForType = mergedServices === null || mergedServices === void 0 ? void 0 : mergedServices[type.name];
    }

    return { ...acc,
      [type.name]: mapFieldsToService({
        fields: type.getFields(),
        resolvers: resolvers === null || resolvers === void 0 ? void 0 : resolvers[type.name],
        services: servicesForType
      })
    };
  }, {});
  const mappedUnionResolvers = (0, _reduce.default)(unionTypes).call(unionTypes, (acc, type) => {
    return { ...acc,
      [type.name]: resolveUnionType(type.getTypes())
    };
  }, {});
  return (0, _lodash2.default)({ ...resolvers,
    ...mappedResolvers,
    ...mappedUnionResolvers
  }, v => typeof v === 'undefined');
};

const mergeResolvers = schemas => {
  var _context12;

  return (0, _lodash2.default)((0, _lodash.default)({}, ...[rootGqlSchema.resolvers, ...(0, _map.default)(_context12 = (0, _values.default)(schemas)).call(_context12, ({
    resolvers
  }) => resolvers)]), v => typeof v === 'undefined');
};
/**
 * Merge GraphQL typeDefs and resolvers into a single schema.
 *
 * @example
 * ```js
 * const schemas = importAll('api', 'graphql')
 * const services = importAll('api', 'services')
 *
 * const schema = makeMergedSchema({
 *  schema,
 *  services,
 * })
 * ```
 */

/**
 * Update January 2021
 * Merge GraphQL Schemas has been replaced by @graphql-toolkit/schema-merging
 * The following code proxies the original mergeTypes to the new mergeTypeDefs
 * https://www.graphql-tools.com/docs/migration-from-merge-graphql-schemas/
 **/


const mergeTypes = (types, options) => {
  const schemaDefinition = options && typeof options.schemaDefinition === 'boolean' ? options.schemaDefinition : true;
  return (0, _merge.mergeTypeDefs)(types, {
    useSchemaDefinition: schemaDefinition,
    forceSchemaDefinition: schemaDefinition,
    throwOnConflict: true,
    commentDescriptions: true,
    reverseDirectives: true,
    ...options
  });
};

const makeMergedSchema = ({
  sdls,
  services,
  schemaOptions = {},
  directives
}) => {
  var _context13;

  const sdlSchemas = (0, _map.default)(_context13 = (0, _values.default)(sdls)).call(_context13, ({
    schema
  }) => schema);
  const typeDefs = mergeTypes([rootGqlSchema.schema, ...(0, _map.default)(directives).call(directives, directive => directive.schema), // pick out schemas from directives
  ...sdlSchemas // pick out the schemas from sdls
  ], {
    all: true
  });
  const {
    typeDefs: schemaOptionsTypeDefs = [],
    ...otherSchemaOptions
  } = schemaOptions;
  const schema = (0, _schema.makeExecutableSchema)({
    typeDefs: [typeDefs, schemaOptionsTypeDefs],
    ...otherSchemaOptions
  });
  const resolvers = mergeResolversWithServices({
    schema,
    resolvers: mergeResolvers(sdls),
    services
  });
  const {
    resolverValidationOptions,
    inheritResolversFromInterfaces
  } = schemaOptions || {};
  return (0, _schema.addResolversToSchema)({
    schema,
    resolvers,
    resolverValidationOptions,
    inheritResolversFromInterfaces
  });
};

exports.makeMergedSchema = makeMergedSchema;