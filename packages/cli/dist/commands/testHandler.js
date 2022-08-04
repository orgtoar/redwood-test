"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _execa = _interopRequireDefault(require("execa"));

var _paths = require("@redwoodjs/internal/dist/paths");

var _telemetry = require("@redwoodjs/telemetry");

var _lib = require("../lib");

var _colors = _interopRequireDefault(require("../lib/colors"));

var project = _interopRequireWildcard(require("../lib/project"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// https://github.com/facebook/create-react-app/blob/cbad256a4aacfc3084be7ccf91aad87899c63564/packages/react-scripts/scripts/test.js#L39
function isInGitRepository() {
  try {
    _execa.default.commandSync('git rev-parse --is-inside-work-tree');

    return true;
  } catch (e) {
    return false;
  }
}

function isInMercurialRepository() {
  try {
    _execa.default.commandSync('hg --cwd . root');

    return true;
  } catch (e) {
    return false;
  }
}

function isJestConfigFile(sides) {
  for (let side of sides) {
    try {
      if (sides.includes(side)) {
        const jestConfigExists = _fs.default.existsSync(_path.default.join(side, 'jest.config.js')) || _fs.default.existsSync(_path.default.join(side, 'jest.config.ts'));

        if (!jestConfigExists) {
          console.error(_colors.default.error(`\nError: Missing Jest config file ${side}/jest.config.js` + '\nTo add this file, run `npx @redwoodjs/codemods update-jest-config`\n'));
          throw new Error(`Error: Jest config file not found in ${side} side`);
        }
      }
    } catch (e) {
      (0, _telemetry.errorTelemetry)(process.argv, e.message);
      process.exit((e === null || e === void 0 ? void 0 : e.exitCode) || 1);
    }
  }
}

const handler = async ({
  filter: filterParams = [],
  watch = true,
  collectCoverage = false,
  dbPush = true,
  ...others
}) => {
  const rwjsPaths = (0, _lib.getPaths)();
  const forwardJestFlags = Object.keys(others).flatMap(flagName => {
    if (['watch', 'collect-coverage', 'db-push', '$0', '_'].includes(flagName)) {
      // filter out flags meant for the rw test command only
      return [];
    } else {
      // and forward on the other flags
      const flagValue = others[flagName];

      if (Array.isArray(flagValue)) {
        // jest does not collapse flags e.g. --coverageReporters=html --coverageReporters=text
        // so we pass it on. Yargs collapses these flags into an array of values
        return flagValue.flatMap(val => {
          return [flagName.length > 1 ? `--${flagName}` : `-${flagName}`, val];
        });
      } else {
        return [flagName.length > 1 ? `--${flagName}` : `-${flagName}`, flagValue];
      }
    }
  }); // Only the side params

  const sides = filterParams.filter(filterString => project.sides().includes(filterString)); // All the other params, apart from sides

  const jestFilterArgs = [...filterParams.filter(filterString => !project.sides().includes(filterString))];
  const jestArgs = [...jestFilterArgs, ...forwardJestFlags, collectCoverage ? '--collectCoverage' : null, '--passWithNoTests'].filter(flagOrValue => flagOrValue !== null); // Filter out nulls, not booleans because user may have passed a --something false flag
  // If the user wants to watch, set the proper watch flag based on what kind of repo this is
  // because of https://github.com/facebook/create-react-app/issues/5210

  if (watch && !process.env.CI && !collectCoverage) {
    const hasSourceControl = isInGitRepository() || isInMercurialRepository();
    jestArgs.push(hasSourceControl ? '--watch' : '--watchAll');
  } // if no sides declared with yargs, default to all sides


  if (!sides.length) {
    project.sides().forEach(side => sides.push(side));
  }

  if (sides.length > 0) {
    jestArgs.push('--projects', ...sides);
  } //checking if Jest config files exists in each of the sides


  isJestConfigFile(sides);

  try {
    const cacheDirDb = `file:${(0, _paths.ensurePosixPath)(rwjsPaths.generated.base)}/test.db`;
    const DATABASE_URL = process.env.TEST_DATABASE_URL || cacheDirDb;

    if (sides.includes('api') && !dbPush) {
      // @NOTE
      // DB push code now lives in packages/testing/config/jest/api/jest-preset.js
      process.env.SKIP_DB_PUSH = '1';
    } // **NOTE** There is no official way to run Jest programmatically,
    // so we're running it via execa, since `jest.run()` is a bit unstable.
    // https://github.com/facebook/jest/issues/5048


    const runCommand = async () => {
      await (0, _execa.default)('yarn jest', jestArgs, {
        cwd: rwjsPaths.base,
        shell: true,
        stdio: 'inherit',
        env: {
          DATABASE_URL
        }
      });
    };

    if (watch) {
      await runCommand();
    } else {
      await (0, _telemetry.timedTelemetry)(process.argv, {
        type: 'test'
      }, async () => {
        await runCommand();
      });
    }
  } catch (e) {
    // Errors already shown from execa inherited stderr
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    process.exit((e === null || e === void 0 ? void 0 : e.exitCode) || 1);
  }
};

exports.handler = handler;