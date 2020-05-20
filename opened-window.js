// @ts-check

/** @type {{[key: string]: OpenedWindow}} */
const knownWindows = {};

/**
 * Wrapper around supported child window types:
 *
 * - iframe
 * - popup
 */
export class OpenedWindow {
  /**
   * @param {string} id Desired ID for the window. Should be unique across all windows.
   * @param {string} [origin] Desired window origin. Default: `window.location.origin`.
   * @param {HTMLIFrameElement | Window | null} root Root window node.
   */
  constructor(id, origin, root) {
    /** Current window's unique ID */
    this.id = id;
    /** Current window's origin */
    this.origin = origin || window.location.origin;
    /** Current window's underlying implementation */
    this.root = root;
    /** Current window's load state */
    this.loaded = false;
    /**
     * @type {Function?}
     * @access private
     */
    this.onloadCallback = null;

    window.addEventListener("message", (e) => {
      // verify expected origin
      if (e.origin !== this.origin) {
        return;
      }

      // verify only load events are handled
      if (!e.data.action || e.data.action !== "load") {
        return;
      }

      // verify load event is triggered only for expected window
      if (!e.data.windowId || e.data.windowId !== this.id) {
        return;
      }

      this.loaded = true;

      if (this.onloadCallback) {
        this.onloadCallback();
      }
    });

    knownWindows[id] = this;
  }

  /** Gets the underlying `Window` object */
  get window() {
    return this.root instanceof HTMLIFrameElement ? this.root.contentWindow : this.root;
  }

  /**
   * Helper for sending messages to a window
   *
   * @param {any} data Message data to send
   */
  postMessage(data) {
    if (!this.window) {
      return;
    }

    this.window.postMessage(data, this.origin);
  }

  /**
   * Sets the `load` event callback function
   *
   * @param {() => void} fn Desired callback
   */
  onload(fn) {
    if (this.loaded === true) {
      fn();
    }

    this.onloadCallback = fn;
  }

  /**
   * Helper for appending windows to a parent
   *
   * @param {Node} target Destination for the window
   */
  appendTo(target) {
    if (!target || !target.appendChild) {
      return;
    }

    if (!this.root || !(this.root instanceof HTMLIFrameElement)) {
      return;
    }

    target.appendChild(this.root);
    // ensure iframe has been added to the DOM
    knownWindows[this.id] = this;
  }
}

/** Gets all known `OpenedWindow` instances */
OpenedWindow.all = () => {
  return knownWindows;
};
