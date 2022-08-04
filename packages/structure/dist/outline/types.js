"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.Icon = void 0;
exports.outlineToJSON = outlineToJSON;

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

let Icon;
exports.Icon = Icon;

(function (Icon) {
  Icon["redwood"] = "redwood";
  Icon["page"] = "page";
  Icon["page_private"] = "page_private";
  Icon["pages"] = "pages";
  Icon["layouts"] = "layouts";
  Icon["netlify"] = "netlify";
  Icon["prisma"] = "prisma";
  Icon["storybook"] = "storybook";
  Icon["services"] = "services";
  Icon["graphql"] = "graphql";
  Icon["play"] = "play";
  Icon["components"] = "components";
  Icon["rw_cli"] = "rw_cli";
  Icon["functions"] = "functions";
  Icon["cells"] = "cells";
  Icon["model"] = "model";
})(Icon || (exports.Icon = Icon = {}));

/**
 * this will recursively await all children and return a serializable representation
 * of the complete outline
 * @param item
 */
async function outlineToJSON(item) {
  if (!item.children) {
    return { ...item,
      children: undefined
    };
  }

  const cs = item.children ? await item.children() : [];
  const css = await _promise.default.all((0, _map.default)(cs).call(cs, outlineToJSON));
  return { ...item,
    children: css
  };
}