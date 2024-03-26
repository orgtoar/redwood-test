"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.uniqueOperationName = exports.operationNameIsUnique = exports.getIdType = exports.getIdName = exports.getCellOperationNames = exports.checkProjectForQueryField = void 0;
var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));
var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));
var _pascalcase = _interopRequireDefault(require("pascalcase"));
var _gql = require("@redwoodjs/internal/dist/gql");
const getCellOperationNames = async () => {
  var _context, _context2;
  const {
    getProject
  } = await import('@redwoodjs/structure');
  return (0, _filter.default)(_context = (0, _map.default)(_context2 = getProject().cells).call(_context2, x => {
    return x.queryOperationName;
  })).call(_context, Boolean);
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
  if (!(0, _includes.default)(cellOperationNames).call(cellOperationNames, operationName)) {
    return operationName;
  }
  return uniqueOperationName(name, {
    index: index + 1
  });
};
exports.uniqueOperationName = uniqueOperationName;
const operationNameIsUnique = async operationName => {
  const cellOperationNames = await getCellOperationNames();
  return !(0, _includes.default)(cellOperationNames).call(cellOperationNames, operationName);
};
exports.operationNameIsUnique = operationNameIsUnique;
const getIdType = model => {
  var _context3;
  return (0, _find.default)(_context3 = model.fields).call(_context3, field => field.isId)?.type;
};
exports.getIdType = getIdType;
const getIdName = model => {
  var _context4;
  return (0, _find.default)(_context4 = model.fields).call(_context4, field => field.isId)?.name;
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
exports.getIdName = getIdName;
const checkProjectForQueryField = async queryFieldName => {
  const queryFields = await (0, _gql.listQueryTypeFieldsInProject)();
  return (0, _includes.default)(queryFields).call(queryFields, queryFieldName);
};
exports.checkProjectForQueryField = checkProjectForQueryField;