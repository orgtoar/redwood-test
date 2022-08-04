#!/usr/bin/env node
"use strict";

var _module = require("module");

const requireFromStorybook = (0, _module.createRequire)(require.resolve('@storybook/react/package.json'));
const bins = requireFromStorybook('./package.json')['bin'];
requireFromStorybook(bins['start-storybook']);