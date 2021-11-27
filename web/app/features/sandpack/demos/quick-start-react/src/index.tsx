import { StrictMode } from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./styles.css";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  rootElement
);

let linkTag = document.createElement("link");
linkTag.rel = "stylesheet";
linkTag.href = "https://cdn.jsdelivr.net/npm/picnic";
document.body.appendChild(linkTag);
