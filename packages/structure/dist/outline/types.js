"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Icon = void 0;
exports.outlineToJSON = outlineToJSON;

require("core-js/modules/esnext.async-iterator.map.js");

require("core-js/modules/esnext.iterator.map.js");

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
  const css = await Promise.all(cs.map(outlineToJSON));
  return { ...item,
    children: css
  };
}