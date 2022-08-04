"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uniqueOperationName = exports.getIdType = exports.getCellOperationNames = exports.checkProjectForQueryField = void 0;

require("core-js/modules/esnext.async-iterator.filter.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.filter.js");

require("core-js/modules/esnext.async-iterator.map.js");

require("core-js/modules/esnext.iterator.map.js");

require("core-js/modules/esnext.async-iterator.find.js");

require("core-js/modules/esnext.iterator.find.js");

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/interopRequireWildcard"));

var _pascalcase = _interopRequireDefault(require("pascalcase"));

var _gql = require("@redwoodjs/internal/dist/gql");

const getCellOperationNames = async () => {
  const {
    getProject
  } = await Promise.resolve().then(() => (0, _interopRequireWildcard2.default)(require('@redwoodjs/structure')));
  return getProject().cells.map(x => {
    return x.queryOperationName;
  }).filter(Boolean);
};

exports.getCellOperationNames = getCellOperationNames;

const uniqueOperationName = async (name, {
  index = 1,
  list = false
}) => {
  let operationName = (0, _pascalcase.default)(index <= 1 ? `find_${name}_query` : `find_${name}_query_${index}`);

  if (list) {
    operationName = index <= 1 ? `${(0, _pascalcase.default)(name)}Query` : `${(0, _pascalcase.default)(name)}Query_${index}`;
  }

  const cellOperationNames = await getCellOperationNames();

  if (!cellOperationNames.includes(operationName)) {
    return operationName;
  }

  return uniqueOperationName(name, {
    index: index + 1
  });
};

exports.uniqueOperationName = uniqueOperationName;

const getIdType = model => {
  var _model$fields$find;

  return (_model$fields$find = model.fields.find(field => field.isId)) === null || _model$fields$find === void 0 ? void 0 : _model$fields$find.type;
};
/**
 *
 * This function checks the project for the field name supplied,
 * assuming the schema file has been generated in .redwood/schema.graphql
 * @example
 * checkProjectForQueryField('blogPost') => true/false
 * checkProjectForQueryField('redwood') => true
 *
 **/


exports.getIdType = getIdType;

const checkProjectForQueryField = async queryFieldName => {
  const queryFields = await (0, _gql.listQueryTypeFieldsInProject)();
  return queryFields.includes(queryFieldName);
};

exports.checkProjectForQueryField = checkProjectForQueryField;