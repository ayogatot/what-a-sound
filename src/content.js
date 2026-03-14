// Default settings
const defaultSettings = {
  enabled: true,
  sounds: {
    copy: 'akh.mp3',
    paste: 'gey-echo.mp3',
    selection: 'faaah.mp3'
  }
};

let currentSettings = { ...defaultSettings };

// Load settings
chrome.storage.sync.get(['enabled', 'sounds'], (result) => {
  if (result.enabled !== undefined) currentSettings.enabled = result.enabled;
  if (result.sounds !== undefined) {
    currentSettings.sounds = { ...currentSettings.sounds, ...result.sounds };
  }
});

// Listen for updates from options page
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    if (changes.enabled) currentSettings.enabled = changes.enabled.newValue;
    if (changes.sounds) {
      currentSettings.sounds = { ...currentSettings.sounds, ...changes.sounds.newValue };
    }
  }
});

// Audio playback function
function playSound(soundFileName) {
  if (!currentSettings.enabled || soundFileName === 'none') {
    return;
  }
  
  const soundUrl = chrome.runtime.getURL(`assets/sounds/${soundFileName}`);
  const audio = new Audio(soundUrl);
  
  audio.play().catch(error => {
    console.warn("WhatTheKey Audio Playback Error:", error);
    console.warn("Note: Browsers block autoplay if the user hasn't interacted with the page. Since this extension triggers on user events (keydown/mouseup), this should work after their first interaction with the document.");
  });
}

// Event Listeners: Keyboard
document.addEventListener('keydown', (event) => {
  // Check for Ctrl or Cmd key
  const isCtrlOrCmd = event.ctrlKey || event.metaKey;
  
  if (isCtrlOrCmd) {
    if (event.key.toLowerCase() === 'c') {
      playSound(currentSettings.sounds.copy);
    } else if (event.key.toLowerCase() === 'v') {
      playSound(currentSettings.sounds.paste);
    }
  }
});

// Event Listeners: Selection (with Debounce)
let selectionTimeout;
document.addEventListener('mouseup', () => {
  // Clear any existing timeout structure (debounce)
  if (selectionTimeout) {
    clearTimeout(selectionTimeout);
  }
  
  // Set new timeout for debounce
  selectionTimeout = setTimeout(() => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 0) {
      playSound(currentSettings.sounds.selection);
    }
  }, 300); // 300ms debounce
});
