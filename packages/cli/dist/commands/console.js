"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.description = exports.command = exports.aliases = void 0;

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _trim = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/trim"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _reverse = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reverse"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _repl = _interopRequireDefault(require("repl"));

var _internal = require("@redwoodjs/internal");

var _lib = require("../lib");

const command = 'console';
exports.command = command;
const aliases = ['c'];
exports.aliases = aliases;
const description = 'Launch an interactive Redwood shell (experimental)';
exports.description = description;
const paths = (0, _lib.getPaths)();

const loadPrismaClient = replContext => {
  const {
    db
  } = require(_path.default.join(paths.api.lib, 'db'));

  replContext.db = db;
};

const consoleHistoryFile = _path.default.join(paths.generated.base, 'console_history');

const persistConsoleHistory = r => {
  var _context;

  _fs.default.appendFileSync(consoleHistoryFile, (0, _filter.default)(_context = r.lines).call(_context, line => (0, _trim.default)(line).call(line)).join('\n') + '\n', 'utf8');
};

const loadConsoleHistory = async r => {
  try {
    var _context2, _context3;

    const history = await _fs.default.promises.readFile(consoleHistoryFile, 'utf8');
    (0, _map.default)(_context2 = (0, _reverse.default)(_context3 = history.split('\n')).call(_context3)).call(_context2, line => r.history.push(line));
  } catch (e) {// We can ignore this -- it just means the user doesn't have any history yet
  }
};

const handler = () => {
  // Transpile on the fly
  (0, _internal.registerApiSideBabelHook)({
    plugins: [['babel-plugin-module-resolver', {
      alias: {
        src: paths.api.src
      }
    }, 'rwjs-console-module-resolver']]
  });

  const r = _repl.default.start(); // always await promises.
  // source: https://github.com/nodejs/node/issues/13209#issuecomment-619526317


  const defaultEval = r.eval;

  r.eval = (cmd, context, filename, callback) => {
    defaultEval(cmd, context, filename, async (err, result) => {
      if (err) {
        // propagate errors.
        callback(err);
      } else {
        // await the promise and either return the result or error.
        try {
          callback(null, await _promise.default.resolve(result));
        } catch (err) {
          callback(err);
        }
      }
    });
  }; // Persist console history to .redwood/console_history. See
  // https://tjwebb.medium.com/a-custom-node-repl-with-history-is-not-as-hard-as-it-looks-3eb2ca7ec0bd


  loadConsoleHistory(r);
  r.addListener('close', () => persistConsoleHistory(r)); // Make the project's db (i.e. Prisma Client) available

  loadPrismaClient(r.context);
};

exports.handler = handler;