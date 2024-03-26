"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = void 0;
require("core-js/modules/es.array.push.js");
require("core-js/modules/esnext.json.parse.js");
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));
var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));
var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));
var _path = _interopRequireDefault(require("path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _listr = require("listr2");
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _projectConfig = require("@redwoodjs/project-config");
var _telemetry = require("@redwoodjs/telemetry");
var _lib = require("../../lib");
var _colors = _interopRequireDefault(require("../../lib/colors"));
var _project = require("../../lib/project");
var _setupRsc = require("./setupRsc");
var _util = require("./util");
const handler = async ({
  force,
  verbose
}) => {
  const rwPaths = (0, _lib.getPaths)();
  const redwoodTomlPath = (0, _projectConfig.getConfigPath)();
  const configContent = _fsExtra.default.readFileSync(redwoodTomlPath, 'utf-8');
  const tasks = new _listr.Listr([{
    title: 'Check prerequisites',
    task: () => {
      if (!rwPaths.web.entryClient || !rwPaths.web.viteConfig) {
        throw new Error('Vite needs to be setup before you can enable RSCs');
      }
      if (!(0, _projectConfig.getConfig)().experimental?.streamingSsr?.enabled) {
        throw new Error('The Streaming SSR experimental feature must be enabled before you can enable RSCs');
      }
      if (!(0, _project.isTypeScriptProject)()) {
        throw new Error('RSCs are only supported in TypeScript projects at this time');
      }
    }
  }, {
    title: 'Adding config to redwood.toml...',
    task: (_ctx, task) => {
      if (!(0, _includes.default)(configContent).call(configContent, '[experimental.rsc]')) {
        (0, _lib.writeFile)(redwoodTomlPath, (0, _concat.default)(configContent).call(configContent, '\n[experimental.rsc]\n  enabled = true\n'), {
          overwriteExisting: true // redwood.toml always exists
        });
      } else {
        if (force) {
          task.output = 'Overwriting config in redwood.toml';
          (0, _lib.writeFile)(redwoodTomlPath, configContent.replace(
          // Enable if it's currently disabled
          '\n[experimental.rsc]\n  enabled = false\n', '\n[experimental.rsc]\n  enabled = true\n'), {
            overwriteExisting: true // redwood.toml always exists
          });
        } else {
          task.skip('The [experimental.rsc] config block already exists in your `redwood.toml` file.');
        }
      }
    },
    options: {
      persistentOutput: true
    }
  }, {
    title: 'Adding entries.ts...',
    task: async () => {
      const entriesTemplate = _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'rsc', 'entries.ts.template'), 'utf-8');

      // Can't use rwPaths.web.entries because it's not created yet
      (0, _lib.writeFile)(_path.default.join(rwPaths.web.src, 'entries.ts'), entriesTemplate, {
        overwriteExisting: force
      });
    }
  }, {
    title: 'Adding Pages...',
    task: async () => {
      const homePageTemplate = _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'rsc', 'HomePage.tsx.template'), 'utf-8');
      const homePagePath = _path.default.join(rwPaths.web.pages, 'HomePage', 'HomePage.tsx');
      (0, _lib.writeFile)(homePagePath, homePageTemplate, {
        overwriteExisting: force
      });
      const aboutPageTemplate = _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'rsc', 'AboutPage.tsx.template'), 'utf-8');
      const aboutPagePath = _path.default.join(rwPaths.web.pages, 'AboutPage', 'AboutPage.tsx');
      (0, _lib.writeFile)(aboutPagePath, aboutPageTemplate, {
        overwriteExisting: force
      });
    }
  }, {
    title: 'Adding Counter.tsx...',
    task: async () => {
      const counterTemplate = _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'rsc', 'Counter.tsx.template'), 'utf-8');
      const counterPath = _path.default.join(rwPaths.web.components, 'Counter', 'Counter.tsx');
      (0, _lib.writeFile)(counterPath, counterTemplate, {
        overwriteExisting: force
      });
    }
  }, {
    title: 'Adding AboutCounter.tsx...',
    task: async () => {
      const counterTemplate = _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'rsc', 'AboutCounter.tsx.template'), 'utf-8');
      const counterPath = _path.default.join(rwPaths.web.components, 'Counter', 'AboutCounter.tsx');
      (0, _lib.writeFile)(counterPath, counterTemplate, {
        overwriteExisting: force
      });
    }
  }, {
    title: 'Adding CSS files...',
    task: async () => {
      const files = [{
        template: 'Counter.css.template',
        path: ['components', 'Counter', 'Counter.css']
      }, {
        template: 'Counter.module.css.template',
        path: ['components', 'Counter', 'Counter.module.css']
      }, {
        template: 'HomePage.css.template',
        path: ['pages', 'HomePage', 'HomePage.css']
      }, {
        template: 'HomePage.module.css.template',
        path: ['pages', 'HomePage', 'HomePage.module.css']
      }, {
        template: 'AboutPage.css.template',
        path: ['pages', 'AboutPage', 'AboutPage.css']
      }];
      (0, _forEach.default)(files).call(files, file => {
        const template = _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'rsc', file.template), 'utf-8');
        const filePath = _path.default.join(rwPaths.web.src, ...file.path);
        (0, _lib.writeFile)(filePath, template, {
          overwriteExisting: force
        });
      });
    }
  }, {
    title: 'Adding Layout...',
    task: async () => {
      const layoutTemplate = _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'rsc', 'NavigationLayout.tsx.template'), 'utf-8');
      const layoutPath = _path.default.join(rwPaths.web.layouts, 'NavigationLayout', 'NavigationLayout.tsx');
      (0, _lib.writeFile)(layoutPath, layoutTemplate, {
        overwriteExisting: force
      });
      const cssTemplate = _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'rsc', 'NavigationLayout.css.template'), 'utf-8');
      const cssPath = _path.default.join(rwPaths.web.layouts, 'NavigationLayout', 'NavigationLayout.css');
      (0, _lib.writeFile)(cssPath, cssTemplate, {
        overwriteExisting: force
      });
    }
  }, {
    title: 'Overwriting index.css...',
    task: async () => {
      const template = _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'rsc', 'index.css.template'), 'utf-8');
      const filePath = _path.default.join(rwPaths.web.src, 'index.css');
      (0, _lib.writeFile)(filePath, template, {
        overwriteExisting: true
      });
    }
  }, {
    title: 'Add React experimental types',
    task: async () => {
      var _context;
      const tsconfigPath = _path.default.join(rwPaths.web.base, 'tsconfig.json');
      const tsconfig = JSON.parse(_fsExtra.default.readFileSync(tsconfigPath, 'utf-8'));
      if ((0, _includes.default)(_context = tsconfig.compilerOptions.types).call(_context, 'react/experimental')) {
        return;
      }
      tsconfig.compilerOptions.types.push('react/experimental');
      (0, _lib.writeFile)(tsconfigPath, await (0, _cliHelpers.prettify)('tsconfig.json', (0, _stringify.default)(tsconfig, null, 2)), {
        overwriteExisting: true
      });
    }
  }, {
    title: 'Overwriting routes...',
    task: async () => {
      const routesTemplate = _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'rsc', 'Routes.tsx.template'), 'utf-8');
      (0, _lib.writeFile)(rwPaths.web.routes, routesTemplate, {
        overwriteExisting: true
      });
    }
  }, {
    task: () => {
      (0, _util.printTaskEpilogue)(_setupRsc.command, _setupRsc.description, _setupRsc.EXPERIMENTAL_TOPIC_ID);
    }
  }], {
    rendererOptions: {
      collapseSubtasks: false,
      persistentOutput: true
    },
    renderer: verbose ? 'verbose' : 'default'
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