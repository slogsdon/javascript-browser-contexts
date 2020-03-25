// @ts-check

import { init } from "../windows.js";

// all windows should call init
init();

window.addEventListener("message", (e) => console.log("child window", e));
