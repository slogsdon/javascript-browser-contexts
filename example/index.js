// @ts-check
/* global window, document, console */

import { init, createWindow, BrowserContext } from "../lib/index.js";

// all windows should call init
init();

window.addEventListener("message", (e) => console.log("parent window", e));

const src = "http://localhost:8989/example/";

// iframes
const createIframe = document.getElementById("create-iframe");
createIframe && createIframe.addEventListener("click", () => {
  const iframe = createWindow(src + 'child.html', {
    hide: true,
  });

  // iframes need to be appended to the DOM in order to load
  iframe.appendTo(document.body);

  // take action once the iframe is loaded
  iframe.onload(() => {
    iframe.postMessage({"message": "hello iframe"});
    console.log(BrowserContext.all());
  });
});

const createNestedIframe = document.getElementById("create-nested-iframe");
createNestedIframe && createNestedIframe.addEventListener("click", () => {
  const iframe = createWindow(src, {
    width: 400,
    height: 300,
  });

  // iframes need to be appended to the DOM in order to load
  iframe.appendTo(document.body);

  // take action once the iframe is loaded
  iframe.onload(() => {
    iframe.postMessage({"message": "hello nested iframe"});
    console.log(BrowserContext.all());
  });
});

// popups
const createPopup = document.getElementById("create-popup");
createPopup && createPopup.addEventListener("click", () => {
  const popup = createWindow(src + 'child.html', {
    isPopup: true,
    hide: true, // ignored because popunders are bad
  });

  // take action once the popup is loaded
  popup.onload(() => {
    popup.postMessage({"message": "hello popup"});
    popup.close();
  });
});
