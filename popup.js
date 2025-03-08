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
    document.getElementById('save-btn').addEventListener('click', saveInfo);
  });
  
  function openTab(tabName) {
    const tabcontent = document.getElementsByClassName('tabcontent');
    for (let i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = 'none';
    }
    document.getElementById(tabName).style.display = 'block';
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
            <strong>${item.name}</strong>
            <p>${item.value.length > 30 ? item.value.substring(0, 30) + '...' : item.value}</p>
            <button class="delete-btn" data-index="${index}">×</button>
          `;
          
          infoItem.addEventListener('click', function(e) {
            if (!e.target.classList.contains('delete-btn')) {
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
          nameInput.value = '';
          valueInput.value = '';
          
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
      // Show a temporary success message
      const statusDiv = document.createElement('div');
      statusDiv.textContent = 'Copied!';
      statusDiv.style.position = 'fixed';
      statusDiv.style.bottom = '10px';
      statusDiv.style.left = '50%';
      statusDiv.style.transform = 'translateX(-50%)';
      statusDiv.style.backgroundColor = '#4CAF50';
      statusDiv.style.color = 'white';
      statusDiv.style.padding = '5px 10px';
      statusDiv.style.borderRadius = '5px';
      
      document.body.appendChild(statusDiv);
      
      setTimeout(function() {
        document.body.removeChild(statusDiv);
      }, 2000);
    });
  }