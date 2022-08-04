"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.command_builder = command_builder;

require("core-js/modules/esnext.set.add-all.js");

require("core-js/modules/esnext.set.delete-all.js");

require("core-js/modules/esnext.set.difference.js");

require("core-js/modules/esnext.set.every.js");

require("core-js/modules/esnext.set.filter.js");

require("core-js/modules/esnext.set.find.js");

require("core-js/modules/esnext.set.intersection.js");

require("core-js/modules/esnext.set.is-disjoint-from.js");

require("core-js/modules/esnext.set.is-subset-of.js");

require("core-js/modules/esnext.set.is-superset-of.js");

require("core-js/modules/esnext.set.join.js");

require("core-js/modules/esnext.set.map.js");

require("core-js/modules/esnext.set.reduce.js");

require("core-js/modules/esnext.set.some.js");

require("core-js/modules/esnext.set.symmetric-difference.js");

require("core-js/modules/esnext.set.union.js");

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/applyDecoratedDescriptor"));

var _camelcase = _interopRequireDefault(require("camelcase"));

var _util = require("../util");

var _decorators = require("../x/decorators");

var _RedwoodCommandString = require("./RedwoodCommandString");

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class;

function command_builder(opts) {
  return new CommandBuilder(opts).buildCommand();
}

let CommandBuilder = (_dec = (0, _decorators.memo)(), _dec2 = (0, _decorators.memo)(), _dec3 = (0, _decorators.lazy)(), _dec4 = (0, _decorators.memo)(), _dec5 = (0, _decorators.memo)(), _dec6 = (0, _decorators.memo)(), _dec7 = (0, _decorators.memo)(), _dec8 = (0, _decorators.memo)(), (_class = class CommandBuilder {
  constructor(opts) {
    this.opts = opts;
    this.prompts = void 0;
    this.prompts = new PromptHelper(this.opts);
  }

  async buildCommand() {
    if (this.opts.cmd.isComplete) {
      // there is no need to build it interactively
      return this.opts.cmd;
    } // else, the command is interactive. we run the interactive builder to complete it


    const str = await this.buildCommandString();
    return str ? new _RedwoodCommandString.RedwoodCommandString(str) : undefined;
  }

  async buildCommandString() {
    try {
      switch (await this.arg_command()) {
        case 'generate':
          return await this.generate(await this.arg_generate_type());

        case 'db':
          switch (await this.arg_db_operation()) {
            case 'save':
              const name = await this.prompts.prompt('Choose migration name');
              return `db save ${name}`;

            case 'up':
              return `db up`;
          }

          return;
      }
    } catch (e) {
      if (e.message === 'break') {
        return;
      }

      throw e;
    }
  }

  get args() {
    return this.opts.cmd.parsed._;
  }

  async generate(type) {
    switch (type) {
      case 'page':
        const pageName = await this.prompts.prompt('Page Name (ex: Home, about, MyPage, contact)');
        const defaultPath = '/' + (0, _camelcase.default)(pageName);
        const path = await this.prompts.pagePath(defaultPath);
        return `generate page ${pageName} ${path}`;

      case 'cell':
        return `generate cell ${await this.prompts.prompt('Cell Name')}`;

      case 'scaffold':
        return `generate scaffold ${await this.arg_generate_scaffold_modelName()}`;

      case 'component':
        return `generate component ${await this.prompts.prompt('Component Name')}`;

      case 'layout':
        return `generate layout ${await this.prompts.prompt('Layout Name')}`;

      case 'sdl':
        const modelName = await this.arg_generate_sdl_modelName();
        const opts = await this.prompts.sdl_options();

        if (!opts) {
          return;
        } // TODO: serialize options
        // services: { type: 'boolean', default: true },
        // crud: { type: 'boolean', default: false },
        // force: { type: 'boolean', default: false },


        return `generate sdl ${modelName}`;
    }
  }

  async arg_command() {
    var _this$args$;

    return (_this$args$ = this.args[0]) !== null && _this$args$ !== void 0 ? _this$args$ : breakIfNull(await this.prompts.command());
  }

  async arg_generate_type() {
    var _this$args$2;

    return (_this$args$2 = this.args[1]) !== null && _this$args$2 !== void 0 ? _this$args$2 : breakIfNull(await this.prompts.generate_type());
  }

  async arg_db_operation() {
    var _this$args$3;

    return (_this$args$3 = this.args[1]) !== null && _this$args$3 !== void 0 ? _this$args$3 : breakIfNull(await this.prompts.db_operations());
  }

  async arg_generate_sdl_modelName() {
    var _this$args$4;

    return (_this$args$4 = this.args[2]) !== null && _this$args$4 !== void 0 ? _this$args$4 : breakIfNull(await this.prompts.model('Choose Model for SDL...'));
  }

  async arg_generate_scaffold_modelName() {
    var _this$args$5;

    return (_this$args$5 = this.args[2]) !== null && _this$args$5 !== void 0 ? _this$args$5 : breakIfNull(await this.prompts.model('Choose Model to Scaffold...'));
  }

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "buildCommand", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "buildCommand"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "buildCommandString", [_dec2], Object.getOwnPropertyDescriptor(_class.prototype, "buildCommandString"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "args", [_dec3], Object.getOwnPropertyDescriptor(_class.prototype, "args"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "arg_command", [_dec4], Object.getOwnPropertyDescriptor(_class.prototype, "arg_command"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "arg_generate_type", [_dec5], Object.getOwnPropertyDescriptor(_class.prototype, "arg_generate_type"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "arg_db_operation", [_dec6], Object.getOwnPropertyDescriptor(_class.prototype, "arg_db_operation"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "arg_generate_sdl_modelName", [_dec7], Object.getOwnPropertyDescriptor(_class.prototype, "arg_generate_sdl_modelName"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "arg_generate_scaffold_modelName", [_dec8], Object.getOwnPropertyDescriptor(_class.prototype, "arg_generate_scaffold_modelName"), _class.prototype)), _class));
/**
 * A set of specialized prompt helpers
 * that wrap around the UI methods and sometimes queries the RWProject
 */

class PromptHelper {
  constructor(opts) {
    this.opts = opts;
  }
  /**
   * prompt for a required (and non-empty) string
   * @param msg
   */


  async prompt(msg) {
    let v = await this.opts.ui.prompt(msg);

    if (v === '') {
      v = undefined;
    }

    return breakIfNull(v);
  }

  async command() {
    return await this.opts.ui.pickOne(['generate', 'db'], // TODO: add more commands (this could be generated from the redwoods/cli package)
    'Choose Redwood CLI command');
  }
  /**
   * Pick a model name from schema.prisma
   * @param msg
   */


  async model(msg) {
    const models = await this.opts.project.prismaDMMFModelNames();

    if (models.length === 0) {
      this.opts.ui.info('You must define at least one model in the "schema.prisma" file');
      return;
    }

    return await this.opts.ui.pickOne(models, msg);
  }

  async sdl_options() {
    const opts = await this.opts.ui.pickMany([{
      label: 'services',
      description: 'generate services',
      picked: true
    }, {
      label: 'crud',
      description: 'generate CRUD',
      picked: false
    }, {
      label: 'force',
      description: 'overwrite existing files',
      picked: false
    }], 'Options...');

    if (!opts) {
      return;
    }

    return new Set(opts);
  }

  async generate_type() {
    return await this.opts.ui.pickOne(generatorTypes, 'Choose Redwood component type to generate');
  }

  async db_operations() {
    return await this.opts.ui.pickOne(dbOperations, 'Choose db command');
  }

  async pagePath(defaultPath) {
    return await this.opts.ui.prompt('path', {
      // prompt: "path",
      value: defaultPath,
      valueSelection: [1, defaultPath.length],

      validateInput(path) {
        try {
          (0, _util.validateRoutePath)(path);
        } catch (e) {
          return e + '';
        }
      }

    });
  }

}

const generatorTypes = ['page', 'cell', 'scaffold', 'component', 'layout', 'sdl', 'service'];
const dbOperations = ['down', 'generate', 'save', 'seed', 'up'];

function breakIfNull(x) {
  if (typeof x === 'undefined' || x === null) {
    throw new Error('break');
  }

  return x;
}