"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "debounce", {
  enumerable: true,
  get: function () {
    return _lodashDecorators.Debounce;
  }
});
Object.defineProperty(exports, "lazy", {
  enumerable: true,
  get: function () {
    return _lazyGetDecorator.LazyGetter;
  }
});
Object.defineProperty(exports, "memo", {
  enumerable: true,
  get: function () {
    return _lodashDecorators.Memoize;
  }
});

var _lazyGetDecorator = require("lazy-get-decorator");

var _lodashDecorators = require("lodash-decorators");