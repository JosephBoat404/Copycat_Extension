document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    document.getElementById('view-tab').addEventListener('click', function() {
      openTab('view-info');
      this.classList.add('active');
      document.getElementById('add-tab').classList.remove('active');
    });
    
    document.getElementById('add-tab').addEventListener('click', function() {
      openTab('add-info');
      this.classList.add('active');
      document.getElementById('view-tab').classList.remove('active');
    });
    
    // Load saved information
    loadSavedInfo();
    
    // Save new information
    document.getElementById('info-form').addEventListener('submit', function(e) {
      e.preventDefault();
      saveInfo();
    });
  });
  
  function openTab(tabName) {
    const tabcontents = document.getElementsByClassName('tabcontent');
    for (let i = 0; i < tabcontents.length; i++) {
      tabcontents[i].classList.remove('active');
    }
    document.getElementById(tabName).classList.add('active');
  }
  
  function loadSavedInfo() {
    chrome.storage.sync.get('savedInfo', function(data) {
      const infoList = document.getElementById('info-list');
      const emptyMessage = document.getElementById('empty-list-message');
      
      infoList.innerHTML = '';
      
      if (data.savedInfo && data.savedInfo.length > 0) {
        emptyMessage.style.display = 'none';
        
        data.savedInfo.forEach(function(item, index) {
          const infoItem = document.createElement('div');
          infoItem.className = 'info-item';
          infoItem.innerHTML = `
            <div class="info-content">
              <div class="info-label">${item.name}</div>
              <div class="info-value">${item.value}</div>
            </div>
            <button class="delete-btn" data-index="${index}" title="Delete">
              <i class="fas fa-trash-alt"></i>
            </button>
          `;
          
          infoItem.addEventListener('click', function(e) {
            if (!e.target.closest('.delete-btn')) {
              copyToClipboard(item.value);
            }
          });
          
          infoList.appendChild(infoItem);
        });
        
        // Add delete button event listeners
        const deleteButtons = document.getElementsByClassName('delete-btn');
        for (let i = 0; i < deleteButtons.length; i++) {
          deleteButtons[i].addEventListener('click', function(e) {
            e.stopPropagation();
            deleteInfo(parseInt(this.getAttribute('data-index')));
          });
        }
      } else {
        emptyMessage.style.display = 'block';
      }
    });
  }
  
  function saveInfo() {
    const nameInput = document.getElementById('info-name');
    const valueInput = document.getElementById('info-value');
    
    const name = nameInput.value.trim();
    const value = valueInput.value.trim();
    
    if (name && value) {
      chrome.storage.sync.get('savedInfo', function(data) {
        const savedInfo = data.savedInfo || [];
        
        savedInfo.push({
          name: name,
          value: value
        });
        
        chrome.storage.sync.set({ 'savedInfo': savedInfo }, function() {
          // Clear form
          nameInput.value = '';
          valueInput.value = '';
          
          // Switch to view tab
          openTab('view-info');
          document.getElementById('view-tab').classList.add('active');
          document.getElementById('add-tab').classList.remove('active');
          
          loadSavedInfo();
        });
      });
    } else {
      alert('Please fill in both fields');
    }
  }
  
  function deleteInfo(index) {
    chrome.storage.sync.get('savedInfo', function(data) {
      if (data.savedInfo && data.savedInfo.length > index) {
        data.savedInfo.splice(index, 1);
        
        chrome.storage.sync.set({ 'savedInfo': data.savedInfo }, function() {
          loadSavedInfo();
        });
      }
    });
  }
  
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
      showNotification('Copied to clipboard!');
    });
  }

  function showNotification(message) {
    const statusDiv = document.createElement('div');
    statusDiv.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
    `;
    statusDiv.style.position = 'fixed';
    statusDiv.style.bottom = '24px';
    statusDiv.style.left = '50%';
    statusDiv.style.transform = 'translateX(-50%)';
    statusDiv.style.background = 'linear-gradient(135deg, #333333 0%, #666666 100%)';
    statusDiv.style.color = '#FFFFFF';
    statusDiv.style.padding = '12px 20px';
    statusDiv.style.borderRadius = '8px';
    statusDiv.style.fontSize = '14px';
    statusDiv.style.fontWeight = '600';
    statusDiv.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
    statusDiv.style.zIndex = '1000';
    statusDiv.style.display = 'flex';
    statusDiv.style.alignItems = 'center';
    statusDiv.style.gap = '8px';
    statusDiv.style.backdropFilter = 'blur(10px)';
    
    document.body.appendChild(statusDiv);
    
    setTimeout(function() {
      statusDiv.style.opacity = '0';
      statusDiv.style.transform = 'translate(-50%, 10px)';
      statusDiv.style.transition = 'all 0.2s ease';
      
      setTimeout(() => document.body.removeChild(statusDiv), 200);
    }, 2000);
  }