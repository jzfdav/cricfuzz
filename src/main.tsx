import { render } from "preact";
import { App } from "./App";
import "./style.css";

const appRoot = document.getElementById("app");
if (appRoot) {
	render(<App />, appRoot);
}
