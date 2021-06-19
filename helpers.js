// @ts-check

import { OpenedWindow } from "./opened-window.js";

/**
 * @typedef {object} NewWindowMessageData
 *
 * @property {string=} id
 * @property {string=} origin
 */

/** Helper to determine if current context is the top window */
export const isTopWindow = () => window === top;

/** Helper to determine if current context is a parent window */
export const isParentWindow = () => window === parent;

/** Helper to determine if current context is a popup window */
export const isPopupWindow = () => null !== opener;

/**
 * Initialize a new window. Facilitates parent/child communication
 *
 * @param {object} [options]
 * @return {object}
 */
export function init(options) {
  options = options || {};

  /** @type {NewWindowMessageData} */
  let initialData = {};

  if (isPopupWindow() || !isTopWindow()) {
    try {
      initialData = JSON.parse(atob(window.location.hash.replace("#", "")));
    } catch (e) {
      /** catch in case other data is present in parent window hash */
    }
  }

  const loadMessage = {
    action: "load",
    options: options,
    windowId: initialData.id,
  };

  (isPopupWindow() && opener ? opener : parent)
    .postMessage(loadMessage, initialData.origin || window.location.origin);

  return initialData;
}

/**
 * @typedef {object} WindowOptions
 *
 * @property {boolean} [isPopup=false]
 * @property {string=} id
 * @property {number} [width=10]
 * @property {number} [height=10]
 * @property {boolean} [showMenuBar=false]
 * @property {boolean} [showLocation=false]
 * @property {boolean} [isResizable=false]
 * @property {boolean} [showScrollBars=false]
 * @property {boolean} [showStatusBar=false]
 * @property {boolean} [hide=false]
 */

/**
 * Creates a new child window. Currently supported child window types:
 *
 * - iframe
 * - popup
 *
 * @param {string} src
 * @param {WindowOptions} [options]
 * @return {OpenedWindow}
 */
export function createWindow(src, options) {
  options = options || /** @type WindowOptions */ ({});

  const isPopup = options.isPopup || false;
  /** @type NewWindowMessageData */
  const initialData = {};
  // scope the eventual `postMessage` call from the popup
  // to the current origin
  initialData.origin = window.location.origin;
  initialData.id = options.id || generateId();

  const win = (isPopup ? createPopup : createIframe)(src, initialData, options);
  return new OpenedWindow(initialData.id, win, getOrigin(src));
}

/**
 * Internal helper to create a popup
 *
 * @param {string} src
 * @param {NewWindowMessageData} initialData
 * @param {WindowOptions} options
 */
function createPopup(src, initialData, options) {
  const opts =
      [
        ['width', options.width || 10],
        ['height', options.height || 10],
        ['menubar', options.showMenuBar ? "yes" : "no"],
        ['location', options.showLocation ? "yes" : "no"],
        ['resizable', options.isResizable ? "yes" : "no"],
        ['scrollbars', options.showScrollBars ? "yes" : "no"],
        ['status', options.showStatusBar ? "yes" : "no"],
      ]
      .map(item => `${item[0]}=${item[1]}`)
      .join(',');
    return window.open(
      // send all initial data via the location hash. another option
      // here would be to wait for the popup window to completely
      // load and use `postMessage` to send this data
      `${src}#${btoa(JSON.stringify(initialData))}`,
      initialData.id,
      opts
    );
}

/**
 * Internal helper to create an iframe
 *
 * @param {string} src
 * @param {NewWindowMessageData} initialData
 * @param {WindowOptions} options
 */
function createIframe(src, initialData, options) {
  const win = document.createElement("iframe");
  if (initialData.id) {
    win.id = initialData.id;
  }
  win.src = `${src}#${btoa(JSON.stringify(initialData))}`;
  win.width = (options.width || 10).toString();
  win.height = (options.height || 10).toString();
  win.style.display = options.hide === true ? "none" : "normal";
  return win;
}

/**
 * Internal helper to obtain the origin of a URL
 *
 * @access private
 * @param {string} src
 */
function getOrigin(src) {
  const a = document.createElement("a");
  a.href = src;
  return a.origin;
}

/**
 * Internal helper to create a unique ID
 *
 * @access private
 * @return {string}
 */
function generateId() {
  return btoa(generateGuid());
}

/**
 * Internal helper to create a GUID
 *
 * @access private
 * @return {string}
 */
function generateGuid() {
  const S4 = () => {
    // tslint:disable-next-line:no-bitwise
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return `${S4()}${S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()})`;
}
