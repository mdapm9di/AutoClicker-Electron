const fs = require('fs');
const path = require('path');

class SettingsManager {
  constructor() {
    this.defaultSettings = {
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
    
    this.settings = { ...this.defaultSettings };
    this.saveTimeout = null;
  }

  loadSettings() {
    try {
      const dataDir = path.join(require('electron').app.getPath('userData'), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      const filePath = path.join(dataDir, 'config.json');
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        const savedSettings = JSON.parse(data);
        this.settings = { ...this.defaultSettings, ...savedSettings };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    return this.settings;
  }

  saveSettings() {
    try {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = setTimeout(() => {
        try {
          const dataDir = path.join(require('electron').app.getPath('userData'), 'data');
          if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
          }
          
          const filePath = path.join(dataDir, 'config.json');
          const settingsToSave = { ...this.settings };
          delete settingsToSave.enabled;
          
          fs.writeFileSync(filePath, JSON.stringify(settingsToSave, null, 2));
        } catch (error) {
          console.error('Error saving settings:', error);
        }
      }, 500);
    } catch (error) {
      console.error('Error setting save timeout:', error);
    }
  }

  saveImmediately() {
    try {
      clearTimeout(this.saveTimeout);
      const dataDir = path.join(require('electron').app.getPath('userData'), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      const filePath = path.join(dataDir, 'config.json');
      const settingsToSave = { ...this.settings };
      delete settingsToSave.enabled;
      
      fs.writeFileSync(filePath, JSON.stringify(settingsToSave, null, 2));
    } catch (error) {
      console.error('Error immediately saving settings:', error);
    }
  }

  update(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  set(key, value) {
    this.settings[key] = value;
    this.saveSettings();
  }

  get(key) {
    return this.settings[key];
  }

  getAll() {
    return { ...this.settings };
  }

  setPosition(x, y) {
    this.settings.customX = x;
    this.settings.customY = y;
    this.saveSettings();
  }
}

module.exports = SettingsManager;