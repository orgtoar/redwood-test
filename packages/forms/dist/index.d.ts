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
import React, { ForwardedRef } from 'react';
import { RegisterOptions, UseFormReturn, UseFormProps } from 'react-hook-form';
import FormError, { RWGqlError } from './FormError';
/**
 * We slightly extend `react-hook-form`'s `RegisterOptions` to make working with GraphQL easier.
 * `react-hook-form` provides the prop `setValueAs` for all-purpose coercion
 * (i.e. anything that isn't `valueAsDate` or `valueAsNumber`, which are standard HTML).
 *
 * @see {@link https://react-hook-form.com/api/useform/register}
 */
interface RedwoodRegisterOptions extends RegisterOptions {
    valueAsBoolean?: boolean;
    valueAsJSON?: boolean;
}
/**
 * The main interface, just to have some sort of source of truth.
 *
 * @typeParam E - The type of element; we're only ever working with a few HTMLElements.
 *
 * `extends` constrains the generic while `=` provides a default.
 *
 * @see {@link https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints}
 *
 * @internal
 */
interface FieldProps<Element extends HTMLTextAreaElement | HTMLSelectElement | HTMLInputElement = HTMLInputElement> {
    name: string;
    id?: string;
    emptyAs?: EmptyAsValue;
    errorClassName?: string;
    errorStyle?: React.CSSProperties;
    className?: string;
    style?: React.CSSProperties;
    validation?: RedwoodRegisterOptions;
    type?: string;
    onBlur?: React.FocusEventHandler<Element>;
    onChange?: React.ChangeEventHandler<Element>;
}
export declare type UseErrorStylesProps = Pick<FieldProps, 'name' | 'errorClassName' | 'errorStyle' | 'className' | 'style'>;
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
declare const useErrorStyles: ({ name, errorClassName, errorStyle, className, style, }: UseErrorStylesProps) => {
    className: string | undefined;
    style: React.CSSProperties | undefined;
};
/**
 * EmptyAsValue defines the values that can be used for the field emptyAs prop
 * It sets the value to be returned from the field if the field is empty.
 * If the valueOf prop is truly undefined (not 'undefined'), it will return
 * a default value corresponding to the type of field. (See
 * the comments above the setCoercion function for more details)
 */
declare type EmptyAsValue = null | 'undefined' | 0 | '';
export declare type UseRegisterProps<Element extends HTMLTextAreaElement | HTMLSelectElement | HTMLInputElement = HTMLInputElement> = Pick<FieldProps<Element>, 'name' | 'validation' | 'type' | 'onBlur' | 'onChange'>;
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
declare const useRegister: <T, Element_1 extends HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement = HTMLInputElement>(props: UseRegisterProps<Element_1> & {
    element?: string | undefined;
}, ref?: React.ForwardedRef<T> | undefined, emptyAs?: EmptyAsValue) => {
    ref: (element: T) => void;
    onBlur: React.FocusEventHandler<Element_1>;
    onChange: React.ChangeEventHandler<Element_1>;
    name: string;
    min?: string | number | undefined;
    max?: string | number | undefined;
    maxLength?: number | undefined;
    minLength?: number | undefined;
    pattern?: string | undefined;
    required?: boolean | undefined;
    disabled?: boolean | undefined;
};
/**
 * Context for keeping track of errors from the server.
 */
interface ServerErrorsContextProps {
    [key: string]: string;
}
declare const ServerErrorsContext: React.Context<ServerErrorsContextProps>;
export interface FormProps<TFieldValues> extends Omit<React.ComponentPropsWithRef<'form'>, 'onSubmit'> {
    error?: any;
    /**
     * The methods returned by `useForm`.
     * This prop is only necessary if you've called `useForm` yourself to get
     * access to one of its functions, like `reset`.
     *
     * @example
     *
     * ```typescript
     * const formMethods = useForm<FormData>()
     *
     * const onSubmit = (data: FormData) => {
     *  sendDataToServer(data)
     *  formMethods.reset()
     * }
     *
     * return (
     *   <Form formMethods={formMethods} onSubmit={onSubmit}>
     * )
     * ```
     */
    formMethods?: UseFormReturn<TFieldValues>;
    /**
     * Configures how React Hook Form performs validation, among other things.
     *
     * @example
     *
     * ```jsx
     * <Form config={{ mode: 'onBlur' }}>
     * ```
     *
     * @see {@link https://react-hook-form.com/api/useform}
     */
    config?: UseFormProps<TFieldValues>;
    onSubmit?: (value: TFieldValues, event?: React.BaseSyntheticEvent) => void;
}
declare const Form: <TFieldValues>(props: FormProps<TFieldValues> & React.RefAttributes<HTMLFormElement>) => React.ReactElement | null;
export interface LabelProps extends Pick<FieldProps, 'errorClassName' | 'errorStyle'>, React.ComponentPropsWithoutRef<'label'> {
    name: string;
}
/**
 * Renders a `<label>` that can be styled differently if errors are present on the related fields.
 */
declare const Label: ({ name, children, errorClassName, errorStyle, className, style, ...rest }: LabelProps) => JSX.Element;
export interface FieldErrorProps extends React.ComponentPropsWithoutRef<'span'> {
    /**
     * The name of the field the `<FieldError>`'s associated with.
     */
    name: string;
}
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
declare const FieldError: ({ name, ...rest }: FieldErrorProps) => JSX.Element | null;
export interface TextAreaFieldProps extends Omit<FieldProps<HTMLTextAreaElement>, 'type'>, Omit<React.ComponentPropsWithRef<'textarea'>, 'name'> {
}
/**
 * Renders a `<textarea>` field.
 */
declare const TextAreaField: React.ForwardRefExoticComponent<Pick<TextAreaFieldProps, "form" | "slot" | "style" | "title" | "children" | "className" | "required" | "maxLength" | "minLength" | "value" | "onChange" | "onBlur" | "disabled" | "name" | "errorClassName" | "errorStyle" | "id" | "emptyAs" | "validation" | "key" | "autoComplete" | "defaultChecked" | "defaultValue" | "suppressContentEditableWarning" | "suppressHydrationWarning" | "accessKey" | "contentEditable" | "contextMenu" | "dir" | "draggable" | "hidden" | "lang" | "placeholder" | "spellCheck" | "tabIndex" | "translate" | "radioGroup" | "role" | "about" | "datatype" | "inlist" | "prefix" | "property" | "resource" | "typeof" | "vocab" | "autoCapitalize" | "autoCorrect" | "autoSave" | "color" | "itemProp" | "itemScope" | "itemType" | "itemID" | "itemRef" | "results" | "security" | "unselectable" | "inputMode" | "is" | "aria-activedescendant" | "aria-atomic" | "aria-autocomplete" | "aria-busy" | "aria-checked" | "aria-colcount" | "aria-colindex" | "aria-colspan" | "aria-controls" | "aria-current" | "aria-describedby" | "aria-details" | "aria-disabled" | "aria-dropeffect" | "aria-errormessage" | "aria-expanded" | "aria-flowto" | "aria-grabbed" | "aria-haspopup" | "aria-hidden" | "aria-invalid" | "aria-keyshortcuts" | "aria-label" | "aria-labelledby" | "aria-level" | "aria-live" | "aria-modal" | "aria-multiline" | "aria-multiselectable" | "aria-orientation" | "aria-owns" | "aria-placeholder" | "aria-posinset" | "aria-pressed" | "aria-readonly" | "aria-relevant" | "aria-required" | "aria-roledescription" | "aria-rowcount" | "aria-rowindex" | "aria-rowspan" | "aria-selected" | "aria-setsize" | "aria-sort" | "aria-valuemax" | "aria-valuemin" | "aria-valuenow" | "aria-valuetext" | "dangerouslySetInnerHTML" | "onCopy" | "onCopyCapture" | "onCut" | "onCutCapture" | "onPaste" | "onPasteCapture" | "onCompositionEnd" | "onCompositionEndCapture" | "onCompositionStart" | "onCompositionStartCapture" | "onCompositionUpdate" | "onCompositionUpdateCapture" | "onFocus" | "onFocusCapture" | "onBlurCapture" | "onChangeCapture" | "onBeforeInput" | "onBeforeInputCapture" | "onInput" | "onInputCapture" | "onReset" | "onResetCapture" | "onSubmit" | "onSubmitCapture" | "onInvalid" | "onInvalidCapture" | "onLoad" | "onLoadCapture" | "onError" | "onErrorCapture" | "onKeyDown" | "onKeyDownCapture" | "onKeyPress" | "onKeyPressCapture" | "onKeyUp" | "onKeyUpCapture" | "onAbort" | "onAbortCapture" | "onCanPlay" | "onCanPlayCapture" | "onCanPlayThrough" | "onCanPlayThroughCapture" | "onDurationChange" | "onDurationChangeCapture" | "onEmptied" | "onEmptiedCapture" | "onEncrypted" | "onEncryptedCapture" | "onEnded" | "onEndedCapture" | "onLoadedData" | "onLoadedDataCapture" | "onLoadedMetadata" | "onLoadedMetadataCapture" | "onLoadStart" | "onLoadStartCapture" | "onPause" | "onPauseCapture" | "onPlay" | "onPlayCapture" | "onPlaying" | "onPlayingCapture" | "onProgress" | "onProgressCapture" | "onRateChange" | "onRateChangeCapture" | "onSeeked" | "onSeekedCapture" | "onSeeking" | "onSeekingCapture" | "onStalled" | "onStalledCapture" | "onSuspend" | "onSuspendCapture" | "onTimeUpdate" | "onTimeUpdateCapture" | "onVolumeChange" | "onVolumeChangeCapture" | "onWaiting" | "onWaitingCapture" | "onAuxClick" | "onAuxClickCapture" | "onClick" | "onClickCapture" | "onContextMenu" | "onContextMenuCapture" | "onDoubleClick" | "onDoubleClickCapture" | "onDrag" | "onDragCapture" | "onDragEnd" | "onDragEndCapture" | "onDragEnter" | "onDragEnterCapture" | "onDragExit" | "onDragExitCapture" | "onDragLeave" | "onDragLeaveCapture" | "onDragOver" | "onDragOverCapture" | "onDragStart" | "onDragStartCapture" | "onDrop" | "onDropCapture" | "onMouseDown" | "onMouseDownCapture" | "onMouseEnter" | "onMouseLeave" | "onMouseMove" | "onMouseMoveCapture" | "onMouseOut" | "onMouseOutCapture" | "onMouseOver" | "onMouseOverCapture" | "onMouseUp" | "onMouseUpCapture" | "onSelect" | "onSelectCapture" | "onTouchCancel" | "onTouchCancelCapture" | "onTouchEnd" | "onTouchEndCapture" | "onTouchMove" | "onTouchMoveCapture" | "onTouchStart" | "onTouchStartCapture" | "onPointerDown" | "onPointerDownCapture" | "onPointerMove" | "onPointerMoveCapture" | "onPointerUp" | "onPointerUpCapture" | "onPointerCancel" | "onPointerCancelCapture" | "onPointerEnter" | "onPointerEnterCapture" | "onPointerLeave" | "onPointerLeaveCapture" | "onPointerOver" | "onPointerOverCapture" | "onPointerOut" | "onPointerOutCapture" | "onGotPointerCapture" | "onGotPointerCaptureCapture" | "onLostPointerCapture" | "onLostPointerCaptureCapture" | "onScroll" | "onScrollCapture" | "onWheel" | "onWheelCapture" | "onAnimationStart" | "onAnimationStartCapture" | "onAnimationEnd" | "onAnimationEndCapture" | "onAnimationIteration" | "onAnimationIterationCapture" | "onTransitionEnd" | "onTransitionEndCapture" | "autoFocus" | "cols" | "dirName" | "readOnly" | "rows" | "wrap"> & React.RefAttributes<HTMLTextAreaElement>>;
export interface SelectFieldProps extends Omit<FieldProps<HTMLSelectElement>, 'type'>, Omit<React.ComponentPropsWithRef<'select'>, 'name'> {
}
/**
 * Renders a `<select>` field.
 */
declare const SelectField: React.ForwardRefExoticComponent<Pick<SelectFieldProps, "form" | "slot" | "style" | "title" | "children" | "className" | "required" | "value" | "onChange" | "onBlur" | "disabled" | "name" | "errorClassName" | "errorStyle" | "id" | "emptyAs" | "validation" | "key" | "autoComplete" | "defaultChecked" | "defaultValue" | "suppressContentEditableWarning" | "suppressHydrationWarning" | "accessKey" | "contentEditable" | "contextMenu" | "dir" | "draggable" | "hidden" | "lang" | "placeholder" | "spellCheck" | "tabIndex" | "translate" | "radioGroup" | "role" | "about" | "datatype" | "inlist" | "prefix" | "property" | "resource" | "typeof" | "vocab" | "autoCapitalize" | "autoCorrect" | "autoSave" | "color" | "itemProp" | "itemScope" | "itemType" | "itemID" | "itemRef" | "results" | "security" | "unselectable" | "inputMode" | "is" | "aria-activedescendant" | "aria-atomic" | "aria-autocomplete" | "aria-busy" | "aria-checked" | "aria-colcount" | "aria-colindex" | "aria-colspan" | "aria-controls" | "aria-current" | "aria-describedby" | "aria-details" | "aria-disabled" | "aria-dropeffect" | "aria-errormessage" | "aria-expanded" | "aria-flowto" | "aria-grabbed" | "aria-haspopup" | "aria-hidden" | "aria-invalid" | "aria-keyshortcuts" | "aria-label" | "aria-labelledby" | "aria-level" | "aria-live" | "aria-modal" | "aria-multiline" | "aria-multiselectable" | "aria-orientation" | "aria-owns" | "aria-placeholder" | "aria-posinset" | "aria-pressed" | "aria-readonly" | "aria-relevant" | "aria-required" | "aria-roledescription" | "aria-rowcount" | "aria-rowindex" | "aria-rowspan" | "aria-selected" | "aria-setsize" | "aria-sort" | "aria-valuemax" | "aria-valuemin" | "aria-valuenow" | "aria-valuetext" | "dangerouslySetInnerHTML" | "onCopy" | "onCopyCapture" | "onCut" | "onCutCapture" | "onPaste" | "onPasteCapture" | "onCompositionEnd" | "onCompositionEndCapture" | "onCompositionStart" | "onCompositionStartCapture" | "onCompositionUpdate" | "onCompositionUpdateCapture" | "onFocus" | "onFocusCapture" | "onBlurCapture" | "onChangeCapture" | "onBeforeInput" | "onBeforeInputCapture" | "onInput" | "onInputCapture" | "onReset" | "onResetCapture" | "onSubmit" | "onSubmitCapture" | "onInvalid" | "onInvalidCapture" | "onLoad" | "onLoadCapture" | "onError" | "onErrorCapture" | "onKeyDown" | "onKeyDownCapture" | "onKeyPress" | "onKeyPressCapture" | "onKeyUp" | "onKeyUpCapture" | "onAbort" | "onAbortCapture" | "onCanPlay" | "onCanPlayCapture" | "onCanPlayThrough" | "onCanPlayThroughCapture" | "onDurationChange" | "onDurationChangeCapture" | "onEmptied" | "onEmptiedCapture" | "onEncrypted" | "onEncryptedCapture" | "onEnded" | "onEndedCapture" | "onLoadedData" | "onLoadedDataCapture" | "onLoadedMetadata" | "onLoadedMetadataCapture" | "onLoadStart" | "onLoadStartCapture" | "onPause" | "onPauseCapture" | "onPlay" | "onPlayCapture" | "onPlaying" | "onPlayingCapture" | "onProgress" | "onProgressCapture" | "onRateChange" | "onRateChangeCapture" | "onSeeked" | "onSeekedCapture" | "onSeeking" | "onSeekingCapture" | "onStalled" | "onStalledCapture" | "onSuspend" | "onSuspendCapture" | "onTimeUpdate" | "onTimeUpdateCapture" | "onVolumeChange" | "onVolumeChangeCapture" | "onWaiting" | "onWaitingCapture" | "onAuxClick" | "onAuxClickCapture" | "onClick" | "onClickCapture" | "onContextMenu" | "onContextMenuCapture" | "onDoubleClick" | "onDoubleClickCapture" | "onDrag" | "onDragCapture" | "onDragEnd" | "onDragEndCapture" | "onDragEnter" | "onDragEnterCapture" | "onDragExit" | "onDragExitCapture" | "onDragLeave" | "onDragLeaveCapture" | "onDragOver" | "onDragOverCapture" | "onDragStart" | "onDragStartCapture" | "onDrop" | "onDropCapture" | "onMouseDown" | "onMouseDownCapture" | "onMouseEnter" | "onMouseLeave" | "onMouseMove" | "onMouseMoveCapture" | "onMouseOut" | "onMouseOutCapture" | "onMouseOver" | "onMouseOverCapture" | "onMouseUp" | "onMouseUpCapture" | "onSelect" | "onSelectCapture" | "onTouchCancel" | "onTouchCancelCapture" | "onTouchEnd" | "onTouchEndCapture" | "onTouchMove" | "onTouchMoveCapture" | "onTouchStart" | "onTouchStartCapture" | "onPointerDown" | "onPointerDownCapture" | "onPointerMove" | "onPointerMoveCapture" | "onPointerUp" | "onPointerUpCapture" | "onPointerCancel" | "onPointerCancelCapture" | "onPointerEnter" | "onPointerEnterCapture" | "onPointerLeave" | "onPointerLeaveCapture" | "onPointerOver" | "onPointerOverCapture" | "onPointerOut" | "onPointerOutCapture" | "onGotPointerCapture" | "onGotPointerCaptureCapture" | "onLostPointerCapture" | "onLostPointerCaptureCapture" | "onScroll" | "onScrollCapture" | "onWheel" | "onWheelCapture" | "onAnimationStart" | "onAnimationStartCapture" | "onAnimationEnd" | "onAnimationEndCapture" | "onAnimationIteration" | "onAnimationIterationCapture" | "onTransitionEnd" | "onTransitionEndCapture" | "size" | "autoFocus" | "multiple"> & React.RefAttributes<HTMLSelectElement>>;
export interface CheckboxFieldProps extends Omit<FieldProps<HTMLInputElement>, 'type' | 'emptyAs'>, Omit<React.ComponentPropsWithRef<'input'>, 'name' | 'type'> {
}
/**
 * Renders an `<input type="checkbox">` field.
 */
export declare const CheckboxField: React.ForwardRefExoticComponent<Pick<CheckboxFieldProps, "form" | "slot" | "style" | "title" | "pattern" | "children" | "className" | "required" | "min" | "max" | "maxLength" | "minLength" | "value" | "onChange" | "onBlur" | "disabled" | "name" | "errorClassName" | "errorStyle" | "id" | "validation" | "key" | "autoComplete" | "defaultChecked" | "defaultValue" | "suppressContentEditableWarning" | "suppressHydrationWarning" | "accessKey" | "contentEditable" | "contextMenu" | "dir" | "draggable" | "hidden" | "lang" | "placeholder" | "spellCheck" | "tabIndex" | "translate" | "radioGroup" | "role" | "about" | "datatype" | "inlist" | "prefix" | "property" | "resource" | "typeof" | "vocab" | "autoCapitalize" | "autoCorrect" | "autoSave" | "color" | "itemProp" | "itemScope" | "itemType" | "itemID" | "itemRef" | "results" | "security" | "unselectable" | "inputMode" | "is" | "aria-activedescendant" | "aria-atomic" | "aria-autocomplete" | "aria-busy" | "aria-checked" | "aria-colcount" | "aria-colindex" | "aria-colspan" | "aria-controls" | "aria-current" | "aria-describedby" | "aria-details" | "aria-disabled" | "aria-dropeffect" | "aria-errormessage" | "aria-expanded" | "aria-flowto" | "aria-grabbed" | "aria-haspopup" | "aria-hidden" | "aria-invalid" | "aria-keyshortcuts" | "aria-label" | "aria-labelledby" | "aria-level" | "aria-live" | "aria-modal" | "aria-multiline" | "aria-multiselectable" | "aria-orientation" | "aria-owns" | "aria-placeholder" | "aria-posinset" | "aria-pressed" | "aria-readonly" | "aria-relevant" | "aria-required" | "aria-roledescription" | "aria-rowcount" | "aria-rowindex" | "aria-rowspan" | "aria-selected" | "aria-setsize" | "aria-sort" | "aria-valuemax" | "aria-valuemin" | "aria-valuenow" | "aria-valuetext" | "dangerouslySetInnerHTML" | "onCopy" | "onCopyCapture" | "onCut" | "onCutCapture" | "onPaste" | "onPasteCapture" | "onCompositionEnd" | "onCompositionEndCapture" | "onCompositionStart" | "onCompositionStartCapture" | "onCompositionUpdate" | "onCompositionUpdateCapture" | "onFocus" | "onFocusCapture" | "onBlurCapture" | "onChangeCapture" | "onBeforeInput" | "onBeforeInputCapture" | "onInput" | "onInputCapture" | "onReset" | "onResetCapture" | "onSubmit" | "onSubmitCapture" | "onInvalid" | "onInvalidCapture" | "onLoad" | "onLoadCapture" | "onError" | "onErrorCapture" | "onKeyDown" | "onKeyDownCapture" | "onKeyPress" | "onKeyPressCapture" | "onKeyUp" | "onKeyUpCapture" | "onAbort" | "onAbortCapture" | "onCanPlay" | "onCanPlayCapture" | "onCanPlayThrough" | "onCanPlayThroughCapture" | "onDurationChange" | "onDurationChangeCapture" | "onEmptied" | "onEmptiedCapture" | "onEncrypted" | "onEncryptedCapture" | "onEnded" | "onEndedCapture" | "onLoadedData" | "onLoadedDataCapture" | "onLoadedMetadata" | "onLoadedMetadataCapture" | "onLoadStart" | "onLoadStartCapture" | "onPause" | "onPauseCapture" | "onPlay" | "onPlayCapture" | "onPlaying" | "onPlayingCapture" | "onProgress" | "onProgressCapture" | "onRateChange" | "onRateChangeCapture" | "onSeeked" | "onSeekedCapture" | "onSeeking" | "onSeekingCapture" | "onStalled" | "onStalledCapture" | "onSuspend" | "onSuspendCapture" | "onTimeUpdate" | "onTimeUpdateCapture" | "onVolumeChange" | "onVolumeChangeCapture" | "onWaiting" | "onWaitingCapture" | "onAuxClick" | "onAuxClickCapture" | "onClick" | "onClickCapture" | "onContextMenu" | "onContextMenuCapture" | "onDoubleClick" | "onDoubleClickCapture" | "onDrag" | "onDragCapture" | "onDragEnd" | "onDragEndCapture" | "onDragEnter" | "onDragEnterCapture" | "onDragExit" | "onDragExitCapture" | "onDragLeave" | "onDragLeaveCapture" | "onDragOver" | "onDragOverCapture" | "onDragStart" | "onDragStartCapture" | "onDrop" | "onDropCapture" | "onMouseDown" | "onMouseDownCapture" | "onMouseEnter" | "onMouseLeave" | "onMouseMove" | "onMouseMoveCapture" | "onMouseOut" | "onMouseOutCapture" | "onMouseOver" | "onMouseOverCapture" | "onMouseUp" | "onMouseUpCapture" | "onSelect" | "onSelectCapture" | "onTouchCancel" | "onTouchCancelCapture" | "onTouchEnd" | "onTouchEndCapture" | "onTouchMove" | "onTouchMoveCapture" | "onTouchStart" | "onTouchStartCapture" | "onPointerDown" | "onPointerDownCapture" | "onPointerMove" | "onPointerMoveCapture" | "onPointerUp" | "onPointerUpCapture" | "onPointerCancel" | "onPointerCancelCapture" | "onPointerEnter" | "onPointerEnterCapture" | "onPointerLeave" | "onPointerLeaveCapture" | "onPointerOver" | "onPointerOverCapture" | "onPointerOut" | "onPointerOutCapture" | "onGotPointerCapture" | "onGotPointerCaptureCapture" | "onLostPointerCapture" | "onLostPointerCaptureCapture" | "onScroll" | "onScrollCapture" | "onWheel" | "onWheelCapture" | "onAnimationStart" | "onAnimationStartCapture" | "onAnimationEnd" | "onAnimationEndCapture" | "onAnimationIteration" | "onAnimationIterationCapture" | "onTransitionEnd" | "onTransitionEndCapture" | "list" | "size" | "step" | "autoFocus" | "readOnly" | "multiple" | "accept" | "alt" | "capture" | "checked" | "crossOrigin" | "enterKeyHint" | "formAction" | "formEncType" | "formMethod" | "formNoValidate" | "formTarget" | "height" | "src" | "width"> & React.RefAttributes<HTMLInputElement>>;
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
declare const Submit: React.ForwardRefExoticComponent<Pick<Omit<Pick<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "key" | keyof React.ButtonHTMLAttributes<HTMLButtonElement>> & {
    ref?: ((instance: HTMLButtonElement | null) => void) | React.RefObject<HTMLButtonElement> | null | undefined;
}, "type">, "form" | "slot" | "style" | "title" | "children" | "className" | "value" | "onChange" | "onBlur" | "disabled" | "name" | "id" | "key" | "defaultChecked" | "defaultValue" | "suppressContentEditableWarning" | "suppressHydrationWarning" | "accessKey" | "contentEditable" | "contextMenu" | "dir" | "draggable" | "hidden" | "lang" | "placeholder" | "spellCheck" | "tabIndex" | "translate" | "radioGroup" | "role" | "about" | "datatype" | "inlist" | "prefix" | "property" | "resource" | "typeof" | "vocab" | "autoCapitalize" | "autoCorrect" | "autoSave" | "color" | "itemProp" | "itemScope" | "itemType" | "itemID" | "itemRef" | "results" | "security" | "unselectable" | "inputMode" | "is" | "aria-activedescendant" | "aria-atomic" | "aria-autocomplete" | "aria-busy" | "aria-checked" | "aria-colcount" | "aria-colindex" | "aria-colspan" | "aria-controls" | "aria-current" | "aria-describedby" | "aria-details" | "aria-disabled" | "aria-dropeffect" | "aria-errormessage" | "aria-expanded" | "aria-flowto" | "aria-grabbed" | "aria-haspopup" | "aria-hidden" | "aria-invalid" | "aria-keyshortcuts" | "aria-label" | "aria-labelledby" | "aria-level" | "aria-live" | "aria-modal" | "aria-multiline" | "aria-multiselectable" | "aria-orientation" | "aria-owns" | "aria-placeholder" | "aria-posinset" | "aria-pressed" | "aria-readonly" | "aria-relevant" | "aria-required" | "aria-roledescription" | "aria-rowcount" | "aria-rowindex" | "aria-rowspan" | "aria-selected" | "aria-setsize" | "aria-sort" | "aria-valuemax" | "aria-valuemin" | "aria-valuenow" | "aria-valuetext" | "dangerouslySetInnerHTML" | "onCopy" | "onCopyCapture" | "onCut" | "onCutCapture" | "onPaste" | "onPasteCapture" | "onCompositionEnd" | "onCompositionEndCapture" | "onCompositionStart" | "onCompositionStartCapture" | "onCompositionUpdate" | "onCompositionUpdateCapture" | "onFocus" | "onFocusCapture" | "onBlurCapture" | "onChangeCapture" | "onBeforeInput" | "onBeforeInputCapture" | "onInput" | "onInputCapture" | "onReset" | "onResetCapture" | "onSubmit" | "onSubmitCapture" | "onInvalid" | "onInvalidCapture" | "onLoad" | "onLoadCapture" | "onError" | "onErrorCapture" | "onKeyDown" | "onKeyDownCapture" | "onKeyPress" | "onKeyPressCapture" | "onKeyUp" | "onKeyUpCapture" | "onAbort" | "onAbortCapture" | "onCanPlay" | "onCanPlayCapture" | "onCanPlayThrough" | "onCanPlayThroughCapture" | "onDurationChange" | "onDurationChangeCapture" | "onEmptied" | "onEmptiedCapture" | "onEncrypted" | "onEncryptedCapture" | "onEnded" | "onEndedCapture" | "onLoadedData" | "onLoadedDataCapture" | "onLoadedMetadata" | "onLoadedMetadataCapture" | "onLoadStart" | "onLoadStartCapture" | "onPause" | "onPauseCapture" | "onPlay" | "onPlayCapture" | "onPlaying" | "onPlayingCapture" | "onProgress" | "onProgressCapture" | "onRateChange" | "onRateChangeCapture" | "onSeeked" | "onSeekedCapture" | "onSeeking" | "onSeekingCapture" | "onStalled" | "onStalledCapture" | "onSuspend" | "onSuspendCapture" | "onTimeUpdate" | "onTimeUpdateCapture" | "onVolumeChange" | "onVolumeChangeCapture" | "onWaiting" | "onWaitingCapture" | "onAuxClick" | "onAuxClickCapture" | "onClick" | "onClickCapture" | "onContextMenu" | "onContextMenuCapture" | "onDoubleClick" | "onDoubleClickCapture" | "onDrag" | "onDragCapture" | "onDragEnd" | "onDragEndCapture" | "onDragEnter" | "onDragEnterCapture" | "onDragExit" | "onDragExitCapture" | "onDragLeave" | "onDragLeaveCapture" | "onDragOver" | "onDragOverCapture" | "onDragStart" | "onDragStartCapture" | "onDrop" | "onDropCapture" | "onMouseDown" | "onMouseDownCapture" | "onMouseEnter" | "onMouseLeave" | "onMouseMove" | "onMouseMoveCapture" | "onMouseOut" | "onMouseOutCapture" | "onMouseOver" | "onMouseOverCapture" | "onMouseUp" | "onMouseUpCapture" | "onSelect" | "onSelectCapture" | "onTouchCancel" | "onTouchCancelCapture" | "onTouchEnd" | "onTouchEndCapture" | "onTouchMove" | "onTouchMoveCapture" | "onTouchStart" | "onTouchStartCapture" | "onPointerDown" | "onPointerDownCapture" | "onPointerMove" | "onPointerMoveCapture" | "onPointerUp" | "onPointerUpCapture" | "onPointerCancel" | "onPointerCancelCapture" | "onPointerEnter" | "onPointerEnterCapture" | "onPointerLeave" | "onPointerLeaveCapture" | "onPointerOver" | "onPointerOverCapture" | "onPointerOut" | "onPointerOutCapture" | "onGotPointerCapture" | "onGotPointerCaptureCapture" | "onLostPointerCapture" | "onLostPointerCaptureCapture" | "onScroll" | "onScrollCapture" | "onWheel" | "onWheelCapture" | "onAnimationStart" | "onAnimationStartCapture" | "onAnimationEnd" | "onAnimationEndCapture" | "onAnimationIteration" | "onAnimationIterationCapture" | "onTransitionEnd" | "onTransitionEndCapture" | "autoFocus" | "formAction" | "formEncType" | "formMethod" | "formNoValidate" | "formTarget"> & React.RefAttributes<HTMLButtonElement>>;
/**
 * All the types we'll be generating named `<InputFields>` for (which is basically all of them).
 * Note that `'checkbox'` isn't here because we handle it separately above.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#input_types}
 */
declare const INPUT_TYPES: readonly ["button", "color", "date", "datetime-local", "email", "file", "hidden", "image", "month", "number", "password", "radio", "range", "reset", "search", "submit", "tel", "text", "time", "url", "week"];
declare type InputType = typeof INPUT_TYPES[number];
export interface InputFieldProps extends Omit<FieldProps<HTMLInputElement>, 'type'>, Omit<React.ComponentPropsWithRef<'input'>, 'name' | 'type'> {
    /**
     * @privateRemarks
     *
     * With this typing, passing `'checkbox'` to `<InputField>`'s type is an error, which,
     * at face value, feels like it shouldn't be.
     *
     * Even though we provide a separate `<CheckboxField>`, maybe we should reconsider the typing here?
     */
    type?: InputType;
}
/**
 * Renders an `<input>` field.
 *
 * @see {@link https://redwoodjs.com/docs/form#inputfields}
 */
declare const InputField: React.ForwardRefExoticComponent<Pick<InputFieldProps, "form" | "slot" | "style" | "title" | "pattern" | "children" | "className" | "required" | "min" | "max" | "maxLength" | "minLength" | "value" | "onChange" | "onBlur" | "disabled" | "name" | "errorClassName" | "errorStyle" | "id" | "emptyAs" | "validation" | "type" | "key" | "autoComplete" | "defaultChecked" | "defaultValue" | "suppressContentEditableWarning" | "suppressHydrationWarning" | "accessKey" | "contentEditable" | "contextMenu" | "dir" | "draggable" | "hidden" | "lang" | "placeholder" | "spellCheck" | "tabIndex" | "translate" | "radioGroup" | "role" | "about" | "datatype" | "inlist" | "prefix" | "property" | "resource" | "typeof" | "vocab" | "autoCapitalize" | "autoCorrect" | "autoSave" | "color" | "itemProp" | "itemScope" | "itemType" | "itemID" | "itemRef" | "results" | "security" | "unselectable" | "inputMode" | "is" | "aria-activedescendant" | "aria-atomic" | "aria-autocomplete" | "aria-busy" | "aria-checked" | "aria-colcount" | "aria-colindex" | "aria-colspan" | "aria-controls" | "aria-current" | "aria-describedby" | "aria-details" | "aria-disabled" | "aria-dropeffect" | "aria-errormessage" | "aria-expanded" | "aria-flowto" | "aria-grabbed" | "aria-haspopup" | "aria-hidden" | "aria-invalid" | "aria-keyshortcuts" | "aria-label" | "aria-labelledby" | "aria-level" | "aria-live" | "aria-modal" | "aria-multiline" | "aria-multiselectable" | "aria-orientation" | "aria-owns" | "aria-placeholder" | "aria-posinset" | "aria-pressed" | "aria-readonly" | "aria-relevant" | "aria-required" | "aria-roledescription" | "aria-rowcount" | "aria-rowindex" | "aria-rowspan" | "aria-selected" | "aria-setsize" | "aria-sort" | "aria-valuemax" | "aria-valuemin" | "aria-valuenow" | "aria-valuetext" | "dangerouslySetInnerHTML" | "onCopy" | "onCopyCapture" | "onCut" | "onCutCapture" | "onPaste" | "onPasteCapture" | "onCompositionEnd" | "onCompositionEndCapture" | "onCompositionStart" | "onCompositionStartCapture" | "onCompositionUpdate" | "onCompositionUpdateCapture" | "onFocus" | "onFocusCapture" | "onBlurCapture" | "onChangeCapture" | "onBeforeInput" | "onBeforeInputCapture" | "onInput" | "onInputCapture" | "onReset" | "onResetCapture" | "onSubmit" | "onSubmitCapture" | "onInvalid" | "onInvalidCapture" | "onLoad" | "onLoadCapture" | "onError" | "onErrorCapture" | "onKeyDown" | "onKeyDownCapture" | "onKeyPress" | "onKeyPressCapture" | "onKeyUp" | "onKeyUpCapture" | "onAbort" | "onAbortCapture" | "onCanPlay" | "onCanPlayCapture" | "onCanPlayThrough" | "onCanPlayThroughCapture" | "onDurationChange" | "onDurationChangeCapture" | "onEmptied" | "onEmptiedCapture" | "onEncrypted" | "onEncryptedCapture" | "onEnded" | "onEndedCapture" | "onLoadedData" | "onLoadedDataCapture" | "onLoadedMetadata" | "onLoadedMetadataCapture" | "onLoadStart" | "onLoadStartCapture" | "onPause" | "onPauseCapture" | "onPlay" | "onPlayCapture" | "onPlaying" | "onPlayingCapture" | "onProgress" | "onProgressCapture" | "onRateChange" | "onRateChangeCapture" | "onSeeked" | "onSeekedCapture" | "onSeeking" | "onSeekingCapture" | "onStalled" | "onStalledCapture" | "onSuspend" | "onSuspendCapture" | "onTimeUpdate" | "onTimeUpdateCapture" | "onVolumeChange" | "onVolumeChangeCapture" | "onWaiting" | "onWaitingCapture" | "onAuxClick" | "onAuxClickCapture" | "onClick" | "onClickCapture" | "onContextMenu" | "onContextMenuCapture" | "onDoubleClick" | "onDoubleClickCapture" | "onDrag" | "onDragCapture" | "onDragEnd" | "onDragEndCapture" | "onDragEnter" | "onDragEnterCapture" | "onDragExit" | "onDragExitCapture" | "onDragLeave" | "onDragLeaveCapture" | "onDragOver" | "onDragOverCapture" | "onDragStart" | "onDragStartCapture" | "onDrop" | "onDropCapture" | "onMouseDown" | "onMouseDownCapture" | "onMouseEnter" | "onMouseLeave" | "onMouseMove" | "onMouseMoveCapture" | "onMouseOut" | "onMouseOutCapture" | "onMouseOver" | "onMouseOverCapture" | "onMouseUp" | "onMouseUpCapture" | "onSelect" | "onSelectCapture" | "onTouchCancel" | "onTouchCancelCapture" | "onTouchEnd" | "onTouchEndCapture" | "onTouchMove" | "onTouchMoveCapture" | "onTouchStart" | "onTouchStartCapture" | "onPointerDown" | "onPointerDownCapture" | "onPointerMove" | "onPointerMoveCapture" | "onPointerUp" | "onPointerUpCapture" | "onPointerCancel" | "onPointerCancelCapture" | "onPointerEnter" | "onPointerEnterCapture" | "onPointerLeave" | "onPointerLeaveCapture" | "onPointerOver" | "onPointerOverCapture" | "onPointerOut" | "onPointerOutCapture" | "onGotPointerCapture" | "onGotPointerCaptureCapture" | "onLostPointerCapture" | "onLostPointerCaptureCapture" | "onScroll" | "onScrollCapture" | "onWheel" | "onWheelCapture" | "onAnimationStart" | "onAnimationStartCapture" | "onAnimationEnd" | "onAnimationEndCapture" | "onAnimationIteration" | "onAnimationIterationCapture" | "onTransitionEnd" | "onTransitionEndCapture" | "list" | "size" | "step" | "autoFocus" | "readOnly" | "multiple" | "accept" | "alt" | "capture" | "checked" | "crossOrigin" | "enterKeyHint" | "formAction" | "formEncType" | "formMethod" | "formNoValidate" | "formTarget" | "height" | "src" | "width"> & React.RefAttributes<HTMLInputElement>>;
export declare const ButtonField: React.ForwardRefExoticComponent<Omit<InputFieldProps, "type">>, ColorField: React.ForwardRefExoticComponent<Omit<InputFieldProps, "type">>, DateField: React.ForwardRefExoticComponent<Omit<InputFieldProps, "type">>, DatetimeLocalField: React.ForwardRefExoticComponent<Omit<InputFieldProps, "type">>, EmailField: React.ForwardRefExoticComponent<Omit<InputFieldProps, "type">>, FileField: React.ForwardRefExoticComponent<Omit<InputFieldProps, "type">>, HiddenField: React.ForwardRefExoticComponent<Omit<InputFieldProps, "type">>, ImageField: React.ForwardRefExoticComponent<Omit<InputFieldProps, "type">>, MonthField: React.ForwardRefExoticComponent<Omit<InputFieldProps, "type">>, NumberField: React.ForwardRefExoticComponent<Omit<InputFieldProps, "type">>, PasswordField: React.ForwardRefExoticComponent<Omit<InputFieldProps, "type">>, RadioField: React.ForwardRefExoticComponent<Omit<InputFieldProps, "type">>, RangeField: React.ForwardRefExoticComponent<Omit<InputFieldProps, "type">>, ResetField: React.ForwardRefExoticComponent<Omit<InputFieldProps, "type">>, SearchField: React.ForwardRefExoticComponent<Omit<InputFieldProps, "type">>, SubmitField: React.ForwardRefExoticComponent<Omit<InputFieldProps, "type">>, TelField: React.ForwardRefExoticComponent<Omit<InputFieldProps, "type">>, TextField: React.ForwardRefExoticComponent<Omit<InputFieldProps, "type">>, TimeField: React.ForwardRefExoticComponent<Omit<InputFieldProps, "type">>, UrlField: React.ForwardRefExoticComponent<Omit<InputFieldProps, "type">>, WeekField: React.ForwardRefExoticComponent<Omit<InputFieldProps, "type">>;
export { Form, ServerErrorsContext, FormError, RWGqlError, FieldError, InputField, Label, TextAreaField, SelectField, Submit, useErrorStyles, useRegister, };
export * from 'react-hook-form';
//# sourceMappingURL=index.d.ts.map