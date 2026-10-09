// Default settings
const defaultSettings = {
  enabled: true,
  isPro: false,
  volume: 100,
  sounds: {
    copy: 'akh.mp3',
    paste: 'gey-echo.mp3',
    selection: 'faaah.mp3'
  }
};

let currentSettings = { ...defaultSettings };

// Load settings
chrome.storage.sync.get(['enabled', 'sounds', 'volume', 'isPro', 'customHotkeys'], (result) => {
  if (result.enabled !== undefined) currentSettings.enabled = result.enabled;
  if (result.isPro !== undefined) currentSettings.isPro = result.isPro;
  if (result.volume !== undefined) currentSettings.volume = result.volume;
  if (result.sounds !== undefined) {
    currentSettings.sounds = { ...currentSettings.sounds, ...result.sounds };
  }
  if (result.customHotkeys !== undefined) currentSettings.customHotkeys = result.customHotkeys;
});

// Listen for updates from options page
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    if (changes.enabled) currentSettings.enabled = changes.enabled.newValue;
    if (changes.isPro !== undefined) currentSettings.isPro = changes.isPro.newValue;
    if (changes.volume) currentSettings.volume = changes.volume.newValue;
    if (changes.sounds) {
      currentSettings.sounds = { ...currentSettings.sounds, ...changes.sounds.newValue };
    }
    if (changes.customHotkeys) currentSettings.customHotkeys = changes.customHotkeys.newValue;
  }
});

// Audio playback function
function playSound(soundFileName) {
  if (!currentSettings.enabled || !soundFileName || soundFileName === 'none') {
    return;
  }

  if (soundFileName.startsWith('custom_')) {
    // Lock check: Only PRO users can play custom audio uploads!
    if (!currentSettings.isPro) {
      console.warn("WhatTheKey: Custom audio playback requires PRO.");
      return;
    }
    chrome.storage.local.get(['customSounds'], (result) => {
      const customSounds = result.customSounds || [];
      const customSound = customSounds.find(s => s.id === soundFileName);
      if (customSound && customSound.dataUrl) {
        executeAudioPlay(customSound.dataUrl);
      }
    });
  } else {
    const soundUrl = soundFileName.startsWith('data:') || soundFileName.startsWith('blob:') || soundFileName.startsWith('http')
      ? soundFileName
      : chrome.runtime.getURL(`assets/sounds/${soundFileName}`);
    executeAudioPlay(soundUrl);
  }
}

function executeAudioPlay(url) {
  const audio = new Audio(url);
  audio.volume = Math.max(0, Math.min(1, (currentSettings.volume !== undefined ? currentSettings.volume : 100) / 100));

  audio.play().catch(error => {
    console.warn("WhatTheKey Audio Playback Error:", error);
    console.warn("Note: Browsers block autoplay if the user hasn't interacted with the page. Since this extension triggers on user events (keydown/mouseup), this should work after their first interaction with the document.");
  });
}

// Event Listeners: Keyboard
document.addEventListener('keydown', (event) => {
  if (!event || !event.key) return;

  const isCtrlOrCmd = event.ctrlKey || event.metaKey;
  const key = event.key.toLowerCase();

  // Check Custom Hotkeys first
  const keys = [];
  if (isCtrlOrCmd) keys.push('CTRL');
  if (event.altKey) keys.push('ALT');
  if (event.shiftKey) keys.push('SHIFT');

  const keyUpper = event.key.toUpperCase();
  if (!['CONTROL', 'META', 'ALT', 'SHIFT'].includes(keyUpper)) {
    keys.push(keyUpper);
    const comboStr = keys.join('+');

    if (currentSettings.customHotkeys && Array.isArray(currentSettings.customHotkeys)) {
      const matchedRule = currentSettings.customHotkeys.find(r => r.combo === comboStr);
      if (matchedRule && matchedRule.sound) {
        playSound(matchedRule.sound);
        return;
      }
    }
  }

  // Preset hotkeys fallback (Copy & Paste)
  if (isCtrlOrCmd) {
    if (key === 'c') {
      playSound(currentSettings.sounds.copy);
    } else if (key === 'v') {
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
