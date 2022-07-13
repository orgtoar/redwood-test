"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

require("core-js/modules/esnext.array.group-by.js");

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.Diagnostic_compare = Diagnostic_compare;
exports.ExtendedDiagnostic_findRelevantQuickFixes = ExtendedDiagnostic_findRelevantQuickFixes;
exports.ExtendedDiagnostic_format = ExtendedDiagnostic_format;
exports.ExtendedDiagnostic_groupByUri = ExtendedDiagnostic_groupByUri;
exports.ExtendedDiagnostic_is = ExtendedDiagnostic_is;
exports.FileSet_fromTextDocuments = FileSet_fromTextDocuments;
exports.LocationLike_toHashLink = LocationLike_toHashLink;
exports.LocationLike_toLocation = LocationLike_toLocation;
exports.LocationLike_toTerminalLink = LocationLike_toTerminalLink;
exports.Location_fromFilePath = Location_fromFilePath;
exports.Location_fromNode = Location_fromNode;
exports.Location_overlaps = Location_overlaps;
exports.Position_compare = Position_compare;
exports.Position_fromOffset = Position_fromOffset;
exports.Position_fromOffsetOrFail = Position_fromOffsetOrFail;
exports.Position_fromTSMorphOffset = Position_fromTSMorphOffset;
exports.Position_translate = Position_translate;
exports.Range_contains = Range_contains;
exports.Range_equals = Range_equals;
exports.Range_fromNode = Range_fromNode;
exports.Range_full = Range_full;
exports.Range_overlaps = Range_overlaps;
exports.WorkspaceEdit_fromFileSet = WorkspaceEdit_fromFileSet;
exports.err = err;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));

var _endsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/ends-with"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/keys"));

var _keys2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

var _lineColumn = _interopRequireDefault(require("line-column"));

var _lodash = require("lodash");

var tsm = _interopRequireWildcard(require("ts-morph"));

var _vscodeLanguageserverTypes = require("vscode-languageserver-types");

var _URL = require("./URL");

function Range_contains(range, pos) {
  if (Position_compare(range.start, pos) === 'greater') {
    return false;
  }

  if (Position_compare(range.end, pos) === 'smaller') {
    return false;
  }

  return true;
}

function Range_overlaps(range1, range2, consider0000) {
  if (consider0000) {
    if (Range_is0000(range1) || Range_is0000(range2)) {
      return true;
    }
  }

  const {
    start,
    end
  } = range2;

  if (Range_contains(range1, start)) {
    return true;
  }

  if (Range_contains(range2, end)) {
    return true;
  }

  return true;
}
/**
 * p1 is greater|smaller|equal than/to p2
 * @param p1
 * @param p2
 */


function Position_compare(p1, p2) {
  if (p1.line > p2.line) {
    return 'greater';
  }

  if (p2.line > p1.line) {
    return 'smaller';
  }

  if (p1.character > p2.character) {
    return 'greater';
  }

  if (p2.character > p1.character) {
    return 'smaller';
  }

  return 'equal';
}
/**
 * Create a new position relative to this position.
 *
 * @param lineDelta Delta value for the line value, default is `0`.
 * @param characterDelta Delta value for the character value, default is `0`.
 * @return A position which line and character is the sum of the current line and
 * character and the corresponding deltas.
 */


function Position_translate(pos, lineDelta = 0, characterDelta = 0) {
  return {
    line: pos.line + lineDelta,
    character: pos.character + characterDelta
  };
}

function Range_fromNode(node) {
  const start = Position_fromTSMorphOffset(node.getStart(false), node.getSourceFile());
  const end = Position_fromTSMorphOffset(node.getEnd(), node.getSourceFile());
  return {
    start,
    end
  };
}

function Location_fromNode(node) {
  return {
    uri: (0, _URL.URL_file)(node.getSourceFile().getFilePath()),
    range: Range_fromNode(node)
  };
}

function Location_fromFilePath(filePath) {
  return {
    uri: (0, _URL.URL_file)(filePath),
    range: _vscodeLanguageserverTypes.Range.create(0, 0, 0, 0)
  };
}
/**
 * returns vscode-terminal-friendly (clickable) link with line/column information
 * ex: "file:///foo.ts:2:3"
 * @param loc
 */


function LocationLike_toTerminalLink(loc) {
  const {
    uri,
    range: {
      start: {
        line,
        character
      }
    }
  } = LocationLike_toLocation(loc);
  return `${uri}:${line + 1}:${character + 1}`;
}
/**
 * returns vscode-terminal-friendly (clickable) link with line/column information
 * ex: "file:///foo.ts:2:3"
 * @param loc
 */


function LocationLike_toHashLink(loc) {
  const {
    uri,
    range: {
      start: {
        line,
        character
      }
    }
  } = LocationLike_toLocation(loc);
  return `${uri}#${line + 1}:${character + 1}`;
}

function LocationLike_toLocation(x) {
  if (typeof x === 'string') {
    return {
      uri: (0, _URL.URL_file)(x),
      range: _vscodeLanguageserverTypes.Range.create(0, 0, 0, 0)
    };
  }

  if (typeof x === 'object') {
    if (x instanceof tsm.Node) {
      return Location_fromNode(x);
    }

    if (_vscodeLanguageserverTypes.Location.is(x)) {
      return x;
    }

    if (ExtendedDiagnostic_is(x)) {
      return {
        uri: x.uri,
        range: x.diagnostic.range
      };
    }
  }

  throw new Error();
}

function Location_overlaps(loc1, loc2, consider0000 = false) {
  if (loc1.uri !== loc2.uri) {
    return false;
  }

  return Range_overlaps(loc1.range, loc2.range, consider0000);
}
/**
 * by convention, the range [0,0,0,0] means the complete document
 * @param range
 */


function Range_is0000(range) {
  const {
    start,
    end
  } = range;
  return Position_is00(start) && Position_is00(end);
}

function Position_is00(pos) {
  return pos.character === 0 && pos.line === 0;
}

function ExtendedDiagnostic_is(x) {
  if (typeof x !== 'object') {
    return false;
  }

  if (typeof x === 'undefined') {
    return false;
  }

  if (typeof x.uri !== 'string') {
    return false;
  }

  if (!_vscodeLanguageserverTypes.Diagnostic.is(x.diagnostic)) {
    return false;
  }

  return true;
}

function ExtendedDiagnostic_groupByUri(ds) {
  const grouped = (0, _lodash.groupBy)(ds, d => d.uri);
  const dss = (0, _lodash.mapValues)(grouped, xds => {
    const dd = (0, _map.default)(xds).call(xds, xd => xd.diagnostic);
    return (0, _lodash.uniqBy)(dd, _stringify.default); // dedupe
  });
  return dss;
}

async function ExtendedDiagnostic_findRelevantQuickFixes(xd, context) {
  // check context to see if any of the context.diagnostics are equivalent
  for (const ctx_d of context.diagnostics) {
    const node_d = xd.diagnostic;

    if (Diagnostic_compare(ctx_d, node_d)) {
      if (xd.quickFix) {
        const a = await xd.quickFix();

        if (a) {
          a.kind = 'quickfix';
          a.diagnostics = [ctx_d];
          return [a];
        }
      }
    }
  }

  return [];
}

function Position_fromTSMorphOffset(offset, sf) {
  const {
    line,
    column
  } = sf.getLineAndColumnAtPos(offset);
  return {
    character: column - 1,
    line: line - 1
  };
}

function Position_fromOffset(offset, text) {
  const res = (0, _lineColumn.default)(text).fromIndex(offset);

  if (!res) {
    return undefined;
  }

  const {
    line,
    col
  } = res;
  return {
    character: col - 1,
    line: line - 1
  };
}

function Position_fromOffsetOrFail(offset, text) {
  const p = Position_fromOffset(offset, text);

  if (!p) {
    throw new Error('Position_fromOffsetOrFail');
  }

  return p;
}
/**
 * The Diagnostic interface defined in vscode-languageserver-types
 * does not include the document URI.
 * This interface adds that, and a few other things.
 */


/**
 * Helper method to create diagnostics
 * @param node
 * @param message
 */
function err(loc, message, code) {
  const {
    uri,
    range
  } = LocationLike_toLocation(loc);
  return {
    uri,
    diagnostic: {
      range,
      message,
      severity: _vscodeLanguageserverTypes.DiagnosticSeverity.Error,
      code
    }
  };
}

function Diagnostic_compare(d1, d2) {
  if (d1.code !== d2.code) {
    return false;
  }

  if (d1.message !== d2.message) {
    return false;
  }

  if (!Range_equals(d1.range, d2.range)) {
    return false;
  }

  return true;
}

function Range_equals(r1, r2) {
  return toArr(r1).join(',') === toArr(r2).join(',');

  function toArr(r) {
    return [r.start.line, r.start.character, r.end.line, r.end.character];
  }
}

function DiagnosticSeverity_getLabel(severity) {
  const {
    Information,
    Error,
    Hint,
    Warning
  } = _vscodeLanguageserverTypes.DiagnosticSeverity;
  const labels = {
    [Information]: 'info',
    [Error]: 'error',
    [Hint]: 'hint',
    [Warning]: 'warning'
  };
  return labels[severity ?? Information];
}

/**
 * Returns a string representation of a diagnostic.
 * TSC style single-line errors:
 * ex: "b.ts:1:2: error: this is a message"
 * ex: "/path/to/app/b.ts:1:2: info: this is a message"
 */
function ExtendedDiagnostic_format(d, opts) {
  const {
    diagnostic: {
      severity,
      message,
      code
    }
  } = d;
  const cwd = opts?.cwd;
  const getSeverityLabel = opts?.getSeverityLabel ?? DiagnosticSeverity_getLabel;
  let base = 'file://';

  if (cwd) {
    base = (0, _URL.URL_file)(cwd);
  }

  if (!(0, _endsWith.default)(base).call(base, '/')) {
    base += '/';
  }

  const file = LocationLike_toTerminalLink(d).substr(base.length);
  const severityLabel = getSeverityLabel(severity);
  const errorCode = code ? ` (${code})` : '';
  const str = `${file}: ${severityLabel}${errorCode}: ${message}`;
  return str;
}
/**
 * a value of "null" means this file needs to be deleted
 */


function FileSet_fromTextDocuments(documents) {
  const files = {};

  for (const uri of (0, _keys.default)(documents).call(documents)) {
    files[uri] = documents.get(uri).getText();
  }

  return files;
}

function WorkspaceEdit_fromFileSet(files, getExistingFileText) {
  const change = new _vscodeLanguageserverTypes.WorkspaceChange({
    documentChanges: []
  });

  for (const uri of (0, _keys2.default)(files)) {
    const content = files[uri];

    if (typeof content !== 'string') {
      change.deleteFile(uri, {
        ignoreIfNotExists: true
      });
      continue;
    } else {
      const text = getExistingFileText?.(uri);

      if (text) {
        // file exists
        //change.createFile(uri, { overwrite: true })
        change.getTextEditChange({
          uri,
          version: null
        }).replace(Range_full(text), content); // TODO: we could be more granular here
      } else {
        change.createFile(uri);
        change.getTextEditChange({
          uri,
          version: null
        }).insert(_vscodeLanguageserverTypes.Position.create(0, 0), content);
      }
    }
  }

  return change.edit;
}

function Range_full(text, cr = '\n') {
  if (text === '') {
    return _vscodeLanguageserverTypes.Range.create(0, 0, 0, 0);
  }

  const lines = text.split(cr);

  if (lines.length === 0) {
    return _vscodeLanguageserverTypes.Range.create(0, 0, 0, 0);
  }

  const start = _vscodeLanguageserverTypes.Position.create(0, 0);

  const end = _vscodeLanguageserverTypes.Position.create(lines.length - 1, lines[lines.length - 1].length);

  return _vscodeLanguageserverTypes.Range.create(start, end);
}