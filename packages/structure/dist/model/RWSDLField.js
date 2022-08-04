"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.RWSDLField = void 0;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/get-own-property-descriptor"));

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/applyDecoratedDescriptor"));

var _vscodeLanguageserverTypes = require("vscode-languageserver-types");

var _errors = require("../errors");

var _ide = require("../ide");

var _decorators = require("../x/decorators");

var _URL = require("../x/URL");

var _vscodeLanguageserverTypes2 = require("../x/vscode-languageserver-types");

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class;

let RWSDLField = (_dec = (0, _decorators.lazy)(), _dec2 = (0, _decorators.lazy)(), _dec3 = (0, _decorators.lazy)(), _dec4 = (0, _decorators.lazy)(), _dec5 = (0, _decorators.lazy)(), _dec6 = (0, _decorators.lazy)(), _dec7 = (0, _decorators.lazy)(), (_class = class RWSDLField extends _ide.BaseNode {
  constructor(objectTypeDef, field, parent) {
    super();
    this.objectTypeDef = objectTypeDef;
    this.field = field;
    this.parent = parent;
  }

  get id() {
    return this.parent.id + ' ' + this.objectTypeDef.name.value + '.' + this.name;
  }
  /**
   * The location of this field.
   * Calculating this is slightly complicated since it is embedded within a TaggedTemplateLiteral
   */


  get location() {
    let {
      start,
      end
    } = this.field.loc;
    const node = this.parent.schemaStringNode;
    start += node.getPos() + 1; // we add one to account for the quote (`)

    end += node.getPos() + 1;
    const startPos = (0, _vscodeLanguageserverTypes2.Position_fromTSMorphOffset)(start, node.getSourceFile());
    const endPos = (0, _vscodeLanguageserverTypes2.Position_fromTSMorphOffset)(end, node.getSourceFile());
    return {
      uri: this.parent.uri,
      range: {
        start: startPos,
        end: endPos
      }
    };
  }

  get name() {
    return this.field.name.value;
  }

  get argumentNames() {
    var _context, _this$field$arguments;

    return (0, _map.default)(_context = (_this$field$arguments = this.field.arguments) !== null && _this$field$arguments !== void 0 ? _this$field$arguments : []).call(_context, a => a.name.value);
  }

  *ideInfo() {
    if (this.impl) {
      yield {
        kind: 'Implementation',
        location: this.location,
        target: (0, _vscodeLanguageserverTypes2.Location_fromNode)(this.impl.node)
      };
    }
  }
  /**
   * TODO: describe in prose what is going on here.
   * this is an important rule
   */


  get impl() {
    var _context2, _this$parent$service$, _this$parent$service;

    return (0, _find.default)(_context2 = (_this$parent$service$ = (_this$parent$service = this.parent.service) === null || _this$parent$service === void 0 ? void 0 : _this$parent$service.funcs) !== null && _this$parent$service$ !== void 0 ? _this$parent$service$ : []).call(_context2, f => f.name === this.name);
  } // TODO: improve snippet


  get defaultImplSnippet() {
    var _this$field$arguments2;

    const args = (_this$field$arguments2 = this.field.arguments) !== null && _this$field$arguments2 !== void 0 ? _this$field$arguments2 : [];
    const params = (0, _map.default)(args).call(args, a => a.name.value).join(',');
    return `
export const ${this.field.name.value} = ({${params}}) => {
  // TODO: implement
}`;
  }

  get quickFix_addImplementation() {
    const {
      service
    } = this.parent;
    const change = new _vscodeLanguageserverTypes.WorkspaceChange({
      documentChanges: []
    });

    let insertPosition = _vscodeLanguageserverTypes.Position.create(0, 0);

    let uri = (0, _URL.URL_file)(this.parent.serviceFilePath);

    if (service) {
      // we'll insert into the end of an existing file
      const lastLine = service.sf.getEndLineNumber();
      insertPosition = _vscodeLanguageserverTypes.Position.create(lastLine, 0);
      uri = service.uri;
    } else {
      // file doesn't exist
      // create the service file before inserting
      change.createFile(uri);
    } // insert


    change.getTextEditChange({
      uri,
      version: null
    }).insert(insertPosition, this.defaultImplSnippet);
    return {
      title: 'Add implementation',
      edit: change.edit
    };
  }

  *diagnostics() {
    if (!this.impl) {
      const {
        uri,
        range
      } = this.location;
      yield {
        uri,
        diagnostic: {
          range,
          message: 'Service Not Implemented',
          severity: _vscodeLanguageserverTypes.DiagnosticSeverity.Error,
          code: _errors.RWError.SERVICE_NOT_IMPLEMENTED
        },
        quickFix: async () => this.quickFix_addImplementation
      };
    }
  }

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "id", [_dec], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "id"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "location", [_dec2], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "location"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "name", [_dec3], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "name"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "argumentNames", [_dec4], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "argumentNames"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "impl", [_dec5], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "impl"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "defaultImplSnippet", [_dec6], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "defaultImplSnippet"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "quickFix_addImplementation", [_dec7], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "quickFix_addImplementation"), _class.prototype)), _class));
exports.RWSDLField = RWSDLField;