import { BrowserContext } from "./browser-context";
import { NewWindowMessageData, WindowOptions } from "./types";

/** Helper to determine if current context is the top window */
export function isTopWindow(): boolean {
  return window === top;
}

/** Helper to determine if current context is a parent window */
export function isParentWindow(): boolean {
  return window === parent;
}

/** Helper to determine if current context is a popup window */
export function isPopupWindow(): boolean {
  return null !== opener;
}

/**
 * Initialize a new window. Facilitates parent/child communication
 */
export function init(options?: WindowOptions): NewWindowMessageData {
  options = options || {};

  const initialData = getInitialData();

  const loadMessage = {
    action: "load",
    options,
    windowId: initialData.id,
  };

  const openerOrigin = options.origin || initialData.origin || window.location.origin;
  const messageTarget = isPopupWindow() && opener ? opener : parent;

  attachEventHanders(initialData, messageTarget, openerOrigin);

  try {
    messageTarget.postMessage(loadMessage, openerOrigin);
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
  }

  return initialData;
}

/**
 * Creates a new child window. Currently supported child window types:
 *
 * - iframe
 * - popup
 */
export function createWindow(src: string, options?: WindowOptions): BrowserContext {
  options = options || {};

  const isPopup = options.isPopup || false;
  const initialData: NewWindowMessageData = {};
  // scope the eventual `postMessage` call from the popup
  // to the current origin
  initialData.origin = options.origin || window.location.origin;
  initialData.id = options.id || generateId();

  const win = (isPopup ? createPopup : createIframe)(src, initialData, options);
  return new BrowserContext(initialData.id, win, getOrigin(src));
}

/**
 * Internal helper to create a popup
 */
function createPopup(src: string, initialData: NewWindowMessageData, options: WindowOptions): Window | null {
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
 */
function createIframe(src: string, initialData: NewWindowMessageData, options: WindowOptions): HTMLIFrameElement {
  const win = document.createElement("iframe");
  if (initialData.id) {
    win.id = initialData.id;
    win.name = initialData.id;
  }
  win.src = `${src}#${btoa(JSON.stringify(initialData))}`;
  win.width = (options.width || 10).toString();
  win.height = (options.height || 10).toString();
  win.style.display = options.hide === true ? "none" : "normal";
  return win;
}

/**
 * Internal helper to obtain the origin of a URL
 */
function getOrigin(src: string) {
  const a = document.createElement("a");
  a.href = src;
  return a.origin;
}

/**
 * Internal helper to create a unique ID
 */
function generateId(): string {
  return btoa(generateGuid());
}

/**
 * Internal helper to create a GUID
 */
function generateGuid(): string {
  const S4 = () => {
    // tslint:disable-next-line:no-bitwise
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return `${S4()}${S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()})`;
}

function attachEventHanders(initialData: NewWindowMessageData, messageTarget: Window, openerOrigin: string) {
  window.addEventListener("unload", () => {
    messageTarget.postMessage({action: "unload"}, openerOrigin);
  });
  window.addEventListener("message", (e) => {
    // verify expected origin
    if (e.origin !== openerOrigin) {
      return;
    }

    // verify events are triggered only for expected window
    if (e.data.windowId !== initialData.id) {
      return;
    }

    switch (e.data.action) {
      case "close":
        self.close();
        break;
      default:
        break;
    }
  });
}

function getInitialData(): NewWindowMessageData {
  if (isPopupWindow() || !isTopWindow()) {
    try {
      return JSON.parse(atob(window.location.hash.replace("#", "")));
    } catch (e) {
      /** catch in case other data is present in parent window hash */
    }
  }
  return {};
}
