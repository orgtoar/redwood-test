"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = transform;

function transform(file, api) {
  const newPropertyName = {
    constraint: 'match',
    transform: 'parse'
  };
  const j = api.jscodeshift;
  const ast = j(file.source);

  const renameParamTypeKey = paramTypeKey => {
    // paramTypeKey here could be any one of following marked as 👉

    /*
    const slug = {
      👉 constraint: /\w+-\w+/,
      👉 transform: (param) => param.split('-'),
    }
    ...
        <Router
          paramTypes={{
            slug,
            embeddedProperties: { 👉 constraint: constraint, 👉 transform },
            embedded: {
              👉 constraint: /\w+.\w+/,
              👉 transform: (param) => param.split('.'),
            },
          }}
        >
        </Router>
    ...
    */
    // To force the value to be explicit. {{ transform }} -> {{ parse: transform }}
    // paramTypeKey.value = j.identifier.from(paramTypeKey.value)
    if (paramTypeKey.shorthand) {
      paramTypeKey.shorthand = false;
    }

    paramTypeKey.key.name = newPropertyName[paramTypeKey.key.name];
  };

  const mapToNewSyntax = allParamTypeProperties => {
    // allParamTypeProperties here is array of following marked as 👉

    /*
        <Router
          paramTypes={{
            👉 slug,
            👉 embeddedProperties: { constraint: constraint, transform },
            👉 embedded: {
                constraint: /\w+.\w+/,
                transform: (param) => param.split('.'),
            },
          }}
        >
    */
    allParamTypeProperties.forEach(paramTypeProperty => {
      // paramTypeProperty.value could be either ObjectExpression, Identifier
      if (paramTypeProperty.type === 'SpreadProperty' || paramTypeProperty.type === 'SpreadElement' || paramTypeProperty.type === 'ObjectMethod') {
        // We don't handle these other types.
        // As they're quite edgecase-ey
        // like paramTypes={{...myParams}} (spreadelement)
        console.warn('Unable to update your custom Route parameters. Please follow manual instructions');
        return;
      }

      switch (paramTypeProperty.value.type) {
        // Identifier could be for {{ slug }} in examples above. Or something like {{slug: slug}}
        case 'Identifier':
          {
            // Even though we have the object but the key is referred as variable
            const paramTypeValueVar = paramTypeProperty.value.name;
            const paramTypeValueDef = ast.find(j.VariableDeclarator, {
              id: {
                name: paramTypeValueVar
              }
            });
            paramTypeValueDef.forEach(valueDefNode => {
              var _valueDefNode$value, _valueDefNode$value$i;

              if ((valueDefNode === null || valueDefNode === void 0 ? void 0 : (_valueDefNode$value = valueDefNode.value) === null || _valueDefNode$value === void 0 ? void 0 : (_valueDefNode$value$i = _valueDefNode$value.init) === null || _valueDefNode$value$i === void 0 ? void 0 : _valueDefNode$value$i.type) !== 'ObjectExpression') {
                // Value must be object but doesn't seem to be case here.
                return;
              }

              const valueDefInit = valueDefNode.value.init;
              valueDefInit.properties.forEach(valueDefInitProperty => {
                renameParamTypeKey(valueDefInitProperty);
              });
            });
            break;
          }

        case 'ObjectExpression':
          // Value is an object
          paramTypeProperty.value.properties.forEach(property => {
            renameParamTypeKey(property);
          });
          break;
      }
    });
  };

  ast.find(j.JSXElement, {
    openingElement: {
      name: {
        name: 'Router'
      }
    }
  }).forEach(routerElement => {
    const paramTypeProp = j(routerElement.node.openingElement).find(j.JSXAttribute, {
      name: {
        name: 'paramTypes'
      }
    });
    paramTypeProp.forEach(prop => {
      var _prop$value, _prop$value$value;

      const paramTypeValue = prop === null || prop === void 0 ? void 0 : (_prop$value = prop.value) === null || _prop$value === void 0 ? void 0 : (_prop$value$value = _prop$value.value) === null || _prop$value$value === void 0 ? void 0 : _prop$value$value.expression; // get the value inside the jsx expression
      // paramTypeValue is marked as 👉 . It could be even referenced as variable.
      // <Router paramTypes={👉 {}}

      switch (paramTypeValue === null || paramTypeValue === void 0 ? void 0 : paramTypeValue.type) {
        case 'Identifier':
          {
            // <R paramsTypes={myParamTypes}
            // Search the Routes file for variable declaration
            const variableDefinitions = ast.find(j.VariableDeclarator, {
              id: {
                name: paramTypeValue.name
              }
            });
            variableDefinitions.forEach(varDef => {
              var _varDef$value, _varDef$value$init;

              const allParamTypeProperties = varDef === null || varDef === void 0 ? void 0 : (_varDef$value = varDef.value) === null || _varDef$value === void 0 ? void 0 : (_varDef$value$init = _varDef$value.init) === null || _varDef$value$init === void 0 ? void 0 : _varDef$value$init.properties; // safe to assume that this variable is an object declaration

              mapToNewSyntax(allParamTypeProperties);
            });
            break;
          }

        case 'ObjectExpression':
          // <R paramTypes={{constraint: '', ..}} or paramTypes={{...myParamTypes}}
          mapToNewSyntax(paramTypeValue.properties);
          break;
      }
    });
  });
  return ast.toSource();
}