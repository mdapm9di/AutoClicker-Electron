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
const positionRow = document.getElementById('positionRow');
const themeButton = document.getElementById('themeButton');
const themeIcon = document.getElementById('themeIcon');

let isEnabled = false;
let currentTheme = 'dark';
let settings = {
  language: 'en',
  theme: 'dark',
  hotkey: 'F6',
  interval: 1000,
  button: 'left',
  clickType: 'single',
  mode: 'current_position',
  customX: 0,
  customY: 0,
  enabled: false
};

document.documentElement.setAttribute('data-theme', currentTheme);

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
    ipcRenderer.send('update-settings', settings);
    
    window.removeEventListener('keydown', handleKeyPress);
  };
  
  window.addEventListener('keydown', handleKeyPress);
});

modeSelect.addEventListener('change', () => {
  updateSettings();
  updatePositionVisibility();
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
  input.addEventListener('blur', updateSettings);
});

toggleBtn.addEventListener('click', () => {
  isEnabled = !isEnabled;
  updateToggleButton();
  updateSettings();
  
  ipcRenderer.send('toggle-clicker', isEnabled);
});

languageSelect.addEventListener('change', (e) => {
  settings.language = e.target.value;
  updateSettings();
  ipcRenderer.send('change-language', e.target.value);
});

languageSelect.addEventListener('blur', (e) => {
  ipcRenderer.send('change-language', e.target.value);
});

themeButton.addEventListener('click', () => {
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  currentTheme = newTheme;
  settings.theme = newTheme;
  
  updateThemeIcon();
  document.documentElement.setAttribute('data-theme', newTheme);
  
  ipcRenderer.send('change-theme', newTheme);
  ipcRenderer.send('update-settings', settings);
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

function updatePositionVisibility() {
  if (modeSelect.value === 'custom_location') {
    positionRow.classList.remove('compact');
    selectPositionBtn.disabled = false;
    if (coordinatesDisplay.textContent === 'Not used' || coordinatesDisplay.textContent === 'Не используется') {
      coordinatesDisplay.setAttribute('data-i18n', 'coordinates_not_selected');
      if (window.translations && window.translations.coordinates_not_selected) {
        coordinatesDisplay.textContent = window.translations.coordinates_not_selected;
      }
    }
  } else {
    positionRow.classList.add('compact');
    selectPositionBtn.disabled = true;
    coordinatesDisplay.setAttribute('data-i18n', 'not_used');
    if (window.translations && window.translations.not_used) {
      coordinatesDisplay.textContent = window.translations.not_used;
    }
  }
}

function updateThemeIcon() {
  if (currentTheme === 'dark') {
    themeIcon.innerHTML = '<path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>';
  } else {
    themeIcon.innerHTML = '<path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>';
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
  updatePositionVisibility();
});

ipcRenderer.on('theme-changed', (event, theme) => {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon();
});

ipcRenderer.on('settings-loaded', (event, savedSettings) => {
  settings = { ...settings, ...savedSettings };
  currentTheme = settings.theme;
  
  hotkeyInput.value = settings.hotkey;
  
  const totalMs = settings.interval;
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const milliseconds = totalMs % 1000;
  
  hoursInput.value = hours;
  minutesInput.value = minutes;
  secondsInput.value = seconds;
  millisecondsInput.value = milliseconds;
  
  buttonSelect.value = settings.button;
  clickTypeSelect.value = settings.clickType;
  modeSelect.value = settings.mode;
  languageSelect.value = settings.language;
  
  if (settings.mode === 'custom_location' && settings.customX !== 0 && settings.customY !== 0) {
    coordinatesDisplay.textContent = `X: ${settings.customX}, Y: ${settings.customY}`;
  }
  
  updatePositionVisibility();
  updateThemeIcon();
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  ipcRenderer.send('register-hotkey', settings.hotkey);
});

document.getElementById('githubButton').addEventListener('click', function() {
  require('electron').shell.openExternal('https://github.com/mdapm9di/auto-clicker-electron');
});

updatePositionVisibility();

ipcRenderer.send('get-initial-settings');