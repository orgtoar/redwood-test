"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.redwood_gen_dry_run = redwood_gen_dry_run;

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));

var _path = require("path");

var _fsExtra = require("fs-extra");

var _proxyquire = _interopRequireDefault(require("proxyquire"));

var _child_process = require("../x/child_process");

async function redwood_gen_dry_run(opts) {
  const {
    cwd,
    cmd,
    fileOverrides,
    tmpdir
  } = opts;

  if (!cmd.isComplete) {
    throw new Error('cannot pass an interactive command straight to the redwood-cli. You must run it through the command_builder first');
  } // eslint-disable-next-line


  const x = [_proxyquire.default].length; // we need to make sure this module is required. it will be used in a script we will generate dynamically

  const tempDir = tmpdir !== null && tmpdir !== void 0 ? tmpdir : (0, _path.join)(cwd, '.tmp');
  const jsfile = (0, _path.join)(tempDir, 'rwcli.js');
  let requireStatement = 'proxyquire'; // if (extensionPath) {
  //   requireStatement = relative(
  //     dirname(jsfile),
  //     extensionPath + "/node_modules/proxyquire"
  //   );
  // }

  (0, _fsExtra.outputFileSync)(jsfile, buildJS(fileOverrides, requireStatement));
  const cmdargs = 'node ' + jsfile + ' ' + cmd.processed;
  const [cmd2, ...args] = cmdargs.split(' '); // TODO: use execa?

  const {
    stdout: out,
    stderr
  } = await (0, _child_process.spawnCancellable)(cmd2, args, {
    cwd
  });

  if (stderr) {
    throw new Error(stderr);
  } //const out = execSync(cmdargs, { cwd: projectRoot })


  const [stdout, jsondata] = out.toString().split(separator);
  return {
    stdout,
    files: JSON.parse(jsondata)
  };
}

const separator = '---------===----===--------';

function buildJS(fileOverrides = {}, proxyquireRequireStatement = 'proxyquire') {
  let js = `
  const proxyquire = require("proxyquire")
  const fs = require('fs')
  const path = require('path')
  const files = {}
  const fileOverrides = { FILE: "OVERRIDES" }
  const FILE_SCHEME = 'file://'

  function URL_file(f) {
    if (f.startsWith(FILE_SCHEME))
      f = f.substr(FILE_SCHEME.length)
    return new URL(FILE_SCHEME + path.normalize(f)).href
  }

  proxyquire('@redwoodjs/cli/dist', {
    fs: {
      mkdir() {},
      mkdirSync(...args) {},
      writeFile(a, b) {
        files[URL_file(a)] = b
      },
      writeFileSync(a, b) {
        files[URL_file(a)] = b
      },
      readFileSync(...args) {
        const f = URL_file(args[0])
        if (fileOverrides[f]) return fileOverrides[f]
        return fs.readFileSync.apply(fs, args)
      },
      '@global': true,
    },
  })

  process.on('exit', () => {
    console.log("__SEPARATOR__")
    console.log(JSON.stringify(files, null, 2))
  })
  `; // replace some placeholders in the template

  js = js.replace(`{ FILE: "OVERRIDES" }`, (0, _stringify.default)(fileOverrides));
  js = js.replace(`"__SEPARATOR__"`, (0, _stringify.default)(separator));
  js = js.replace(`require("proxyquire")`, `require("${proxyquireRequireStatement}")`);
  return js;
}