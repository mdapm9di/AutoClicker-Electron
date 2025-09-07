const { ipcRenderer } = require('electron');

const hotkeyInput = document.getElementById('hotkey');
const hoursInput = document.getElementById('hours');
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');
const millisecondsInput = document.getElementById('milliseconds');
const buttonSelect = document.getElementById('button');
const clickTypeSelect = document.getElementById('clickType');
const modeSelect = document.getElementById('mode');
const selectPositionBtn = document.getElementById('selectPositionBtn');
const coordinatesDisplay = document.getElementById('coordinatesDisplay');
const toggleBtn = document.getElementById('toggleBtn');
const statusDiv = document.getElementById('status');
const languageSelect = document.getElementById('languageSelect');

let isEnabled = false;
let settings = {
  hotkey: 'F6',
  interval: 1000,
  button: 'left',
  clickType: 'single',
  mode: 'current_position',
  customX: 0,
  customY: 0,
  enabled: false
};

hotkeyInput.addEventListener('click', () => {
  hotkeyInput.placeholder = 'Press any key...';
  const handleKeyPress = (e) => {
    e.preventDefault();
    let key = e.key.toUpperCase();
    
    if (e.ctrlKey) key = `Ctrl+${key}`;
    if (e.shiftKey) key = `Shift+${key}`;
    if (e.altKey) key = `Alt+${key}`;
    
    if (['CONTROL', 'SHIFT', 'ALT', 'META', 'CAPSLOCK', 'TAB'].includes(key.toUpperCase())) {
      return;
    }
    
    hotkeyInput.value = key;
    hotkeyInput.placeholder = '';
    settings.hotkey = key;
    
    ipcRenderer.send('register-hotkey', key);
    
    window.removeEventListener('keydown', handleKeyPress);
  };
  
  window.addEventListener('keydown', handleKeyPress);
});

modeSelect.addEventListener('change', () => {
  updateSettings();
});

selectPositionBtn.addEventListener('click', () => {
  ipcRenderer.send('start-position-selection');
});

[hoursInput, minutesInput, secondsInput, millisecondsInput, buttonSelect, 
 clickTypeSelect, modeSelect].forEach(element => {
  element.addEventListener('change', updateSettings);
});

[hoursInput, minutesInput, secondsInput, millisecondsInput].forEach(input => {
  input.addEventListener('input', updateSettings);
});

toggleBtn.addEventListener('click', () => {
  isEnabled = !isEnabled;
  updateToggleButton();
  updateSettings();
  
  ipcRenderer.send('toggle-clicker', isEnabled);
});

languageSelect.addEventListener('change', (e) => {
  ipcRenderer.send('change-language', e.target.value);
});

function updateSettings() {
  const hours = parseInt(hoursInput.value) || 0;
  const minutes = parseInt(minutesInput.value) || 0;
  const seconds = parseInt(secondsInput.value) || 0;
  const milliseconds = parseInt(millisecondsInput.value) || 0;
  
  const totalMs = (hours * 3600000) + (minutes * 60000) + 
                 (seconds * 1000) + milliseconds;
  
  settings.interval = totalMs > 0 ? totalMs : 1000;
  settings.button = buttonSelect.value;
  settings.clickType = clickTypeSelect.value;
  settings.mode = modeSelect.value;
  
  ipcRenderer.send('update-settings', settings);
}

function updateToggleButton() {
  if (isEnabled) {
    toggleBtn.setAttribute('data-i18n', 'disable');
    statusDiv.setAttribute('data-i18n', 'enabled');
    statusDiv.classList.remove('disabled');
    statusDiv.classList.add('enabled');
  } else {
    toggleBtn.setAttribute('data-i18n', 'enable');
    statusDiv.setAttribute('data-i18n', 'disabled');
    statusDiv.classList.remove('enabled');
    statusDiv.classList.add('disabled');
  }
  
  if (window.translations) {
    toggleBtn.textContent = isEnabled ? window.translations.disable : window.translations.enable;
    statusDiv.textContent = isEnabled ? window.translations.enabled : window.translations.disabled;
  }
}

ipcRenderer.on('clicker-toggled', (event, enabled) => {
  isEnabled = enabled;
  updateToggleButton();
});

ipcRenderer.on('position-updated', (event, x, y) => {
  settings.customX = x;
  settings.customY = y;
  coordinatesDisplay.textContent = `X: ${x}, Y: ${y}`;
  updateSettings();
});

ipcRenderer.on('language-changed', (event, lang, translations) => {
  window.translations = translations;
  
  languageSelect.value = lang;
  
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[key]) {
      element.textContent = translations[key];
    }
  });
  
  document.querySelectorAll('option[data-i18n]').forEach(option => {
    const key = option.getAttribute('data-i18n');
    if (translations[key]) {
      option.textContent = translations[key];
    }
  });
  
  updateToggleButton();
  
  if (modeSelect.value === 'current_position') {
    coordinatesDisplay.setAttribute('data-i18n', 'not_used');
    if (translations.not_used) {
      coordinatesDisplay.textContent = translations.not_used;
    }
  } else if (coordinatesDisplay.textContent === 'Not used' || coordinatesDisplay.textContent === 'Не используется') {
    coordinatesDisplay.setAttribute('data-i18n', 'coordinates_not_selected');
    if (translations.coordinates_not_selected) {
      coordinatesDisplay.textContent = translations.coordinates_not_selected;
    }
  }
});

document.getElementById('githubButton').addEventListener('click', function() {
    // Замените URL на актуальный репозиторий вашего проекта
    require('electron').shell.openExternal('https://github.com/mdapm9di/auto-clicker-electron');
});

updateSettings();
ipcRenderer.send('register-hotkey', settings.hotkey);