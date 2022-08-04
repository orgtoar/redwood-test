"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RWProject = void 0;

require("core-js/modules/esnext.async-iterator.map.js");

require("core-js/modules/esnext.iterator.map.js");

require("core-js/modules/esnext.async-iterator.filter.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.filter.js");

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
    const dmmf = await this.prismaDMMF();

    if (!dmmf) {
      return [];
    }

    return dmmf.datamodel.models.map(m => m.name);
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
    return this.processPagesDir.map(p => new _RWPage.RWPage(p.const, p.path, this));
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
    // TODO: what is the official logic?
    // TODO: Support both `/services/todos/todos.js` AND `/services/todos.js`
    return this.host.globSync(this.pathHelper.api.services + allFilesGlob).filter(_path2.followsDirNameConvention).map(x => new _RWService.RWService(x, this));
  }

  get sdls() {
    return this.host.globSync(this.pathHelper.api.graphql + '/**/*.sdl.{js,ts}').map(x => new _RWSDL.RWSDL(x, this));
  }

  get layouts() {
    // TODO: what is the official logic?
    return this.host.globSync(this.pathHelper.web.layouts + allFilesGlob).filter(_path2.followsDirNameConvention).filter(_path2.isLayoutFileName).map(x => new _RWLayout.RWLayout(x, this));
  }

  get functions() {
    // TODO: what is the official logic?
    return this.host.globSync(this.pathHelper.api.functions + allFilesGlob).map(x => new _RWFunction.RWFunction(x, this));
  }

  get components() {
    return this.host.globSync(this.pathHelper.web.components + allFilesGlob).map(file => {
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
    return this.host.globSync(this.pathHelper.web.base + '/**/*Cell.{js,jsx,tsx}').map(file => new _RWCell.RWCell(file, this)).filter(file => file.isCell);
  }

  get envHelper() {
    return new _RWEnvHelper.RWEnvHelper(this);
  }

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "id", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "id"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "pathHelper", [_dec2], Object.getOwnPropertyDescriptor(_class.prototype, "pathHelper"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "isTypeScriptProject", [_dec3], Object.getOwnPropertyDescriptor(_class.prototype, "isTypeScriptProject"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "prismaDMMF", [_dec4], Object.getOwnPropertyDescriptor(_class.prototype, "prismaDMMF"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "prismaDMMFModelNames", [_dec5], Object.getOwnPropertyDescriptor(_class.prototype, "prismaDMMFModelNames"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "redwoodTOML", [_dec6], Object.getOwnPropertyDescriptor(_class.prototype, "redwoodTOML"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "processPagesDir", [_dec7], Object.getOwnPropertyDescriptor(_class.prototype, "processPagesDir"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "pages", [_dec8], Object.getOwnPropertyDescriptor(_class.prototype, "pages"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "router", [_dec9], Object.getOwnPropertyDescriptor(_class.prototype, "router"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "defaultNotFoundPageFilePath", [_dec10], Object.getOwnPropertyDescriptor(_class.prototype, "defaultNotFoundPageFilePath"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "services", [_dec11], Object.getOwnPropertyDescriptor(_class.prototype, "services"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "sdls", [_dec12], Object.getOwnPropertyDescriptor(_class.prototype, "sdls"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "layouts", [_dec13], Object.getOwnPropertyDescriptor(_class.prototype, "layouts"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "functions", [_dec14], Object.getOwnPropertyDescriptor(_class.prototype, "functions"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "components", [_dec15], Object.getOwnPropertyDescriptor(_class.prototype, "components"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "sides", [_dec16], Object.getOwnPropertyDescriptor(_class.prototype, "sides"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "mocks", [_dec17], Object.getOwnPropertyDescriptor(_class.prototype, "mocks"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "cells", [_dec18], Object.getOwnPropertyDescriptor(_class.prototype, "cells"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "envHelper", [_dec19], Object.getOwnPropertyDescriptor(_class.prototype, "envHelper"), _class.prototype)), _class));
exports.RWProject = RWProject;