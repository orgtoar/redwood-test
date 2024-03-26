"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.validatePlural = exports.isWordPluralizable = exports.ensureUniquePlural = void 0;
var _trim = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/trim"));
var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/slice"));
var _prompts = _interopRequireDefault(require("prompts"));
var _rwPluralize = require("./rwPluralize");
const isWordPluralizable = word => {
  return (0, _rwPluralize.isPlural)(word) !== (0, _rwPluralize.isSingular)(word);
};
exports.isWordPluralizable = isWordPluralizable;
const validatePlural = (plural, singular) => {
  const trimmedPlural = (0, _trim.default)(plural).call(plural);
  if (trimmedPlural === singular) {
    return 'Plural can not be same as singular.';
  }
  if (trimmedPlural.match(/[\n\r\s]+/)) {
    return 'Only one word please!';
  }
  // Control Char u0017 is returned if default input is cleared in the prompt
  // using option+backspace
  // eslint-disable-next-line no-control-regex
  if (trimmedPlural.match(/^[\n\r\s\u0017]*$/)) {
    return 'Plural can not be empty.';
  }
  return true;
};

// Ask user for plural version, if singular & plural are same for a word. For
// example: Pokemon
exports.validatePlural = validatePlural;
const ensureUniquePlural = async ({
  model,
  isDestroyer = false,
  forcePrompt = false
}) => {
  if (!forcePrompt && isWordPluralizable(model)) {
    return;
  }
  const generateMessage = `Cannot determine the plural of "${model}". \n` + 'To continue, the generator requires a unique plural form:';
  const destroyMessage = `Cannot determine the plural of "${model}" originally used to generate ` + 'the files. \n' + 'To continue, the destroy command requires the plural form:';
  const promptMessage = isDestroyer ? destroyMessage : generateMessage;

  // News => Newses; Equipment => Equipments
  const initialPlural = (0, _slice.default)(model).call(model, -1) === 's' ? `${model}es` : `${model}s`;
  const promptResult = await (0, _prompts.default)({
    type: 'text',
    name: 'plural',
    message: promptMessage,
    initial: initialPlural,
    validate: pluralInput => validatePlural(pluralInput, model)
  });

  // Quick-fix is to remove that control char u0017, which is prepended if
  // default input is cleared using option+backspace
  // eslint-disable-next-line no-control-regex
  const pluralToUse = promptResult.plural?.trim().replace(/\u0017/g, '');
  if (!pluralToUse) {
    throw Error('Plural name must not be empty');
  }
  (0, _rwPluralize.addSingularPlural)(model, pluralToUse);
};
exports.ensureUniquePlural = ensureUniquePlural;