console.log("Quick Info content script loaded");

// Run after page is fully loaded
window.addEventListener('load', function() {
  console.log("Page loaded, attaching input listeners");
  
  // Add focus listeners to all inputs and textareas on the page
  document.querySelectorAll('input, textarea').forEach(function(input) {
    input.addEventListener('focus', function() {
      console.log("Input focused:", this.tagName);
      showQuickInfoButton(this);
    });
  });
  
  // Also listen for dynamic inputs that might be added later
  document.addEventListener('focusin', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      console.log("Input focused via focusin:", e.target.tagName);
      showQuickInfoButton(e.target);
    }
  });
});

function showQuickInfoButton(inputElement) {
  // Remove any existing buttons
  const existingButtons = document.querySelectorAll('.quick-info-btn');
  existingButtons.forEach(btn => btn.remove());
  
  console.log("Creating Quick Info button");
  
  // Create button
  const button = document.createElement('div');
  button.className = 'quick-info-btn';
  button.innerHTML = 'QI';
  button.style.position = 'absolute';
  button.style.zIndex = '10000';
  button.style.backgroundColor = '#4CAF50';
  button.style.color = 'white';
  button.style.borderRadius = '50%';
  button.style.width = '24px';
  button.style.height = '24px';
  button.style.textAlign = 'center';
  button.style.lineHeight = '24px';
  button.style.cursor = 'pointer';
  button.style.fontSize = '12px';
  button.style.fontWeight = 'bold';
  button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  
  // Position the button near the input
  const rect = inputElement.getBoundingClientRect();
  button.style.top = (window.scrollY + rect.top) + 'px';
  button.style.left = (window.scrollX + rect.right + 5) + 'px';
  
  // Add click event
  button.addEventListener('click', function(e) {
    e.stopPropagation();
    console.log("Quick Info button clicked");
    // Show popup
    showQuickInfoPopup(inputElement, button);
  });
  
  document.body.appendChild(button);
  console.log("Button added to page");
}

function showQuickInfoPopup(inputElement, buttonElement) {
  // Remove any existing popups
  const existingPopups = document.querySelectorAll('.quick-info-popup');
  existingPopups.forEach(popup => popup.remove());
  
  // Create popup
  const popup = document.createElement('div');
  popup.className = 'quick-info-popup';
  popup.style.position = 'absolute';
  popup.style.zIndex = '10001';
  popup.style.backgroundColor = 'white';
  popup.style.border = '1px solid #ccc';
  popup.style.borderRadius = '5px';
  popup.style.padding = '10px';
  popup.style.width = '250px';
  popup.style.maxHeight = '300px';
  popup.style.overflowY = 'auto';
  popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  
  // Position the popup
  const buttonRect = buttonElement.getBoundingClientRect();
  popup.style.top = (window.scrollY + buttonRect.bottom + 5) + 'px';
  popup.style.left = (window.scrollX + buttonRect.left - 230) + 'px'; // Adjust to not go off-screen
  
  // Load saved information from storage
  chrome.storage.sync.get('savedInfo', function(data) {
    if (data.savedInfo && data.savedInfo.length > 0) {
      data.savedInfo.forEach(function(item) {
        const infoItem = document.createElement('div');
        infoItem.className = 'quick-info-item';
        infoItem.innerHTML = `<strong>${item.name}</strong>`;
        infoItem.style.padding = '8px';
        infoItem.style.margin = '5px 0';
        infoItem.style.border = '1px solid #eee';
        infoItem.style.borderRadius = '3px';
        infoItem.style.cursor = 'pointer';
        
        infoItem.addEventListener('click', function() {
          inputElement.value = item.value;
          popup.remove();
          buttonElement.remove();
        });
        
        infoItem.addEventListener('mouseover', function() {
          this.style.backgroundColor = '#f1f1f1';
        });
        
        infoItem.addEventListener('mouseout', function() {
          this.style.backgroundColor = 'transparent';
        });
        
        popup.appendChild(infoItem);
      });
    } else {
      const message = document.createElement('p');
      message.textContent = 'No saved information. Add some through the extension popup.';
      message.style.color = '#666';
      popup.appendChild(message);
    }
    
    // Add close button
    const closeBtn = document.createElement('div');
    closeBtn.textContent = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '5px';
    closeBtn.style.right = '8px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.fontSize = '16px';
    closeBtn.style.color = '#666';
    
    closeBtn.addEventListener('click', function() {
      popup.remove();
    });
    
    popup.appendChild(closeBtn);
  });
  
  // Close when clicking outside
  document.addEventListener('click', function closePopup(e) {
    if (!popup.contains(e.target) && e.target !== buttonElement) {
      popup.remove();
      document.removeEventListener('click', closePopup);
    }
  });
  
  document.body.appendChild(popup);
}