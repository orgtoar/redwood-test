"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = transform;

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

function transform(file, api) {
  var _context3;

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
    (0, _forEach.default)(allParamTypeProperties).call(allParamTypeProperties, paramTypeProperty => {
      var _context2;

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
            const paramTypeValueDef = (0, _find.default)(ast).call(ast, j.VariableDeclarator, {
              id: {
                name: paramTypeValueVar
              }
            });
            (0, _forEach.default)(paramTypeValueDef).call(paramTypeValueDef, valueDefNode => {
              var _context;

              if (valueDefNode?.value?.init?.type !== 'ObjectExpression') {
                // Value must be object but doesn't seem to be case here.
                return;
              }

              const valueDefInit = valueDefNode.value.init;
              (0, _forEach.default)(_context = valueDefInit.properties).call(_context, valueDefInitProperty => {
                renameParamTypeKey(valueDefInitProperty);
              });
            });
            break;
          }

        case 'ObjectExpression':
          // Value is an object
          (0, _forEach.default)(_context2 = paramTypeProperty.value.properties).call(_context2, property => {
            renameParamTypeKey(property);
          });
          break;
      }
    });
  };

  (0, _forEach.default)(_context3 = (0, _find.default)(ast).call(ast, j.JSXElement, {
    openingElement: {
      name: {
        name: 'Router'
      }
    }
  })).call(_context3, routerElement => {
    var _context4;

    const paramTypeProp = (0, _find.default)(_context4 = j(routerElement.node.openingElement)).call(_context4, j.JSXAttribute, {
      name: {
        name: 'paramTypes'
      }
    });
    (0, _forEach.default)(paramTypeProp).call(paramTypeProp, prop => {
      const paramTypeValue = prop?.value?.value?.expression; // get the value inside the jsx expression
      // paramTypeValue is marked as 👉 . It could be even referenced as variable.
      // <Router paramTypes={👉 {}}

      switch (paramTypeValue?.type) {
        case 'Identifier':
          {
            // <R paramsTypes={myParamTypes}
            // Search the Routes file for variable declaration
            const variableDefinitions = (0, _find.default)(ast).call(ast, j.VariableDeclarator, {
              id: {
                name: paramTypeValue.name
              }
            });
            (0, _forEach.default)(variableDefinitions).call(variableDefinitions, varDef => {
              const allParamTypeProperties = varDef?.value?.init?.properties; // safe to assume that this variable is an object declaration

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