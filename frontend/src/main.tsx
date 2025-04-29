import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./main.css";

// 初始设置主题
const prefersDarkMode =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;
document.documentElement.setAttribute(
  "data-theme",
  prefersDarkMode ? "dark" : "light"
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
