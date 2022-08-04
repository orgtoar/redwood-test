"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = void 0;

var _tasuku = _interopRequireDefault(require("tasuku"));

var _updateScaffoldStyles = require("./updateScaffoldStyles");

const command = 'update-scaffold-styles';
exports.command = command;
const description = '(v0.37->v0.38) Update your scaffold.css file with an input error style';
exports.description = description;

const handler = () => {
  (0, _tasuku.default)('Update scaffold styles', async () => {
    (0, _updateScaffoldStyles.updateScaffoldStyles)();
  });
};

exports.handler = handler;