const defaultSettings = {
  enabled: true,
  isPro: false,
  volume: 100,
  sounds: {
    copy: 'akh.mp3',
    paste: 'gey-echo.mp3',
    selection: 'faaah.mp3'
  },
  customHotkeys: []
};

const BUILTIN_SOUNDS = [
  { value: 'akh.mp3', label: 'Akh' },
  { value: 'faaah.mp3', label: 'Faaah' },
  { value: 'gey-echo.mp3', label: 'Gey Echo' },
  { value: 'perfect-fart.mp3', label: 'Perfect Fart' },
  { value: 'vine-boom.mp3', label: 'Vine Boom' },
  { value: 'none', label: 'None' }
];

const SOUND_SELECT_IDS = [
  'sound-copy',
  'sound-paste',
  'sound-selection',
  'hotkey-sound-picker'
];

const GUMROAD_CHECKOUT_URL = 'https://ayogatot.gumroad.com/l/what-a-sound-pro-lifetime-pass';
const GUMROAD_PRODUCT_ID = 'nBi6xs5ATk7ZZNaCmri5zA==';

document.addEventListener('DOMContentLoaded', () => {
  const enableCheckbox = document.getElementById('enable-extension');
  const copySelect = document.getElementById('sound-copy');
  const pasteSelect = document.getElementById('sound-paste');
  const selectionSelect = document.getElementById('sound-selection');
  const volumeSlider = document.getElementById('sound-volume');
  const volumeValueSpan = document.getElementById('volume-value');
  const saveBtn = document.getElementById('save-btn');
  const statusDiv = document.getElementById('status');
  const userTierBadge = document.getElementById('user-tier-badge');
  const customSoundLock = document.getElementById('custom-sound-lock');
  const volumeLock = document.getElementById('volume-lock');
  const extraTriggersLock = document.getElementById('extra-triggers-lock');
  const upgradeProBtn = document.getElementById('upgrade-pro-btn');
  const proBuyContainer = document.getElementById('pro-buy-container');
  const licenseKeyInput = document.getElementById('license-key-input');
  const verifyLicenseBtn = document.getElementById('verify-license-btn');
  const modalStatus = document.getElementById('modal-status');
  const activeLicenseKeySpan = document.getElementById('active-license-key');
  const deactivateKeyBtn = document.getElementById('deactivate-key-btn');
  const customFileInput = document.getElementById('custom-audio-file');
  const uploadedSoundsList = document.getElementById('uploaded-sounds-list');

  // Custom Hotkey elements
  const hotkeyRecorder = document.getElementById('hotkey-recorder');
  const hotkeySoundPicker = document.getElementById('hotkey-sound-picker');
  const addHotkeyBtn = document.getElementById('add-hotkey-btn');
  const customHotkeysList = document.getElementById('custom-hotkeys-list');

  let activeCustomHotkeys = [];

  // Key Combination Recorder Handler
  if (hotkeyRecorder) {
    hotkeyRecorder.addEventListener('keydown', (e) => {
      e.preventDefault();
      if (!e || !e.key) return;
      
      const keys = [];
      if (e.ctrlKey || e.metaKey) keys.push('CTRL');
      if (e.altKey) keys.push('ALT');
      if (e.shiftKey) keys.push('SHIFT');

      const keyName = e.key.toUpperCase();
      if (!['CONTROL', 'META', 'ALT', 'SHIFT'].includes(keyName)) {
        keys.push(keyName);
      }

      if (keys.length > 0) {
        hotkeyRecorder.value = keys.join('+');
      }
    });
  }

  // Add Custom Hotkey Rule
  if (addHotkeyBtn) {
    addHotkeyBtn.addEventListener('click', () => {
      const combo = hotkeyRecorder ? hotkeyRecorder.value.trim() : '';
      const soundVal = hotkeySoundPicker ? hotkeySoundPicker.value : 'none';

      if (!combo) {
        alert('Please click the recorder box and press a key combination (e.g. CTRL+U).');
        return;
      }
      if (soundVal === 'none') {
        alert('Please assign a sound to this shortcut.');
        return;
      }

      const existingIdx = activeCustomHotkeys.findIndex(h => h.combo === combo);
      if (existingIdx !== -1) {
        activeCustomHotkeys[existingIdx].sound = soundVal;
      } else {
        activeCustomHotkeys.push({ combo, sound: soundVal });
      }

      chrome.storage.sync.set({ customHotkeys: activeCustomHotkeys }, () => {
        renderCustomHotkeysList(activeCustomHotkeys);
        if (hotkeyRecorder) hotkeyRecorder.value = '';
        statusDiv.style.color = '#00c853';
        statusDiv.textContent = `Added shortcut "${combo}"!`;
        setTimeout(() => statusDiv.textContent = '', 2500);
      });
    });
  }

  // Render Custom Hotkeys List
  function renderCustomHotkeysList(hotkeys = []) {
    if (!customHotkeysList) return;
    customHotkeysList.innerHTML = '';

    if (hotkeys.length === 0) {
      customHotkeysList.innerHTML = '<div style="color: #666; font-style: italic; font-size: 10px;">No custom shortcuts created yet.</div>';
      return;
    }

    hotkeys.forEach((rule, index) => {
      const item = document.createElement('div');
      item.className = 'sound-item';
      item.innerHTML = `
        <span style="font-weight: bold; font-size: 11px;">⌨️ <mark style="background: #fff9c4; padding: 0 4px; border: 1px solid black;">${rule.combo}</mark></span>
        <div>
          <button class="delete-hotkey-btn" data-index="${index}" style="padding: 2px 6px; font-size: 10px; width: auto; display: inline-block; margin-top: 0; background: #ff5252; color: white;">✖</button>
        </div>
      `;
      customHotkeysList.appendChild(item);
    });

    customHotkeysList.querySelectorAll('.delete-hotkey-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        activeCustomHotkeys.splice(idx, 1);
        chrome.storage.sync.set({ customHotkeys: activeCustomHotkeys }, () => {
          renderCustomHotkeysList(activeCustomHotkeys);
        });
      });
    });
  }

  // Modal elements
  const proModalOverlay = document.getElementById('pro-modal-overlay');
  const closeModalBtn = document.getElementById('close-modal-btn');

  // Modal open / close handlers
  const openModal = () => {
    if (modalStatus) {
      modalStatus.style.display = 'none';
      modalStatus.textContent = '';
    }
    if (proModalOverlay) proModalOverlay.classList.add('active');
  };

  const closeModal = () => {
    if (proModalOverlay) proModalOverlay.classList.remove('active');
    if (modalStatus) {
      modalStatus.style.display = 'none';
      modalStatus.textContent = '';
    }
  };

  // Bind all unlock-pro-trigger buttons
  document.querySelectorAll('.unlock-pro-trigger').forEach(btn => {
    btn.addEventListener('click', openModal);
  });

  if (userTierBadge) userTierBadge.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

  // Close modal when clicking outside content box
  if (proModalOverlay) {
    proModalOverlay.addEventListener('click', (e) => {
      if (e.target === proModalOverlay) closeModal();
    });
  }

  // Populate dropdowns dynamically with built-in + custom sounds
  function populateSoundDropdowns(customSounds = [], savedSounds = {}, isPro = false) {
    SOUND_SELECT_IDS.forEach(id => {
      const select = document.getElementById(id);
      if (!select) return;

      const triggerKey = id.replace('sound-', '');
      let savedValue = savedSounds[triggerKey] || select.value;
      if (!isPro && savedValue && savedValue.startsWith('custom_')) {
        savedValue = defaultSettings.sounds[triggerKey] || 'none';
      }

      select.innerHTML = '';

      // Add Builtin Sounds
      BUILTIN_SOUNDS.forEach(sound => {
        const opt = document.createElement('option');
        opt.value = sound.value;
        opt.textContent = sound.label;
        select.appendChild(opt);
      });

      // Add Custom Sounds ONLY if user is PRO
      if (isPro && customSounds && customSounds.length > 0) {
        const optGroup = document.createElement('optgroup');
        optGroup.label = '📁 Custom Sounds';
        
        customSounds.forEach(custom => {
          const opt = document.createElement('option');
          opt.value = custom.id;
          opt.textContent = `⭐ ${custom.name}`;
          optGroup.appendChild(opt);
        });
        select.appendChild(optGroup);
      }

      if (savedValue) {
        select.value = savedValue;
        // Fallback for matching legacy saved dataUrls or IDs
        if (select.value !== savedValue && isPro && customSounds && customSounds.length > 0) {
          const matched = customSounds.find(c => c.dataUrl === savedValue || c.id === savedValue);
          if (matched) {
            select.value = matched.id;
          }
        }
      }
    });
  }

  // Load and render custom uploaded sounds list
  function loadCustomSounds(savedSounds = {}, isPro = false) {
    chrome.storage.local.get(['customSounds'], (result) => {
      const customSounds = result.customSounds || [];
      populateSoundDropdowns(customSounds, savedSounds, isPro);
      renderCustomSoundsList(customSounds);
    });
  }

  function renderCustomSoundsList(customSounds) {
    if (!uploadedSoundsList) return;
    uploadedSoundsList.innerHTML = '';
    
    if (customSounds.length === 0) {
      uploadedSoundsList.innerHTML = '<div style="color: #666; font-style: italic; font-size: 10px;">No custom sounds uploaded yet.</div>';
      return;
    }

    customSounds.forEach((sound, index) => {
      const item = document.createElement('div');
      item.className = 'sound-item';
      item.innerHTML = `
        <span style="font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 170px;">🎵 ${sound.name}</span>
        <div>
          <button class="play-btn" data-index="${index}" style="padding: 2px 6px; font-size: 10px; width: auto; display: inline-block; margin-top: 0; background: #fff9c4; color: black;">▶</button>
          <button class="delete-btn" data-index="${index}" style="padding: 2px 6px; font-size: 10px; width: auto; display: inline-block; margin-top: 0; background: #ff5252; color: white;">✖</button>
        </div>
      `;
      uploadedSoundsList.appendChild(item);
    });

    // Play sound preview
    uploadedSoundsList.querySelectorAll('.play-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.target.getAttribute('data-index');
        const sound = customSounds[idx];
        if (sound && sound.dataUrl) {
          const audio = new Audio(sound.dataUrl);
          audio.volume = parseInt(volumeSlider.value, 10) / 100;
          audio.play();
        }
      });
    });

    // Delete custom sound
    uploadedSoundsList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        customSounds.splice(idx, 1);
        chrome.storage.local.set({ customSounds }, () => {
          // Re-load settings to maintain currently selected values
          chrome.storage.sync.get(['sounds'], (syncRes) => {
            loadCustomSounds(syncRes.sounds || {});
          });
        });
      });
    });
  }

  // Handle Custom Audio File Upload
  if (customFileInput) {
    customFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        alert('Audio file size must be under 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        const newId = `custom_${Date.now()}`;
        const soundObj = {
          id: newId,
          name: file.name,
          dataUrl: dataUrl
        };

        chrome.storage.local.get(['customSounds'], (result) => {
          const customSounds = result.customSounds || [];
          customSounds.push(soundObj);
          chrome.storage.local.set({ customSounds }, () => {
            chrome.storage.sync.get(['sounds'], (syncRes) => {
              const currentSounds = syncRes.sounds || defaultSettings.sounds;
              // Auto-select newly uploaded custom sound for copy trigger
              currentSounds.copy = newId;
              loadCustomSounds(currentSounds);
              
              // Automatically save to sync storage
              chrome.storage.sync.set({ sounds: currentSounds }, () => {
                statusDiv.style.color = '#00c853';
                statusDiv.textContent = `Uploaded & selected "${file.name}"!`;
                setTimeout(() => statusDiv.textContent = '', 2500);
              });
            });
          });
        });
      };
      reader.readAsDataURL(file);
    });
  }

  // Cleanup routine to remove legacy huge base64 dataUrls if present in sync storage
  function sanitizeSyncStorage(soundsObj) {
    if (!soundsObj) return defaultSettings.sounds;
    let needsSanitize = false;
    const sanitized = { ...soundsObj };

    for (const key in sanitized) {
      if (typeof sanitized[key] === 'string' && (sanitized[key].startsWith('data:audio') || sanitized[key].length > 100)) {
        sanitized[key] = defaultSettings.sounds[key] || 'none';
        needsSanitize = true;
      }
    }

    if (needsSanitize) {
      chrome.storage.sync.set({ sounds: sanitized }, () => {
        console.log("Sanitized sync storage to remove bloated dataUrl items.");
      });
    }
    return sanitized;
  }

  // Gumroad License Verification API
  async function validateGumroadLicense(keyStr) {
    const trimmed = (keyStr || '').trim();
    if (!trimmed) return { valid: false, error: 'Please enter a license key.' };

    try {
      const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          product_id: GUMROAD_PRODUCT_ID,
          product_permalink: 'what-a-sound-pro-lifetime-pass',
          license_key: trimmed
        })
      });
      const data = await response.json();
      if (data && data.success && data.purchase && !data.purchase.refunded && !data.purchase.disputed) {
        return { valid: true, data: data };
      } else {
        const errorMsg = (data && data.message) ? data.message : 'Invalid or inactive Gumroad license key.';
        return { valid: false, error: errorMsg };
      }
    } catch (err) {
      console.warn("Gumroad API error:", err);
      return { valid: false, error: 'Network error validating key.' };
    }
  }

  // Load settings from storage
  chrome.storage.sync.get(['enabled', 'sounds', 'isPro', 'licenseKey', 'volume'], (result) => {
    const enabled = result.enabled !== undefined ? result.enabled : defaultSettings.enabled;
    const storedIsPro = result.isPro !== undefined ? result.isPro : defaultSettings.isPro;
    const storedKey = result.licenseKey || '';
    const volume = result.volume !== undefined ? result.volume : defaultSettings.volume;
    const rawSounds = result.sounds ? { ...defaultSettings.sounds, ...result.sounds } : defaultSettings.sounds;
    const sounds = sanitizeSyncStorage(rawSounds);

    enableCheckbox.checked = enabled;
    volumeSlider.value = volume;
    volumeValueSpan.textContent = `${volume}%`;

    loadCustomSounds(sounds, storedIsPro);
    updateProUI(storedIsPro, storedKey);

    // If key exists, validate background status to ensure key is valid
    if (storedKey) {
      validateGumroadLicense(storedKey).then(res => {
        if (res.valid) {
          chrome.storage.sync.set({ isPro: true });
          updateProUI(true, storedKey);
        } else {
          chrome.storage.sync.set({ isPro: false });
          updateProUI(false, '');
        }
      });
    }
  });

  // Volume slider feedback
  volumeSlider.addEventListener('input', (e) => {
    volumeValueSpan.textContent = `${e.target.value}%`;
  });

  // Update UI according to PRO status
  function updateProUI(isPro, licenseKey = '') {
    const displayStyle = isPro ? 'none' : 'flex';
    userTierBadge.textContent = isPro ? 'PRO ⭐' : 'FREE';
    userTierBadge.style.background = isPro ? '#00e676' : '#ffeb3b';

    const proBanner = document.getElementById('pro-banner');
    if (proBanner) {
      if (isPro) {
        proBanner.style.background = '#00e676';
        const titleEl = proBanner.querySelector('.pro-banner-title');
        const subEl = proBanner.querySelector('.pro-banner-sub');
        const btnEl = proBanner.querySelector('.pro-banner-btn');
        if (titleEl) titleEl.innerHTML = '✨ PRO MEMBER ACTIVE';
        if (subEl) subEl.textContent = 'All custom audio & hotkeys unlocked!';
        if (btnEl) btnEl.style.display = 'none';
      } else {
        proBanner.style.background = '#ffeb3b';
        const titleEl = proBanner.querySelector('.pro-banner-title');
        const subEl = proBanner.querySelector('.pro-banner-sub');
        const btnEl = proBanner.querySelector('.pro-banner-btn');
        if (titleEl) titleEl.innerHTML = '⚡ UNLOCK PRO ACCESS';
        if (subEl) subEl.textContent = 'Custom Audio • Custom Hotkeys • Volume';
        if (btnEl) {
          btnEl.style.display = 'inline-block';
          btnEl.textContent = 'UPGRADE';
          btnEl.style.background = '#ff5252';
          btnEl.style.color = '#ffffff';
        }
      }
    }

    const proActiveMsg = document.getElementById('pro-active-msg');
    if (proActiveMsg) proActiveMsg.style.display = isPro ? 'block' : 'none';
    if (proBuyContainer) proBuyContainer.style.display = isPro ? 'none' : 'block';
    if (activeLicenseKeySpan && licenseKey) {
      activeLicenseKeySpan.textContent = `Key: ${licenseKey}`;
    }

    if (customSoundLock) customSoundLock.style.display = displayStyle;
    if (volumeLock) volumeLock.style.display = displayStyle;
    if (extraTriggersLock) extraTriggersLock.style.display = displayStyle;

    // Refresh custom sound dropdowns based on new PRO status
    chrome.storage.sync.get(['sounds'], (res) => {
      loadCustomSounds(res.sounds || defaultSettings.sounds, isPro);
    });
  }

  // Trigger Upgrade Modal / Action
  if (upgradeProBtn) {
    upgradeProBtn.addEventListener('click', () => {
      window.open(GUMROAD_CHECKOUT_URL, '_blank');
    });
  }

  // Verify License Key Button Handler
  if (verifyLicenseBtn) {
    verifyLicenseBtn.addEventListener('click', () => {
      const inputKey = licenseKeyInput ? licenseKeyInput.value.trim() : '';
      if (!inputKey) {
        if (modalStatus) {
          modalStatus.style.display = 'block';
          modalStatus.style.color = '#d32f2f';
          modalStatus.style.background = '#ffebee';
          modalStatus.style.border = '2px solid black';
          modalStatus.style.padding = '6px';
          modalStatus.textContent = '⚠️ Please paste your license key first.';
        }
        return;
      }

      if (modalStatus) {
        modalStatus.style.display = 'block';
        modalStatus.style.color = '#000';
        modalStatus.style.background = '#fff9c4';
        modalStatus.style.border = '2px solid black';
        modalStatus.style.padding = '6px';
        modalStatus.textContent = '⏳ Verifying Gumroad license key...';
      }
      statusDiv.style.color = '#000';
      statusDiv.textContent = 'Verifying Gumroad license key...';

      validateGumroadLicense(inputKey).then(res => {
        if (res.valid) {
          chrome.storage.sync.set({ isPro: true, licenseKey: inputKey }, () => {
            if (modalStatus) {
              modalStatus.style.background = '#b9f6ca';
              modalStatus.style.color = '#00695c';
              modalStatus.textContent = '🎉 License Verified! Unlocking PRO...';
            }
            updateProUI(true, inputKey);
            statusDiv.style.color = '#00c853';
            statusDiv.textContent = '🎉 Gumroad License Verified! PRO Unlocked!';
            setTimeout(() => {
              closeModal();
              statusDiv.textContent = '';
            }, 1800);
          });
        } else {
          if (modalStatus) {
            modalStatus.style.display = 'block';
            modalStatus.style.background = '#ff8a80';
            modalStatus.style.color = '#000000';
            modalStatus.style.border = '2px solid black';
            modalStatus.style.padding = '6px';
            modalStatus.textContent = `❌ ${res.error || 'Invalid or inactive License Key.'}`;
          }
          statusDiv.style.color = '#ff5252';
          statusDiv.textContent = res.error || 'Invalid License Key.';
        }
      });
    });
  }

  // Deactivate Key Handler
  if (deactivateKeyBtn) {
    deactivateKeyBtn.addEventListener('click', () => {
      chrome.storage.sync.get(['sounds'], (syncRes) => {
        const sounds = syncRes.sounds || defaultSettings.sounds;

        // Reset custom sound selections to built-in defaults
        const resetSounds = {
          copy: sounds.copy && sounds.copy.startsWith('custom_') ? 'akh.mp3' : sounds.copy,
          paste: sounds.paste && sounds.paste.startsWith('custom_') ? 'gey-echo.mp3' : sounds.paste,
          selection: sounds.selection && sounds.selection.startsWith('custom_') ? 'faaah.mp3' : sounds.selection,
        };

        chrome.storage.sync.set({ isPro: false, licenseKey: '', sounds: resetSounds }, () => {
          updateProUI(false, '');
          statusDiv.style.color = '#000';
          statusDiv.textContent = 'License Key deactivated.';
          setTimeout(() => statusDiv.textContent = '', 2500);
        });
      });
    });
  }

  // Save settings to storage
  saveBtn.addEventListener('click', () => {
    const cleanVal = (val) => (val && val.startsWith('data:audio')) ? 'none' : (val || 'none');

    const newSettings = {
      enabled: enableCheckbox.checked,
      volume: parseInt(volumeSlider.value, 10),
      sounds: {
        copy: cleanVal(copySelect.value),
        paste: cleanVal(pasteSelect.value),
        selection: cleanVal(selectionSelect.value)
      }
    };

    chrome.storage.sync.set(newSettings, () => {
      statusDiv.style.color = '#000';
      statusDiv.textContent = 'Settings saved successfully!';
      setTimeout(() => {
        statusDiv.textContent = '';
      }, 2500);
    });
  });
});





