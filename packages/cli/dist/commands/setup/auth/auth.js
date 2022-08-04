"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.webIndexDoesExist = exports.isProviderSupported = exports.handler = exports.files = exports.description = exports.command = exports.builder = exports.apiSrcDoesExist = exports.addConfigToApp = exports.addApiConfig = void 0;

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/interopRequireWildcard"));

require("core-js/modules/esnext.async-iterator.filter.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.filter.js");

require("core-js/modules/esnext.async-iterator.map.js");

require("core-js/modules/esnext.iterator.map.js");

require("core-js/modules/esnext.async-iterator.reduce.js");

require("core-js/modules/esnext.iterator.reduce.js");

require("core-js/modules/esnext.async-iterator.for-each.js");

require("core-js/modules/esnext.iterator.for-each.js");

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _execa = _interopRequireDefault(require("execa"));

var _listr = _interopRequireDefault(require("listr"));

var _prompts = _interopRequireDefault(require("prompts"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _telemetry = require("@redwoodjs/telemetry");

var _lib = require("../../../lib");

var _colors = _interopRequireDefault(require("../../../lib/colors"));

var _project = require("../../../lib/project");

const AUTH_PROVIDER_IMPORT = `import { AuthProvider } from '@redwoodjs/auth'`;
const OUTPUT_PATHS = {
  auth: _path.default.join((0, _lib.getPaths)().api.lib, (0, _project.isTypeScriptProject)() ? 'auth.ts' : 'auth.js'),
  function: _path.default.join((0, _lib.getPaths)().api.functions, (0, _project.isTypeScriptProject)() ? 'auth.ts' : 'auth.js')
};
const WEBAUTHN_SUPPORTED_PROVIDERS = ['dbAuth'];

const getWebAppPath = () => (0, _lib.getPaths)().web.app;

const getSupportedProviders = () => _fs.default.readdirSync(_path.default.resolve(__dirname, 'providers')).map(file => _path.default.basename(file, '.js')).filter(file => file !== 'README.md');

const getTemplates = () => _fs.default.readdirSync(_path.default.resolve(__dirname, 'templates')).reduce((templates, file) => {
  if (file === 'auth.ts.template') {
    return { ...templates,
      base: [_path.default.resolve(__dirname, 'templates', file)]
    };
  } else {
    const provider = file.split('.')[0];

    if (templates[provider]) {
      templates[provider].push(_path.default.resolve(__dirname, 'templates', file));
      return { ...templates
      };
    } else {
      return { ...templates,
        [provider]: [_path.default.resolve(__dirname, 'templates', file)]
      };
    }
  }
}, {}); // returns the content of App.{js,tsx} with import statements added


const addWebImports = (content, imports) => {
  return `${AUTH_PROVIDER_IMPORT}\n` + imports.join('\n') + '\n' + content;
}; // returns the content of App.{js,tsx} with init lines added (if there are any)


const addWebInit = (content, init) => {
  if (init) {
    const regex = /const App = \(.*\) => [({]/;
    const match = content.match(regex);

    if (!match) {
      return content;
    }

    return content.replace(regex, `${init}\n\n${match[0]}`);
  }

  return content;
};

const objectToComponentProps = (obj, options = {
  exclude: []
}) => {
  let props = [];

  for (const [key, value] of Object.entries(obj)) {
    if (!options.exclude.includes(key)) {
      if (key === 'client') {
        props.push(`${key}={${value}}`);
      } else {
        props.push(`${key}="${value}"`);
      }
    }
  }

  return props;
}; // returns the content of App.{js,tsx} with <AuthProvider> added


const addWebRender = (content, authProvider) => {
  const [_, newlineAndIndent, redwoodProviderOpen, redwoodProviderChildren, redwoodProviderClose] = content.match(/(\s+)(<RedwoodProvider.*?>)(.*)(<\/RedwoodProvider>)/s);
  const redwoodProviderChildrenLines = redwoodProviderChildren.split('\n').map((line, index) => {
    return `${index === 0 ? '' : '  '}` + line;
  }); // Wrap with custom components e.g.
  // <RedwoodProvider titleTemplate="%PageTitle | %AppTitle">
  //     <FetchConfigProvider>
  //     <ApolloInjector>
  //     <AuthProvider client={ethereum} type="ethereum">

  const customRenderOpen = (authProvider.render || []).reduce((acc, component) => acc + newlineAndIndent + '  ' + `<${component}>`, '');
  const customRenderClose = (authProvider.render || []).reduce((acc, component) => newlineAndIndent + '  ' + `</${component}>` + acc, '');
  const props = objectToComponentProps(authProvider, {
    exclude: ['render']
  });
  const renderContent = newlineAndIndent + redwoodProviderOpen + customRenderOpen + newlineAndIndent + '  ' + `<AuthProvider ${props.join(' ')}>` + redwoodProviderChildrenLines.join('\n') + `</AuthProvider>` + customRenderClose + newlineAndIndent + redwoodProviderClose;
  return content.replace(/\s+<RedwoodProvider.*?>.*<\/RedwoodProvider>/s, renderContent);
}; // returns the content of App.{js,tsx} with <AuthProvider> updated


const updateWebRender = (content, authProvider) => {
  const props = objectToComponentProps(authProvider);
  const renderContent = `<AuthProvider ${props.join(' ')}>`;
  return content.replace(/<AuthProvider.*type=['"](.*)['"]>/s, renderContent);
}; // returns the content of App.{js,tsx} without the old auth import


const removeOldWebImports = (content, imports) => {
  return content.replace(`${AUTH_PROVIDER_IMPORT}\n` + imports.join('\n'), '');
}; // returns the content of App.{js,tsx} without the old auth init


const removeOldWebInit = (content, init) => {
  return content.replace(init, '');
}; // returns content with old auth provider removes


const removeOldAuthProvider = async content => {
  // get the current auth provider
  const [_, currentAuthProvider] = content.match(/<AuthProvider.*type=['"](.*)['"]/s);
  let oldAuthProvider;

  try {
    oldAuthProvider = await Promise.resolve(`./providers/${currentAuthProvider}`).then(s => (0, _interopRequireWildcard2.default)(require(s)));
  } catch (e) {
    throw new Error('Could not replace existing auth provider init');
  }

  content = removeOldWebImports(content, oldAuthProvider.config.imports);
  content = removeOldWebInit(content, oldAuthProvider.config.init);
  return content;
}; // check to make sure AuthProvider doesn't exist


const checkAuthProviderExists = async () => {
  const content = _fs.default.readFileSync(getWebAppPath()).toString();

  if (content.includes(AUTH_PROVIDER_IMPORT)) {
    throw new Error('Existing auth provider found.\nUse --force to override existing provider.');
  }
}; // the files to create to support auth


const files = ({
  provider,
  webAuthn
}) => {
  const templates = getTemplates();
  let files = {}; // look for any templates for this provider

  for (const [templateProvider, templateFiles] of Object.entries(templates)) {
    if (provider === templateProvider) {
      templateFiles.forEach(templateFile => {
        const shouldUseTemplate = webAuthn && templateFile.match(/\.webAuthn\./) || !webAuthn && !templateFile.match(/\.webAuthn\./);

        if (shouldUseTemplate) {
          const outputPath = OUTPUT_PATHS[_path.default.basename(templateFile).split('.')[1]];

          const content = _fs.default.readFileSync(templateFile).toString();

          files = Object.assign(files, {
            [outputPath]: (0, _project.isTypeScriptProject)() ? content : (0, _lib.transformTSToJS)(outputPath, content)
          });
        }
      });
    }
  } // if there are no provider-specific templates, just use the base auth one


  if (Object.keys(files).length === 0) {
    const content = _fs.default.readFileSync(templates.base[0]).toString();

    files = {
      [OUTPUT_PATHS.auth]: (0, _project.isTypeScriptProject)() ? content : (0, _lib.transformTSToJS)(templates.base[0], content)
    };
  }

  return files;
}; // actually inserts the required config lines into App.{js,tsx}


exports.files = files;

const addConfigToApp = async (config, force, options = {}) => {
  const {
    webAppPath: customWebAppPath
  } = options || {};
  const webAppPath = customWebAppPath || getWebAppPath();

  let content = _fs.default.readFileSync(webAppPath).toString(); // update existing AuthProvider if --force else add new AuthProvider


  if (content.includes(AUTH_PROVIDER_IMPORT) && force) {
    content = await removeOldAuthProvider(content);
    content = updateWebRender(content, config.authProvider);
  } else {
    content = addWebRender(content, config.authProvider);
  }

  content = addWebImports(content, config.imports);
  content = addWebInit(content, config.init);

  _fs.default.writeFileSync(webAppPath, content);
};

exports.addConfigToApp = addConfigToApp;

const addApiConfig = () => {
  const graphqlPath = (0, _lib.getGraphqlPath)();

  let content = _fs.default.readFileSync(graphqlPath).toString(); // default to an array to avoid destructure errors


  const [_, hasAuthImport] = content.match(/(import {.*} from 'src\/lib\/auth.*')/s) || [];

  if (!hasAuthImport) {
    // add import statement
    content = content.replace(/^(.*services.*)$/m, `$1\n\nimport { getCurrentUser } from 'src/lib/auth'`); // add object to handler

    content = content.replace(/^(\s*)(loggerConfig:)(.*)$/m, `$1getCurrentUser,\n$1$2$3`);

    _fs.default.writeFileSync(graphqlPath, content);
  }
};

exports.addApiConfig = addApiConfig;

const isProviderSupported = provider => {
  return getSupportedProviders().indexOf(provider) !== -1;
};

exports.isProviderSupported = isProviderSupported;

const apiSrcDoesExist = () => {
  return _fs.default.existsSync(_path.default.join((0, _lib.getPaths)().api.src));
};

exports.apiSrcDoesExist = apiSrcDoesExist;

const webIndexDoesExist = () => {
  return _fs.default.existsSync(getWebAppPath());
};

exports.webIndexDoesExist = webIndexDoesExist;
const command = 'auth <provider>';
exports.command = command;
const description = 'Generate an auth configuration';
exports.description = description;

const builder = yargs => {
  yargs.positional('provider', {
    choices: getSupportedProviders(),
    description: 'Auth provider to configure',
    type: 'string'
  }).option('force', {
    alias: 'f',
    default: false,
    description: 'Overwrite existing configuration',
    type: 'boolean'
  }).option('webauthn', {
    alias: 'w',
    default: null,
    description: 'Include WebAuthn support (TouchID/FaceID)',
    type: 'boolean'
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#setup-auth')}`);
};

exports.builder = builder;

const handler = async yargs => {
  const {
    provider,
    rwVersion,
    webauthn
  } = yargs;
  let force = yargs.force;
  let includeWebAuthn = webauthn;
  let providerData; // check if api/src/lib/auth.js already exists and if so, ask the user to overwrite

  if (force === false) {
    if (_fs.default.existsSync(Object.keys(files(provider, yargs))[0])) {
      const forceResponse = await (0, _prompts.default)({
        type: 'confirm',
        name: 'answer',
        message: `Overwrite existing ${(0, _lib.getPaths)().api.lib.replace((0, _lib.getPaths)().base, '')}/auth.[jt]s?`,
        initial: false
      });
      force = forceResponse.answer;
    }
  } // only dbAuth supports WebAuthn right now, but in theory it could work with
  // any provider, so we'll do a check here and potentially use any the webAuthn
  // version of its provider


  if (includeWebAuthn === null && WEBAUTHN_SUPPORTED_PROVIDERS.includes(provider)) {
    const webAuthnResponse = await (0, _prompts.default)({
      type: 'confirm',
      name: 'answer',
      message: `Enable WebAuthn support (TouchID/FaceID)? See https://redwoodjs.com/docs/auth/dbAuth#webAuthn`,
      initial: false
    });
    includeWebAuthn = webAuthnResponse.answer;
  }

  if (includeWebAuthn) {
    providerData = await Promise.resolve(`./providers/${provider}.webAuthn`).then(s => (0, _interopRequireWildcard2.default)(require(s)));
  } else {
    providerData = await Promise.resolve(`./providers/${provider}`).then(s => (0, _interopRequireWildcard2.default)(require(s)));
  }

  const tasks = new _listr.default([{
    title: 'Generating auth lib...',
    task: (_ctx, task) => {
      if (apiSrcDoesExist()) {
        return (0, _lib.writeFilesTask)(files({ ...yargs,
          webAuthn: includeWebAuthn
        }), {
          overwriteExisting: force
        });
      } else {
        task.skip('api/src not found, skipping');
      }
    }
  }, {
    title: 'Adding auth config to web...',
    task: (_ctx, task) => {
      if (webIndexDoesExist()) {
        addConfigToApp(providerData.config, force);
      } else {
        task.skip('web/src/App.{js,tsx} not found, skipping');
      }
    }
  }, {
    title: 'Adding auth config to GraphQL API...',
    task: (_ctx, task) => {
      if ((0, _lib.graphFunctionDoesExist)()) {
        addApiConfig();
      } else {
        task.skip('GraphQL function not found, skipping');
      }
    }
  }, {
    title: 'Adding required web packages...',
    task: async () => {
      if (!isProviderSupported(provider)) {
        throw new Error(`Unknown auth provider '${provider}'`);
      }

      await (0, _execa.default)('yarn', ['workspace', 'web', 'add', ...providerData.webPackages, `@redwoodjs/auth@${rwVersion}`]);
    }
  }, providerData.apiPackages.length > 0 && {
    title: 'Adding required api packages...',
    task: async () => {
      if (!isProviderSupported(provider)) {
        throw new Error(`Unknown auth provider '${provider}'`);
      }

      await (0, _execa.default)('yarn', ['workspace', 'api', 'add', ...providerData.apiPackages]);
    }
  }, {
    title: 'Installing packages...',
    task: async () => {
      await (0, _execa.default)('yarn', ['install']);
    }
  }, providerData.task, {
    title: 'One more thing...',
    task: (_ctx, task) => {
      task.title = `One more thing...\n\n   ${providerData.notes.join('\n   ')}\n`;
    }
  }].filter(Boolean), {
    collapse: false
  });

  try {
    // Don't throw existing provider error when --force exists
    if (!force) {
      await checkAuthProviderExists();
    }

    await tasks.run();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_colors.default.error(e.message));
    process.exit((e === null || e === void 0 ? void 0 : e.exitCode) || 1);
  }
};

exports.handler = handler;