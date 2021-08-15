// @ts-check
/* global window, document, console */

import { init } from "../lib/index.js";

// all windows should call init
init();

window.addEventListener("message", (e) => console.log("child window", e));
