"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = void 0;

var _record = require("@redwoodjs/record");

const handler = async () => {
  await (0, _record.parseDatamodel)();
};

exports.handler = handler;