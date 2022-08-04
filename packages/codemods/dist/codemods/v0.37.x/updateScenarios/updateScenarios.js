"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = transform;

require("core-js/modules/esnext.async-iterator.for-each.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.for-each.js");

require("core-js/modules/esnext.async-iterator.find.js");

require("core-js/modules/esnext.iterator.find.js");

function transform(file, api) {
  const j = api.jscodeshift;
  return j(file.source).find(j.CallExpression, path => {
    return path.callee.type === 'Identifier' && path.callee.name === 'defineScenario';
  }).forEach(scenarioPath => {
    // The first argument is the definition.
    const scenarioDefinition = scenarioPath.value.arguments[0];
    const scenarioModels = scenarioDefinition.properties; // i.e. "user"

    scenarioModels.forEach(model => {
      const modelProps = model.value.properties; // "one", "two"
      // FYI - you can see what the name is in key.name

      modelProps.forEach(modelProp => {
        const dataDef = modelProp.value; // this is {email:}

        modelProp.value = j.objectExpression([j.property('init', j.identifier('data'), dataDef)]);
      });
    });
  }).toSource();
}