console.log("Quick Info content script loaded");

// Run after page is fully loaded
window.addEventListener('load', function() {
  console.log("Page loaded, attaching input listeners");
  
  // Add focus listeners to all inputs and textareas on the page
  document.querySelectorAll('input, textarea').forEach(function(input) {
    input.addEventListener('focus', function() {
      console.log("Input focused:", this.tagName);
    });
  });
  
  // Also listen for dynamic inputs that might be added later
  document.addEventListener('focusin', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      console.log("Input focused via focusin:", e.target.tagName);
    }
  });
});