import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// The content script runs after DOMContentLoaded (or we can ensure it by waiting)
function init() {
  // Hide native file list, but keep it in DOM so we can parse it
  const nativeChildren = Array.from(document.body.children);
  nativeChildren.forEach((child) => {
    if (child.tagName !== "SCRIPT") {
      (child as HTMLElement).style.display = "none";
    }
  });

  const rootEl = document.createElement("div");
  rootEl.id = "modern-file-ui-root";
  rootEl.style.width = "100vw";
  rootEl.style.height = "100vh";
  document.body.appendChild(rootEl);
  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.overflow = "hidden";

  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

function isChromeDirListing() {
  return document.title.startsWith("Index of ") || 
         !!document.getElementById("tbody") || 
         document.body.innerHTML.includes("addRow(");
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (isChromeDirListing()) init();
  });
} else {
  if (isChromeDirListing()) init();
}
