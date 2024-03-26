"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.loadPlugins = loadPlugins;
require("core-js/modules/es.array.push.js");
var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/slice"));
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));
var _set = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/set"));
var _startsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/starts-with"));
var _sort = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/sort"));
var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));
var _from = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/array/from"));
var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/entries"));
var _values = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/values"));
var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/some"));
var _values2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/values"));
var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));
var _lib = require("./lib");
var _plugin = require("./lib/plugin");
/**
 * Attempts to load all CLI plugins as defined in the redwood.toml file
 *
 * @param {*} yargs A yargs instance
 * @returns The yargs instance with plugins loaded
 */
async function loadPlugins(yargs) {
  var _context, _context2, _context3, _context6, _context7;
  // Extract some useful information from the command line args
  const namespaceIsExplicit = process.argv[2]?.startsWith('@');
  const namespaceInUse = (namespaceIsExplicit ? process.argv[2] : '@redwoodjs') ?? '@redwoodjs';
  const commandString = namespaceIsExplicit ? (0, _slice.default)(_context = process.argv).call(_context, 3).join(' ') : (0, _slice.default)(_context2 = process.argv).call(_context2, 2).join(' ');
  const commandFirstWord = commandString.split(' ')[0];

  // Check for possible early exit for `yarn rw --version`
  if (commandFirstWord === '--version' && namespaceInUse === '@redwoodjs') {
    // We don't need to load any plugins in this case
    return yargs;
  }

  // TODO: We should have some mechanism to fetch the cache from an online or precomputed
  // source this will allow us to have a cache hit on the first run of a command
  const pluginCommandCache = (0, _plugin.loadCommandCache)();

  // Check if the command is built in to the base CLI package
  if ((0, _includes.default)(_context3 = pluginCommandCache._builtin).call(_context3, commandFirstWord) && namespaceInUse === '@redwoodjs') {
    // If the command is built in we don't need to load any plugins
    return yargs;
  }

  // The TOML is the source of truth for plugins
  const {
    plugins,
    autoInstall
  } = (0, _lib.getConfig)().experimental.cli;

  // Plugins are enabled unless explicitly disabled
  const enabledPlugins = (0, _filter.default)(plugins).call(plugins, p => p.package !== undefined && (p.enabled ?? true));

  // Print warnings about any invalid plugins
  (0, _plugin.checkPluginListAndWarn)(enabledPlugins);

  // Extract some useful information from the enabled plugins
  const redwoodPackages = new _set.default();
  const thirdPartyPackages = new _set.default();
  for (const plugin of enabledPlugins) {
    var _context4, _context5;
    // Skip invalid plugins
    if (!plugin.package) {
      continue;
    }
    // Skip non-scoped packages
    if (!(0, _startsWith.default)(_context4 = plugin.package).call(_context4, '@')) {
      continue;
    }
    if ((0, _startsWith.default)(_context5 = plugin.package).call(_context5, '@redwoodjs/')) {
      redwoodPackages.add(plugin.package);
    } else {
      thirdPartyPackages.add(plugin.package);
    }
  }

  // Order alphabetically but with @redwoodjs namespace first, orders the help output
  const namespaces = (0, _sort.default)(_context6 = (0, _map.default)(_context7 = (0, _from.default)(thirdPartyPackages)).call(_context7, p => p.split('/')[0])).call(_context6);
  if (redwoodPackages.size > 0) {
    namespaces.unshift('@redwoodjs');
  }

  // There are cases where we can avoid loading the plugins if they are in the cache
  // this includes when we are showing help output at the root level
  const showingHelpAtRootLevel = !namespaceIsExplicit && (commandFirstWord === '--help' || commandFirstWord === '-h' || commandFirstWord === '');

  // We also need the same logic for when an unknown namespace is used
  const namespaceIsUnknown = !(0, _includes.default)(namespaces).call(namespaces, namespaceInUse);
  if (showingHelpAtRootLevel || namespaceIsUnknown) {
    // In this case we wish to show all available redwoodjs commands and all the
    // third party namespaces available
    for (const namespace of namespaces) {
      if (namespace === '@redwoodjs') {
        for (const redwoodPluginPackage of redwoodPackages) {
          // We'll load the plugin information from the cache if there is a cache entry
          const commands = await loadCommandsFromCacheOrPackage(redwoodPluginPackage, pluginCommandCache, autoInstall, true);
          yargs.command(commands);
        }
      } else {
        // We only need to show that the namespace exists, users can then run
        // `yarn rw @namespace` to see the commands available in that namespace
        yargs.command({
          command: `${namespace} <command>`,
          describe: `Commands from ${namespace}`,
          builder: () => {},
          handler: () => {}
        });
      }
    }

    // Update the cache with any new information we have
    (0, _plugin.saveCommandCache)(pluginCommandCache);
    return yargs;
  }
  const showingHelpAtNamespaceLevel = namespaceIsExplicit && (commandFirstWord === '--help' || commandFirstWord === '-h' || commandFirstWord === '');
  if (showingHelpAtNamespaceLevel) {
    // In this case we wish to show all available commands for the particular namespace
    if (namespaceInUse === '@redwoodjs') {
      for (const redwoodPluginPackage of redwoodPackages) {
        // We'll load the plugin information from the cache if there is a cache entry
        const commands = await loadCommandsFromCacheOrPackage(redwoodPluginPackage, pluginCommandCache, autoInstall, true);
        yargs.command(commands);
      }
    } else {
      var _context8;
      const packagesForNamespace = (0, _filter.default)(_context8 = (0, _from.default)(thirdPartyPackages)).call(_context8, p => (0, _startsWith.default)(p).call(p, namespaceInUse));
      for (const packageForNamespace of packagesForNamespace) {
        // We'll load the plugin information from the cache if there is a cache entry
        const commands = await loadCommandsFromCacheOrPackage(packageForNamespace, pluginCommandCache, autoInstall, true);
        yargs.command({
          command: `${namespaceInUse} <command>`,
          describe: `Commands from ${namespaceInUse}`,
          builder: yargs => {
            yargs.command(commands).demandCommand();
          },
          handler: () => {}
        });
      }
    }

    // Update the cache with any new information we have
    (0, _plugin.saveCommandCache)(pluginCommandCache);
    return yargs;
  }

  // At this point we know that:
  // - The command is not built in
  // - The namespace is known
  // - We're not asking for help at the root level
  // - We're not asking for help at the namespace level
  // Now we need to try to cull based on the namespace and the specific command

  // Try to find the package for this command from the cache
  const packagesToLoad = new _set.default();
  for (const [packageName, cacheEntry] of (0, _entries.default)(pluginCommandCache)) {
    if (packageName === '_builtin') {
      continue;
    }
    const commandFirstWords = [];
    for (const [command, info] of (0, _entries.default)(cacheEntry)) {
      commandFirstWords.push(command.split(' ')[0]);
      commandFirstWords.push(...(info.aliases?.map(a => a.split(' ')[0]) ?? []));
    }
    if ((0, _includes.default)(commandFirstWords).call(commandFirstWords, commandFirstWord) && (0, _startsWith.default)(packageName).call(packageName, namespaceInUse)) {
      packagesToLoad.add(packageName);
      break;
    }
  }

  // If we didn't find the package in the cache we'll have to load all
  // of them, for help output essentially
  const foundMatchingPackage = packagesToLoad.size > 0;
  if (!foundMatchingPackage) {
    for (const plugin of enabledPlugins) {
      var _context9;
      if ((0, _startsWith.default)(_context9 = plugin.package).call(_context9, namespaceInUse)) {
        packagesToLoad.add(plugin.package);
      }
    }
  }
  const commandsToRegister = [];
  // If we nailed down the package to load we can go ahead and load it now
  if (foundMatchingPackage) {
    // We'll have to load the plugin package since we may need to actually execute
    // the command builder/handler functions
    const packageToLoad = (0, _values.default)(packagesToLoad).call(packagesToLoad).next().value;
    const commands = await loadCommandsFromCacheOrPackage(packageToLoad, pluginCommandCache, autoInstall, false);
    commandsToRegister.push(...commands);
  } else {
    // It's safe to try and load the plugin information from the cache since any
    // that are present in the cache didn't match the command we're trying to run
    // so they'll never be executed and will only be used for help output
    for (const packageToLoad of packagesToLoad) {
      const commands = await loadCommandsFromCacheOrPackage(packageToLoad, pluginCommandCache, autoInstall, true);
      commandsToRegister.push(...commands);
    }
  }

  // We need to nest the commands under the namespace remembering that the
  // @redwoodjs namespace is special and doesn't need to be nested
  if (namespaceInUse === '@redwoodjs') {
    yargs.command(commandsToRegister);
  } else {
    yargs.command({
      command: `${namespaceInUse} <command>`,
      describe: `Commands from ${namespaceInUse}`,
      builder: yargs => {
        yargs.command(commandsToRegister).demandCommand();
      },
      handler: () => {}
    });
  }

  // For consistency in the help output at the root level we'll register
  // the namespace stubs if they didn't explicitly use a namespace
  if (!namespaceIsExplicit) {
    for (const namespace of namespaces) {
      if (namespace === '@redwoodjs') {
        continue;
      }
      yargs.command({
        command: `${namespace} <command>`,
        describe: `Commands from ${namespace}`,
        builder: () => {},
        handler: () => {}
      });
    }
  }

  // Update the cache with any new information we have
  (0, _plugin.saveCommandCache)(pluginCommandCache);
  return yargs;
}
async function loadCommandsFromCacheOrPackage(packageName, cache, autoInstall, readFromCache) {
  let cacheEntry = undefined;
  if (readFromCache) {
    cacheEntry = cache !== undefined ? cache[packageName] : undefined;
  }
  if (cacheEntry !== undefined) {
    var _context10;
    const commands = (0, _map.default)(_context10 = (0, _entries.default)(cacheEntry)).call(_context10, ([command, info]) => {
      return {
        command,
        describe: info.description,
        aliases: info.aliases
      };
    });
    return commands;
  }

  // We'll have to load the plugin package to get the command information
  const plugin = await (0, _plugin.loadPluginPackage)(packageName, undefined, autoInstall);
  if (plugin) {
    const commands = plugin.commands ?? [];
    const cacheUpdate = {};
    for (const command of commands) {
      var _context11;
      const info = {
        aliases: command.aliases,
        description: command.description
      };

      // If we have any information about the command we'll update the cache
      if ((0, _some.default)(_context11 = (0, _values2.default)(info)).call(_context11, value => value !== undefined)) {
        cacheUpdate[command.command] = info;
      }
    }

    // Only update the entry if we got any cache information
    if ((0, _keys.default)(cacheUpdate).length > 0) {
      cache[packageName] = cacheUpdate;
    }
    return commands;
  }

  // NOTE: If the plugin failed to load there should have been a warning printed
  return [];
}