"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.redwoodjs_commands = exports.CommandsManager = void 0;

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));

var _command_builder = require("../interactive_cli/command_builder");

var _dry_run = require("../interactive_cli/dry_run");

var _RedwoodCommandString = require("../interactive_cli/RedwoodCommandString");

var _ui = require("../interactive_cli/ui");

var _model = require("../model");

var _decorators = require("../x/decorators");

var _URL = require("../x/URL");

var _vscodeLanguageserverTypes = require("../x/vscode-languageserver-types");

var _dec, _dec2, _class;

const redwoodjs_commands = {
  'redwoodjs.cli': 'redwoodjs.cli'
};
exports.redwoodjs_commands = redwoodjs_commands;
let CommandsManager = (_dec = (0, _decorators.lazy)(), _dec2 = (0, _decorators.memo)(), (_class = class CommandsManager {
  constructor(server) {
    this.server = server;
  }

  get options() {
    return {
      commands: Object.keys(redwoodjs_commands),
      workDoneProgress: true
    };
  }

  start() {
    const {
      connection
    } = this.server;
    connection.onExecuteCommand(async params => {
      if (params.command === redwoodjs_commands['redwoodjs.cli']) {
        var _params$arguments;

        const [cmd, cwd] = (_params$arguments = params.arguments) !== null && _params$arguments !== void 0 ? _params$arguments : [];
        await this.command__cli(cmd, cwd);
      }
    });
  } // --- start command implementations


  async command__cli(cmdString, cwd) {
    var _cwd;

    const {
      vscodeWindowMethods,
      host,
      projectRoot,
      connection,
      documents
    } = this.server;
    cwd = (_cwd = cwd) !== null && _cwd !== void 0 ? _cwd : projectRoot;

    if (!cwd) {
      return;
    } // we need a cwd to run the CLI
    // parse the cmd. this will do some checks and throw


    let cmd = new _RedwoodCommandString.RedwoodCommandString(cmdString !== null && cmdString !== void 0 ? cmdString : '...');

    if (cmd.processed.startsWith('dev --open') || cmd.processed.startsWith('storybook --open')) {
      vscodeWindowMethods.showInformationMessage('not implemented yet: $ redwood ' + cmd.processed);
      return;
    }

    if (!cmd.isComplete) {
      // if the command is incomplete, we need to build it interactively
      const project = new _model.RWProject({
        projectRoot: cwd,
        host
      }); // the interactive builder needs a UI to prompt the user
      // this UI is provided by the client side VSCode extension
      // (it is not a standard part of the LSP)
      // we have a convenience wrapper to access it

      const ui = new _ui.VSCodeWindowUI(vscodeWindowMethods);
      const cmd2 = await (0, _command_builder.command_builder)({
        cmd,
        project,
        ui
      });

      if (!cmd2) {
        return;
      } // user cancelled the interactive process


      cmd = cmd2;
    } // run the command


    if (cmd.isInterceptable) {
      // TODO: we could use the LSP progress API
      vscodeWindowMethods.showInformationMessage('redwood ' + cmd.processed); // run using dry_run so we can intercept the generated files

      const fileOverrides = (0, _vscodeLanguageserverTypes.FileSet_fromTextDocuments)(documents);
      const {
        stdout,
        files
      } = await (0, _dry_run.redwood_gen_dry_run)({
        cmd,
        cwd,
        fileOverrides
      });
      const edit = (0, _vscodeLanguageserverTypes.WorkspaceEdit_fromFileSet)(files, f => {
        if (!host.existsSync((0, _URL.URL_toFile)(f))) {
          return undefined;
        }

        return host.readFileSync((0, _URL.URL_toFile)(f));
      });
      vscodeWindowMethods.showInformationMessage(stdout);
      await connection.workspace.applyEdit({
        label: 'redwood ' + cmd.processed,
        edit
      });
    } else {
      // if it can't be intercepted, just run in the terminal
      vscodeWindowMethods.createTerminal2({
        name: 'Redwood',
        cwd,
        cmd: 'yarn redwood ' + cmd.processed
      });
    }
  }

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "options", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "options"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "start", [_dec2], Object.getOwnPropertyDescriptor(_class.prototype, "start"), _class.prototype)), _class));
exports.CommandsManager = CommandsManager;