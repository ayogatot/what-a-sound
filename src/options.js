const defaultSettings = {
  enabled: true,
  sounds: {
    copy: 'akh.mp3',
    paste: 'gey-echo.mp3',
    selection: 'faaah.mp3'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const enableCheckbox = document.getElementById('enable-extension');
  const copySelect = document.getElementById('sound-copy');
  const pasteSelect = document.getElementById('sound-paste');
  const selectionSelect = document.getElementById('sound-selection');
  const saveBtn = document.getElementById('save-btn');
  const statusDiv = document.getElementById('status');

  // Load settings from storage
  chrome.storage.sync.get(['enabled', 'sounds'], (result) => {
    const enabled = result.enabled !== undefined ? result.enabled : defaultSettings.enabled;
    const sounds = result.sounds ? { ...defaultSettings.sounds, ...result.sounds } : defaultSettings.sounds;

    enableCheckbox.checked = enabled;
    copySelect.value = sounds.copy;
    pasteSelect.value = sounds.paste;
    selectionSelect.value = sounds.selection;
  });

  // Save settings to storage
  saveBtn.addEventListener('click', () => {
    const newSettings = {
      enabled: enableCheckbox.checked,
      sounds: {
        copy: copySelect.value,
        paste: pasteSelect.value,
        selection: selectionSelect.value,
      }
    };

    chrome.storage.sync.set(newSettings, () => {
      statusDiv.textContent = 'Settings saved successfully!';
      setTimeout(() => {
        statusDiv.textContent = '';
      }, 2500);
    });
  });
});
