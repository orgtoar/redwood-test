"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.getOutline = getOutline;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _URL = require("../x/URL");

var _vscode = require("../x/vscode");

function getOutline(project) {
  return {
    children: () => [_router(project), _pages(project), _components(project), _layouts(project), _cells(project), _services(project), _functions(project), _schema(project), {
      label: 'redwood.toml',
      iconPath: 'x-redwood',
      ...resourceUriAndCommandFor((0, _URL.URL_file)(project.pathHelper.base, 'redwood.toml')),
      menu: {
        kind: 'withDoc',
        doc: (0, _vscode.Command_open)('https://redwoodjs.com/docs/app-configuration-redwood-toml')
      }
    }, {
      label: 'open graphql playground',
      command: (0, _vscode.Command_open)('http://localhost:8911/graphql'),
      iconPath: 'x-graphql',
      menu: {
        kind: 'withDoc',
        doc: (0, _vscode.Command_open)('https://www.apollographql.com/docs/apollo-server/testing/graphql-playground/')
      }
    }, {
      label: 'open storybook',
      command: (0, _vscode.Command_cli)('rw storybook --open'),
      iconPath: 'x-storybook',
      menu: {
        kind: 'withDoc',
        doc: (0, _vscode.Command_open)('https://redwoodjs.com/how-to/mocking-graph-ql-in-storybook')
      }
    }, _rwcli_command_group({
      cmd: 'generate ...',
      tooltip: 'start interactive redwood generator'
    }, {
      cmd: 'dev',
      tooltip: 'start development server and open browser'
    })]
  };
}

function _router(project) {
  const {
    router
  } = project;
  return {
    label: 'Routes.js',
    ...resourceUriAndCommandFor(router.uri),
    iconPath: 'globe',
    children: () => {
      var _context;

      return (0, _map.default)(_context = router.routes).call(_context, _router_route);
    },
    menu: {
      kind: 'group',
      add: (0, _vscode.Command_cli)('rw generate page ...'),
      doc: (0, _vscode.Command_open)('https://redwoodjs.com/docs/redwood-router')
    }
  };
}

function _router_route(route) {
  return {
    label: route.outlineLabel,
    description: route.outlineDescription,
    command: (0, _vscode.Command_open)(route.location),
    iconPath: route.isPrivate ? 'gist-secret' : 'gist',
    menu: {
      kind: 'route',
      openComponent: route.page ? (0, _vscode.Command_open)(route.page.uri) : undefined,
      openRoute: (0, _vscode.Command_open)(route.location),
      openInBrowser: (0, _vscode.Command_cli)(`rw dev --open='${route.path}'`)
    }
  };
}

function _pages(project) {
  return {
    label: 'pages',
    iconPath: 'globe',
    children: () => {
      var _context2;

      return (0, _map.default)(_context2 = project.pages).call(_context2, _pages_page);
    },
    menu: {
      kind: 'group',
      add: (0, _vscode.Command_cli)('rw generate page ...'),
      doc: (0, _vscode.Command_open)('https://redwoodjs.com/docs/tutorial/chapter1/first-page')
    }
  };
}

function _pages_page(page) {
  return {
    id: page.id,
    label: page.basename,
    ...resourceUriAndCommandFor(page.uri),
    description: page.route?.path,
    children: () => [_rwcli_command_group({
      cmd: 'rw destroy page ' + page.basenameNoExt,
      tooltip: 'Delete page and related files'
    })]
  };
}

function _components(project) {
  return {
    label: 'components',
    iconPath: 'extensions',
    children: () => fromFiles(project.components),
    menu: {
      kind: 'group',
      add: (0, _vscode.Command_cli)('rw generate component ...'),
      doc: (0, _vscode.Command_open)('https://redwoodjs.com/docs/cli-commands.html#component')
    }
  };
}

function _layouts(project) {
  return {
    label: 'layouts',
    iconPath: 'preview',
    children: () => fromFiles(project.layouts),
    menu: {
      kind: 'group',
      add: (0, _vscode.Command_cli)('rw generate layout ...'),
      doc: (0, _vscode.Command_open)('https://redwoodjs.com/docs/tutorial/chapter1/layouts')
    }
  };
}

function _cells(project) {
  return {
    label: 'cells',
    iconPath: 'circuit-board',
    children: () => fromFiles(project.cells),
    menu: {
      kind: 'group',
      add: (0, _vscode.Command_cli)('rw generate cell ...'),
      doc: (0, _vscode.Command_open)('https://redwoodjs.com/docs/tutorial/chapter2/cells')
    }
  };
}

function _services(project) {
  return {
    label: 'services',
    iconPath: 'server',
    children: () => fromFiles(project.services),
    menu: {
      kind: 'group',
      add: (0, _vscode.Command_cli)('rw generate service ...'),
      doc: (0, _vscode.Command_open)('https://redwoodjs.com/docs/cli-commands.html#service')
    }
  };
}

function _functions(project) {
  return {
    label: 'functions',
    iconPath: 'server-process',
    // TODO: link to published function
    // http://localhost:8911/graphql
    children: () => fromFiles(project.functions),
    menu: {
      kind: 'group',
      add: (0, _vscode.Command_cli)('rw generate function ...'),
      doc: (0, _vscode.Command_open)('https://redwoodjs.com/docs/serverless-functions')
    }
  };
}

function _schema(project) {
  return {
    label: 'schema.prisma',
    iconPath: 'x-prisma',
    menu: {
      kind: 'withDoc',
      doc: (0, _vscode.Command_open)('https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema')
    },
    ...resourceUriAndCommandFor(project.pathHelper.api.dbSchema),

    async children() {
      var _context3;

      const dmmf = await project.prismaDMMF();

      if (!dmmf) {
        return [];
      }

      const models = (0, _map.default)(_context3 = dmmf.datamodel.models).call(_context3, model => {
        return {
          label: model.name,
          iconPath: 'database',

          // TODO: location for models and fields
          children() {
            var _context4;

            const fields = (0, _map.default)(_context4 = model.fields).call(_context4, f => ({
              label: f.name,
              iconPath: 'symbol-field',
              description: `${f.type}`
            }));

            const commands = _rwcli_command_group({
              tooltip: 'create graphql interface to access this model',
              cmd: `generate sdl ${model.name}`
            }, {
              cmd: `generate scaffold ${model.name}`,
              tooltip: 'generate pages, SDL, and a services object for this model'
            });

            return [...fields, commands];
          }

        };
      });

      const commands = _rwcli_command_group({
        cmd: 'db save',
        tooltip: 'save migration file with new changes'
      }, {
        cmd: 'db up',
        tooltip: 'apply migrations'
      });

      return [...models, commands];
    }

  };
}

function _rwcli_command_group(...opts) {
  return {
    label: 'rw cli',
    key: 'rw-cli-commands',
    tooltip: 'Redwood.js CLI commands',
    iconPath: 'terminal',
    children: () => (0, _map.default)(opts).call(opts, _rwcli_command),
    menu: {
      kind: 'withDoc',
      doc: (0, _vscode.Command_open)('https://redwoodjs.com/docs/cli-commands')
    }
  };
}

function _rwcli_command(opts) {
  const {
    cmd,
    tooltip
  } = opts;
  return {
    label: cmd,
    tooltip,
    menu: {
      kind: 'cli',
      run: (0, _vscode.Command_cli)(cmd)
    }
  };
}

function fromFiles(fileNodes) {
  return (0, _map.default)(fileNodes).call(fileNodes, fromFile);
}

function fromFile(fileNode) {
  return {
    label: fileNode.basename,
    ...resourceUriAndCommandFor(fileNode.uri)
  };
}

function resourceUriAndCommandFor(uri) {
  uri = (0, _URL.URL_file)(uri);
  return {
    resourceUri: uri,
    command: (0, _vscode.Command_open)(uri)
  };
}