// content.js

console.log("InBrowser MCP Content Script Loaded");

// Listen for messages from the background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in content script:", request);

  if (request.action === "navigate") {
    if (request.url) {
      console.log(`Navigating to: ${request.url}`);
      window.location.href = request.url;
      // Content scripts usually respond asynchronously after action completion
      // For navigation, the page will reload, so a simple acknowledgement might suffice
      // or handle response in background script based on tab update events.
      sendResponse({ status: "navigation_initiated", url: request.url });
    } else {
      console.error("Navigation action received without URL");
      sendResponse({ status: "error", message: "URL missing for navigation" });
    }
  } else if (request.action === "goBack") {
    console.log("Going back");
    window.history.back();
    sendResponse({ status: "back_initiated" });
  } else if (request.action === "goForward") {
    console.log("Going forward");
    window.history.forward();
    sendResponse({ status: "forward_initiated" });
  } else if (request.action === "pressKey") {
    // Basic simulation - more complex key events might need more sophisticated handling
    console.log(`Simulating key press: ${request.key}`);
    // This is a placeholder. Actual key simulation is complex and often requires
    // focusing an element and dispatching KeyboardEvent.
    // For simplicity, we'll just log it here.
    sendResponse({ status: "key_press_logged", key: request.key });
  } else if (request.action === "getPageSnapshot") {
      console.log("Taking page snapshot");
      // Basic snapshot: return page title and outer HTML
      // More complex snapshots might involve libraries like html2canvas
      const snapshot = {
          title: document.title,
          html: document.documentElement.outerHTML,
          url: window.location.href
      };
      sendResponse({ status: "snapshot_taken", snapshot: snapshot });
  }
  else {
    console.log("Unknown action received:", request.action);
    sendResponse({ status: "unknown_action", action: request.action });
  }

  // Return true to indicate you wish to send a response asynchronously
  // (although in some cases above, the response is sent synchronously)
  // For navigation, the script context might be destroyed before response is sent.
  return true;
});

// Example: Send a message to background script when the page is fully loaded
// This could be used to signal readiness or send initial page state
window.addEventListener('load', () => {
  console.log("Page fully loaded, sending message to background");
  chrome.runtime.sendMessage({ type: "page_loaded", url: window.location.href, title: document.title }, (response) => {
    if (chrome.runtime.lastError) {
        console.error("Error sending page_loaded message:", chrome.runtime.lastError.message);
    } else {
        console.log("Background script responded:", response);
    }
  });
});