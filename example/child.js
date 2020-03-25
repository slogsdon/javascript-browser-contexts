// @ts-check

import { init } from "../browser-contexts.js";

// all windows should call init
init();

window.addEventListener("message", (e) => console.log("child window", e));
