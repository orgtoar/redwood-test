"use strict";

var _sendTelemetry = require("../sendTelemetry");

(async function () {
  await (0, _sendTelemetry.sendTelemetry)();
})();