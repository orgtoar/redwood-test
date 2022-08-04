"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.getSchemaDefinitions = exports.getSchemaConfig = exports.getSchema = exports.getEnum = void 0;
exports.verifyModelName = verifyModelName;

var _values = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/values"));

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _values2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/values"));

var _fs = _interopRequireDefault(require("fs"));

var _sdk = require("@prisma/sdk");

var _pluralHelpers = require("./pluralHelpers");

var _rwPluralize = require("./rwPluralize");

var _ = require("./");

/**
 * Used to memoize results from `getSchema` so we don't have to go through
 * the work of open the file and parsing it from scratch each time getSchema()
 * is called with the same model name.
 */
const schemaMemo = {};
/**
 * Searches for the given model (ignoring case) in schema.prisma
 * and returns the name as it is written by the user, or
 * `undefined` if no model could be found
 */

const getExistingModelName = async name => {
  if (!name) {
    return undefined;
  } // Support PascalCase, camelCase, kebab-case, UPPER_CASE, and lowercase model
  // names


  const modelName = name.replace(/[_-]/g, '').toLowerCase();

  for (let model of (0, _values.default)(schemaMemo)) {
    if (model.name.toLowerCase() === modelName) {
      return model.name;
    }
  }

  const schema = await getSchemaDefinitions();

  for (let model of schema.datamodel.models) {
    if (model.name.toLowerCase() === modelName) {
      return model.name;
    }
  }

  return undefined;
};
/**
 * Returns the database schema for the given `name` database table parsed from
 * the schema.prisma of the target application. If no `name` is given then the
 * entire schema is returned.
 */


const getSchema = async name => {
  if (name) {
    const modelName = await getExistingModelName(name);

    if (!modelName) {
      throw new Error(`No schema definition found for \`${name}\` in schema.prisma file`);
    }

    if (!schemaMemo[modelName]) {
      var _context;

      const schema = await getSchemaDefinitions();
      const model = (0, _find.default)(_context = schema.datamodel.models).call(_context, model => {
        return model.name === modelName;
      });

      if (model) {
        var _context2;

        // look for any fields that are enums and attach the possible enum values
        // so we can put them in generated test files
        (0, _forEach.default)(_context2 = model.fields).call(_context2, field => {
          var _context3;

          const fieldEnum = (0, _find.default)(_context3 = schema.datamodel.enums).call(_context3, e => {
            return field.type === e.name;
          });

          if (fieldEnum) {
            field.enumValues = (0, _values2.default)(fieldEnum);
          }
        }); // memoize based on the model name

        schemaMemo[modelName] = model;
      }
    }

    return schemaMemo[modelName];
  } else {
    return (await getSchemaDefinitions()).datamodel;
  }
};
/**
 * Returns the enum defined with the given `name` parsed from
 * the schema.prisma of the target application. If no `name` is given then the
 * all enum definitions are returned
 */


exports.getSchema = getSchema;

const getEnum = async name => {
  const schema = await getSchemaDefinitions();

  if (name) {
    var _context4;

    const model = (0, _find.default)(_context4 = schema.datamodel.enums).call(_context4, model => {
      return model.name === name;
    });

    if (model) {
      return model;
    } else {
      throw new Error(`No enum schema definition found for \`${name}\` in schema.prisma file`);
    }
  }

  return schema.metadata.datamodel.enums;
};
/*
 * Returns the DMMF defined by `prisma` resolving the relevant `schema.prisma` path.
 */


exports.getEnum = getEnum;

const getSchemaDefinitions = () => {
  return (0, _sdk.getDMMF)({
    datamodelPath: (0, _.getPaths)().api.dbSchema
  });
};
/*
 * Returns the config info defined in `schema.prisma` (provider, datasource, etc.)
 */


exports.getSchemaDefinitions = getSchemaDefinitions;

const getSchemaConfig = () => {
  return (0, _sdk.getConfig)({
    datamodel: _fs.default.readFileSync((0, _.getPaths)().api.dbSchema).toString()
  });
};

exports.getSchemaConfig = getSchemaConfig;

async function verifyModelName(options) {
  const modelName = (await getExistingModelName(options.name)) || (await getExistingModelName((0, _rwPluralize.singularize)(options.name)));

  if (modelName === undefined) {
    throw new Error(`"${options.name}" model not found, check if it exists in "./api/db/schema.prisma"`);
  }

  await (0, _pluralHelpers.ensureUniquePlural)({
    model: modelName,
    isDestroyer: options.isDestroyer,
    forcePrompt: (0, _rwPluralize.isPlural)(modelName)
  });
  return { ...options,
    name: modelName
  };
}