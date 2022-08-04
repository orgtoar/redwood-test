"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = transform;

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