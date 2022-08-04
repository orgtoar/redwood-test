"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Core = _interopRequireDefault(require("./Core"));

var _Reflection = _interopRequireDefault(require("./Reflection"));

var _RelationProxy = _interopRequireDefault(require("./RelationProxy"));

var _ValidationMixin = _interopRequireDefault(require("./ValidationMixin"));

class RedwoodRecord extends (0, _ValidationMixin.default)(_Core.default) {
  static get reflect() {
    return new _Reflection.default(this);
  } // Call original build, but add related attributes


  static build(attributes) {
    const record = super.build(attributes);

    _RelationProxy.default.addRelations(record, this.constructor.schema);

    return record;
  } // Don't even try to save if data isn't valid


  async save(options = {}) {
    if (this.validate({
      throw: options.throw
    })) {
      return await super.save(options);
    } else {
      return false;
    }
  } // Call original method, but add error keys for validation


  _createPropertyForAttribute(name) {
    super._createPropertyForAttribute(name);

    this._errors[name] = [];
  } // Add validation error on save error


  _onSaveError(...args) {
    super._onSaveError(...args);

    this.addError(...args);
  }

}

exports.default = RedwoodRecord;