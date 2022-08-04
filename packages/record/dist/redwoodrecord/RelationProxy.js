"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/esnext.async-iterator.find.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.find.js");

var _classPrivateFieldLooseBase2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/classPrivateFieldLooseBase"));

var _classPrivateFieldLooseKey2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/classPrivateFieldLooseKey"));

var _Reflection = _interopRequireDefault(require("./Reflection"));

// Proxies access to a related model. Stores the requirements for the relation,
// so that any function called on it is called on the original model, but with
// the relations attributes automatically merged in.
var _addHasManyRelations = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("addHasManyRelations");

var _addBelongsToRelations = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("addBelongsToRelations");

class RelationProxy {
  static addRelations(record) {
    const reflection = new _Reflection.default(record.constructor);

    (0, _classPrivateFieldLooseBase2.default)(this, _addHasManyRelations)[_addHasManyRelations](record, reflection.hasMany);

    (0, _classPrivateFieldLooseBase2.default)(this, _addBelongsToRelations)[_addBelongsToRelations](record, reflection.belongsTo);
  }

  constructor(model, relation) {
    // Stores the model this proxy is proxying
    this.model = model; // Stores the relation attributes, like `{ userId: 123 }`

    this.relation = relation;
  }

  all(...args) {
    return this.where(...args);
  }

  create(attributes, options = {}) {
    let relatedAttributes = { ...attributes
    };

    if (this.relation.create) {
      relatedAttributes = { ...relatedAttributes,
        ...this.relation.create
      };
    } else {
      relatedAttributes = { ...relatedAttributes,
        ...this.relation.where
      };
    }

    return this.model.create(relatedAttributes, options);
  }

  find(id, options = {}) {
    return this.findBy({
      [this.model.primaryKey]: id
    }, options);
  }

  findBy(attributes, options = {}) {
    const relatedAttributes = { ...attributes,
      ...this.relation.where
    };
    return this.model.findBy(relatedAttributes, options);
  }

  first(...args) {
    return this.findBy(...args);
  }

  where(attributes, options = {}) {
    const relatedAttributes = { ...attributes,
      ...this.relation.where
    };
    return this.model.where(relatedAttributes, options);
  }

}

exports.default = RelationProxy;

function _addHasManyRelations2(record, hasMany) {
  for (const [name, options] of Object.entries(hasMany)) {
    // Property already defined from a previous usage, don't try to define again
    // eslint-disable-next-line
    if (record.hasOwnProperty(name)) {
      continue;
    }

    const model = record.constructor.requiredModels.find(requiredModel => {
      return requiredModel.name === options.modelName;
    });

    if (!model) {
      console.warn(`Model ${record.constructor.name} has a relationship defined for \`${name}\` in schema.prisma, but there is no Redwoood model for this relationship.`);
      continue;
    }

    Object.defineProperty(record, name, {
      get() {
        if (options.foreignKey === null) {
          // implicit many-to-many
          return new RelationProxy(model, {
            where: {
              [options.referenceName]: {
                some: {
                  [options.primaryKey]: record[options.primaryKey]
                }
              }
            },
            create: {
              [options.referenceName]: {
                connect: [{
                  [options.primaryKey]: record[options.primaryKey]
                }]
              }
            }
          });
        } else {
          // hasMany
          return new RelationProxy(model, {
            where: {
              [options.foreignKey]: record[options.primaryKey]
            }
          });
        }
      },

      enumerable: true
    });
  }
}

function _addBelongsToRelations2(record, belongsTo) {
  for (const [name, options] of Object.entries(belongsTo)) {
    // Property already defined from a previous usage, don't try to define again
    // eslint-disable-next-line
    if (record.hasOwnProperty(name)) {
      continue;
    }

    const model = record.constructor.requiredModels.find(requiredModel => {
      return requiredModel.name === options.modelName;
    });

    if (!model) {
      console.warn(`Model ${record.constructor.name} has a relationship defined for \`${name}\` in schema.prisma, but there is no Redwoood model for this relationship.`);
      continue;
    }

    Object.defineProperty(record, name, {
      async get() {
        return await model.findBy({
          [options.primaryKey]: record[options.foreignKey]
        });
      },

      enumerable: true
    });
  }
}

Object.defineProperty(RelationProxy, _addBelongsToRelations, {
  value: _addBelongsToRelations2
});
Object.defineProperty(RelationProxy, _addHasManyRelations, {
  value: _addHasManyRelations2
});