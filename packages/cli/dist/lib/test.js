"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.loadGeneratorFixture = exports.loadFixture = exports.generatorsRootPath = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

require("./mockTelemetry");

/* eslint-env jest */
// Include at the top of your tests. Automatically mocks out the file system
//
// import { loadComponentFixture } from 'src/lib/test'
//
// test('true is true', () => {
//   expect('some output').toEqual(loadComponentFixture('component', 'filename.js'))
// })
jest.mock('@redwoodjs/internal/dist/generate/generate', () => {
  return {
    generate: () => {}
  };
});
jest.mock('@redwoodjs/internal/dist/paths', () => {
  const path = require('path');

  return { ...jest.requireActual('@redwoodjs/internal/dist/paths'),
    getPaths: () => {
      const BASE_PATH = '/path/to/project';
      return {
        base: BASE_PATH,
        api: {
          dataMigrations: path.join(BASE_PATH, './api/prisma/dataMigrations'),
          db: path.join(global.__dirname, 'fixtures'),
          // this folder
          dbSchema: path.join(global.__dirname, 'fixtures', 'schema.prisma'),
          // this folder
          generators: path.join(BASE_PATH, './api/generators'),
          src: path.join(BASE_PATH, './api/src'),
          services: path.join(BASE_PATH, './api/src/services'),
          directives: path.join(BASE_PATH, './api/src/directives'),
          graphql: path.join(BASE_PATH, './api/src/graphql'),
          functions: path.join(BASE_PATH, './api/src/functions')
        },
        web: {
          config: path.join(BASE_PATH, './web/config'),
          src: path.join(BASE_PATH, './web/src'),
          generators: path.join(BASE_PATH, './web/generators'),
          routes: path.join(BASE_PATH, 'web/src/Routes.js'),
          components: path.join(BASE_PATH, '/web/src/components'),
          layouts: path.join(BASE_PATH, '/web/src/layouts'),
          pages: path.join(BASE_PATH, '/web/src/pages')
        },
        scripts: path.join(BASE_PATH, 'scripts'),
        generated: {
          base: path.join(BASE_PATH, '.redwood'),
          schema: path.join(BASE_PATH, '.redwood/schema.graphql'),
          types: {
            includes: path.join(BASE_PATH, '.redwood/types/includes'),
            mirror: path.join(BASE_PATH, '.redwood/types/mirror')
          }
        }
      };
    }
  };
});
jest.mock('./project', () => ({
  isTypeScriptProject: () => false,
  sides: () => ['web', 'api']
}));
global.__prettierPath = _path.default.resolve(__dirname, './__tests__/fixtures/prettier.config.js');
jest.mock('path', () => {
  const path = jest.requireActual('path');
  return { ...path,
    join: (...paths) => {
      if (paths && paths[0] === '/path/to/project' && paths[1] === 'prettier.config.js') {
        return global.__prettierPath;
      }

      return path.join(...paths);
    }
  };
});
jest.spyOn(Math, 'random').mockReturnValue(0.123456789);

const generatorsRootPath = _path.default.join(__dirname, '..', 'commands', 'generate');
/**
 * Loads the fixture for a generator by assuming a lot of the path structure
 * automatically:
 *
 *   `loadGeneratorFixture('scaffold', 'NamePage.js')`
 *
 * will return the contents of:
 *
 *   `cli/src/commands/generate/scaffold/__tests__/fixtures/NamePage.js`
 */


exports.generatorsRootPath = generatorsRootPath;

const loadGeneratorFixture = (generator, name) => {
  return loadFixture(_path.default.join(__dirname, '..', 'commands', 'generate', generator, '__tests__', 'fixtures', name));
};
/**
 * Returns the contents of a text file in a `fixtures` directory
 */


exports.loadGeneratorFixture = loadGeneratorFixture;

const loadFixture = filepath => {
  return _fs.default.readFileSync(filepath).toString();
};

exports.loadFixture = loadFixture;