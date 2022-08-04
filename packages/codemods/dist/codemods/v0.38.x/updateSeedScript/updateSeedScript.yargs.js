"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.description = exports.command = void 0;

var _tasuku = _interopRequireDefault(require("tasuku"));

var _updateSeedScript = require("./updateSeedScript");

const command = 'update-seed-script';
exports.command = command;
const description = '(v0.37->v0.38) Moves and updates the seed script to work with prisma 3';
exports.description = description;

const handler = () => {
  (0, _tasuku.default)('Update seed script part', async ({
    setOutput
  }) => {
    await (0, _updateSeedScript.updateSeedScript)();
    const notes = [`One more thing...`, '', `  We added a new seed file added in scripts/seed.{js,ts}.`, `  If you have an existing seed file in api/db,`, `  be sure to move the logic over.`, '', `  But if you don't use the seed file in api/db, you can just delete it.`, ''].join('\n');
    setOutput(notes);
  });
};

exports.handler = handler;