"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = void 0;
require("core-js/modules/es.array.push.js");
var _splice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/splice"));
var _path = _interopRequireDefault(require("path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _listr = require("listr2");
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _telemetry = require("@redwoodjs/telemetry");
const rwPaths = (0, _cliHelpers.getPaths)();
const handler = async ({
  force
}) => {
  const extension = (0, _cliHelpers.isTypeScriptProject)() ? 'ts' : 'js';
  const notes = [];
  const tasks = new _listr.Listr([(0, _cliHelpers.addApiPackages)(['@envelop/sentry@5', '@sentry/node@7']), (0, _cliHelpers.addWebPackages)(['@sentry/react@7', '@sentry/browser@7']), (0, _cliHelpers.addEnvVarTask)('SENTRY_DSN', '', 'https://docs.sentry.io/product/sentry-basics/dsn-explainer/'), {
    title: 'Setting up Sentry on the API and web sides',
    task: () => {
      return (0, _cliHelpers.writeFilesTask)({
        [_path.default.join(rwPaths.api.lib, `sentry.${extension}`)]: _fsExtra.default.readFileSync(_path.default.join(__dirname, 'templates/sentryApi.ts.template')).toString(),
        [_path.default.join(rwPaths.web.src, 'lib', `sentry.${extension}`)]: _fsExtra.default.readFileSync(_path.default.join(__dirname, 'templates/sentryWeb.ts.template')).toString()
      }, {
        existingFiles: force ? 'OVERWRITE' : 'SKIP'
      });
    }
  }, {
    title: 'Implementing the Envelop plugin',
    task: async ctx => {
      const graphqlHandlerPath = _path.default.join(rwPaths.api.functions, `graphql.${extension}`);
      const contentLines = _fsExtra.default.readFileSync(graphqlHandlerPath).toString().split('\n');
      const handlerIndex = contentLines.findLastIndex(line => /^export const handler = createGraphQLHandler\({/.test(line));
      const pluginsIndex = contentLines.findLastIndex(line => /extraPlugins:/.test(line));
      if (handlerIndex === -1 || pluginsIndex !== -1) {
        ctx.addEnvelopPluginSkipped = true;
        return;
      }
      (0, _splice.default)(contentLines).call(contentLines, handlerIndex, 1, "import 'src/lib/sentry'", '', 'export const handler = createGraphQLHandler({', 'extraPlugins: [useSentry({', '  includeRawResult: true,', '  includeResolverArgs: true,', '  includeExecuteVariables: true,', '})],');
      (0, _splice.default)(contentLines).call(contentLines, 0, 0, "import { useSentry } from '@envelop/sentry'");
      _fsExtra.default.writeFileSync(graphqlHandlerPath, await (0, _cliHelpers.prettify)('graphql.ts', contentLines.join('\n')));
    }
  }, {
    title: "Replacing Redwood's Error boundary",
    task: async () => {
      const contentLines = _fsExtra.default.readFileSync(rwPaths.web.app).toString().split('\n');
      const webImportIndex = contentLines.findLastIndex(line => /^import { FatalErrorBoundary, RedwoodProvider } from '@redwoodjs\/web'$/.test(line));
      (0, _splice.default)(contentLines).call(contentLines, webImportIndex, 1, "import { RedwoodProvider } from '@redwoodjs/web'");
      const boundaryOpenIndex = contentLines.findLastIndex(line => /<FatalErrorBoundary page={FatalErrorPage}>/.test(line));
      (0, _splice.default)(contentLines).call(contentLines, boundaryOpenIndex, 1, '<Sentry.ErrorBoundary fallback={FatalErrorPage}>');
      const boundaryCloseIndex = contentLines.findLastIndex(line => /<\/FatalErrorBoundary>/.test(line));
      (0, _splice.default)(contentLines).call(contentLines, boundaryCloseIndex, 1, '</Sentry.ErrorBoundary>');
      (0, _splice.default)(contentLines).call(contentLines, 0, 0, "import Sentry from 'src/lib/sentry'");
      _fsExtra.default.writeFileSync(rwPaths.web.app, await (0, _cliHelpers.prettify)('App.tsx', contentLines.join('\n')));
    }
  }, {
    title: 'One more thing...',
    task: ctx => {
      notes.push(_cliHelpers.colors.green('You will need to add `SENTRY_DSN` to `includeEnvironmentVariables` in redwood.toml.'));
      if (ctx.addEnvelopPluginSkipped) {
        notes.push(`${_cliHelpers.colors.underline('Make sure you implement the Sentry Envelop plugin:')} https://redwoodjs.com/docs/cli-commands#sentry-envelop-plugin`);
      } else {
        notes.push('Check out the RedwoodJS forums for more: https://community.redwoodjs.com/t/sentry-error-and-performance-monitoring-experimental/4880');
      }
    }
  }]);
  try {
    await tasks.run();
    console.log(notes.join('\n'));
  } catch (e) {
    if (isErrorWithMessage(e)) {
      (0, _telemetry.errorTelemetry)(process.argv, e.message);
      console.error(_cliHelpers.colors.error(e.message));
    }
    if (isErrorWithExitCode(e)) {
      process.exit(e.exitCode);
    }
    process.exit(1);
  }
};
exports.handler = handler;
function isErrorWithMessage(e) {
  return !!e && typeof e === 'object' && 'message' in e;
}
function isErrorWithExitCode(e) {
  return !!e && typeof e === 'object' && 'exitCode' in e && typeof e.exitCode === 'number';
}