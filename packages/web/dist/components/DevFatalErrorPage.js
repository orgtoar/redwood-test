"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DevFatalErrorPage = void 0;

var _react = _interopRequireWildcard(require("react"));

var _stacktracey = _interopRequireDefault(require("stacktracey"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// This file is a hard fork of panic-overlay for RedwoodJS. The original code
// is licensed under The Unlicense - https://github.com/xpl/panic-overlay/blob/master/LICENSE
// making it fine for embedding inside this project.
// RWJS_SRC_ROOT is defined and defaulted in webpack to the base path
const srcRoot = process.env.RWJS_SRC_ROOT || '';
let appRoot;

if (/^[A-Z]:\\/.test(srcRoot)) {
  // On Windows srcRoot will be something like C:\Users\bob\dev\rwApp
  appRoot = srcRoot.substring(3).replace(/\\/g, '/');
} else {
  // On Linux/MacOS srcRoot will be something like /Users/bob/dev/rwApp
  appRoot = srcRoot.substring(1);
} // Allow APIs client to attach response/request


const DevFatalErrorPage = props => {
  // Safety fallback
  if (!props.error) {
    return /*#__PURE__*/_react.default.createElement("h3", null, "Could not render the error page due to a missing error, please see the console for more details.");
  }

  const err = props.error;
  const stack = new _stacktracey.default(err).withSources();
  const typeName = String(err['type'] || err.constructor && err.constructor.name || typeof err);
  const msg = String(err && err.message);
  const FileRef = stack.items[0] ? /*#__PURE__*/_react.default.createElement("a", {
    href: toVSCodeURL(stack.items[0])
  }, stack.items[0].fileName) : null;
  return /*#__PURE__*/_react.default.createElement("main", {
    className: "error-page"
  }, /*#__PURE__*/_react.default.createElement("style", {
    dangerouslySetInnerHTML: {
      __html: css
    }
  }), /*#__PURE__*/_react.default.createElement("nav", null, /*#__PURE__*/_react.default.createElement("h1", null, "A fatal runtime error occurred when rendering ", FileRef), /*#__PURE__*/_react.default.createElement("div", null, "Get help via ", /*#__PURE__*/_react.default.createElement(Discord, null), " or ", /*#__PURE__*/_react.default.createElement(Discourse, null))), /*#__PURE__*/_react.default.createElement("section", {
    className: "panic-overlay"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "error"
  }, /*#__PURE__*/_react.default.createElement("h3", {
    className: "error-title"
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: "error-type"
  }, typeName), /*#__PURE__*/_react.default.createElement("span", {
    className: "error-message"
  }, prettyMessage(msg))), /*#__PURE__*/_react.default.createElement("div", {
    className: "error-stack"
  }, stack.items.map((entry, i) => /*#__PURE__*/_react.default.createElement(StackEntry, {
    key: i,
    entry: entry,
    i: i,
    message: msg
  })))), props.error.mostRecentRequest ? /*#__PURE__*/_react.default.createElement(ResponseRequest, {
    error: props.error
  }) : null));
};

exports.DevFatalErrorPage = DevFatalErrorPage;

function hideStackLine(fileReference) {
  return fileReference.length === 1 || fileReference.includes('node_modules/react-dom');
}

function StackEntry(_ref) {
  let {
    entry,
    i
  } = _ref;
  const {
    sourceFile = {
      lines: []
    },
    line,
    column,
    fileShort
  } = entry;
  const lineIndex = (line || 0) - 1;
  const maxLines = sourceFile.lines.length;
  const window = 4;
  let start = lineIndex - window,
      end = lineIndex + window + 2;

  if (start < 0) {
    end = Math.min(end - start, maxLines);
    start = 0;
  }

  if (end > maxLines) {
    start = Math.max(0, start - (end - maxLines));
    end = maxLines;
  }

  const lines = sourceFile.lines.slice(start, end);
  const lineNumberWidth = String(start + lines.length).length;
  const highlightIndex = (line || 0) - start - 1;
  const onLastLine = highlightIndex === lines.length - 1;

  const shortestPath = path => path.replace(appRoot || '', '');

  const expanded = !shouldHideEntry(entry, i);
  const clickable = lines.length;

  const LinkToVSCode = props => clickable ? /*#__PURE__*/_react.default.createElement("a", {
    href: toVSCodeURL(entry)
  }, props.children) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, props.children);

  const fileReference = !lines.length ? '[System]' : shortestPath(fileShort);
  const rootClasses = ['stack-entry', !fileReference.includes('node_modules') && 'rwfw', i === 0 && ' first', lines.length && 'clickable'].filter(Boolean);
  return hideStackLine(fileReference) ? /*#__PURE__*/_react.default.createElement("div", null) : /*#__PURE__*/_react.default.createElement(LinkToVSCode, null, /*#__PURE__*/_react.default.createElement("div", {
    className: rootClasses.join(' ')
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "file"
  }, fileReference + ' in ' + entry.callee), expanded && !!lines.length && /*#__PURE__*/_react.default.createElement("div", {
    className: 'lines' + (onLastLine ? '.no-fade' : '')
  }, lines.map((text, i) => {
    return /*#__PURE__*/_react.default.createElement("div", {
      key: i,
      className: 'line' + (i === highlightIndex ? ' line-hili' : '')
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "line-number"
    }, String(start + i + 1).padStart(lineNumberWidth, ' ')), /*#__PURE__*/_react.default.createElement("span", {
      className: "line-text"
    }, i === highlightIndex ? renderHighlightedLine(text, column || 0) : text));
  }))));

  function renderHighlightedLine(text, column) {
    const [before, after] = [text.slice(0, column - 1), text.slice(column - 1)];
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, before, /*#__PURE__*/_react.default.createElement("strong", null, after));
  }

  function shouldHideEntry(entry, i) {
    return (entry.thirdParty || entry['native'] || entry.hide || entry.fileShort.includes('node_modules')) && i !== 0;
  }
}

function toVSCodeURL(entry) {
  // To account for folks using vscode-insiders etc
  const scheme = process.env.REDWOOD_ENV_EDITOR || 'vscode';
  return "".concat(scheme, "://file/").concat(entry.fileShort, ":").concat(entry.line, ":").concat(entry.column);
}

function prettyMessage(msg) {
  // This could slowly get build out with more cases for improving whitespace/readability
  // over time. There's probably a function like this in react-error-overlay
  return msg.replace('is not a function.', 'is not a function.\n\n');
}

function ResponseRequest(props) {
  const [openQuery, setOpenQuery] = (0, _react.useState)(false);
  const [openResponse, setOpenResponse] = (0, _react.useState)(false);
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "request-response"
  }, props.error.mostRecentRequest ? /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h4", null, "Request: ", props.error.mostRecentRequest.operationName), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h5", null, "Variables:"), /*#__PURE__*/_react.default.createElement("code", null, /*#__PURE__*/_react.default.createElement("pre", null, JSON.stringify(props.error.mostRecentRequest.variables, null, '  ')))), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h5", null, "Query:"), /*#__PURE__*/_react.default.createElement("code", null, /*#__PURE__*/_react.default.createElement("pre", {
    onClick: () => setOpenQuery(!openQuery),
    className: openQuery ? 'open' : 'preview'
  }, props.error.mostRecentRequest.query)))) : null, props.error.mostRecentRequest ? /*#__PURE__*/_react.default.createElement("div", {
    className: "response"
  }, /*#__PURE__*/_react.default.createElement("h4", null, "Response"), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h5", null, "JSON:"), /*#__PURE__*/_react.default.createElement("code", null, /*#__PURE__*/_react.default.createElement("pre", {
    onClick: () => setOpenResponse(!openResponse),
    className: openResponse ? 'open' : 'preview'
  }, JSON.stringify(props.error.mostRecentResponse, null, '  '))))) : null);
}

const css = "\nbody {\n  background-color: rgb(253, 248, 246) !important;\n  font-family: \"Open Sans\", system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif  !important;\n}\n\n.panic-overlay {\n  background-color: white;\n  padding: 0 2.5em;\n}\n\n.panic-overlay strong {\n  font-weight: bold;\n}\n\nmain.error-page nav {\n  display: flex;\n  flex-direction: row;\n  align: center;\n  justify-content: space-between;\n  padding: 1em 2.5em;\n}\n\nmain.error-page  nav h1 {\n  color: black;\n  margin: 0;\n  padding: 0;\n  font-size: 1.2em;\n  font-weight: 400;\n  opacity: 1;\n  color: rgb(191, 71, 34);\n}\n\nmain.error-page nav h1 a {\n  color: black;\n  text-decoration: underline;\n}\n\nmain.error-page nav div {\n  display: flex;\n  align-items: center;\n  line-height: 2em;\n}\n\nmain.error-page nav div a {\n  display: flex;\n  margin: 0 0.3em;\n}\n\nmain.error-page nav svg {\n  width: 24px;\n  height: 24px;\n  fill: rgb(191, 71, 34);\n}\n\nmain.error-page nav svg.discourse {\n  height: 20px;\n  width: 20px;\n}\n\nmain.error-page nav svg:hover {\n  fill: rgb(200, 32, 32);\n}\n\n.request-response div div code,\n.request-response div div pre {\n  background-color: transparent !important;\n}\n\n.panic-overlay a {\n  text-decoration: none;\n}\n\n.panic-overlay .error {\n  padding: 3em 0;\n}\n\n.panic-overlay .error-title {\n  display: flex;\n  align-items: stretch;\n}\n\n.panic-overlay .error-type {\n  min-height: 2.8em;\n  display: flex !important;\n  align-items: center;\n  padding: 0 1em;\n  background: rgb(195, 74, 37);\n  color: white;\n  margin-right: 2em;\n  white-space: nowrap;\n  text-align: center;\n}\n.panic-overlay .error-counter {\n  color: white;\n  opacity: 0.3;\n  position: absolute;\n  left: 0.8em;\n}\n.panic-overlay .error-message {\n  display: flex !important;\n  align-items: center;\n  font-weight: 300;\n  line-height: 1.1em;\n  font-size: 2.8em;\n  word-break: break-all;\n  white-space: pre-wrap;\n}\n.panic-overlay .error-stack {\n  margin-top: 2em;\n  white-space: pre;\n  padding-left: var(--left-pad);\n}\n\n.panic-overlay .stack-entry.clickable {\n  cursor: pointer;\n}\n\n.panic-overlay .stack-entry {\n  margin-left: 2.5em;\n}\n\n.panic-overlay .stack-entry.rwfw {\n  font-weight: bold;\n}\n\n.panic-overlay .stack-entry .file {\n  color: rgb(195, 74, 37, 0.8);\n}\n\n.panic-overlay .stack-entry.first .file {\n  font-weight: bold;\n  color: rgb(200, 47, 47);\n}\n\n.panic-overlay .file strong {\n  font-weight: normal;\n}\n.panic-overlay .file:before,\n.panic-overlay .more:before {\n  content: \"@ \";\n  opacity: 0.5;\n  margin-left: -1.25em;\n}\n.panic-overlay .more:before {\n  content: \"\u25B7 \";\n  opacity: 0.5;\n}\n.panic-overlay .more {\n  opacity: 0.25;\n  color: black;\n  font-size: 0.835em;\n  cursor: pointer;\n  text-align: center;\n  display: none;\n}\n.panic-overlay .more em {\n  font-style: normal;\n  font-weight: normal;\n  border-bottom: 1px dashed black;\n}\n.panic-overlay .collapsed .panic-overlay .more {\n  display: block;\n}\n.panic-overlay .lines, .request-response code {\n  color: rgb(187, 165, 165);\n  font-size: 0.835em;\n  margin-bottom: 2.5em;\n  padding: 2rem;\n  font-family: Menlo, Monaco, \"Courier New\", Courier, monospace;\n}\n.panic-overlay .lines:not(.panic-overlay .no-fade) {\n  -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 75%, rgba(0, 0, 0, 0));\n  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 75%, rgba(0, 0, 0, 0));\n}\n.panic-overlay .line-number {\n  padding-right: 1.5em;\n  opacity: 0.5;\n}\n.panic-overlay .line-hili {\n  background: rgb(253, 248, 246);\n  color: #5f4545;\n}\n.panic-overlay .stack-entry:first-child .panic-overlay .line-hili strong {\n  text-decoration: underline wavy #ff0040;\n}\n.panic-overlay .line-hili em {\n  font-style: italic;\n  color: rgb(195, 74, 37);\n  font-size: 0.75em;\n  margin-left: 2em;\n  opacity: 0.25;\n  position: relative;\n  top: -0.115em;\n  white-space: nowrap;\n}\n.panic-overlay .line-hili em:before {\n  content: \"\u2190 \";\n}\n.panic-overlay .no-source {\n  font-style: italic;\n}\n\n.panic-overlay .request-response {\n  margin-top: 2rem;\n  display: flex;\n  flex-direction: row;\n}\n\n.panic-overlay .request-response > div {\n  flex: 1;\n}\n\n.panic-overlay .request-response .response {\n  margin-left: 2rem;\n}\n\n.panic-overlay .request-response h4 {\n  background-color: rgb(195, 74, 37);\n  color: white;\n  font-size: 1.5rem;\n  padding: 0.2rem 1rem;\n}\n\n.panic-overlay .request-response > div > div {\n  margin: 1rem 1rem;\n}\n\n.panic-overlay .request-response pre {\n  background-color: rgb(253, 248, 246);\n  padding: 1rem 1rem;\n  color: black;\n}\n\n.panic-overlay .request-response pre.open {\n  max-height: auto;\n}\n\n.panic-overlay .request-response pre.preview {\n  max-height: 13.5rem;\n  overflow-y: auto;\n\n  -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 75%, rgba(0, 0, 0, 0));\n  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 75%, rgba(0, 0, 0, 0));\n}\n\n@media only screen and (max-width: 640px) {\n  .panic-overlay {\n    font-size: 15px;\n  }\n\n  .panic-overlay h1 {\n    margin: 40px 0;\n  }\n}\n@media only screen and (max-width: 500px) {\n  .panic-overlay {\n    font-size: 14px;\n  }\n\n  .panic-overlay h1 {\n    margin: 30px 0;\n  }\n}\n";

const Discourse = () => /*#__PURE__*/_react.default.createElement("a", {
  href: "https://community.redwoodjs.com",
  title: "Go to Redwood's Discourse server"
}, /*#__PURE__*/_react.default.createElement("svg", {
  className: "discourse",
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 32 32"
}, /*#__PURE__*/_react.default.createElement("path", {
  d: "M16.1357143,0 C7.37857143,0 0,7.03571429 0,15.7214286 C0,16 0.00714285714,32 0.00714285714,32 L16.1357143,31.9857143 C24.9,31.9857143 32,24.6785714 32,15.9928571 C32,7.30714286 24.9,0 16.1357143,0 Z M16,25.1428571 C14.6142857,25.1428571 13.2928571,24.8357143 12.1142857,24.2785714 L6.32142857,25.7142857 L7.95714286,20.3571429 C7.25714286,19.0642857 6.85714286,17.5785714 6.85714286,16 C6.85714286,10.95 10.95,6.85714286 16,6.85714286 C21.05,6.85714286 25.1428571,10.95 25.1428571,16 C25.1428571,21.05 21.05,25.1428571 16,25.1428571 Z"
})));

const Discord = () => /*#__PURE__*/_react.default.createElement("a", {
  href: "https://discord.gg/redwoodjs",
  title: "Go to Redwood's Discord server"
}, /*#__PURE__*/_react.default.createElement("svg", {
  viewBox: "0 0 36 36",
  xmlns: "http://www.w3.org/2000/svg"
}, /*#__PURE__*/_react.default.createElement("path", {
  d: "M29.9699 7.7544C27.1043 5.44752 22.5705 5.05656 22.3761 5.04288C22.2284 5.03072 22.0806 5.0648 21.9531 5.1404C21.8257 5.216 21.7249 5.32937 21.6647 5.4648C21.5783 5.65936 21.5049 5.85949 21.4451 6.06384C23.3409 6.38424 25.6694 7.02864 27.7761 8.33616C27.8565 8.38604 27.9262 8.45126 27.9814 8.52809C28.0366 8.60493 28.0761 8.69187 28.0976 8.78397C28.1192 8.87607 28.1224 8.97151 28.1071 9.06485C28.0917 9.15819 28.0582 9.24759 28.0083 9.32796C27.9584 9.40833 27.8932 9.47809 27.8164 9.53325C27.7395 9.58842 27.6526 9.62791 27.5605 9.64947C27.4684 9.67103 27.373 9.67424 27.2796 9.65892C27.1863 9.6436 27.0969 9.61004 27.0165 9.56016C23.3949 7.3116 18.8719 7.2 17.9999 7.2C17.1287 7.2 12.6028 7.31232 8.98338 9.55944C8.90301 9.60932 8.81361 9.64288 8.72027 9.6582C8.62693 9.67352 8.53149 9.67031 8.43939 9.64875C8.25339 9.6052 8.09231 9.48955 7.99158 9.32724C7.89085 9.16493 7.85873 8.96925 7.90227 8.78325C7.94582 8.59725 8.06147 8.43617 8.22378 8.33544C10.3305 7.03152 12.659 6.38424 14.5547 6.06672C14.4453 5.7096 14.3459 5.48424 14.3387 5.4648C14.2788 5.32841 14.1776 5.2143 14.0493 5.13859C13.921 5.06288 13.7721 5.0294 13.6238 5.04288C13.4294 5.05728 8.89554 5.44752 5.99034 7.78536C4.47474 9.18792 1.43994 17.3894 1.43994 24.48C1.43994 24.6067 1.47378 24.7277 1.5357 24.8371C3.62802 28.5163 9.3405 29.4775 10.6423 29.52H10.6646C10.7782 29.5203 10.8903 29.4937 10.9916 29.4424C11.093 29.3911 11.1808 29.3165 11.2478 29.2248L12.5632 27.4133C9.01146 26.4967 7.19706 24.9386 7.09338 24.8458C6.95017 24.7194 6.86303 24.5412 6.85115 24.3506C6.83927 24.1599 6.90361 23.9723 7.03002 23.8291C7.15643 23.6859 7.33456 23.5988 7.52522 23.5869C7.71588 23.575 7.90345 23.6394 8.04666 23.7658C8.08842 23.8054 11.4299 26.64 17.9999 26.64C24.5807 26.64 27.9223 23.7938 27.9561 23.7658C28.0998 23.6403 28.2874 23.5769 28.4777 23.5896C28.668 23.6023 28.8456 23.69 28.9713 23.8334C29.0335 23.9042 29.0812 23.9864 29.1117 24.0756C29.1421 24.1647 29.1546 24.259 29.1486 24.353C29.1426 24.447 29.1181 24.5389 29.0766 24.6235C29.035 24.708 28.9772 24.7836 28.9065 24.8458C28.8028 24.9386 26.9884 26.4967 23.4367 27.4133L24.7528 29.2248C24.8198 29.3164 24.9074 29.3909 25.0087 29.4422C25.1099 29.4935 25.2218 29.5202 25.3353 29.52H25.3569C26.6601 29.4775 32.3719 28.5156 34.4649 24.8371C34.5261 24.7277 34.5599 24.6067 34.5599 24.48C34.5599 17.3894 31.5251 9.18864 29.9699 7.7544V7.7544ZM13.3199 21.6C11.9275 21.6 10.7999 20.3112 10.7999 18.72C10.7999 17.1288 11.9275 15.84 13.3199 15.84C14.7124 15.84 15.8399 17.1288 15.8399 18.72C15.8399 20.3112 14.7124 21.6 13.3199 21.6ZM22.6799 21.6C21.2875 21.6 20.1599 20.3112 20.1599 18.72C20.1599 17.1288 21.2875 15.84 22.6799 15.84C24.0724 15.84 25.1999 17.1288 25.1999 18.72C25.1999 20.3112 24.0724 21.6 22.6799 21.6Z"
})));