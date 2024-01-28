"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var utils_exports = {};
__export(utils_exports, {
  mergeMultiValueHeaders: () => mergeMultiValueHeaders,
  parseBody: () => parseBody
});
module.exports = __toCommonJS(utils_exports);
const parseBody = (rawBody) => {
  if (typeof rawBody === "string") {
    return { body: rawBody, isBase64Encoded: false };
  }
  if (rawBody instanceof Buffer) {
    return { body: rawBody.toString("base64"), isBase64Encoded: true };
  }
  return { body: "", isBase64Encoded: false };
};
const mergeMultiValueHeaders = (headers, multiValueHeaders) => {
  const mergedHeaders = Object.entries(
    headers || {}
  ).reduce((acc, [name, value]) => {
    acc[name.toLowerCase()] = [value];
    return acc;
  }, {});
  Object.entries(multiValueHeaders || {}).forEach(([headerName, values]) => {
    const name = headerName.toLowerCase();
    if (name.toLowerCase() === "set-cookie") {
      mergedHeaders["set-cookie"] = values;
    } else {
      mergedHeaders[name] = [values.join("; ")];
    }
  });
  return mergedHeaders;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  mergeMultiValueHeaders,
  parseBody
});
