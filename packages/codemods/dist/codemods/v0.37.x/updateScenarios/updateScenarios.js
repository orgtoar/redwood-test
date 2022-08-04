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
  var _context, _context2;

  const j = api.jscodeshift;
  return (0, _forEach.default)(_context = (0, _find.default)(_context2 = j(file.source)).call(_context2, j.CallExpression, path => {
    return path.callee.type === 'Identifier' && path.callee.name === 'defineScenario';
  })).call(_context, scenarioPath => {
    // The first argument is the definition.
    const scenarioDefinition = scenarioPath.value.arguments[0];
    const scenarioModels = scenarioDefinition.properties; // i.e. "user"

    (0, _forEach.default)(scenarioModels).call(scenarioModels, model => {
      const modelProps = model.value.properties; // "one", "two"
      // FYI - you can see what the name is in key.name

      (0, _forEach.default)(modelProps).call(modelProps, modelProp => {
        const dataDef = modelProp.value; // this is {email:}

        modelProp.value = j.objectExpression([j.property('init', j.identifier('data'), dataDef)]);
      });
    });
  }).toSource();
}