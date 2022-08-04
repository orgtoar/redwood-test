"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = void 0;

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/interopRequireWildcard"));

require("core-js/modules/esnext.async-iterator.map.js");

require("core-js/modules/esnext.iterator.map.js");

require("core-js/modules/esnext.async-iterator.filter.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.filter.js");

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _listr = _interopRequireDefault(require("listr"));

var _listrVerboseRenderer = _interopRequireDefault(require("listr-verbose-renderer"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _api = require("@redwoodjs/internal/dist/build/babel/api");

var _telemetry = require("@redwoodjs/telemetry");

var _lib = require("../../lib");

var _colors = _interopRequireDefault(require("../../lib/colors"));

// sorts migrations by date, oldest first
const sortMigrations = migrations => {
  return migrations.sort((a, b) => {
    const aVersion = parseInt(Object.keys(a)[0]);
    const bVersion = parseInt(Object.keys(b)[0]);

    if (aVersion > bVersion) {
      return 1;
    }

    if (aVersion < bVersion) {
      return -1;
    }

    return 0;
  });
};

const SUPPORTED_EXTENSIONS = ['.js', '.ts']; // Return the list of migrations that haven't run against the database yet

const getMigrations = async db => {
  const basePath = _path.default.join((0, _lib.getPaths)().api.dataMigrations);

  if (!_fs.default.existsSync(basePath)) {
    return [];
  } // gets all migrations present in the app


  const files = _fs.default.readdirSync(basePath).filter(m => SUPPORTED_EXTENSIONS.includes(_path.default.extname(m))).map(m => {
    return {
      [m.split('-')[0]]: _path.default.join(basePath, m)
    };
  }); // gets all migration versions that have already run against the database


  const ranMigrations = await db.rW_DataMigration.findMany({
    orderBy: {
      version: 'asc'
    }
  });
  const ranVersions = ranMigrations.map(migration => migration.version.toString());
  const unrunMigrations = files.filter(migration => {
    return !ranVersions.includes(Object.keys(migration)[0]);
  });
  return sortMigrations(unrunMigrations);
}; // adds data for completed migrations to the DB


const record = async (db, {
  version,
  name,
  startedAt,
  finishedAt
}) => {
  await db.rW_DataMigration.create({
    data: {
      version,
      name,
      startedAt,
      finishedAt
    }
  });
}; // output run status to the console


const report = counters => {
  console.log('');

  if (counters.run) {
    console.info(_colors.default.green(`${counters.run} data migration(s) completed successfully.`));
  }

  if (counters.error) {
    console.error(_colors.default.error(`${counters.error} data migration(s) exited with errors.`));
  }

  if (counters.skipped) {
    console.warn(_colors.default.warning(`${counters.skipped} data migration(s) skipped due to previous error.`));
  }

  console.log('');
};

const runScript = async (db, scriptPath) => {
  const script = await Promise.resolve(`${scriptPath}`).then(s => (0, _interopRequireWildcard2.default)(require(s)));
  const startedAt = new Date();
  await script.default({
    db
  });
  const finishedAt = new Date();
  return {
    startedAt,
    finishedAt
  };
};

const command = 'up';
exports.command = command;
const description = 'Run any outstanding Data Migrations against the database';
exports.description = description;

const builder = yargs => {
  yargs.epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#datamigrate-up')}`);
};

exports.builder = builder;

const handler = async () => {
  // Import babel settings so we can write es6 scripts
  (0, _api.registerApiSideBabelHook)();

  const {
    db
  } = require(_path.default.join((0, _lib.getPaths)().api.lib, 'db'));

  const migrations = await getMigrations(db); // exit immediately if there aren't any migrations to run

  if (!migrations.length) {
    console.info(_colors.default.green('\nNo data migrations run, already up-to-date.\n'));
    process.exit(0);
  }

  const counters = {
    run: 0,
    skipped: 0,
    error: 0
  };
  const migrationTasks = migrations.map(migration => {
    const version = Object.keys(migration)[0];
    const migrationPath = Object.values(migration)[0];

    const migrationName = _path.default.basename(migrationPath, '.js');

    return {
      title: migrationName,
      skip: () => {
        if (counters.error > 0) {
          counters.skipped++;
          return true;
        }
      },
      task: async () => {
        try {
          const {
            startedAt,
            finishedAt
          } = await runScript(db, migrationPath);
          counters.run++;
          await record(db, {
            version,
            name: migrationName,
            startedAt,
            finishedAt
          });
        } catch (e) {
          counters.error++;
          console.error(_colors.default.error(`Error in data migration: ${e.message}`));
        }
      }
    };
  });
  const tasks = new _listr.default(migrationTasks, {
    collapse: false,
    renderer: _listrVerboseRenderer.default
  });

  try {
    await tasks.run();
    await db.$disconnect();
    report(counters);

    if (counters.error) {
      process.exit(1);
    }
  } catch (e) {
    await db.$disconnect();
    report(counters);
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    process.exit((e === null || e === void 0 ? void 0 : e.exitCode) || 1);
  }
};

exports.handler = handler;