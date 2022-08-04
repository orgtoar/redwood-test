"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.CLIUI = void 0;
exports.UIPickItem_normalize = UIPickItem_normalize;
exports.VSCodeWindowUI = void 0;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _enquirer = _interopRequireDefault(require("enquirer"));

function UIPickItem_normalize(item) {
  return typeof item === 'string' ? {
    label: item
  } : item;
}

class VSCodeWindowUI {
  constructor(w) {
    this.w = w;
  }

  async info(msg) {
    await this.w.showInformationMessage(msg);
  }

  async prompt(msg, opts) {
    const opts2 = { ...opts,
      prompt: msg
    };
    return await this.w.showInputBox(opts2);
  }

  async pickOne(items, msg) {
    const items2 = (0, _map.default)(items).call(items, UIPickItem_normalize);
    const res = await this.w.showQuickPick(items2, {
      placeHolder: msg
    });
    return res === null || res === void 0 ? void 0 : res.label;
  }

  async pickMany(items, msg) {
    const items2 = (0, _map.default)(items).call(items, UIPickItem_normalize);
    const res = await this.w.showQuickPick(items2, {
      placeHolder: msg,
      canPickMany: true
    });
    return res === null || res === void 0 ? void 0 : (0, _map.default)(res).call(res, r => r.label);
  }

}

exports.VSCodeWindowUI = VSCodeWindowUI;

class CLIUI {
  async info(msg) {
    console.log(msg);
  }

  async prompt(msg) {
    const res = await _enquirer.default.prompt({
      type: 'input',
      name: 'x',
      message: msg
    });
    return res['x'];
  }

  async pickOne(items, msg) {
    const items2 = (0, _map.default)(items).call(items, UIPickItem_normalize);
    const res = await _enquirer.default.prompt({
      type: 'select',
      name: 'x',
      message: msg,
      choices: (0, _map.default)(items2).call(items2, i => i.label)
    });
    return res['x'];
  }

  async pickMany(items, msg) {
    const items2 = (0, _map.default)(items).call(items, UIPickItem_normalize);
    const res = await _enquirer.default.prompt({
      type: 'multiselect',
      name: 'x',
      message: msg,
      choices: (0, _map.default)(items2).call(items2, i => i.label)
    });
    return res['x'];
  }

}

exports.CLIUI = CLIUI;