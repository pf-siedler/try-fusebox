import * as snabbdom from "snabbdom";
import { view } from "./view";

const patch = snabbdom.init([]);
patch(document.querySelector("#app"), view(window.location.href));
