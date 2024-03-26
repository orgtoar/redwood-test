"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/entries"));
var _startsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/starts-with"));
var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/array/is-array"));
var _sort = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/sort"));
var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/parse-int"));
var _path = _interopRequireDefault(require("path"));
var _exporterTraceOtlpHttp = require("@opentelemetry/exporter-trace-otlp-http");
var _resources = require("@opentelemetry/resources");
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _projectConfig = require("@redwoodjs/project-config");
var _resource = require("./resource");
async function main() {
  // Log out the telemetry notice
  console.log("You can disable telemetry by:\n - setting the 'REDWOOD_DISABLE_TELEMETRY' environment variable\n - passing the '--no-telemetry' flag when using the CLI");
  console.log('Information about Redwood telemetry can be found at:\n - https://telemetry.redwoodjs.com\n');

  // Get all telemetry files
  const telemetryDir = _path.default.join((0, _projectConfig.getPaths)().generated.base, 'telemetry');
  _fsExtra.default.ensureDirSync(telemetryDir);
  const telemetryFiles = _fsExtra.default.readdirSync(_path.default.join((0, _projectConfig.getPaths)().generated.base, 'telemetry'));

  // Compute all the resource information
  console.time('Computed resource information');
  const customResourceData = await (0, _resource.getResources)();
  console.timeEnd('Computed resource information');
  const resource = _resources.Resource.default().merge(new _resources.Resource(customResourceData));
  const url = process.env.REDWOOD_REDIRECT_TELEMETRY || 'https://quark.quantumparticle.io/v1/traces';
  const traceExporter = new _exporterTraceOtlpHttp.OTLPTraceExporter({
    url
  });
  console.log(`Sending telemetry data to '${url}'`);

  // Go through all telemetry files and send the new spans to the telemetry collector
  for (const [index, file] of (0, _entries.default)(telemetryFiles).call(telemetryFiles)) {
    // '_' denotes a file that has already been sent
    if ((0, _startsWith.default)(file).call(file, '_')) {
      continue;
    }
    console.log(`Sending data from telemetry file '${file}'`);

    // Read the saved spans
    let spans = [];
    try {
      spans = _fsExtra.default.readJSONSync(_path.default.join(telemetryDir, file));
    } catch (error) {
      console.error(`Error reading telemetry file '${file}'`);
      console.error(error);
      console.error('Deleting this file to prevent further errors');
      _fsExtra.default.unlinkSync(_path.default.join(telemetryDir, file));
      continue;
    }
    if (!(0, _isArray.default)(spans)) {
      console.error(`Telemetry file '${file}' does not contain an array of spans. Deleting this file to prevent further errors.`);
      _fsExtra.default.unlinkSync(_path.default.join(telemetryDir, file));
      continue;
    }

    /**
     * We have to fix some of the span properties because we serialized the span
     * to JSON and then deserialized it. This means that some of the properties that
     * were functions are now just objects and that some of the properties were
     * renamed.
     */
    for (const span of spans) {
      span.resource = resource;
      span.attributes ??= span._attributes ?? {};
      span.spanContext = () => span._spanContext;

      // This is only for visibility - we current do not record any events on the backend anyway.
      // We do this for the time being because we don't want unsanitized error messages to be sent
      span.events = [];
    }
    traceExporter.export(spans, ({
      code,
      error
    }) => {
      if (code !== 0) {
        console.error('Encountered:');
        console.error(error);
        console.error('while exporting the following spans:');
        console.error(spans);
      }
    });

    /**
     * We have to rewrite the file because we recomputed the resource information
     * and we also denote that the spans have been sent by adding a '_' prefix to
     * the file name.
     */
    _fsExtra.default.writeJSONSync(_path.default.join(telemetryDir, `_${file}`), spans, {
      spaces: 2
    });
    _fsExtra.default.unlinkSync(_path.default.join(telemetryDir, file));
    telemetryFiles[index] = `_${file}`;
  }

  // Shutdown to ensure all spans are sent
  traceExporter.shutdown();

  // We keep the last 8 telemetry files for visibility/transparency
  console.log('Keeping the lastest 8 telemetry files for visibility/transparency.');
  const sortedTelemetryFiles = (0, _sort.default)(telemetryFiles).call(telemetryFiles, (a, b) => {
    return (0, _parseInt2.default)(b.split('.')[0].replace('_', '')) - (0, _parseInt2.default)(a.split('.')[0].replace('_', ''));
  });
  for (let i = 8; i < sortedTelemetryFiles.length; i++) {
    console.log(`Removing telemetry file '${sortedTelemetryFiles[i]}'`);
    _fsExtra.default.unlinkSync(_path.default.join(telemetryDir, sortedTelemetryFiles[i]));
  }
}
main();