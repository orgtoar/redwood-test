"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.addFileToRollback = addFileToRollback;
exports.addFunctionToRollback = addFunctionToRollback;
exports.executeRollback = executeRollback;
exports.prepareForRollback = prepareForRollback;
exports.resetRollback = resetRollback;
require("core-js/modules/es.array.push.js");
var _path = _interopRequireDefault(require("path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
// The stack containing rollback actions
let rollback = [];

/**
 * Adds a function call to the rollback stack, this function will be called when the rollback is executed
 *
 * @param {function} func - The function to call
 * @param {boolean} [atEnd=false] - If true inserts at the bottom of the stack instead of the top
 */
function addFunctionToRollback(func, atEnd = false) {
  const step = {
    type: 'func',
    func: func
  };
  if (atEnd) {
    rollback.unshift(step);
  } else {
    rollback.push(step);
  }
}

/**
 * Adds a file call to the rollback stack, when the rollback is executed the file will deleted if it does not currently exist or will be restored to its current state
 *
 * @param {string} path - Path to the file
 * @param {boolean} [atEnd=false] - If true inserts at the bottom of the stack instead of the top
 */
function addFileToRollback(path, atEnd = false) {
  const step = {
    type: 'file',
    path: path,
    content: _fsExtra.default.existsSync(path) ? _fsExtra.default.readFileSync(path) : null
  };
  if (atEnd) {
    rollback.unshift(step);
  } else {
    rollback.push(step);
  }
}

/**
 * Executes a rollback by processing the contents of the rollback stack
 *
 * @param {object|null} [ctx=null] - The listr2 ctx
 * @param {object|null} [task=null] - The listr2 task
 */
async function executeRollback(_ = null, task = null) {
  if (task) {
    task.title = 'Reverting generator actions...';
  }
  while (rollback.length > 0) {
    const step = rollback.pop();
    switch (step.type) {
      case 'func':
        await step.func();
        break;
      case 'file':
        if (step.content === null) {
          _fsExtra.default.unlinkSync(step.path);
          // Remove any empty parent/grandparent directories, only need 2 levels so just do it manually
          let parent = _path.default.dirname(step.path);
          if (parent !== '.' && _fsExtra.default.readdirSync(parent).length === 0) {
            _fsExtra.default.rmdirSync(parent);
          }
          parent = _path.default.dirname(parent);
          if (parent !== '.' && _fsExtra.default.readdirSync(parent).length === 0) {
            _fsExtra.default.rmdirSync(parent);
          }
        } else {
          _fsExtra.default.writeFileSync(step.path, step.content);
        }
        break;
      default:
        // This should be unreachable.
        break;
    }
  }
  if (task) {
    task.title = `Reverted because: ${task.task.message.error}`;
  }
}

/**
 * Clears the current rollback stack
 */
function resetRollback() {
  rollback.length = 0;
}

/**
 * Resets the current rollback stack and assigns all of the tasks to have a listr2 rollback function which call {@link executeRollback}
 */
function prepareForRollback(tasks) {
  resetRollback();
  tasks.tasks?.forEach(task => {
    task.task.rollback = executeRollback;
  });
}