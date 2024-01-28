#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var import_child_process = require("child_process");
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
var import_chalk = __toESM(require("chalk"));
var import_chokidar = __toESM(require("chokidar"));
var import_dotenv = __toESM(require("dotenv"));
var import_lodash = require("lodash");
var import_helpers = require("yargs/helpers");
var import_yargs = __toESM(require("yargs/yargs"));
var import_api = require("@redwoodjs/internal/dist/build/api");
var import_validateSchema = require("@redwoodjs/internal/dist/validateSchema");
var import_project_config = require("@redwoodjs/project-config");
const argv = (0, import_yargs.default)((0, import_helpers.hideBin)(process.argv)).option("debug-port", {
  alias: "dp",
  description: "Debugging port",
  type: "number"
}).option("port", {
  alias: "p",
  description: "Port",
  type: "number"
}).help().alias("help", "h").parseSync();
const rwjsPaths = (0, import_project_config.getPaths)();
if (!process.env.REDWOOD_ENV_FILES_LOADED) {
  import_dotenv.default.config({
    path: import_path.default.join((0, import_project_config.getPaths)().base, ".env"),
    // @ts-expect-error The types for dotenv-defaults are using an outdated version of dotenv
    defaults: import_path.default.join((0, import_project_config.getPaths)().base, ".env.defaults"),
    multiline: true
  });
  process.env.REDWOOD_ENV_FILES_LOADED = "true";
}
let httpServerProcess;
const killApiServer = () => {
  httpServerProcess?.emit("exit");
  httpServerProcess?.kill();
};
const validate = async () => {
  try {
    await (0, import_validateSchema.loadAndValidateSdls)();
    return true;
  } catch (e) {
    killApiServer();
    console.log(
      import_chalk.default.redBright(`[GQL Server Error] - Schema validation failed`)
    );
    console.error(import_chalk.default.red(e?.message));
    console.log(import_chalk.default.redBright("-".repeat(40)));
    debouncedBuild.cancel();
    debouncedRebuild.cancel();
    return false;
  }
};
const buildAndRestart = async ({
  rebuild = false,
  clean = false
} = {}) => {
  try {
    killApiServer();
    const buildTs = Date.now();
    console.log(import_chalk.default.dim.italic("Building..."));
    if (clean) {
      await (0, import_api.cleanApiBuild)();
    }
    if (rebuild) {
      await (0, import_api.rebuildApi)();
    } else {
      await (0, import_api.buildApi)();
    }
    console.log(import_chalk.default.dim.italic("Took " + (Date.now() - buildTs) + " ms"));
    const forkOpts = {
      execArgv: process.execArgv
    };
    if ((0, import_project_config.getConfig)().experimental.opentelemetry.enabled) {
      const opentelemetrySDKScriptPath = import_path.default.join(
        (0, import_project_config.getPaths)().api.dist,
        "opentelemetry.js"
      );
      const opentelemetrySDKScriptPathRelative = import_path.default.relative(
        (0, import_project_config.getPaths)().base,
        opentelemetrySDKScriptPath
      );
      console.log(
        `Setting up OpenTelemetry using the setup file: ${opentelemetrySDKScriptPathRelative}`
      );
      if (import_fs.default.existsSync(opentelemetrySDKScriptPath)) {
        forkOpts.execArgv = forkOpts.execArgv.concat([
          `--require=${opentelemetrySDKScriptPath}`
        ]);
      } else {
        console.error(
          `OpenTelemetry setup file does not exist at ${opentelemetrySDKScriptPathRelative}`
        );
      }
    }
    const debugPort = argv["debug-port"];
    if (debugPort) {
      forkOpts.execArgv = forkOpts.execArgv.concat([`--inspect=${debugPort}`]);
    }
    const port = argv.port ?? (0, import_project_config.getConfig)().api.port;
    const serverFile = (0, import_project_config.resolveFile)(`${rwjsPaths.api.dist}/server`);
    if (serverFile) {
      httpServerProcess = (0, import_child_process.fork)(
        serverFile,
        ["--port", port.toString()],
        forkOpts
      );
    } else {
      httpServerProcess = (0, import_child_process.fork)(
        import_path.default.join(__dirname, "bin.js"),
        ["api", "--port", port.toString()],
        forkOpts
      );
    }
  } catch (e) {
    console.error(e);
  }
};
const debouncedRebuild = (0, import_lodash.debounce)(
  () => buildAndRestart({ rebuild: true }),
  process.env.RWJS_DELAY_RESTART ? parseInt(process.env.RWJS_DELAY_RESTART, 10) : 500
);
const debouncedBuild = (0, import_lodash.debounce)(
  () => buildAndRestart({ rebuild: false }),
  process.env.RWJS_DELAY_RESTART ? parseInt(process.env.RWJS_DELAY_RESTART, 10) : 500
);
const IGNORED_API_PATHS = [
  "api/dist",
  // use this, because using rwjsPaths.api.dist seems to not ignore on first build
  rwjsPaths.api.types,
  rwjsPaths.api.db
].map((path2) => (0, import_project_config.ensurePosixPath)(path2));
import_chokidar.default.watch([rwjsPaths.api.src], {
  persistent: true,
  ignoreInitial: true,
  ignored: (file) => {
    const x = file.includes("node_modules") || IGNORED_API_PATHS.some((ignoredPath) => file.includes(ignoredPath)) || [
      ".DS_Store",
      ".db",
      ".sqlite",
      "-journal",
      ".test.js",
      ".test.ts",
      ".scenarios.ts",
      ".scenarios.js",
      ".d.ts",
      ".log"
    ].some((ext) => file.endsWith(ext));
    return x;
  }
}).on("ready", async () => {
  await buildAndRestart({
    clean: true,
    rebuild: false
  });
  await validate();
}).on("all", async (eventName, filePath) => {
  if (eventName === "addDir" && filePath === rwjsPaths.api.base) {
    return;
  }
  if (eventName) {
    if (filePath.includes(".sdl")) {
      const isValid = await validate();
      if (!isValid) {
        return;
      }
    }
  }
  console.log(
    import_chalk.default.dim(`[${eventName}] ${filePath.replace(rwjsPaths.api.base, "")}`)
  );
  if (eventName === "add" || eventName === "unlink") {
    debouncedBuild.cancel();
    debouncedRebuild.cancel();
    debouncedBuild();
  } else {
    debouncedRebuild.cancel();
    debouncedRebuild();
  }
});
