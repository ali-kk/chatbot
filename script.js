// DOM Elements
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const chatMessages = document.getElementById('chatMessages');
const chatHistory = document.getElementById('chatHistory');
const searchInput = document.getElementById('searchInput');
const newChatBtn = document.querySelector('.new-chat-btn');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');

// Local Storage Key
const CHAT_HISTORY_KEY = 'geminiChatHistory';
let currentChatIndex = -1;

// Load chat history from local storage
let chats = JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY)) || [];

// Initialize the UI
if (chats.length > 0) {
  currentChatIndex = 0;
  renderChatHistory();
  loadChat(0);
}

// Auto-resize textarea
messageInput.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = (this.scrollHeight) + 'px';

  // Enable/disable send button based on input
  sendButton.disabled = this.value.trim() === '';
});

// Render chat history
function renderChatHistory() {
  chatHistory.innerHTML = ''; // Clear the chat history container
  chats.forEach((chat, index) => {
    // Get the last message in the chat or use a default message
    const lastMessage = chat.messages[chat.messages.length - 1] || { text: 'New conversation', sender: 'ai' };

    // Ensure the last message has a valid text property
    const messagePreview = lastMessage.text ? `${lastMessage.sender === 'user' ? 'You: ' : 'AI: '}${lastMessage.text.substring(0, 30)}${lastMessage.text.length > 30 ? '...' : ''}` : 'New conversation';

    // Create the chat item
    const chatItem = document.createElement('div');
    chatItem.className = `chat-item ${index === currentChatIndex ? 'active' : ''}`;
    chatItem.innerHTML = `
      <div class="chat-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-left-text" viewBox="0 0 16 16">
          <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
          <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6zm0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
        </svg>
      </div>
      <div class="chat-info">
        <div class="chat-title">${chat.name}</div>
        <div class="chat-actions">
          <button class="rename-btn" onclick="renameChat(${index})">تعديل الاسم</button>
          <button class="delete-btn" onclick="deleteChat(${index})">حذف</button>
        </div>
      </div>
    `;

    // Add click event to load the chat
    chatItem.addEventListener('click', () => {
      document.querySelectorAll('.chat-item.active').forEach(item => item.classList.remove('active'));
      chatItem.classList.add('active');
      loadChat(index);
    });

    // Append the chat item to the chat history
    chatHistory.appendChild(chatItem);
  });
}

// Load a specific chat
function loadChat(index) {
  currentChatIndex = index;
  chatMessages.innerHTML = '';
  
  if (chats[index] && chats[index].messages.length > 0) {
    chats[index].messages.forEach(message => {
      addMessageToUI(message.text, message.sender);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
  } else {
    // Show empty state
    chatMessages.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-chat-dots" viewBox="0 0 16 16">
          <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
          <path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9.06 9.06 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.437 10.437 0 0 1-.524 2.318l-.003.011a10.722 10.722 0 0 1-.244.637c-.079.186.074.394.273.362a21.673 21.673 0 0 0 .693-.125zm.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6c0 3.193-3.004 6-7 6a8.06 8.06 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a10.97 10.97 0 0 0 .398-2z"/>
        </svg>
        <h2>Start a new conversation</h2>
        <p>Type a message below to start chatting with AI.</p>
      </div>
    `;
  }
}

// Add message to UI
function addMessageToUI(text, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message-container ${sender}`;
  
  if (sender === 'ai') {
    messageDiv.innerHTML = `
      <div class="ai-avatar">
        <img src="images/THEnerds.jpg" alt="AI Avatar">
      </div>
      <div class="message ${sender}">
        <p>${text}</p>
      </div>
    `;
  } else {
    messageDiv.innerHTML = `
      <div class="message ${sender}">
        <p>${text}</p>
      </div>
    `;
  }
  
  // Remove empty state if it exists
  const emptyState = chatMessages.querySelector('.empty-state');
  if (emptyState) {
    chatMessages.removeChild(emptyState);
  }
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Save chat to local storage
function saveChat() {
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chats));
}

// Create a new chat
function createNewChat() {
  const chatName = `Chat ${chats.length + 1}`;
  chats.unshift({ name: chatName, messages: [] });
  currentChatIndex = 0;
  saveChat();
  renderChatHistory();
  loadChat(0);
}

// New chat button handler
newChatBtn.addEventListener('click', createNewChat);

// Send message
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

function sendMessage() {
  const messageText = messageInput.value.trim();
  if (messageText) {
    // Create a new chat if none exists
    if (currentChatIndex === -1 || chats.length === 0) {
      createNewChat();
    }

    // Add user message
    const userMessage = { sender: 'user', text: messageText };
    addMessageToUI(messageText, 'user');

    // Add to chat history
    chats[currentChatIndex].messages.push(userMessage);

    // Reset input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    sendButton.disabled = true; // Disable button after sending

    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message-container ai';
    typingDiv.innerHTML = `
      <div class="message ai">
        <p>Typing<span class="typing-dots">...</span></p>
      </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Send the message to the backend
    fetch('api.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: messageText }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Remove typing indicator
        chatMessages.removeChild(typingDiv);

        // Add AI message
        const aiMessage = { sender: 'ai', text: data.response };
        addMessageToUI(data.response, 'ai');

        // Add to chat history
        chats[currentChatIndex].messages.push(aiMessage);

        // Update chat name after first exchange if it's a default name
        if (chats[currentChatIndex].messages.length === 2 && chats[currentChatIndex].name.startsWith('Chat ')) {
          // Generate a name based on the conversation using Gemini
          generateChatName(messageText).then((name) => {
            chats[currentChatIndex].name = name;
            saveChat();
            renderChatHistory();
          });
        } else {
          saveChat();
          renderChatHistory();
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        // Remove typing indicator
        chatMessages.removeChild(typingDiv);

        // Show error message
        const errorMessage = { sender: 'ai', text: 'Sorry, something went wrong. Please try again.' };
        addMessageToUI(errorMessage.text, 'ai');
        chats[currentChatIndex].messages.push(errorMessage);
        saveChat();
      });
  }
}

// Generate chat name using Gemini API
function generateChatName(firstMessage) {
  return fetch('api.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Generate only one  short and relevant arabic  chat name for this conversation: "${firstMessage}"`,
    }),
  })
    .then((response) => response.json())
    .then((data) => data.response)
    .catch(() => 'New conversation'); // Fallback name if API fails
}

// Search chats
searchInput.addEventListener('input', () => {
  const searchTerm = searchInput.value.toLowerCase();
  
  if (searchTerm === '') {
    renderChatHistory();
    return;
  }
  
  const chatItems = document.querySelectorAll('.chat-item');
  chatItems.forEach(item => {
    const title = item.querySelector('.chat-title').textContent.toLowerCase();
    const preview = item.querySelector('.chat-preview').textContent.toLowerCase();
    
    if (title.includes(searchTerm) || preview.includes(searchTerm)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
});

// Toggle Sidebar
sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('show');
});

// Delete Chat
function deleteChat(index) {
  chats.splice(index, 1);
  saveChat();
  renderChatHistory();
  if (currentChatIndex === index) {
    currentChatIndex = -1;
    loadChat(-1);
  }
}

// Rename Chat
function renameChat(index) {
  const newName = prompt('أدخل الاسم الجديد:', chats[index].name);
  if (newName) {
    chats[index].name = newName;
    saveChat();
    renderChatHistory();
  }
}