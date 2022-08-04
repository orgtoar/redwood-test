"use strict";

var _Object$defineProperty2 = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty2(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/define-property"));

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

var _classPrivateFieldLooseBase2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/classPrivateFieldLooseBase"));

var _classPrivateFieldLooseKey2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/classPrivateFieldLooseKey"));

var _hasMany = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("hasMany");

var _belongsTo = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("belongsTo");

var _attributes = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("attributes");

var _schemaForModel = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("schemaForModel");

var _parseHasMany = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("parseHasMany");

var _parseBelongsTo = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("parseBelongsTo");

var _parseAttributes = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("parseAttributes");

// Introspects a given model and returns its attributes and figures out what
// other models it belongs to or has many of.
class Reflection {
  constructor(_model) {
    (0, _defineProperty.default)(this, _parseAttributes, {
      value: _parseAttributes2
    });
    (0, _defineProperty.default)(this, _parseBelongsTo, {
      value: _parseBelongsTo2
    });
    (0, _defineProperty.default)(this, _parseHasMany, {
      value: _parseHasMany2
    });
    (0, _defineProperty.default)(this, _schemaForModel, {
      value: _schemaForModel2
    });
    (0, _defineProperty.default)(this, _hasMany, {
      writable: true,
      value: null
    });
    (0, _defineProperty.default)(this, _belongsTo, {
      writable: true,
      value: null
    });
    (0, _defineProperty.default)(this, _attributes, {
      writable: true,
      value: null
    });
    this.model = _model;
  }

  get attributes() {
    if (!(0, _classPrivateFieldLooseBase2.default)(this, _attributes)[_attributes]) {
      (0, _classPrivateFieldLooseBase2.default)(this, _parseAttributes)[_parseAttributes]();
    }

    return (0, _classPrivateFieldLooseBase2.default)(this, _attributes)[_attributes];
  }

  get belongsTo() {
    if (!(0, _classPrivateFieldLooseBase2.default)(this, _belongsTo)[_belongsTo]) {
      (0, _classPrivateFieldLooseBase2.default)(this, _parseBelongsTo)[_parseBelongsTo]();
    }

    return (0, _classPrivateFieldLooseBase2.default)(this, _belongsTo)[_belongsTo];
  }

  get hasMany() {
    if (!(0, _classPrivateFieldLooseBase2.default)(this, _hasMany)[_hasMany]) {
      (0, _classPrivateFieldLooseBase2.default)(this, _parseHasMany)[_parseHasMany]();
    }

    return (0, _classPrivateFieldLooseBase2.default)(this, _hasMany)[_hasMany];
  } // Finds the schema for a single model


}

exports.default = Reflection;

function _schemaForModel2(name = this.model.name) {
  var _context;

  return (0, _find.default)(_context = this.model.schema.models).call(_context, model => model.name === name);
}

function _parseHasMany2() {
  var _selfSchema$fields;

  const selfSchema = (0, _classPrivateFieldLooseBase2.default)(this, _schemaForModel)[_schemaForModel]();

  (0, _classPrivateFieldLooseBase2.default)(this, _hasMany)[_hasMany] = {};
  selfSchema === null || selfSchema === void 0 ? void 0 : (_selfSchema$fields = selfSchema.fields) === null || _selfSchema$fields === void 0 ? void 0 : (0, _forEach.default)(_selfSchema$fields).call(_selfSchema$fields, field => {
    if (field.isList) {
      var _context2;

      // get other side of relationship to determine foreign key name
      const otherSchema = (0, _classPrivateFieldLooseBase2.default)(this, _schemaForModel)[_schemaForModel](field.type);

      const belongsTo = (0, _find.default)(_context2 = otherSchema.fields).call(_context2, field => field.type === this.model.name);
      (0, _classPrivateFieldLooseBase2.default)(this, _hasMany)[_hasMany][field.name] = {
        modelName: field.type,
        referenceName: belongsTo.name,
        // a null foreign key denotes an implicit many-to-many relationship
        foreignKey: belongsTo.relationFromFields[0] || null,
        primaryKey: belongsTo.relationToFields[0]
      };
    }
  });
}

function _parseBelongsTo2() {
  var _selfSchema$fields2;

  const selfSchema = (0, _classPrivateFieldLooseBase2.default)(this, _schemaForModel)[_schemaForModel]();

  (0, _classPrivateFieldLooseBase2.default)(this, _belongsTo)[_belongsTo] = {};
  selfSchema === null || selfSchema === void 0 ? void 0 : (_selfSchema$fields2 = selfSchema.fields) === null || _selfSchema$fields2 === void 0 ? void 0 : (0, _forEach.default)(_selfSchema$fields2).call(_selfSchema$fields2, field => {
    var _field$relationFromFi;

    if ((_field$relationFromFi = field.relationFromFields) !== null && _field$relationFromFi !== void 0 && _field$relationFromFi.length) {
      (0, _classPrivateFieldLooseBase2.default)(this, _belongsTo)[_belongsTo][field.name] = {
        modelName: field.type,
        foreignKey: field.relationFromFields[0],
        primaryKey: field.relationToFields[0]
      };
    }
  });
}

function _parseAttributes2() {
  var _selfSchema$fields3;

  const selfSchema = (0, _classPrivateFieldLooseBase2.default)(this, _schemaForModel)[_schemaForModel]();

  (0, _classPrivateFieldLooseBase2.default)(this, _attributes)[_attributes] = {};

  if (!(0, _classPrivateFieldLooseBase2.default)(this, _hasMany)[_hasMany]) {
    (0, _classPrivateFieldLooseBase2.default)(this, _parseHasMany)[_parseHasMany]();
  }

  if (!this.belongsTo) {
    (0, _classPrivateFieldLooseBase2.default)(this, _parseBelongsTo)[_parseBelongsTo]();
  }

  selfSchema === null || selfSchema === void 0 ? void 0 : (_selfSchema$fields3 = selfSchema.fields) === null || _selfSchema$fields3 === void 0 ? void 0 : (0, _forEach.default)(_selfSchema$fields3).call(_selfSchema$fields3, field => {
    var _context3, _context4;

    const {
      name,
      ...props
    } = field;

    if (!(0, _includes.default)(_context3 = (0, _keys.default)((0, _classPrivateFieldLooseBase2.default)(this, _hasMany)[_hasMany])).call(_context3, name) && !(0, _includes.default)(_context4 = (0, _keys.default)((0, _classPrivateFieldLooseBase2.default)(this, _belongsTo)[_belongsTo])).call(_context4, name)) {
      (0, _classPrivateFieldLooseBase2.default)(this, _attributes)[_attributes][name] = props;
    }
  });
}