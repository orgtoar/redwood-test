"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CLIUI = void 0;
exports.UIPickItem_normalize = UIPickItem_normalize;
exports.VSCodeWindowUI = void 0;

require("core-js/modules/esnext.async-iterator.map.js");

require("core-js/modules/esnext.iterator.map.js");

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
    const items2 = items.map(UIPickItem_normalize);
    const res = await this.w.showQuickPick(items2, {
      placeHolder: msg
    });
    return res === null || res === void 0 ? void 0 : res.label;
  }

  async pickMany(items, msg) {
    const items2 = items.map(UIPickItem_normalize);
    const res = await this.w.showQuickPick(items2, {
      placeHolder: msg,
      canPickMany: true
    });
    return res === null || res === void 0 ? void 0 : res.map(r => r.label);
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
    const items2 = items.map(UIPickItem_normalize);
    const res = await _enquirer.default.prompt({
      type: 'select',
      name: 'x',
      message: msg,
      choices: items2.map(i => i.label)
    });
    return res['x'];
  }

  async pickMany(items, msg) {
    const items2 = items.map(UIPickItem_normalize);
    const res = await _enquirer.default.prompt({
      type: 'multiselect',
      name: 'x',
      message: msg,
      choices: items2.map(i => i.label)
    });
    return res['x'];
  }

}

exports.CLIUI = CLIUI;