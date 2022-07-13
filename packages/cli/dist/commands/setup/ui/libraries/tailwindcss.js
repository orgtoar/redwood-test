"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.description = exports.command = exports.builder = exports.aliases = void 0;

var _every = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/every"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _execa = _interopRequireDefault(require("execa"));

var _fsExtra = require("fs-extra");

var _listr = _interopRequireDefault(require("listr"));

var _telemetry = require("@redwoodjs/telemetry");

var _lib = require("../../../../lib");

var _colors = _interopRequireDefault(require("../../../../lib/colors"));

const command = 'tailwindcss';
exports.command = command;
const aliases = ['tailwind', 'tw'];
exports.aliases = aliases;
const description = 'Set up tailwindcss and PostCSS';
exports.description = description;

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
const tailwindImports = [// using outer double quotes and inner single quotes here to generate code
// the way prettier wants it in the actual RW app where this will be used
"@import 'tailwindcss/base';", "@import 'tailwindcss/components';", "@import 'tailwindcss/utilities';"];

const tailwindImportsExist = indexCSS => {
  var _context;

  return (0, _every.default)(_context = (0, _map.default)(tailwindImports).call(tailwindImports, el => new RegExp(el))).call(_context, tailwindDirective => tailwindDirective.test(indexCSS));
};

const tailwindImportsAndNotes = ['/**', ' * START --- SETUP TAILWINDCSS EDIT', ' *', ' * `yarn rw setup ui tailwindcss` placed these imports here', " * to inject Tailwind's styles into your CSS.", ' * For more information, see: https://tailwindcss.com/docs/installation#include-tailwind-in-your-css', ' */', ...tailwindImports, '/**', ' * END --- SETUP TAILWINDCSS EDIT', ' */\n'];

const handler = async ({
  force,
  install
}) => {
  const rwPaths = (0, _lib.getPaths)();
  const packages = ['postcss', 'postcss-loader', 'tailwindcss', 'autoprefixer'];
  const recommendedVSCodeExtensions = ['csstools.postcss', 'bradlc.vscode-tailwindcss'];
  const tasks = new _listr.default([{
    title: 'Installing packages...',
    skip: () => !install,
    task: () => {
      return new _listr.default([{
        title: `Install ${packages.join(', ')}`,
        task: async () => {
          await (0, _execa.default)('yarn', ['workspace', 'web', 'add', '-D', ...packages]);
        }
      }]);
    }
  }, {
    title: 'Configuring PostCSS...',
    task: () => {
      /**
       * Check if PostCSS config already exists.
       * If it exists, throw an error.
       */
      const postCSSConfigPath = rwPaths.web.postcss;

      if (!force && _fs.default.existsSync(postCSSConfigPath)) {
        throw new Error('PostCSS config already exists.\nUse --force to override existing config.');
      } else {
        const postCSSConfig = _fs.default.readFileSync(_path.default.join(__dirname, '../templates/postcss.config.js.template'), 'utf-8');

        return (0, _fsExtra.outputFileSync)(postCSSConfigPath, postCSSConfig);
      }
    }
  }, {
    title: 'Initializing Tailwind CSS...',
    task: async () => {
      const tailwindConfigPath = _path.default.join(rwPaths.web.config, 'tailwind.config.js');

      if (_fs.default.existsSync(tailwindConfigPath)) {
        if (force) {
          // `yarn tailwindcss init` will fail these files already exists
          _fs.default.unlinkSync(tailwindConfigPath);
        } else {
          throw new Error('Tailwindcss config already exists.\nUse --force to override existing config.');
        }
      }

      await (0, _execa.default)('yarn', ['tailwindcss', 'init', tailwindConfigPath], {
        cwd: rwPaths.web.base
      }); // Replace `content`.

      const tailwindConfig = _fs.default.readFileSync(tailwindConfigPath, 'utf-8');

      const newTailwindConfig = tailwindConfig.replace('content: []', "content: ['src/**/*.{js,jsx,ts,tsx}']");

      _fs.default.writeFileSync(tailwindConfigPath, newTailwindConfig);
    }
  }, {
    title: 'Adding import to index.css...',
    task: (_ctx, task) => {
      const INDEX_CSS_PATH = _path.default.join(rwPaths.web.src, 'index.css');

      const indexCSS = _fs.default.readFileSync(INDEX_CSS_PATH, 'utf-8');

      if (tailwindImportsExist(indexCSS)) {
        task.skip('Imports already exist in index.css');
      } else {
        const newIndexCSS = tailwindImportsAndNotes.join('\n') + indexCSS;

        _fs.default.writeFileSync(INDEX_CSS_PATH, newIndexCSS);
      }
    }
  }, {
    title: 'Adding recommended VS Code extensions...',
    task: (_ctx, task) => {
      const VS_CODE_EXTENSIONS_PATH = _path.default.join(rwPaths.base, '.vscode/extensions.json');

      if (!(0, _lib.usingVSCode)()) {
        task.skip("Looks like your're not using VS Code");
      } else {
        let originalExtensionsJson = {
          recommendations: []
        };

        if (_fs.default.existsSync(VS_CODE_EXTENSIONS_PATH)) {
          const originalExtensionsFile = _fs.default.readFileSync(VS_CODE_EXTENSIONS_PATH, 'utf-8');

          originalExtensionsJson = JSON.parse(originalExtensionsFile);
        }

        const newExtensionsJson = { ...originalExtensionsJson,
          recommendations: [...originalExtensionsJson.recommendations, ...recommendedVSCodeExtensions]
        };

        _fs.default.writeFileSync(VS_CODE_EXTENSIONS_PATH, (0, _stringify.default)(newExtensionsJson, null, 2));
      }
    }
  }]);

  try {
    await tasks.run();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_colors.default.error(e.message));
    process.exit((e === null || e === void 0 ? void 0 : e.exitCode) || 1);
  }
};

exports.handler = handler;