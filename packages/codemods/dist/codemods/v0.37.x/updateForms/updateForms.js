"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = transform;

function transform(file, api) {
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

  ast.find(j.JSXElement, {
    openingElement: {
      name: {
        name: 'Form'
      }
    }
  }).forEach(formElement => {
    // Use opening element, to make sure we don't modify validation on <Field validation>
    const formValidationProp = j(formElement.node.openingElement).find(j.JSXIdentifier, {
      name: 'validation'
    }); // formValidationProp is an array so we have to iterate over it.

    formValidationProp.forEach(validationProp => {
      validationProp.value.name = 'config';
    });
    j(formElement).find(j.JSXAttribute, {
      name: {
        name: 'transformValue'
      }
    }).forEach(transformValueProp => {
      const field = transformValueProp.parent;
      const transformOptions = transformValueProp.node.value;
      const transformValue = transformOptions.value;
      j(transformValueProp).remove();
      const fieldHasValidation = field.node.attributes.some(attr => {
        return attr.name.name === 'validation';
      });

      if (fieldHasValidation) {
        // only add a property to the object expression
        const validationAttribute = field.node.attributes.filter(attr => {
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