"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = exports.aliases = void 0;
require("core-js/modules/esnext.json.parse.js");
var _every = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/every"));
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));
var _trim = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/trim"));
var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));
var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));
var _startsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/starts-with"));
var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));
var _replaceAll = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/replace-all"));
var _path = _interopRequireDefault(require("path"));
var _execa = _interopRequireDefault(require("execa"));
var _fsExtra = _interopRequireWildcard(require("fs-extra"));
var _listr = require("listr2");
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _telemetry = require("@redwoodjs/telemetry");
var _lib = require("../../../../lib");
var _colors = _interopRequireDefault(require("../../../../lib/colors"));
const command = exports.command = 'tailwindcss';
const aliases = exports.aliases = ['tailwind', 'tw'];
const description = exports.description = 'Set up tailwindcss and PostCSS';
const builder = yargs => {
  yargs.option('force', {
    alias: 'f',
    default: false,
    description: 'Overwrite existing configuration',
    type: 'boolean'
  });
  yargs.option('install', {
    alias: 'i',
    default: true,
    description: 'Install packages',
    type: 'boolean'
  });
};
exports.builder = builder;
const tailwindDirectives = ['@tailwind base;', '@tailwind components;', '@tailwind utilities;'];

/** @param {string} indexCSS */
const tailwindDirectivesExist = indexCSS => (0, _every.default)(tailwindDirectives).call(tailwindDirectives, tailwindDirective => (0, _includes.default)(indexCSS).call(indexCSS, tailwindDirective));
const tailwindImportsAndNotes = ['/**', ' * START --- SETUP TAILWINDCSS EDIT', ' *', ' * `yarn rw setup ui tailwindcss` placed these directives here', " * to inject Tailwind's styles into your CSS.", ' * For more information, see: https://tailwindcss.com/docs/installation', ' */', ...tailwindDirectives, '/**', ' * END --- SETUP TAILWINDCSS EDIT', ' */\n'];
const recommendedVSCodeExtensions = ['csstools.postcss', 'bradlc.vscode-tailwindcss'];
const recommendationTexts = {
  'csstools.postcss': (0, _terminalLink.default)('PostCSS Language Support', 'https://marketplace.visualstudio.com/items?itemName=csstools.postcss'),
  'bradlc.vscode-tailwindcss': (0, _terminalLink.default)('Tailwind CSS IntelliSense', 'https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss')
};
async function recommendExtensionsToInstall() {
  if (!(0, _lib.usingVSCode)()) {
    return;
  }
  let recommendations = [];
  try {
    var _context;
    const {
      stdout
    } = await (0, _execa.default)('code', ['--list-extensions']);
    const installedExtensions = (0, _map.default)(_context = stdout.split('\n')).call(_context, ext => (0, _trim.default)(ext).call(ext));
    recommendations = (0, _filter.default)(recommendedVSCodeExtensions).call(recommendedVSCodeExtensions, ext => !(0, _includes.default)(installedExtensions).call(installedExtensions, ext));
  } catch {
    // `code` probably not in PATH so can't check for installed extensions.
    // We'll just recommend all extensions
    recommendations = recommendedVSCodeExtensions;
  }
  if (recommendations.length > 0) {
    console.log();
    console.log(_colors.default.info('For the best experience we recommend that you install the following ' + (recommendations.length === 1 ? 'extension:' : 'extensions:')));
    (0, _forEach.default)(recommendations).call(recommendations, extension => {
      console.log(_colors.default.info('  ' + recommendationTexts[extension]));
    });
  }
}
const handler = async ({
  force,
  install
}) => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'setup ui tailwindcss',
    force,
    install
  });
  const rwPaths = (0, _lib.getPaths)();
  const projectPackages = ['prettier-plugin-tailwindcss@^0.5.12'];
  const webWorkspacePackages = ['postcss', 'postcss-loader', 'tailwindcss', 'autoprefixer'];
  const tasks = new _listr.Listr([{
    title: 'Installing project-wide packages...',
    skip: () => !install,
    task: () => {
      return new _listr.Listr([{
        title: `Install ${projectPackages.join(', ')}`,
        task: async () => {
          var _context2, _context3;
          const yarnVersion = await (0, _execa.default)('yarn', ['--version']);
          const isYarnV1 = (0, _startsWith.default)(_context2 = (0, _trim.default)(_context3 = yarnVersion.stdout).call(_context3)).call(_context2, '1');
          await (0, _execa.default)('yarn', ['add', '-D', ...(isYarnV1 ? ['-W'] : []), ...projectPackages]);
        }
      }], {
        rendererOptions: {
          collapseSubtasks: false
        }
      });
    }
  }, {
    title: 'Installing web side packages...',
    skip: () => !install,
    task: () => {
      return new _listr.Listr([{
        title: `Install ${webWorkspacePackages.join(', ')}`,
        task: async () => {
          await (0, _execa.default)('yarn', ['workspace', 'web', 'add', '-D', ...webWorkspacePackages]);
        }
      }], {
        rendererOptions: {
          collapseSubtasks: false
        }
      });
    }
  }, {
    title: 'Configuring PostCSS...',
    task: () => {
      /**
       * Check if PostCSS config already exists.
       * If it exists, throw an error.
       */
      const postCSSConfigPath = rwPaths.web.postcss;
      if (!force && _fsExtra.default.existsSync(postCSSConfigPath)) {
        throw new Error('PostCSS config already exists.\nUse --force to override existing config.');
      } else {
        const postCSSConfig = _fsExtra.default.readFileSync(_path.default.join(__dirname, '../templates/postcss.config.js.template'), 'utf-8');
        return (0, _fsExtra.outputFileSync)(postCSSConfigPath, postCSSConfig);
      }
    }
  }, {
    title: 'Initializing Tailwind CSS...',
    task: async () => {
      const tailwindConfigPath = _path.default.join(rwPaths.web.config, 'tailwind.config.js');
      if (_fsExtra.default.existsSync(tailwindConfigPath)) {
        if (force) {
          // `yarn tailwindcss init` will fail if these files already exists
          _fsExtra.default.unlinkSync(tailwindConfigPath);
        } else {
          throw new Error('Tailwindcss config already exists.\nUse --force to override existing config.');
        }
      }
      await (0, _execa.default)('yarn', ['tailwindcss', 'init', tailwindConfigPath], {
        cwd: rwPaths.web.base
      });

      // Replace `content`.
      const tailwindConfig = _fsExtra.default.readFileSync(tailwindConfigPath, 'utf-8');
      const newTailwindConfig = tailwindConfig.replace('content: []', "content: ['src/**/*.{js,jsx,ts,tsx}']");
      _fsExtra.default.writeFileSync(tailwindConfigPath, newTailwindConfig);
    }
  }, {
    title: 'Adding directives to index.css...',
    task: (_ctx, task) => {
      const INDEX_CSS_PATH = _path.default.join(rwPaths.web.src, 'index.css');
      const indexCSS = _fsExtra.default.readFileSync(INDEX_CSS_PATH, 'utf-8');
      if (tailwindDirectivesExist(indexCSS)) {
        task.skip('Directives already exist in index.css');
      } else {
        const newIndexCSS = tailwindImportsAndNotes.join('\n') + indexCSS;
        _fsExtra.default.writeFileSync(INDEX_CSS_PATH, newIndexCSS);
      }
    }
  }, {
    title: "Updating tailwind 'scaffold.css'...",
    skip: () => {
      // Skip this step if the 'scaffold.css' file does not exist
      return !_fsExtra.default.existsSync(_path.default.join(rwPaths.web.src, 'scaffold.css'));
    },
    task: async (_ctx, task) => {
      const overrideScaffoldCss = force || (await task.prompt({
        type: 'Confirm',
        message: "Do you want to override your 'scaffold.css' to use tailwind too?"
      }));
      if (overrideScaffoldCss) {
        const tailwindScaffoldTemplate = _fsExtra.default.readFileSync(_path.default.join(__dirname, '..', '..', '..', 'generate', 'scaffold', 'templates', 'assets', 'scaffold.tailwind.css.template'));
        _fsExtra.default.writeFileSync(_path.default.join(rwPaths.web.src, 'scaffold.css'), tailwindScaffoldTemplate);
      } else {
        task.skip('Skipping scaffold.css override');
      }
    }
  }, {
    title: 'Adding recommended VS Code extensions to project settings...',
    task: (_ctx, task) => {
      const VS_CODE_EXTENSIONS_PATH = _path.default.join(rwPaths.base, '.vscode/extensions.json');
      if (!(0, _lib.usingVSCode)()) {
        task.skip("Looks like your're not using VS Code");
      } else {
        let originalExtensionsJson = {
          recommendations: []
        };
        if (_fsExtra.default.existsSync(VS_CODE_EXTENSIONS_PATH)) {
          const originalExtensionsFile = _fsExtra.default.readFileSync(VS_CODE_EXTENSIONS_PATH, 'utf-8');
          originalExtensionsJson = JSON.parse(originalExtensionsFile);
        }
        const newExtensionsJson = {
          ...originalExtensionsJson,
          recommendations: [...originalExtensionsJson.recommendations, ...recommendedVSCodeExtensions]
        };
        _fsExtra.default.writeFileSync(VS_CODE_EXTENSIONS_PATH, (0, _stringify.default)(newExtensionsJson, null, 2));
      }
    }
  }, {
    title: 'Adding tailwind config entry in prettier...',
    task: async _ctx => {
      var _context4;
      const prettierConfigPath = _path.default.join(rwPaths.base, 'prettier.config.js');
      // Add tailwindcss ordering plugin to prettier
      const prettierConfig = _fsExtra.default.readFileSync(prettierConfigPath, 'utf-8');
      const tailwindConfigPath = (0, _replaceAll.default)(_context4 = _path.default.relative(rwPaths.base, _path.default.posix.join(rwPaths.web.config, 'tailwind.config.js'))).call(_context4, '\\', '/');
      let newPrettierConfig = prettierConfig;
      if ((0, _includes.default)(newPrettierConfig).call(newPrettierConfig, 'tailwindConfig: ')) {
        if (force) {
          newPrettierConfig = newPrettierConfig.replace(/tailwindConfig: .*(,)?/, `tailwindConfig: './${tailwindConfigPath}',`);
        } else {
          throw new Error('tailwindConfig setting already exists in prettier configuration.\nUse --force to override existing config.');
        }
      } else {
        newPrettierConfig = newPrettierConfig.replace(/,(\n\s*)(\}\n?)$/, `,\n  tailwindConfig: './${tailwindConfigPath}',$1$2`);
      }
      _fsExtra.default.writeFileSync(prettierConfigPath, newPrettierConfig);
    }
  }, {
    title: 'Adding tailwind prettier plugin...',
    task: async (_ctx, task) => {
      const prettierConfigPath = _path.default.join(rwPaths.base, 'prettier.config.js');
      // Add tailwindcss ordering plugin to prettier
      const prettierConfig = _fsExtra.default.readFileSync(prettierConfigPath, 'utf-8');
      let newPrettierConfig = prettierConfig;
      if ((0, _includes.default)(newPrettierConfig).call(newPrettierConfig, 'plugins: [')) {
        const pluginsMatch = newPrettierConfig.match(/plugins: \[[\sa-z\(\)'\-,]*]/);
        const matched = pluginsMatch && pluginsMatch[0];
        if (matched && ((0, _includes.default)(matched).call(matched, "'prettier-plugin-tailwindcss'") || (0, _includes.default)(matched).call(matched, '"prettier-plugin-tailwindcss"'))) {
          task.skip('tailwindcss-plugin-prettier already required in plugins');
        } else {
          newPrettierConfig = newPrettierConfig.replace(/plugins: \[(\n\s+)*/, `plugins: [$'prettier-plugin-tailwindcss',$1`);
        }
      } else {
        newPrettierConfig = newPrettierConfig.replace(/,(\n\s*)(\}\n?)$/, `,\n  plugins: ['prettier-plugin-tailwindcss'],$1$2`);
      }
      _fsExtra.default.writeFileSync(prettierConfigPath, newPrettierConfig);
    }
  }], {
    rendererOptions: {
      collapseSubtasks: false
    }
  });
  try {
    await tasks.run();
    await recommendExtensionsToInstall();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_colors.default.error(e.message));
    process.exit(e?.exitCode || 1);
  }
};
exports.handler = handler;