"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _child_process = require("child_process");

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _getRWPaths = _interopRequireDefault(require("../../../lib/getRWPaths"));

async function upgradeYarn() {
  const rwPaths = (0, _getRWPaths.default)();
  console.log('Preparing and enabling corepack...');
  const corepackPreparePO = (0, _child_process.spawnSync)('corepack prepare yarn@1.22.17 --activate', {
    shell: true,
    cwd: rwPaths.base
  });

  if (corepackPreparePO.status !== 0) {
    throw new Error(['', 'Failed to prepare yarn@1.22.17 via corepack:', '', `  ${corepackPreparePO.stderr.toString().trim()}`, '', 'Your node version may be less than v14.19', 'Please install corepack globally via ', '', '  npm install -g corepack', '', 'For more information, see:', '- https://yarnpkg.com/getting-started/install', '- https://nodejs.org/dist/latest/docs/api/corepack.html'].join('\n'));
  }

  (0, _child_process.spawnSync)('corepack enable', {
    shell: true,
    cwd: rwPaths.base
  });
  console.log('Setting yarn version to 3...');
  (0, _child_process.spawnSync)('yarn set version stable', {
    shell: true,
    cwd: rwPaths.base
  });
  const {
    stdout
  } = (0, _child_process.spawnSync)('yarn --version', {
    shell: true,
    cwd: rwPaths.base
  });
  const yarnVersion = stdout.toString().trim();
  console.log();
  console.log('Adding .yarnrc.yml and updating .gitignore...');

  _fs.default.writeFileSync(_path.default.join(rwPaths.base, '.yarnrc.yml'), ['compressionLevel: 0', '', 'enableGlobalCache: true', '', 'nmMode: hardlinks-local', '', 'nodeLinker: node-modules', '', `yarnPath: .yarn/releases/yarn-${yarnVersion}.cjs`].join('\n'));

  const gitignorePath = _path.default.join(rwPaths.base, '.gitignore');

  const gitignore = _fs.default.readFileSync(gitignorePath);

  _fs.default.writeFileSync(_path.default.join(gitignorePath), `${gitignore}${['.pnp.*', '.yarn/*', '!.yarn/patches', '!.yarn/plugins', '!.yarn/releases', '!.yarn/sdks', '!.yarn/versions'].join('\n')}`);

  console.log('Installing...');
  (0, _child_process.spawnSync)('yarn install', {
    shell: true,
    cwd: rwPaths.base,
    stdio: 'inherit'
  });
  console.log();
  console.log('Done! Be sure to commit the changes');
}

var _default = upgradeYarn;
exports.default = _default;