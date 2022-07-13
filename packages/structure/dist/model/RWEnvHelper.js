"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.RWEnvHelper = void 0;

var _startsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/starts-with"));

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _from = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/array/from"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/get-own-property-descriptor"));

var _findIndex = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find-index"));

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/applyDecoratedDescriptor"));

var _path = require("path");

var dotenv = _interopRequireWildcard(require("dotenv-defaults"));

var _fsExtra = require("fs-extra");

var _lodash = require("lodash");

var _vscodeLanguageserver = require("vscode-languageserver");

var _ide = require("../ide");

var _decorators = require("../x/decorators");

var _prisma = require("../x/prisma");

var _URL = require("../x/URL");

var _vscode = require("../x/vscode");

var _vscodeLanguageserverTypes = require("../x/vscode-languageserver-types");

var _process_env = require("./util/process_env");

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _class2;

let RWEnvHelper = (_dec = (0, _decorators.lazy)(), _dec2 = (0, _decorators.lazy)(), _dec3 = (0, _decorators.lazy)(), _dec4 = (0, _decorators.lazy)(), _dec5 = (0, _decorators.lazy)(), _dec6 = (0, _decorators.lazy)(), _dec7 = (0, _decorators.lazy)(), _dec8 = (0, _decorators.lazy)(), (_class = class RWEnvHelper extends _ide.BaseNode {
  constructor(parent) {
    super();
    this.parent = parent;
  }

  get id() {
    // this is an internal node. it is not associated to any particular file
    return this.parent.id + ' envHelper';
  }

  bailOutOnCollection() {
    // we need this node to participate in all collection requests
    // because it will emit info and diagnostics for files all over the codebase
    return false;
  }
  /**
   * parse .env
   * return undefined if not present
   * NOTE: It does not apply defaults (see env_merged)
   */


  get env() {
    return this._dotenv('.env');
  }
  /**
   * .env.defaults
   * return undefined if not present
   */


  get env_defaults() {
    return this._dotenv('.env.defaults');
  }

  get api_prisma_env() {
    return this._dotenv('api/prisma/.env');
  }
  /**
   * .env.defaults + .env
   * uses the same algorithm that env-defaults does (Object.assign(), which is equivalent to object spread addition)
   */


  get env_default_merged() {
    var _this$env_defaults, _this$env;

    return { ...((_this$env_defaults = this.env_defaults) !== null && _this$env_defaults !== void 0 ? _this$env_defaults : {}),
      ...((_this$env = this.env) !== null && _this$env !== void 0 ? _this$env : {})
    };
  }
  /**
   * - starts with .env + .env.defaults
   * - allows any variables prefixed with 'REDWOOD_ENV_'
   * - applies the "include" rule on the rest
   * @param include
   */


  env_default_merged_filtered(include) {
    return (0, _lodash.pickBy)(this.env_default_merged, (_v, k) => (0, _startsWith.default)(k).call(k, 'REDWOOD_ENV_') || (include === null || include === void 0 ? void 0 : (0, _includes.default)(include).call(include, k)));
  }

  _dotenv(f) {
    const file = (0, _path.join)(this.parent.projectRoot, f);

    if (!(0, _fsExtra.existsSync)(file)) {
      return undefined;
    }

    return dotenv.parse((0, _fsExtra.readFileSync)(file));
  }

  get env_available_to_api() {
    // in the API side, all variables are visible
    return this.env_default_merged; // return this.env_merged_filter(
    //   this.parent.redwoodTOML.api_includeEnvironmentVariables ?? []
    // )
  }

  get env_available_to_web() {
    var _this$parent$redwoodT;

    return this.env_default_merged_filtered((_this$parent$redwoodT = this.parent.redwoodTOML.web_includeEnvironmentVariables) !== null && _this$parent$redwoodT !== void 0 ? _this$parent$redwoodT : []);
  }

  children() {
    return [...this.process_env_expressions];
  }

  get process_env_expressions() {
    var _context, _context2;

    // TODO: make this async (this is globbing around quite a bit)
    const {
      pathHelper
    } = this.parent;
    const api = (0, _map.default)(_context = (0, _process_env.process_env_findAll)(pathHelper.api.base)).call(_context, x => new ProcessDotEnvExpression(this, 'api', x.key, x.node));
    const web = (0, _map.default)(_context2 = (0, _process_env.process_env_findAll)(pathHelper.web.base)).call(_context2, x => new ProcessDotEnvExpression(this, 'web', x.key, x.node));
    const prisma = (0, _from.default)((0, _prisma.prisma_parseEnvExpressionsInFile)(pathHelper.api.dbSchema));
    const pp = (0, _map.default)(prisma).call(prisma, x => new ProcessDotEnvExpression(this, 'prisma', x.key, x.location));
    return [...api, ...web, ...pp];
  }

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "id", [_dec], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "id"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "env", [_dec2], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "env"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "env_defaults", [_dec3], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "env_defaults"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "api_prisma_env", [_dec4], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "api_prisma_env"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "env_default_merged", [_dec5], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "env_default_merged"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "env_available_to_api", [_dec6], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "env_available_to_api"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "env_available_to_web", [_dec7], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "env_available_to_web"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "process_env_expressions", [_dec8], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "process_env_expressions"), _class.prototype)), _class));
/**
 * An occurence of process.env somewhere in the codebase
 */

exports.RWEnvHelper = RWEnvHelper;
let ProcessDotEnvExpression = (_dec9 = (0, _decorators.lazy)(), _dec10 = (0, _decorators.lazy)(), _dec11 = (0, _decorators.lazy)(), _dec12 = (0, _decorators.lazy)(), _dec13 = (0, _decorators.lazy)(), _dec14 = (0, _decorators.lazy)(), (_class2 = class ProcessDotEnvExpression extends _ide.BaseNode {
  constructor(parent, kind, key, node) {
    super();
    this.parent = parent;
    this.kind = kind;
    this.key = key;
    this.node = node;
  }

  bailOutOnCollection(uri) {
    if (this.location.uri !== uri) {
      return true;
    }

    return false;
  }

  get id() {
    // this is an internal node. it is not associated to any particular file
    // we just need to make sure the ID is unique and correctly nested
    return this.parent.id + ' ' + (0, _vscodeLanguageserverTypes.LocationLike_toHashLink)(this.location);
  }

  get side() {
    return this.kind === 'web' ? 'web' : 'api';
  }

  get location() {
    return (0, _vscodeLanguageserverTypes.LocationLike_toLocation)(this.node);
  }

  *ideInfo() {
    for (const x of this.render()) {
      if (!(0, _vscodeLanguageserverTypes.ExtendedDiagnostic_is)(x)) {
        yield x;
      }
    }
  }

  *diagnostics() {
    for (const x of this.render()) {
      if ((0, _vscodeLanguageserverTypes.ExtendedDiagnostic_is)(x)) {
        yield x;
      }
    }
  }

  get value_definition_file_basename() {
    const {
      key,
      parent: {
        env,
        env_defaults
      }
    } = this;

    if (env !== null && env !== void 0 && env[key]) {
      return '.env';
    }

    if (env_defaults !== null && env_defaults !== void 0 && env_defaults[key]) {
      return '.env.defaults';
    }

    return undefined;
  }

  get value_definition_location() {
    const x = this.value_definition_file_basename;

    if (!x) {
      return undefined;
    }

    const file = (0, _path.join)(this.parent.parent.projectRoot, x);
    const content = (0, _fsExtra.readFileSync)(file).toString();
    const lines = content.split('\n');
    const index = (0, _findIndex.default)(lines).call(lines, l => (0, _startsWith.default)(l).call(l, this.key + '='));
    return {
      uri: (0, _URL.URL_file)(file),
      range: _vscodeLanguageserver.Range.create(index, 0, index, lines[index].length)
    };
  }

  get value_as_available() {
    if (this.side === 'web') {
      return this.parent.env_available_to_web[this.key];
    }

    const v = this.parent.env_available_to_api[this.key];
    return v;
  }

  *render() {
    const {
      key,
      location,
      value_as_available
    } = this;
    const {
      uri,
      range
    } = location; // show reference to value definition

    if (this.value_definition_location) {
      yield {
        kind: 'Reference',
        location,
        target: this.value_definition_location
      };
      yield {
        kind: 'Definition',
        location,
        target: this.value_definition_location
      };
    } // show hover with the actual value, if present


    if (typeof value_as_available !== 'undefined') {
      var _this$value_definitio;

      yield {
        kind: 'Hover',
        location,
        hover: {
          range: location.range,
          contents: `${key}=${value_as_available} (${(_this$value_definitio = this.value_definition_file_basename) !== null && _this$value_definitio !== void 0 ? _this$value_definitio : ''})`
        }
      };

      if (typeof value_as_available !== 'undefined' && this.value_definition_location) {
        const title = `${key}=${value_as_available}`;
        const command = { ...(0, _vscode.Command_open)(this.value_definition_location),
          title
        };
        const codelens = {
          kind: 'CodeLens',
          location,
          codeLens: {
            range,
            command
          }
        }; // TODO: we need to add middleware to the LSP client
        // so the uri (string) is converted to a vscode.Uri
        // https://github.com/microsoft/vscode-languageserver-node/issues/495
        // eslint-disable-next-line no-constant-condition

        if (false) {
          yield codelens;
        }
      }
    }

    if (typeof value_as_available === 'undefined') {
      // the value is not available
      // there are a few scenarios here...
      if (this.parent.env_default_merged[key]) {
        // value is actually in the merged env, but it is not visible here
        // this is probably because the user forgot to add an includeEnvironmentVariables rule
        const snippet = `
[${this.side}]
  includeEnvironmentVariables = ['${this.key}']`;
        yield {
          uri,
          diagnostic: {
            range,
            message: `
This env variable is present in '${this.value_definition_file_basename}',
but it won't be available to your app in production *unless* you add it to includeEnvironmentVariables.
Tip: add the following to your redwood.toml:
${snippet}
            `,
            severity: _vscodeLanguageserver.DiagnosticSeverity.Warning // TODO: quickFix

          }
        };
      } else {
        // the value is simply not visible
        yield {
          uri,
          diagnostic: {
            range,
            message: `env value ${key} is not available. add it to your .env file`,
            severity: _vscodeLanguageserver.DiagnosticSeverity.Warning // TODO: add a quickfix?

          }
        };
      }
    }
  }

}, ((0, _applyDecoratedDescriptor2.default)(_class2.prototype, "id", [_dec9], (0, _getOwnPropertyDescriptor.default)(_class2.prototype, "id"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "side", [_dec10], (0, _getOwnPropertyDescriptor.default)(_class2.prototype, "side"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "location", [_dec11], (0, _getOwnPropertyDescriptor.default)(_class2.prototype, "location"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "value_definition_file_basename", [_dec12], (0, _getOwnPropertyDescriptor.default)(_class2.prototype, "value_definition_file_basename"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "value_definition_location", [_dec13], (0, _getOwnPropertyDescriptor.default)(_class2.prototype, "value_definition_location"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "value_as_available", [_dec14], (0, _getOwnPropertyDescriptor.default)(_class2.prototype, "value_as_available"), _class2.prototype)), _class2));