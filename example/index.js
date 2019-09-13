// @ts-check

import { init, createWindow } from "../windows.js";
import { OpenedWindow } from "../opened-window.js";

// all windows should call init
init();

const src = "http://localhost:8989/example/";

// iframes
const createIframe = document.getElementById("create-iframe");
createIframe && createIframe.addEventListener("click", () => {
  const iframe = createWindow(src, {
    hide: true,
  });

  // iframes need to be appended to the DOM in order to load
  iframe.appendTo(document.body);

  // take action once the iframe is loaded
  iframe.onload(() => {
    iframe.postMessage("hello iframe");
    console.log(OpenedWindow.all());
  });
});

// popups
const createPopup = document.getElementById("create-popup");
createPopup && createPopup.addEventListener("click", () => {
  const popup = createWindow(src, {
    isPopup: true,
    hide: true, // ignored because popunders are bad
  });

  // take action once the popup is loaded
  popup.onload(() => {
    popup.postMessage("hello popup");
  });
});
