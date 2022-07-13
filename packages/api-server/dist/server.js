"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.startServer = void 0;

const startServer = ({
  port = 8911,
  socket,
  app
}) => {
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '::';
  app.listen(socket || port, host);
  return app;
};

exports.startServer = startServer;