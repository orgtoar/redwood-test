"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.RWProject = void 0;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/get-own-property-descriptor"));

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/applyDecoratedDescriptor"));

var _path = require("path");

var _sdk = require("@prisma/sdk");

var _internal = require("@redwoodjs/internal");

var _ide = require("../ide");

var _decorators = require("../x/decorators");

var _path2 = require("../x/path");

var _URL = require("../x/URL");

var _RWCell = require("./RWCell");

var _RWComponent = require("./RWComponent");

var _RWEnvHelper = require("./RWEnvHelper");

var _RWFunction = require("./RWFunction");

var _RWLayout = require("./RWLayout");

var _RWPage = require("./RWPage");

var _RWRouter = require("./RWRouter");

var _RWSDL = require("./RWSDL");

var _RWService = require("./RWService");

var _RWTOML = require("./RWTOML");

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _class;

const allFilesGlob = '/**/*.{js,jsx,ts,tsx}';
/**
 * Represents a Redwood project.
 * This is the root node.
 */

let RWProject = (_dec = (0, _decorators.lazy)(), _dec2 = (0, _decorators.lazy)(), _dec3 = (0, _decorators.lazy)(), _dec4 = (0, _decorators.memo)(), _dec5 = (0, _decorators.memo)(), _dec6 = (0, _decorators.lazy)(), _dec7 = (0, _decorators.lazy)(), _dec8 = (0, _decorators.lazy)(), _dec9 = (0, _decorators.lazy)(), _dec10 = (0, _decorators.lazy)(), _dec11 = (0, _decorators.lazy)(), _dec12 = (0, _decorators.lazy)(), _dec13 = (0, _decorators.lazy)(), _dec14 = (0, _decorators.lazy)(), _dec15 = (0, _decorators.lazy)(), _dec16 = (0, _decorators.lazy)(), _dec17 = (0, _decorators.lazy)(), _dec18 = (0, _decorators.lazy)(), _dec19 = (0, _decorators.lazy)(), (_class = class RWProject extends _ide.BaseNode {
  constructor(opts) {
    super();
    this.opts = opts;
    this.parent = undefined;

    this.getRouter = () => {
      return new _RWRouter.RWRouter(this.pathHelper.web.routes, this);
    };
  }

  get host() {
    return this.opts.host;
  }

  get projectRoot() {
    return this.opts.projectRoot;
  }

  get id() {
    return (0, _URL.URL_file)(this.projectRoot);
  }

  children() {
    return [this.redwoodTOML, ...this.pages, this.router, ...this.services, ...this.sdls, ...this.layouts, ...this.components, this.envHelper];
  }
  /**
   * Path constants that are relevant to a Redwood project.
   */


  get pathHelper() {
    return (0, _internal.getPaths)(this.projectRoot);
  }
  /**
   * Checks for the presence of a tsconfig.json at the root.
   */


  get isTypeScriptProject() {
    return this.host.existsSync((0, _path.join)(this.pathHelper.web.base, 'tsconfig.json')) || this.host.existsSync((0, _path.join)(this.pathHelper.api.base, 'tsconfig.json'));
  } // TODO: do we move this to a separate node? (ex: RWDatabase)


  async prismaDMMF() {
    try {
      // consider case where dmmf doesn't exist (or fails to parse)
      return await (0, _sdk.getDMMF)({
        datamodel: this.host.readFileSync(this.pathHelper.api.dbSchema)
      });
    } catch (e) {
      return undefined;
    }
  }

  async prismaDMMFModelNames() {
    var _context;

    const dmmf = await this.prismaDMMF();

    if (!dmmf) {
      return [];
    }

    return (0, _map.default)(_context = dmmf.datamodel.models).call(_context, m => m.name);
  }

  get redwoodTOML() {
    return new _RWTOML.RWTOML((0, _path.join)(this.projectRoot, 'redwood.toml'), this);
  }

  get processPagesDir() {
    try {
      return (0, _internal.processPagesDir)(this.pathHelper.web.pages);
    } catch (e) {
      return [];
    }
  }

  get pages() {
    var _context2;

    return (0, _map.default)(_context2 = this.processPagesDir).call(_context2, p => new _RWPage.RWPage(p.const, p.path, this));
  }

  get router() {
    return this.getRouter();
  }

  // TODO: move to path helper
  servicesFilePath(name) {
    // name = blog,posts
    const ext = this.isTypeScriptProject ? '.ts' : '.js';
    return (0, _path.join)(this.pathHelper.api.services, name, name + ext);
  } // TODO: move to path helper


  get defaultNotFoundPageFilePath() {
    const ext = this.isTypeScriptProject ? '.tsx' : '.js'; // or jsx?

    return (0, _path.join)(this.pathHelper.web.pages, 'NotFoundPage', 'NotFoundPage' + ext);
  }

  get services() {
    var _context3, _context4;

    // TODO: what is the official logic?
    // TODO: Support both `/services/todos/todos.js` AND `/services/todos.js`
    return (0, _map.default)(_context3 = (0, _filter.default)(_context4 = this.host.globSync(this.pathHelper.api.services + allFilesGlob)).call(_context4, _path2.followsDirNameConvention)).call(_context3, x => new _RWService.RWService(x, this));
  }

  get sdls() {
    var _context5;

    return (0, _map.default)(_context5 = this.host.globSync(this.pathHelper.api.graphql + '/**/*.sdl.{js,ts}')).call(_context5, x => new _RWSDL.RWSDL(x, this));
  }

  get layouts() {
    var _context6, _context7, _context8;

    // TODO: what is the official logic?
    return (0, _map.default)(_context6 = (0, _filter.default)(_context7 = (0, _filter.default)(_context8 = this.host.globSync(this.pathHelper.web.layouts + allFilesGlob)).call(_context8, _path2.followsDirNameConvention)).call(_context7, _path2.isLayoutFileName)).call(_context6, x => new _RWLayout.RWLayout(x, this));
  }

  get functions() {
    var _context9;

    // TODO: what is the official logic?
    return (0, _map.default)(_context9 = this.host.globSync(this.pathHelper.api.functions + allFilesGlob)).call(_context9, x => new _RWFunction.RWFunction(x, this));
  }

  get components() {
    var _context10;

    return (0, _map.default)(_context10 = this.host.globSync(this.pathHelper.web.components + allFilesGlob)).call(_context10, file => {
      if ((0, _path2.isCellFileName)(file)) {
        const possibleCell = new _RWCell.RWCell(file, this);
        return possibleCell.isCell ? possibleCell : new _RWComponent.RWComponent(file, this);
      }

      return new _RWComponent.RWComponent(file, this);
    });
  }

  get sides() {
    return ['web', 'api'];
  } // TODO: Wrap these in a real model.


  get mocks() {
    return this.host.globSync(this.pathHelper.web.base + '/**/*.mock.{js,ts}');
  }
  /**
   * A "Cell" is a component that ends in `Cell.{js, jsx, tsx}`, but does not
   * have a default export AND does not export `QUERY`
   **/


  get cells() {
    var _context11, _context12;

    return (0, _filter.default)(_context11 = (0, _map.default)(_context12 = this.host.globSync(this.pathHelper.web.base + '/**/*Cell.{js,jsx,tsx}')).call(_context12, file => new _RWCell.RWCell(file, this))).call(_context11, file => file.isCell);
  }

  get envHelper() {
    return new _RWEnvHelper.RWEnvHelper(this);
  }

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "id", [_dec], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "id"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "pathHelper", [_dec2], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "pathHelper"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "isTypeScriptProject", [_dec3], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "isTypeScriptProject"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "prismaDMMF", [_dec4], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "prismaDMMF"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "prismaDMMFModelNames", [_dec5], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "prismaDMMFModelNames"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "redwoodTOML", [_dec6], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "redwoodTOML"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "processPagesDir", [_dec7], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "processPagesDir"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "pages", [_dec8], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "pages"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "router", [_dec9], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "router"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "defaultNotFoundPageFilePath", [_dec10], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "defaultNotFoundPageFilePath"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "services", [_dec11], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "services"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "sdls", [_dec12], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "sdls"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "layouts", [_dec13], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "layouts"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "functions", [_dec14], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "functions"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "components", [_dec15], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "components"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "sides", [_dec16], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "sides"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "mocks", [_dec17], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "mocks"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "cells", [_dec18], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "cells"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "envHelper", [_dec19], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "envHelper"), _class.prototype)), _class));
exports.RWProject = RWProject;