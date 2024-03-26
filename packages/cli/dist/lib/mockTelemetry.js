"use strict";

var _vitest = require("vitest");
/* eslint-env vitest */

// mock Telemetry for CLI commands so they don't try to spawn a process
_vitest.vi.mock('@redwoodjs/telemetry', () => {
  return {
    errorTelemetry: () => _vitest.vi.fn(),
    timedTelemetry: () => _vitest.vi.fn()
  };
});