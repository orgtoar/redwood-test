"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uniqueOperationName = exports.getIdType = exports.getCellOperationNames = exports.checkProjectForQueryField = void 0;

var _pascalcase = _interopRequireDefault(require("pascalcase"));

var _gql = require("@redwoodjs/internal/dist/gql");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const getCellOperationNames = async () => {
  const {
    getProject
  } = await Promise.resolve().then(() => _interopRequireWildcard(require('@redwoodjs/structure')));
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