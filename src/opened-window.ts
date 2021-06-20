import { WindowOptions } from "./types";

export interface IKnownWindows {
  [key: string]: OpenedWindow;
}
const knownWindows: IKnownWindows = {};

/**
 * Wrapper around supported child window types:
 *
 * - iframe
 * - popup
 */
export class OpenedWindow {
  /** Current window's unique ID */
  public id: string;
  /** Current window's origin */
  public origin: string;
  /** Current window's underlying implementation */
  public root: HTMLIFrameElement | Window | null;
  /** Current window's load state */
  public loaded = false;
  /** Current window's options */
  public options: WindowOptions;
  private onloadCallback?: () => void;

  /**
   * @param id Desired ID for the window. Should be unique across all windows.
   * @param root Root window node.
   * @param origin Desired window origin. Default: `window.location.origin`.
   */
  constructor(id: string, root: HTMLIFrameElement | Window | null, origin?: string) {
    this.id = id;
    this.origin = origin || window.location.origin;
    this.root = root;
    this.loaded = false;
    this.options = { id };

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
      this.options = e.data.options || {};

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
   * @param data Message data to send
   */
  postMessage(data: any) {
    if (!this.window) {
      return;
    }

    try {
      this.window.postMessage(data, this.origin);
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(e);
    }
  }

  /**
   * Sets the `load` event callback function
   *
   * @param fn Desired callback
   */
  onload(fn: () => void) {
    if (this.loaded === true) {
      fn();
    }

    this.onloadCallback = fn;
  }

  /**
   * Helper for appending windows to a parent
   *
   * @param target Destination for the window
   */
  appendTo(target: Node) {
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

  /**
   * Gets all known `OpenedWindow` instances
   */
  static all() {
    return knownWindows;
  }
}
