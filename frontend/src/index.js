import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { StylesManager } from "survey-core";

import "survey-core/modern.min.css";
StylesManager.applyTheme("modern");

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
