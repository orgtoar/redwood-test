"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = void 0;
var _path = _interopRequireDefault(require("path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _listr = require("listr2");
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _telemetry = require("@redwoodjs/telemetry");
var _lib = require("../../../lib");
var _colors = _interopRequireDefault(require("../../../lib/colors"));
var _project = require("../../../lib/project");
const handler = async ({
  force,
  skipExamples
}) => {
  const projectIsTypescript = (0, _project.isTypeScriptProject)();
  const redwoodVersion = require(_path.default.join((0, _lib.getPaths)().base, 'package.json')).devDependencies['@redwoodjs/core'] ?? 'latest';
  const tasks = new _listr.Listr([{
    title: `Adding api/src/lib/mailer.${projectIsTypescript ? 'ts' : 'js'}...`,
    task: () => {
      const templatePath = _path.default.resolve(__dirname, 'templates', 'mailer.ts.template');
      const templateContent = _fsExtra.default.readFileSync(templatePath, {
        encoding: 'utf8',
        flag: 'r'
      });
      const mailerPath = _path.default.join((0, _lib.getPaths)().api.lib, `mailer.${projectIsTypescript ? 'ts' : 'js'}`);
      const mailerContent = projectIsTypescript ? templateContent : (0, _lib.transformTSToJS)(mailerPath, templateContent);
      return (0, _lib.writeFile)(mailerPath, mailerContent, {
        overwriteExisting: force
      });
    }
  }, {
    title: 'Adding api/src/mail directory...',
    task: () => {
      const mailDir = _path.default.join((0, _lib.getPaths)().api.mail);
      if (!_fsExtra.default.existsSync(mailDir)) {
        _fsExtra.default.mkdirSync(mailDir);
      }
    }
  }, {
    title: `Adding example ReactEmail mail template`,
    skip: () => skipExamples,
    task: () => {
      const templatePath = _path.default.resolve(__dirname, 'templates', 're-example.tsx.template');
      const templateContent = _fsExtra.default.readFileSync(templatePath, {
        encoding: 'utf8',
        flag: 'r'
      });
      const exampleTemplatePath = _path.default.join((0, _lib.getPaths)().api.mail, 'Example', `Example.${projectIsTypescript ? 'tsx' : 'jsx'}`);
      const exampleTemplateContent = projectIsTypescript ? templateContent : (0, _lib.transformTSToJS)(exampleTemplatePath, templateContent);
      return (0, _lib.writeFile)(exampleTemplatePath, exampleTemplateContent, {
        overwriteExisting: force
      });
    }
  }, {
    // Add production dependencies
    ...(0, _cliHelpers.addApiPackages)([`@redwoodjs/mailer-core@${redwoodVersion}`, `@redwoodjs/mailer-handler-nodemailer@${redwoodVersion}`, `@redwoodjs/mailer-renderer-react-email@${redwoodVersion}`, `@react-email/components` // NOTE: Unpinned dependency here
    ]),
    title: 'Adding production dependencies to your api side...'
  }, {
    // Add development dependencies
    ...(0, _cliHelpers.addApiPackages)(['-D', `@redwoodjs/mailer-handler-in-memory@${redwoodVersion}`, `@redwoodjs/mailer-handler-studio@${redwoodVersion}`]),
    title: 'Adding development dependencies to your api side...'
  }], {
    rendererOptions: {
      collapseSubtasks: false
    }
  });
  try {
    await tasks.run();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_colors.default.error(e.message));
    process.exit(e?.exitCode || 1);
  }
};
exports.handler = handler;