"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resetFocus = exports.getFocus = exports.getAnnouncement = void 0;

/**
 * gets the announcement for the new page.
 * called in one of active-route-loader's `useEffect`.
 *
 * the order of priority is:
 * 1. RouteAnnouncement (the most specific one)
 * 2. h1
 * 3. document.title
 * 4. location.pathname
 */
const getAnnouncement = () => {
  var _global, _global$document$quer, _global2, _global3, _global4;

  const routeAnnouncement = (_global = global) === null || _global === void 0 ? void 0 : (_global$document$quer = _global.document.querySelectorAll('[data-redwood-route-announcement]')) === null || _global$document$quer === void 0 ? void 0 : _global$document$quer[0];

  if (routeAnnouncement !== null && routeAnnouncement !== void 0 && routeAnnouncement.textContent) {
    return routeAnnouncement.textContent;
  }

  const pageHeading = (_global2 = global) === null || _global2 === void 0 ? void 0 : _global2.document.querySelector("h1");

  if (pageHeading !== null && pageHeading !== void 0 && pageHeading.textContent) {
    return pageHeading.textContent;
  }

  if ((_global3 = global) !== null && _global3 !== void 0 && _global3.document.title) {
    return document.title;
  }

  return "new page at ".concat((_global4 = global) === null || _global4 === void 0 ? void 0 : _global4.location.pathname);
};

exports.getAnnouncement = getAnnouncement;

const getFocus = () => {
  var _global5, _global5$document$que;

  const routeFocus = (_global5 = global) === null || _global5 === void 0 ? void 0 : (_global5$document$que = _global5.document.querySelectorAll('[data-redwood-route-focus]')) === null || _global5$document$que === void 0 ? void 0 : _global5$document$que[0];

  if (!routeFocus || !routeFocus.children.length || routeFocus.children[0].tabIndex < 0) {
    return null;
  }

  return routeFocus.children[0];
}; // note: tried document.activeElement.blur(), but that didn't reset the focus flow


exports.getFocus = getFocus;

const resetFocus = () => {
  var _global6, _global7, _global8;

  (_global6 = global) === null || _global6 === void 0 ? void 0 : _global6.document.body.setAttribute('tabindex', '-1');
  (_global7 = global) === null || _global7 === void 0 ? void 0 : _global7.document.body.focus();
  (_global8 = global) === null || _global8 === void 0 ? void 0 : _global8.document.body.removeAttribute('tabindex');
};

exports.resetFocus = resetFocus;