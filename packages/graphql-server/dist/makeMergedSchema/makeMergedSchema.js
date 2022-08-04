"use strict";

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeMergedSchema = void 0;

require("core-js/modules/esnext.async-iterator.reduce.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.reduce.js");

require("core-js/modules/es.object.has-own.js");

require("core-js/modules/esnext.async-iterator.filter.js");

require("core-js/modules/esnext.iterator.filter.js");

require("core-js/modules/esnext.async-iterator.map.js");

require("core-js/modules/esnext.iterator.map.js");

var _merge = require("@graphql-tools/merge");

var _schema = require("@graphql-tools/schema");

var _lodash = _interopRequireDefault(require("lodash.merge"));

var _lodash2 = _interopRequireDefault(require("lodash.omitby"));

var rootGqlSchema = _interopRequireWildcard(require("../rootSchema"));

const mapFieldsToService = ({
  fields = {},
  resolvers: unmappedResolvers,
  services
}) => Object.keys(fields).reduce((resolvers, name) => {
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
/**
 *
 * @param types on Union type: i.e for union Media =  Book | Movie, parameter = [Book, Movie]
 * @returns null | string: Type name of the union's type that is returned.
 * If null or invalid value is returned, will trigger a GQL error
 */


const resolveUnionType = types => ({
  __resolveType(obj) {
    var _maxIntersectionType$, _maxIntersectionType;

    // if obj has __typename, check that first to resolve type, otherwise, look for largest intersection
    if (Object.hasOwn(obj, '__typename')) {
      for (const type of types) {
        if (type.name === obj['__typename']) {
          return type.name;
        }
      }
    }

    const fieldIntersections = new Array(types.length).fill(0);
    let maxIntersectionFields = 0;
    let maxIntersectionType;
    let maxIntersectionIdx = 0;

    for (let i = 0; i < types.length; i++) {
      const type = types[i];
      const fieldIntersection = Object.keys(type.getFields()).filter(field => field in obj);
      fieldIntersections[i] = fieldIntersection.length; // update max intersection fields, type and index

      if (fieldIntersection.length > maxIntersectionFields) {
        maxIntersectionFields = fieldIntersection.length;
        maxIntersectionType = type;
        maxIntersectionIdx = i;
      }
    } // If the maxIntersection fields is not unique, we are unable to determine type


    if (fieldIntersections.indexOf(maxIntersectionFields, maxIntersectionIdx + 1) !== -1) {
      throw Error('Unable to resolve correct type for union. Try adding unique fields to each type or __typename to each resolver');
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
  const mergedServices = (0, _lodash.default)({}, ...Object.keys(services).map(name => services[name])); // Get a list of types that have fields.
  // TODO: Figure out if this would interfere with other types: Interface types, etc.`

  const typesWithFields = Object.keys(schema.getTypeMap()).filter(name => !name.startsWith('_')).filter(name => typeof schema.getType(name).getFields !== 'undefined').map(name => {
    return schema.getType(name);
  }).filter(type => type !== undefined && type !== null); // gets union types, which does not have fields but has types. i.e union Media = Book | Movie

  const unionTypes = Object.keys(schema.getTypeMap()).filter(name => typeof schema.getType(name).getTypes !== 'undefined').map(name => {
    return schema.getType(name);
  }).filter(type => type !== undefined && type !== null);
  const mappedResolvers = typesWithFields.reduce((acc, type) => {
    // Services export Query and Mutation field resolvers as named exports,
    // but other GraphQLObjectTypes are exported as an object that are named
    // after the type.
    // Example: export const MyType = { field: () => {} }
    let servicesForType = mergedServices;

    if (!['Query', 'Mutation'].includes(type.name)) {
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
  const mappedUnionResolvers = unionTypes.reduce((acc, type) => {
    return { ...acc,
      [type.name]: resolveUnionType(type.getTypes())
    };
  }, {});
  return (0, _lodash2.default)({ ...resolvers,
    ...mappedResolvers,
    ...mappedUnionResolvers
  }, v => typeof v === 'undefined');
};

const mergeResolvers = schemas => (0, _lodash2.default)((0, _lodash.default)({}, ...[rootGqlSchema.resolvers, ...Object.values(schemas).map(({
  resolvers
}) => resolvers)]), v => typeof v === 'undefined');
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
  const sdlSchemas = Object.values(sdls).map(({
    schema
  }) => schema);
  const typeDefs = mergeTypes([rootGqlSchema.schema, ...directives.map(directive => directive.schema), // pick out schemas from directives
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