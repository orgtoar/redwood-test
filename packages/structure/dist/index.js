"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

_Object$defineProperty(exports, "DefaultHost", {
  enumerable: true,
  get: function () {
    return _hosts.DefaultHost;
  }
});

_Object$defineProperty(exports, "DiagnosticSeverity", {
  enumerable: true,
  get: function () {
    return _vscodeLanguageserverTypes2.DiagnosticSeverity;
  }
});

_Object$defineProperty(exports, "Host", {
  enumerable: true,
  get: function () {
    return _hosts.Host;
  }
});

_Object$defineProperty(exports, "RWProject", {
  enumerable: true,
  get: function () {
    return _model.RWProject;
  }
});

_Object$defineProperty(exports, "URL_file", {
  enumerable: true,
  get: function () {
    return _URL.URL_file;
  }
});

exports.getProject = getProject;
exports.printDiagnostics = printDiagnostics;

var _hosts = require("./hosts");

var _model = require("./model");

var _vscodeLanguageserverTypes = require("./x/vscode-languageserver-types");

var _vscodeLanguageserverTypes2 = require("vscode-languageserver-types");

var _URL = require("./x/URL");

function getProject(projectRoot, host = new _hosts.DefaultHost()) {
  return new _model.RWProject({
    projectRoot,
    host
  });
}

async function printDiagnostics(projectRoot, opts) {
  const project = getProject(projectRoot);
  const formatOpts = {
    cwd: projectRoot,
    ...opts
  };

  try {
    let warnings = 0;
    let errors = 0;

    for (const d of await project.collectDiagnostics()) {
      const str = (0, _vscodeLanguageserverTypes.ExtendedDiagnostic_format)(d, formatOpts);
      console.log(`\n${str}`); // counts number of warnings (2) and errors (1) encountered

      if (d.diagnostic.severity === 2) {
        warnings++;
      }

      if (d.diagnostic.severity === 1) {
        errors++;
      }
    }

    if (warnings === 0 && errors === 0) {
      console.log('\nSuccess: no errors or warnings were detected\n');
    } else if (errors > 0) {
      console.error(`\nFailure: ${errors} errors and ${warnings} warnings detected\n`);
      process.exit(1);
    }
  } catch (e) {
    throw new Error(e.message);
  }
}