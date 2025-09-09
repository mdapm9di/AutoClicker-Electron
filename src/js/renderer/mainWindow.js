const { ipcRenderer } = require('electron');

class MainWindow {
  constructor() {
    this.isEnabled = false;
    this.currentTheme = 'dark';
    this.settings = {
      language: 'en',
      theme: 'dark',
      hotkey: 'F6',
      interval: 1000,
      button: 'left',
      clickType: 'single',
      mode: 'current_position',
      customX: 0,
      customY: 0,
      repeatOption: 'until_stopped',
      repeatDuration: 60,
      times: 1,
      enabled: false
    };
    
    this.initializeElements();
    this.bindEvents();
    this.applyTheme(this.currentTheme);
    this.loadInitialSettings();
  }

  initializeElements() {
    this.elements = {
      hotkeyInput: document.getElementById('hotkey'),
      hoursInput: document.getElementById('hours'),
      minutesInput: document.getElementById('minutes'),
      secondsInput: document.getElementById('seconds'),
      millisecondsInput: document.getElementById('milliseconds'),
      buttonSelect: document.getElementById('button'),
      clickTypeSelect: document.getElementById('clickType'),
      modeSelect: document.getElementById('mode'),
      selectPositionBtn: document.getElementById('selectPositionBtn'),
      coordinatesDisplay: document.getElementById('coordinatesDisplay'),
      toggleBtn: document.getElementById('toggleBtn'),
      statusDiv: document.getElementById('status'),
      languageSelect: document.getElementById('languageSelect'),
      themeButton: document.getElementById('themeButton'),
      themeIcon: document.getElementById('themeIcon'),
      githubButton: document.getElementById('githubButton'),
      repeatOptionSelect: document.getElementById('repeatOption'),
      repeatDurationInput: document.getElementById('repeatDuration'),
      timesDisplay: document.getElementById('timesDisplay'),
      timesDisplayContainer: document.querySelector('.times-display-container')
    };
  }

  async loadInitialSettings() {
    try {
      this.settings = await ipcRenderer.invoke('get-settings');
      const translations = await ipcRenderer.invoke('get-translations', this.settings.language);
      this.updateTranslations(this.settings.language, translations);
      this.loadSettings(this.settings);
    } catch (error) {
      console.error('Error loading initial settings:', error);
    }
  }

  bindEvents() {
    this.elements.hotkeyInput.addEventListener('click', () => this.handleHotkeyInput());
    
    this.elements.modeSelect.addEventListener('change', () => {
      this.updateSettings();
      this.updatePositionVisibility();
    });
    
    this.elements.selectPositionBtn.addEventListener('click', () => {
      ipcRenderer.send('start-position-selection');
    });
    
    this.elements.repeatOptionSelect.addEventListener('change', () => {
      this.updateRepeatOptionVisibility();
      this.updateSettings();
    });
    
    ['change', 'input', 'blur'].forEach(eventType => {
      [
        this.elements.hoursInput,
        this.elements.minutesInput,
        this.elements.secondsInput,
        this.elements.millisecondsInput,
        this.elements.buttonSelect,
        this.elements.clickTypeSelect,
        this.elements.modeSelect,
        this.elements.repeatOptionSelect,
        this.elements.repeatDurationInput
      ].forEach(element => {
        element.addEventListener(eventType, () => this.updateSettings());
      });
    });
    
    this.elements.toggleBtn.addEventListener('click', () => this.toggleClicker());
    this.elements.languageSelect.addEventListener('change', (e) => this.changeLanguage(e));
    this.elements.themeButton.addEventListener('click', () => this.toggleTheme());
    this.elements.githubButton.addEventListener('click', () => this.openGitHub());
    
    ipcRenderer.on('clicker-toggled', (event, enabled) => {
        this.isEnabled = enabled;
        this.updateToggleButton(enabled);
    });
    ipcRenderer.on('position-updated', (event, x, y) => this.updatePosition(x, y));
    ipcRenderer.on('language-changed', (event, lang, translations) => this.updateTranslations(lang, translations));
    ipcRenderer.on('theme-changed', (event, theme) => this.applyTheme(theme));
    ipcRenderer.on('settings-loaded', (event, savedSettings) => this.loadSettings(savedSettings));
    
    this.updatePositionVisibility();
    this.updateRepeatOptionVisibility();
  }

  handleHotkeyInput() {
    this.elements.hotkeyInput.placeholder = 'Press any key...';
    const handleKeyPress = (e) => {
      e.preventDefault();
      let key = e.key.toUpperCase();
      
      if (e.ctrlKey) key = `Ctrl+${key}`;
      if (e.shiftKey) key = `Shift+${key}`;
      if (e.altKey) key = `Alt+${key}`;
      
      if (['CONTROL', 'SHIFT', 'ALT', 'META', 'CAPSLOCK', 'TAB'].includes(key.toUpperCase())) {
        return;
      }
      
      this.elements.hotkeyInput.value = key;
      this.elements.hotkeyInput.placeholder = '';
      this.settings.hotkey = key;
      
      ipcRenderer.send('register-hotkey', key);
      ipcRenderer.send('update-settings', this.settings);
      
      window.removeEventListener('keydown', handleKeyPress);
    };
    
    window.addEventListener('keydown', handleKeyPress);
  }

  updateSettings() {
    const hours = parseInt(this.elements.hoursInput.value) || 0;
    const minutes = parseInt(this.elements.minutesInput.value) || 0;
    const seconds = parseInt(this.elements.secondsInput.value) || 0;
    const milliseconds = parseInt(this.elements.millisecondsInput.value) || 0;
    
    const totalMs = (hours * 3600000) + (minutes * 60000) + 
                   (seconds * 1000) + milliseconds;
    
    this.settings.interval = totalMs > 0 ? totalMs : 1000;
    this.settings.button = this.elements.buttonSelect.value;
    this.settings.clickType = this.elements.clickTypeSelect.value;
    this.settings.mode = this.elements.modeSelect.value;
    this.settings.repeatOption = this.elements.repeatOptionSelect.value;
    this.settings.repeatDuration = parseInt(this.elements.repeatDurationInput.value) || 60;
    this.settings.times = 1;
    
    ipcRenderer.send('update-settings', this.settings);
  }

  toggleClicker() {
    this.isEnabled = !this.isEnabled;
    this.updateToggleButton();
    ipcRenderer.send('toggle-clicker', this.isEnabled);
  }

  changeLanguage(e) {
    this.settings.language = e.target.value;
    this.updateSettings();
    ipcRenderer.send('change-language', e.target.value);
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.currentTheme = newTheme;
    this.settings.theme = newTheme;
    
    this.updateThemeIcon();
    this.applyTheme(newTheme);
    
    ipcRenderer.send('change-theme', newTheme);
    ipcRenderer.send('update-settings', this.settings);
  }

  openGitHub() {
    require('electron').shell.openExternal('https://github.com/mdapm9di/auto-clicker-electron');
  }

  updateToggleButton(enabled = this.isEnabled) {
    this.isEnabled = enabled;
    
    if (enabled) {
      this.elements.toggleBtn.setAttribute('data-i18n', 'disable');
      this.elements.statusDiv.setAttribute('data-i18n', 'enabled');
      this.elements.statusDiv.classList.remove('disabled');
      this.elements.statusDiv.classList.add('enabled');
    } else {
      this.elements.toggleBtn.setAttribute('data-i18n', 'enable');
      this.elements.statusDiv.setAttribute('data-i18n', 'disabled');
      this.elements.statusDiv.classList.remove('enabled');
      this.elements.statusDiv.classList.add('disabled');
    }
    
    if (window.translations) {
      this.elements.toggleBtn.textContent = enabled ? window.translations.disable : window.translations.enable;
      this.elements.statusDiv.textContent = enabled ? window.translations.enabled : window.translations.disabled;
    }
  }

  updatePositionVisibility() {
    const isCustomPosition = this.elements.modeSelect.value === 'custom_location';
    
    this.elements.selectPositionBtn.disabled = !isCustomPosition;
    
    if (isCustomPosition) {
      const currentCoords = this.elements.coordinatesDisplay.textContent;
      if (currentCoords !== 'Not used' && currentCoords !== 'Не используется' && 
          currentCoords !== 'Coordinates not selected' && currentCoords !== 'Координаты не выбраны') {
        return;
      }
      this.elements.coordinatesDisplay.setAttribute('data-i18n', 'coordinates_not_selected');
      if (window.translations && window.translations.coordinates_not_selected) {
        this.elements.coordinatesDisplay.textContent = window.translations.coordinates_not_selected;
      }
    } else {
      this.elements.coordinatesDisplay.setAttribute('data-i18n', 'not_used');
      if (window.translations && window.translations.not_used) {
        this.elements.coordinatesDisplay.textContent = window.translations.not_used;
      }
    }
  }

  updateRepeatOptionVisibility() {
    const isTimeOption = this.elements.repeatOptionSelect.value === 'repeat_for_time';
    
    if (isTimeOption) {
      this.elements.timesDisplayContainer.classList.remove('disabled');
      this.elements.repeatDurationInput.value = this.settings.repeatDuration || 60;
    } else {
      this.elements.timesDisplayContainer.classList.add('disabled');
      this.elements.timesDisplay.setAttribute('data-i18n', 'not_used');
      if (window.translations && window.translations.not_used) {
        this.elements.timesDisplay.textContent = window.translations.not_used;
      }
    }
  }

    updateThemeIcon() {
    if (this.currentTheme === 'dark') {
      this.elements.themeIcon.innerHTML = '<path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>';
    } else {
      this.elements.themeIcon.innerHTML = '<path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>';
    }
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    this.updateThemeIcon();
  }

  updatePosition(x, y) {
    this.settings.customX = x;
    this.settings.customY = y;
    this.elements.coordinatesDisplay.textContent = `X: ${x}, Y: ${y}`;
    this.updateSettings();
  }

  updateTranslations(lang, translations) {
    window.translations = translations;
    
    this.elements.languageSelect.value = lang;
    
    const currentCoords = this.elements.coordinatesDisplay.textContent;
    const hasCustomCoords = currentCoords !== 'Not used' && 
                           currentCoords !== 'Не используется' && 
                           currentCoords !== 'Coordinates not selected' && 
                           currentCoords !== 'Координаты не выбраны';
    
    const currentDuration = this.elements.repeatDurationInput.value;
    const hasCustomDuration = currentDuration !== '60' && currentDuration !== 'Not used' && 
                             currentDuration !== 'Не используется';
    
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (translations[key] && element !== this.elements.coordinatesDisplay && element !== this.elements.timesDisplay) {
        element.textContent = translations[key];
      }
    });
    
    document.querySelectorAll('option[data-i18n]').forEach(option => {
      const key = option.getAttribute('data-i18n');
      if (translations[key]) {
        option.textContent = translations[key];
      }
    });
    
    if (hasCustomCoords) {
      this.elements.coordinatesDisplay.textContent = currentCoords;
    }
    
    if (hasCustomDuration) {
      this.elements.repeatDurationInput.value = currentDuration;
    } else if (this.elements.repeatOptionSelect.value !== 'repeat_for_time') {
      this.elements.timesDisplay.textContent = translations.not_used || 'Not used';
    }
    
    this.updateToggleButton();
    this.updatePositionVisibility();
    this.updateRepeatOptionVisibility();
  }

  loadSettings(savedSettings) {
    this.settings = { ...this.settings, ...savedSettings };
    this.currentTheme = this.settings.theme;
    
    this.elements.hotkeyInput.value = this.settings.hotkey;
    
    const totalMs = this.settings.interval;
    const hours = Math.floor(totalMs / 3600000);
    const minutes = Math.floor((totalMs % 3600000) / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const milliseconds = totalMs % 1000;
    
    this.elements.hoursInput.value = hours;
    this.elements.minutesInput.value = minutes;
    this.elements.secondsInput.value = seconds;
    this.elements.millisecondsInput.value = milliseconds;
    
    this.elements.buttonSelect.value = this.settings.button;
    this.elements.clickTypeSelect.value = this.settings.clickType;
    this.elements.modeSelect.value = this.settings.mode;
    this.elements.languageSelect.value = this.settings.language;
    this.elements.repeatOptionSelect.value = this.settings.repeatOption || 'until_stopped';
    this.elements.repeatDurationInput.value = this.settings.repeatDuration || 60;
    
    if (this.settings.mode === 'custom_location' && this.settings.customX !== 0 && this.settings.customY !== 0) {
      this.elements.coordinatesDisplay.textContent = `X: ${this.settings.customX}, Y: ${this.settings.customY}`;
    }
    
    this.updatePositionVisibility();
    this.updateRepeatOptionVisibility();
    this.updateThemeIcon();
    this.applyTheme(this.currentTheme);
    
    ipcRenderer.send('register-hotkey', this.settings.hotkey);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new MainWindow();
});