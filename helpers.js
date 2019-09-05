// @ts-check

import { OpenedWindow } from "./opened-window.js";

export const isTopWindow = () => window === top;
export const isParentWindow = () => window === parent;
export const isPopupWindow = () => null !== opener;

/**
 * @param {object} [options] 
 * @return {object}
 */
export function init(options) {
  options = options || {};

  /** @type {any} */
  let initialData = {};

  if (isPopupWindow() || !isTopWindow()) {
    initialData = JSON.parse(atob(window.location.hash.replace("#", "")));
  }

  const loadMessage = {action: "load", windowId: initialData.id};
  if (isPopupWindow()) {
    opener.postMessage(loadMessage, initialData.origin);
  } else if (!isTopWindow()) {
    parent.postMessage(loadMessage, initialData.origin);
  }

  return initialData;
}

/**
 * @param {string} src
 * @param {object} [options] 
 * @return {OpenedWindow}
 */
export function createWindow(src, options) {
  options = options || {};

  const isPopup = options.isPopup || false;
  /** @type any */
  const initialData = {};
  // scope the eventual `postMessage` call from the popup
  // to the current origin
  initialData.origin = window.location.origin;

  if (isPopup) {
    initialData.id = options.id || generateId();
    // build window options
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
    const win = window.open(
      // send all initial data via the location hash. another option
      // here would be to wait for the popup window to completely
      // load and use `postMessage` to send this data
      `${src}#${btoa(JSON.stringify(initialData))}`,
      initialData.id,
      opts
    );
    return new OpenedWindow(initialData.id, getOrigin(src), win);
  }

  initialData.id = options.id || generateId();
  const win = document.createElement("iframe");
  win.id = initialData.id;
  win.src = `${src}#${btoa(JSON.stringify(initialData))}`;
  win.width = options.width || 10;
  win.height = options.height || 10;
  win.style.display = options.hide === true ? "none" : "normal";

  return new OpenedWindow(initialData.id, getOrigin(src), win);
}

/**
 * @param {string} src 
 */
function getOrigin(src) {
  const a = document.createElement("a");
  a.href = src;
  return a.origin;
}

function generateId() {
  return btoa(generateGuid());
}

function generateGuid() {
  const S4 = () => {
    // tslint:disable-next-line:no-bitwise
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return `${S4()}${S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()})`;
}
