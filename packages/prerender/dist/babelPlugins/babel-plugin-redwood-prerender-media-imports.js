"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _path = require("path");

var _paths = require("@redwoodjs/internal/dist/paths");

var _utils = require("./utils");

const defaultOptions = {
  // This list of extensions matches config for file-loader in
  // packages/core/config/webpack.common.js
  extensions: ['.ico', '.jpg', '.jpeg', '.png', '.gif', '.eot', '.otf', '.webp', '.ttf', '.woff', '.woff2', '.cur', '.ani', '.pdf', '.bmp']
};

function getVariableName(p) {
  var _p$node$specifiers;

  if ((_p$node$specifiers = p.node.specifiers) !== null && _p$node$specifiers !== void 0 && _p$node$specifiers[0] && p.node.specifiers[0].local) {
    return p.node.specifiers[0].local.name;
  }

  return null;
}

function _default({
  types: t
}) {
  const manifestPath = (0, _path.join)((0, _paths.getPaths)().web.dist, 'build-manifest.json');

  const webpackManifest = require(manifestPath);

  return {
    name: 'babel-plugin-redwood-prerender-media-imports',
    visitor: {
      ImportDeclaration(p, state) {
        const importPath = p.node.source.value;
        const ext = (0, _path.extname)(importPath);
        const options = { ...defaultOptions,
          ...state.opts
        };

        if (ext && options.extensions.includes(ext)) {
          const importConstName = getVariableName(p);
          const webpackManifestKey = `static/media/${(0, _path.basename)(p.node.source.value)}`;
          const copiedAssetPath = webpackManifest[webpackManifestKey]; // If webpack has copied it over, use the path from the asset manifest
          // Otherwise convert it to a base64 encoded data uri

          const assetSrc = copiedAssetPath !== null && copiedAssetPath !== void 0 ? copiedAssetPath : (0, _utils.convertToDataUrl)((0, _path.join)(state.file.opts.sourceRoot || './', importPath));

          if (importConstName) {
            p.replaceWith(t.variableDeclaration('const', [t.variableDeclarator(t.identifier(importConstName), t.stringLiteral(assetSrc))]));
          }
        }
      }

    }
  };
}