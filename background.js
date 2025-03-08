console.log("Quick Info background script loaded");

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("Background received message:", request);
    if (request.action === "showIcon") {
      // Update the extension icon or state if needed
      // This can be expanded for additional functionality
    }
    return true;
  }
);