"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.getFreePort = getFreePort;
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _portfinder = _interopRequireDefault(require("portfinder"));
/**
 * Finds a free port
 * @param  {number}   requestedPort Port to start searching from
 * @param  {number[]} excludePorts  Array of port numbers to exclude
 * @return {Promise<number>}                 A free port equal or higher than requestedPort but not within excludePorts. If no port can be found then returns -1
 */
async function getFreePort(requestedPort, excludePorts = []) {
  try {
    let freePort = await _portfinder.default.getPortPromise({
      port: requestedPort
    });
    if ((0, _includes.default)(excludePorts).call(excludePorts, freePort)) {
      freePort = await getFreePort(freePort + 1, excludePorts);
    }
    return freePort;
  } catch (error) {
    return -1;
  }
}