"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = transform;

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/some"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

function transform(file, api) {
  var _context;

  const j = api.jscodeshift;

  const mapTransformValueToValidationProperty = transformValue => {
    const j = api.jscodeshift;

    switch (transformValue) {
      case 'Float':
        return j.objectProperty(j.identifier('valueAsNumber'), j.booleanLiteral(true));

      case 'Json':
        return j.objectProperty(j.identifier('valueAsJSON'), j.booleanLiteral(true));

      case 'Int':
        return j.objectProperty(j.identifier('valueAsNumber'), j.booleanLiteral(true));

      case 'Boolean':
        return j.objectProperty(j.identifier('valueAsBoolean'), j.booleanLiteral(true));

      case 'DateTime':
        return j.objectProperty(j.identifier('valueAsDate'), j.booleanLiteral(true));
    }
  };

  const ast = j(file.source);
  /**
   * 1 - renaming validation to config
   */

  (0, _forEach.default)(_context = (0, _find.default)(ast).call(ast, j.JSXElement, {
    openingElement: {
      name: {
        name: 'Form'
      }
    }
  })).call(_context, formElement => {
    var _context2, _context3, _context4;

    // Use opening element, to make sure we don't modify validation on <Field validation>
    const formValidationProp = (0, _find.default)(_context2 = j(formElement.node.openingElement)).call(_context2, j.JSXIdentifier, {
      name: 'validation'
    }); // formValidationProp is an array so we have to iterate over it.

    (0, _forEach.default)(formValidationProp).call(formValidationProp, validationProp => {
      validationProp.value.name = 'config';
    });
    (0, _forEach.default)(_context3 = (0, _find.default)(_context4 = j(formElement)).call(_context4, j.JSXAttribute, {
      name: {
        name: 'transformValue'
      }
    })).call(_context3, transformValueProp => {
      var _context5;

      const field = transformValueProp.parent;
      const transformOptions = transformValueProp.node.value;
      const transformValue = transformOptions.value;
      j(transformValueProp).remove();
      const fieldHasValidation = (0, _some.default)(_context5 = field.node.attributes).call(_context5, attr => {
        return attr.name.name === 'validation';
      });

      if (fieldHasValidation) {
        var _context6;

        // only add a property to the object expression
        const validationAttribute = (0, _filter.default)(_context6 = field.node.attributes).call(_context6, attr => {
          return attr.name.name === 'validation';
        });
        const validationAttributeObjectProperties = validationAttribute[0].value.expression.properties;
        validationAttributeObjectProperties.push(mapTransformValueToValidationProperty(transformValue));
      } else {
        // add the whole validation attribute
        const prop = j.jsxAttribute(j.jsxIdentifier('validation'), j.jsxExpressionContainer(j.objectExpression([mapTransformValueToValidationProperty(transformValue)])));
        field.value.attributes.push(prop);
      }
    });
  });
  return ast.toSource();
}