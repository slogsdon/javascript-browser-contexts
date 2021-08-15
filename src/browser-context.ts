import { WindowOptions } from "./types";

export type IKnownWindows = Record<string, BrowserContext>;
const knownWindows: IKnownWindows = {};

/**
 * Wrapper around supported child window types:
 *
 * - iframe
 * - popup
 */
export class BrowserContext {
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

    this.receive((data) => {
      switch (data.action) {
        case "load":
          this.loaded = true;
          this.options = data.options as WindowOptions || {};

          if (this.onloadCallback) {
            this.onloadCallback();
          }
          break;
        case "unload":
          delete knownWindows[data.windowId as string];
          break;
      }
    });

    knownWindows[id] = this;
  }

  /** Gets the underlying `Window` object */
  get window(): Window | null {
    return this.root instanceof HTMLIFrameElement ? this.root.contentWindow : this.root;
  }

  /**
   * Helper for sending messages to a window
   *
   * @param data Message data to send
   */
  postMessage(data: Record<string, string | boolean | number | Record<string, unknown>>): void {
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

  receive(fn: (data: Record<string, unknown>) => void): void {
    window.addEventListener("message", (e) => {
      // verify expected origin
      if (e.origin !== this.origin) {
        return;
      }

      // verify load event is triggered only for expected window
      if (!e.data.windowId || e.data.windowId !== this.id) {
        return;
      }

      fn(e.data);
    });
  }

  /**
   * Sets the `load` event callback function
   *
   * @param fn Desired callback
   */
  onload(fn: () => void): void {
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
  appendTo(target: Node): void {
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

  close(): void {
    if (!this.root) {
      return;
    }

    if (this.root instanceof HTMLIFrameElement) {
      this.root.parentNode?.removeChild(this.root);
      return;
    }

    this.postMessage({ action: "close", windowId: this.id });
  }

  /**
   * Gets all known `BrowserContext` instances
   */
  static all(): IKnownWindows {
    return knownWindows;
  }
}
