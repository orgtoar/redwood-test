"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.extendJSXFile = extendJSXFile;
exports.fileIncludes = fileIncludes;
exports.objectToComponentProps = objectToComponentProps;
require("core-js/modules/es.array.push.js");
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _splice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/splice"));
var _startsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/starts-with"));
var _trimStart = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/trim-start"));
var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));
var _findIndex = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find-index"));
var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));
var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/slice"));
var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/array/is-array"));
var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/entries"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
/**
 * Convenience function to check if a file includes a particular string.
 * @param {string} path File to read and search for str.
 * @param {string} str The value to search for.
 * @returns true if the file exists and the contents thereof include the given string, else false.
 */
function fileIncludes(path, str) {
  var _context;
  return _fsExtra.default.existsSync(path) && (0, _includes.default)(_context = _fsExtra.default.readFileSync(path).toString()).call(_context, str);
}

/**
 * Inject code into the file at the given path.
 * Use of insertComponent assumes only one of (around|within) is used, and that the component
 * identified by (around|within) occurs exactly once in the file at the given path.
 * Imports are added after the last redwoodjs import.
 * moduleScopeLines are added after the last import.
 *
 * @param {string} path Path to JSX file to extend.
 * @param {Object} options Configure behavior
 * @param {Object} options.insertComponent Configure component-inserting behavior.
 * @param {Object} options.insertComponent.name Name of component to insert.
 * @param {Object|string} options.insertComponent.props Properties to pass to the inserted component.
 * @param {string} options.insertComponent.around Name of the component around which the new
 * component will be inserted. Mutually exclusive with insertComponent.within.
 * @param {string} options.insertComponent.within Name of the component within which the new
 * component will be inserted. Mutually exclusive with insertComponent.around.
 * @param {string} options.insertComponent.insertBefore Content to insert before the inserted
 * component.
 * @param {string} options.insertComponent.insertAfter Content to insert after the inserted
 * component.
 * @param {Array} options.imports Import declarations to inject after the last redwoodjs import.
 * @param {Array} options.moduleScopeLines Lines of code to inject after the last import statement.
 * @returns Nothing; writes changes directly into the file at the given path.
 */
function extendJSXFile(path, {
  insertComponent: {
    name = undefined,
    props = undefined,
    around = undefined,
    within = undefined,
    insertBefore = undefined,
    insertAfter = undefined
  },
  imports = [],
  moduleScopeLines = []
}) {
  const content = _fsExtra.default.readFileSync(path).toString().split('\n');
  if (moduleScopeLines?.length) {
    (0, _splice.default)(content).call(content, content.findLastIndex(l => {
      var _context2;
      return (0, _startsWith.default)(_context2 = (0, _trimStart.default)(l).call(l)).call(_context2, 'import');
    }) + 1, 0, '',
    // Empty string to add a newline when we .join('\n') below.
    ...moduleScopeLines);
  }
  if (imports?.length) {
    (0, _splice.default)(content).call(content, content.findLastIndex(l => (0, _includes.default)(l).call(l, '@redwoodjs')) + 1, 0, '',
    // Empty string to add a newline when we .join('\n') below.
    ...imports);
  }
  if (name) {
    insertComponent(content, {
      component: name,
      props,
      around,
      within,
      insertBefore,
      insertAfter
    });
  }
  _fsExtra.default.writeFileSync(path, (0, _filter.default)(content).call(content, e => e !== undefined).join('\n'));
}

/**
 * Inject lines of code into an array of lines to wrap the specified component in a new component tag.
 * Increases the indentation of newly-wrapped content by two spaces (one tab).
 *
 * @param {Array} content A JSX file split by newlines.
 * @param {String} component Name of the component to insert.
 * @param {String|Object} props Properties to pass to the new component.
 * @param {String} around Name of the component around which to insert the new component. Mutually
 * exclusive with within.
 * @param {String} within Name of the component within which to insert the new component. Mutually
 * exclusive with around.
 * @param {String} insertBefore Content to insert before the inserted component.
 * @param {String} insertAfter Content to insert after the inserted component.
 * @returns Nothing; modifies content in place.
 */
function insertComponent(content, {
  component,
  props,
  around,
  within,
  insertBefore,
  insertAfter
}) {
  var _context3;
  if (around && within || !(around || within)) {
    throw new Error('Exactly one of (around | within) must be defined. Choose one.');
  }
  const target = around ?? within;
  const findTagIndex = regex => (0, _findIndex.default)(content).call(content, line => regex.test(line));
  let open = findTagIndex(new RegExp(`([^\\S\r\n]*)<${target}\\s*(.*)\\s*>`));
  let close = findTagIndex(new RegExp(`([^\\S\r\n]*)<\/${target}>`)) + 1;
  if (open === -1 || close === -1) {
    throw new Error(`Could not find tags for ${target}`);
  }
  if (within) {
    open++;
    close--;
  }

  // Assuming close line has same indent depth.
  const [, componentDepth] = content[open].match(/([^\S\r\n]*).*/);
  (0, _splice.default)(content).call(content, open, close - open,
  // "Delete" the wrapped component contents. We put it back below.
  insertBefore && componentDepth + insertBefore, componentDepth + buildOpeningTag(component, props),
  // Increase indent of each now-nested tag by one tab (two spaces)
  ...(0, _map.default)(_context3 = (0, _slice.default)(content).call(content, open, close)).call(_context3, line => '  ' + line), componentDepth + `</${component}>`, insertAfter && componentDepth + insertAfter);
}

/**
 *
 * @param {string} componentName Name of the component to create a tag for.
 * @param {Object|string|undefined} props Properties object, or string, to pass to the tag.
 * @returns A string containing a valid JSX opening tag.
 */
function buildOpeningTag(componentName, props) {
  const propsString = (() => {
    switch (typeof props) {
      case 'undefined':
        return '';
      case 'object':
        return objectToComponentProps(props, {
          raw: true
        }).join(' ');
      case 'string':
        return props;
      default:
        throw new Error(`Illegal argument passed for 'props'. Required: {Object | string | undefined}, got ${typeof props}`);
    }
  })();
  const possibleSpace = propsString.length ? ' ' : '';
  return `<${componentName}${possibleSpace}${propsString}>`;
}

/**
 * Transform an object to JSX props syntax
 *
 * @param {Record<string, any>} obj
 * @param {{exclude?: string[], raw?: boolean | string[]}} options
 * @returns {string[]}
 */
function objectToComponentProps(obj, options = {
  exclude: [],
  raw: false
}) {
  const props = [];
  const doRaw = key => {
    var _context4;
    return options.raw === true || (0, _isArray.default)(options.raw) && (0, _includes.default)(_context4 = options.raw).call(_context4, key);
  };
  for (const [key, value] of (0, _entries.default)(obj)) {
    var _context5;
    if (options.exclude && (0, _includes.default)(_context5 = options.exclude).call(_context5, key)) {
      continue;
    }
    if (doRaw(key)) {
      props.push(`${key}={${value}}`);
    } else {
      props.push(`${key}="${value}"`);
    }
  }
  return props;
}