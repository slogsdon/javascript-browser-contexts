// @ts-check

/** @type {any} */
const knownWindows = {};

export class OpenedWindow {
  /**
   * @param {string} id
   * @param {string} origin
   * @param {HTMLIFrameElement | Window | null} root
   */
  constructor(id, origin, root) {
    this.id = id;
    this.origin = origin;
    this.root = root;
    this.loaded = false;
    this.loadedCallback = () => {};

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
      this.loadedCallback();
    });

    knownWindows[id] = this;
  }

  get window() {
    return this.root instanceof HTMLIFrameElement ? this.root.contentWindow : this.root;
  }

  /**
   * @param {any} data 
   */
  postMessage(data) {
    if (this.window === null) {
      return;
    }

    this.window.postMessage(data, this.origin);
  }

  /**
   * @param {() => void} fn 
   */
  onload(fn) {
    if (this.loaded === true) {
      fn();
    }

    this.loadedCallback = fn;
  }

  /**
   * @param {Node} target 
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

OpenedWindow.all = () => {
  return knownWindows;
}
