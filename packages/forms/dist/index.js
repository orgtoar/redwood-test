"use strict";

var _context2;

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _forEachInstanceProperty2 = require("@babel/runtime-corejs3/core-js/instance/for-each");

var _Object$keys = require("@babel/runtime-corejs3/core-js/object/keys");

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

var _exportNames = {
  CheckboxField: true,
  ButtonField: true,
  ColorField: true,
  DateField: true,
  DatetimeLocalField: true,
  EmailField: true,
  FileField: true,
  HiddenField: true,
  ImageField: true,
  MonthField: true,
  NumberField: true,
  PasswordField: true,
  RadioField: true,
  RangeField: true,
  ResetField: true,
  SearchField: true,
  SubmitField: true,
  TelField: true,
  TextField: true,
  TimeField: true,
  UrlField: true,
  WeekField: true,
  Form: true,
  ServerErrorsContext: true,
  FieldError: true,
  InputField: true,
  Label: true,
  TextAreaField: true,
  SelectField: true,
  Submit: true,
  useErrorStyles: true,
  useRegister: true,
  FormError: true,
  RWGqlError: true
};
exports.Form = exports.FileField = exports.FieldError = exports.EmailField = exports.DatetimeLocalField = exports.DateField = exports.ColorField = exports.CheckboxField = exports.ButtonField = void 0;

_Object$defineProperty(exports, "FormError", {
  enumerable: true,
  get: function () {
    return _FormError.default;
  }
});

exports.PasswordField = exports.NumberField = exports.MonthField = exports.Label = exports.InputField = exports.ImageField = exports.HiddenField = void 0;

_Object$defineProperty(exports, "RWGqlError", {
  enumerable: true,
  get: function () {
    return _FormError.RWGqlError;
  }
});

exports.useRegister = exports.useErrorStyles = exports.WeekField = exports.UrlField = exports.TimeField = exports.TextField = exports.TextAreaField = exports.TelField = exports.SubmitField = exports.Submit = exports.ServerErrorsContext = exports.SelectField = exports.SearchField = exports.ResetField = exports.RangeField = exports.RadioField = void 0;

var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _extends2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/extends"));

var _react = _interopRequireWildcard(require("react"));

var _pascalcase = _interopRequireDefault(require("pascalcase"));

var _reactHookForm = require("react-hook-form");

_forEachInstanceProperty2(_context2 = _Object$keys(_reactHookForm)).call(_context2, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _reactHookForm[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _reactHookForm[key];
    }
  });
});

var _FormError = _interopRequireWildcard(require("./FormError"));

/**
 * @module @redwoodjs/forms
 *
 * Redwood's form library.
 * Mostly simple wrappers around `react-hook-form` that make it even easier to use.
 *
 * @remarks
 *
 * @redwoodjs/forms slightly extends `react-hook-form`'s `valueAs` props because it's important for us to coerce values
 * to the correct type for GraphQL.
 * The properties that are exclusive to Redwood are:
 * - `valueAsBoolean`
 * - `valueAsJSON`
 * - `emptyAs`
 *
 * @see {@link https://react-hook-form.com/}
 *
 * @remarks
 *
 * We make all of `react-hook-form`'s exports available as well.
 *
 * @privateRemarks
 *
 * The two main hooks in this library are:
 * - `useErrorStyles`
 * - `useRegister`
 *
 * `useErrorStyles` implements the error-specific styling via `useEffect`.
 *
 * `useRegister` hooks fields up to `react-hook-form` while providing some sensible defaults
 * based on the field's type.
 *
 * @privateRemarks
 *
 * We use `React.ComponentPropsWithRef` and `React.ComponentPropsWithoutRef` instead of `React.FC`
 * because the community seems to be shifting away from `React.FC`.
 *
 * @see {@link https://fettblog.eu/typescript-react-why-i-dont-use-react-fc/}
 * @see {@link https://github.com/facebook/create-react-app/pull/8177}
 * @see {@link https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/function_components/}
 *
 * @privateRemarks
 *
 * As for interfaces vs types, we're going with TypesScript's recommendation to use interfaces until types are needed.
 *
 * @see {@link https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces}
 */

/**
 * Adds styling to a field when an error is present.
 *
 * @remarks
 *
 * Mostly just a `useEffect` hook.
 *
 * `className` and `style` get swapped with `errorClassName` and `errorStyle` respectively
 * when an error's present (on the server or otherwise).
 */
const useErrorStyles = _ref2 => {
  let {
    name,
    errorClassName,
    errorStyle,
    className,
    style
  } = _ref2;
  const {
    formState: {
      errors
    },
    setError
  } = (0, _reactHookForm.useFormContext)();
  const serverError = (0, _react.useContext)(ServerErrorsContext)[name];

  _react.default.useEffect(() => {
    if (serverError) {
      setError(name, {
        type: 'server',
        message: serverError
      });
    }
  }, [serverError, name, setError]);

  const validationError = name ? (0, _reactHookForm.get)(errors, name) : undefined;

  if (validationError) {
    if (errorClassName) {
      className = errorClassName;
    }

    if (errorStyle) {
      style = errorStyle;
    }
  }

  return {
    className,
    style
  };
}; // Used to determine if a value is empty.


exports.useErrorStyles = useErrorStyles;

const isValueEmpty = val => val === '';
/**
 * EmptyAsValue defines the values that can be used for the field emptyAs prop
 * It sets the value to be returned from the field if the field is empty.
 * If the valueOf prop is truly undefined (not 'undefined'), it will return
 * a default value corresponding to the type of field. (See
 * the comments above the setCoercion function for more details)
 */


/*
 * One of the functions in the SET_VALUE_AS_FUNCTIONS object is
 * passed to the react-hook-forms setValueAs prop by the getSetValueAsFn
 * function which is used by the setCoercion function
 * There may be an alternate solution using closures that is less explicit, but
 * would likely be more troublesome to debug.
 */
const SET_VALUE_AS_FUNCTIONS = {
  // valueAsBoolean is commented out as r-h-f does not currently support
  // setValueAs functionality for checkboxes.  May investigate future
  // integration

  /*  valueAsBoolean: {
    // r-h-f returns a boolean if a checkBox type, but also handle string case in case valueAsBoolean is used
    base: (val: boolean | string): boolean => !!val,
    emptyAsNull: (val: boolean | string): boolean | null => (val ? true : null),
    emptyAsUndefined: (val: boolean | string): boolean | undefined =>
      val ? true : undefined,
  },*/
  valueAsDate: {
    emptyAsNull: val => isValueEmpty(val) ? null : new Date(val),
    emptyAsUndefined: val => isValueEmpty(val) ? undefined : new Date(val),
    emptyAsString: val => isValueEmpty(val) ? '' : new Date(val),
    emptyAsZero: val => isValueEmpty(val) ? 0 : new Date(val)
  },
  valueAsJSON: {
    emptyAsNull: val => {
      if (isValueEmpty(val)) {
        return null;
      }

      try {
        return JSON.parse(val);
      } catch (e) {
        return NaN; // represents invalid JSON parse to JSONValidation function
      }
    },
    emptyAsString: val => {
      if (isValueEmpty(val)) {
        return '';
      }

      try {
        return JSON.parse(val);
      } catch (e) {
        return NaN; // represents invalid JSON parse to JSONValidation function
      }
    },
    emptyAsUndefined: val => {
      if (isValueEmpty(val)) {
        return undefined;
      }

      try {
        return JSON.parse(val);
      } catch (e) {
        return NaN; // represents invalid JSON parse to JSONValidation function
      }
    },
    emptyAsZero: val => {
      if (isValueEmpty(val)) {
        return 0;
      }

      try {
        return JSON.parse(val);
      } catch (e) {
        return NaN; // represents invalid JSON parse to JSONValidation function
      }
    }
  },
  valueAsNumber: {
    emptyAsNull: val => isValueEmpty(val) ? null : +val,
    emptyAsUndefined: val => isValueEmpty(val) ? undefined : +val,
    emptyAsNaN: val => isValueEmpty(val) ? NaN : +val,
    emptyAsString: val => isValueEmpty(val) ? '' : +val,
    emptyAsZero: val => isValueEmpty(val) ? 0 : +val
  },
  valueAsString: {
    emptyAsNull: val => isValueEmpty(val) ? null : val,
    emptyAsUndefined: val => isValueEmpty(val) ? undefined : val,
    emptyAsString: val => isValueEmpty(val) ? '' : val,
    emptyAsZero: val => isValueEmpty(val) ? 0 : val
  }
}; // Note that the emptyAs parameter takes precedence over the type, required,
// and isId parameters

const getSetValueAsFn = (type, emptyAs, required, isId) => {
  const typeObj = SET_VALUE_AS_FUNCTIONS[type];

  if (typeObj === undefined) {
    throw Error("Type ".concat(type, " is unsupported."));
  }

  let fn;

  switch (emptyAs) {
    case null:
      fn = typeObj['emptyAsNull'];
      break;

    case 'undefined':
      fn = typeObj['emptyAsUndefined'];
      break;

    case 0:
      fn = typeObj['emptyAsZero'];
      break;

    case '':
      fn = typeObj['emptyAsString'];
      break;

    case undefined:
    default:
      if (required || isId) {
        fn = typeObj.emptyAsNull;
      } else {
        // set the default SetValueAsFn
        switch (type) {
          case 'valueAsNumber':
            fn = typeObj.emptyAsNaN;
            break;

          case 'valueAsDate':
          case 'valueAsJSON':
            fn = typeObj.emptyAsNull;
            break;

          case 'valueAsString':
            fn = typeObj.emptyAsString;
            break;
        }
      }

      break;
  }

  if (fn === undefined) {
    console.error("emptyAs prop of ".concat(emptyAs, " is unsupported for this type."));
  }

  return fn;
}; // This function is passed into r-h-f's validate function if valueAsJSON is set


const JSONValidation = val => typeof val === 'number' ? !isNaN(val) : true;
/**
 * ** setCoercion **
 * Handles the flow of coercion, providing a default if none is specified.
 * Also implements Redwood's extensions to `react-hook-form`'s `valueAs` props.
 *
 * To provide Redwood specific functionality, we need to override part of
 * react-hook-form`'s functionality in some cases. This is accomplished
 * through the use of the setValueAs function supported by r-h-f.
 * If a setValueAs function is provided by the user, it takes precedence over
 * the emptyAs prop.
 *
 * Redwood provides specific logic to address field empty scenarios through
 * the use of the emptyAs prop. The decision chain for behaviour on field empty
 * scenarios is as follows:
 *   1. if setValueAs is specified by the user, that will determine the behavior
 *   2  if emptyAs is specified, then the emptyAs prop will determine the
 *      field value on an empty condition.
 *   3. if { validation.required } is set, an empty field will return null; however,
 *      r-h-f's validation should engage and prevent submission of the form.
 *   4. if the field is an Id field, that is its name ends in "Id", then an empty
 *      field will return null.
 *   5. In the event of none of the above cases, the field value will be set as
 *      follows for empty field scenarios:
 *       DateFields => null
 *       NumberFields => NaN
 *       TextFields with valueAsNumber set => NaN
 *       SelectFields with valueAsNumber set => NaN
 *       SelectFields without valueAsNumber set => '' (empty string)
 *       TextFields with valueAsJSON set => null
 *       TextFields and comparable => '' (empty string)
 */


const setCoercion = (validation, _ref3) => {
  let {
    type,
    name,
    emptyAs
  } = _ref3;

  if (validation.setValueAs) {
    // Note, this case could overide other props
    return;
  }

  let valueAs;

  if (validation.valueAsBoolean || type === 'checkbox') {
    // Note the react-hook-forms setValueAs prop does not work in react-hook-forms
    // for checkboxes and thus Redwood does not provide emptyAs functionality
    // for checkboxes for now.
    return;
  } else if (validation.valueAsJSON) {
    validation.validate = JSONValidation;
    delete validation.valueAsJSON;
    valueAs = 'valueAsJSON';
  } else if (type === 'date' || type === 'datetime-local' || validation.valueAsDate) {
    valueAs = 'valueAsDate';
  } else if (type === 'number' || validation.valueAsNumber) {
    valueAs = 'valueAsNumber';
  } else {
    valueAs = 'valueAsString';
  }

  validation.setValueAs = getSetValueAsFn(valueAs, // type
  emptyAs, // emptyAs
  validation.required !== undefined && validation.required !== false, // required
  /Id$/.test(name || '') // isId
  );
};

/**
 * useRegister
 *
 * Register the field into `react-hook-form` with defaults.
 *
 * @remarks
 *
 * A field's `validation` prop is `react-hook-form`'s `RegisterOptions`
 * (with Redwood's extended `valueAs` props).
 *
 * @see {@link https://react-hook-form.com/api/useform/register}
 */
const useRegister = (props, ref, emptyAs) => {
  const {
    register
  } = (0, _reactHookForm.useFormContext)();
  const validation = props.validation || {
    required: false
  };
  setCoercion(validation, {
    type: props.type,
    name: props.name,
    emptyAs
  });
  const {
    ref: _ref,
    onBlur: handleBlur,
    onChange: handleChange,
    ...rest
  } = register(props.name, validation);

  const onBlur = event => {
    var _props$onBlur;

    handleBlur(event);
    (_props$onBlur = props.onBlur) === null || _props$onBlur === void 0 ? void 0 : _props$onBlur.call(props, event);
  };

  const onChange = event => {
    var _props$onChange;

    handleChange(event);
    (_props$onChange = props.onChange) === null || _props$onChange === void 0 ? void 0 : _props$onChange.call(props, event);
  };

  return { ...rest,
    ref: element => {
      _ref(element);

      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    },
    onBlur,
    onChange
  };
};
/**
 * Context for keeping track of errors from the server.
 */


exports.useRegister = useRegister;

const ServerErrorsContext = /*#__PURE__*/_react.default.createContext({});

exports.ServerErrorsContext = ServerErrorsContext;

/**
 * Renders a `<form>` with the required context.
 */
function FormInner(_ref4, ref) {
  var _errorProps$graphQLEr, _errorProps$graphQLEr2, _errorProps$graphQLEr3;

  let {
    config,
    error: errorProps,
    formMethods: propFormMethods,
    onSubmit,
    children,
    ...rest
  } = _ref4;
  const hookFormMethods = (0, _reactHookForm.useForm)(config);
  const formMethods = propFormMethods || hookFormMethods;
  return /*#__PURE__*/_react.default.createElement("form", (0, _extends2.default)({
    ref: ref
  }, rest, {
    onSubmit: formMethods.handleSubmit((data, event) => onSubmit === null || onSubmit === void 0 ? void 0 : onSubmit(data, event))
  }), /*#__PURE__*/_react.default.createElement(ServerErrorsContext.Provider, {
    value: (errorProps === null || errorProps === void 0 ? void 0 : (_errorProps$graphQLEr = errorProps.graphQLErrors[0]) === null || _errorProps$graphQLEr === void 0 ? void 0 : (_errorProps$graphQLEr2 = _errorProps$graphQLEr.extensions) === null || _errorProps$graphQLEr2 === void 0 ? void 0 : (_errorProps$graphQLEr3 = _errorProps$graphQLEr2.properties) === null || _errorProps$graphQLEr3 === void 0 ? void 0 : _errorProps$graphQLEr3.messages) || {}
  }, /*#__PURE__*/_react.default.createElement(_reactHookForm.FormProvider, formMethods, children)));
} // Sorry about the `as` type assertion (type cast) here. Normally I'd redeclare
// forwardRef to only return a plain function, allowing us to use TypeScript's
// Higher-order Function Type Inference. But that gives us problems with the
// ForwardRefExoticComponent type we use for our InputComponents. So instead
// of changing that type (because it's correct) I use a type assertion here.
// forwardRef is notoriously difficult to use with UI component libs.
// Chakra-UI also says:
// > To be honest, the forwardRef type is quite complex [...] I'd recommend
// > that you cast the type
// https://github.com/chakra-ui/chakra-ui/issues/4528#issuecomment-902566185


const Form = /*#__PURE__*/(0, _react.forwardRef)(FormInner);
exports.Form = Form;

/**
 * Renders a `<label>` that can be styled differently if errors are present on the related fields.
 */
const Label = _ref5 => {
  let {
    name,
    children,
    // for useErrorStyles
    errorClassName,
    errorStyle,
    className,
    style,
    ...rest
  } = _ref5;
  const styles = useErrorStyles({
    name,
    errorClassName,
    errorStyle,
    className,
    style
  });
  return /*#__PURE__*/_react.default.createElement("label", (0, _extends2.default)({
    htmlFor: name
  }, rest, styles), children || name);
};

exports.Label = Label;
const DEFAULT_MESSAGES = {
  required: 'is required',
  pattern: 'is not formatted correctly',
  minLength: 'is too short',
  maxLength: 'is too long',
  min: 'is too low',
  max: 'is too high',
  validate: 'is not valid'
};
/**
 * Renders a `<span>` with an error message if there's a validation error on the corresponding field.
 * If no error message is provided, a default one is used based on the type of validation that caused the error.
 *
 * @example Displaying a validation error message with `<FieldError>`
 *
 * `<FieldError>` doesn't render (i.e. returns `null`) when there's no error on `<TextField>`.
 *
 * ```jsx
 * <Label name="name" errorClassName="error">
 *   Name
 * </Label>
 * <TextField
 *   name="name"
 *   validation={{ required: true }}
 *   errorClassName="error"
 * />
 * <FieldError name="name" className="error" />
 * ```
 *
 * @see {@link https://redwoodjs.com/docs/tutorial/chapter3/forms#fielderror}
 *
 * @privateRemarks
 *
 * This is basically a helper for a common pattern you see in `react-hook-form`:
 *
 * ```jsx
 * <form onSubmit={handleSubmit(onSubmit)}>
 *   <input {...register("firstName", { required: true })} />
 *   {errors.firstName?.type === 'required' && "First name is required"}
 * ```
 *
 * @see {@link https://react-hook-form.com/get-started#Handleerrors}
 */

const FieldError = _ref6 => {
  var _context;

  let {
    name,
    ...rest
  } = _ref6;
  const {
    formState: {
      errors
    }
  } = (0, _reactHookForm.useFormContext)();
  const validationError = (0, _reactHookForm.get)(errors, name);
  const errorMessage = validationError && (validationError.message || (0, _concat.default)(_context = "".concat(name, " ")).call(_context, DEFAULT_MESSAGES[validationError.type]));
  return validationError ? /*#__PURE__*/_react.default.createElement("span", rest, errorMessage) : null;
};

exports.FieldError = FieldError;

/**
 * Renders a `<textarea>` field.
 */
const TextAreaField = /*#__PURE__*/(0, _react.forwardRef)((_ref7, ref) => {
  let {
    name,
    id,
    emptyAs,
    // for useErrorStyles
    errorClassName,
    errorStyle,
    className,
    style,
    // for useRegister
    validation,
    onBlur,
    onChange,
    ...rest
  } = _ref7;
  const styles = useErrorStyles({
    name,
    errorClassName,
    errorStyle,
    className,
    style
  });
  const useRegisterReturn = useRegister({
    name,
    validation,
    onBlur,
    onChange
  }, ref, emptyAs);
  return /*#__PURE__*/_react.default.createElement("textarea", (0, _extends2.default)({
    id: id || name
  }, rest, styles, useRegisterReturn));
});
exports.TextAreaField = TextAreaField;

/**
 * Renders a `<select>` field.
 */
const SelectField = /*#__PURE__*/(0, _react.forwardRef)((_ref8, ref) => {
  let {
    name,
    id,
    emptyAs,
    // for useErrorStyles
    errorClassName,
    errorStyle,
    className,
    style,
    // for useRegister
    validation,
    onBlur,
    onChange,
    ...rest
  } = _ref8;
  const styles = useErrorStyles({
    name,
    errorClassName,
    errorStyle,
    className,
    style
  });
  const useRegisterReturn = useRegister({
    name,
    validation,
    onBlur,
    onChange
  }, ref, emptyAs);
  return /*#__PURE__*/_react.default.createElement("select", (0, _extends2.default)({
    id: id || name
  }, rest, styles, useRegisterReturn));
});
exports.SelectField = SelectField;

/**
 * Renders an `<input type="checkbox">` field.
 */
const CheckboxField = /*#__PURE__*/(0, _react.forwardRef)((_ref9, ref) => {
  let {
    name,
    id,
    // for useErrorStyles
    errorClassName,
    errorStyle,
    className,
    style,
    // for useRegister
    validation,
    onBlur,
    onChange,
    ...rest
  } = _ref9;
  const styles = useErrorStyles({
    name,
    errorClassName,
    errorStyle,
    className,
    style
  });
  const type = 'checkbox';
  const useRegisterReturn = useRegister({
    name,
    validation,
    onBlur,
    onChange,
    type
  }, ref);
  return /*#__PURE__*/_react.default.createElement("input", (0, _extends2.default)({
    id: id || name
  }, rest, {
    /** This order ensures type="checkbox" */
    type: type
  }, styles, useRegisterReturn));
});
/**
 * Renders a `<button type="submit">` field.
 *
 * @example
 * ```jsx{3}
 * <Form onSubmit={onSubmit}>
 *   // ...
 *   <Submit>Save</Submit>
 * </Form>
 * ```
 */

exports.CheckboxField = CheckboxField;
const Submit = /*#__PURE__*/(0, _react.forwardRef)((props, ref) => /*#__PURE__*/_react.default.createElement("button", (0, _extends2.default)({
  ref: ref,
  type: "submit"
}, props)));
/**
 * All the types we'll be generating named `<InputFields>` for (which is basically all of them).
 * Note that `'checkbox'` isn't here because we handle it separately above.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#input_types}
 */

exports.Submit = Submit;
const INPUT_TYPES = ['button', 'color', 'date', 'datetime-local', 'email', 'file', 'hidden', 'image', 'month', 'number', 'password', 'radio', 'range', 'reset', 'search', 'submit', 'tel', 'text', 'time', 'url', 'week'];

/**
 * Renders an `<input>` field.
 *
 * @see {@link https://redwoodjs.com/docs/form#inputfields}
 */
const InputField = /*#__PURE__*/(0, _react.forwardRef)((_ref10, ref) => {
  let {
    name,
    id,
    emptyAs,
    // for useErrorStyles
    errorClassName,
    errorStyle,
    className,
    style,
    // for useRegister
    validation,
    onBlur,
    onChange,
    type,
    ...rest
  } = _ref10;
  const styles = useErrorStyles({
    name,
    errorClassName,
    errorStyle,
    className,
    style
  });
  const useRegisterReturn = useRegister({
    name,
    validation,
    onBlur,
    onChange,
    type
  }, ref, emptyAs);
  return /*#__PURE__*/_react.default.createElement("input", (0, _extends2.default)({
    id: id || name
  }, rest, {
    type: type
  }, styles, useRegisterReturn));
});
/**
 * `React.ForwardRefExoticComponent` is `forwardRef`'s return type.
 * You can hover over `<InputField>` above to see the type inference at work.
 */

exports.InputField = InputField;
const InputComponents = {};
/**
 * Create a component for each type in `INPUT_TYPES`.
 *
 * Rather than writing out each and every component definition,
 * we use a bit of JS metaprogramming to create them all with the appropriate name.
 *
 * We end up with `InputComponents.TextField`, `InputComponents.TimeField`, etc.
 * Export those and we're good to go!
 */

(0, _forEach.default)(INPUT_TYPES).call(INPUT_TYPES, type => {
  InputComponents["".concat((0, _pascalcase.default)(type), "Field")] = /*#__PURE__*/(0, _react.forwardRef)((props, ref) => /*#__PURE__*/_react.default.createElement(InputField, (0, _extends2.default)({
    ref: ref,
    type: type
  }, props)));
});
const {
  ButtonField,
  ColorField,
  DateField,
  DatetimeLocalField,
  EmailField,
  FileField,
  HiddenField,
  ImageField,
  MonthField,
  NumberField,
  PasswordField,
  RadioField,
  RangeField,
  ResetField,
  SearchField,
  SubmitField,
  TelField,
  TextField,
  TimeField,
  UrlField,
  WeekField
} = InputComponents;
exports.WeekField = WeekField;
exports.UrlField = UrlField;
exports.TimeField = TimeField;
exports.TextField = TextField;
exports.TelField = TelField;
exports.SubmitField = SubmitField;
exports.SearchField = SearchField;
exports.ResetField = ResetField;
exports.RangeField = RangeField;
exports.RadioField = RadioField;
exports.PasswordField = PasswordField;
exports.NumberField = NumberField;
exports.MonthField = MonthField;
exports.ImageField = ImageField;
exports.HiddenField = HiddenField;
exports.FileField = FileField;
exports.EmailField = EmailField;
exports.DatetimeLocalField = DatetimeLocalField;
exports.DateField = DateField;
exports.ColorField = ColorField;
exports.ButtonField = ButtonField;