const fs = require('fs');
const path = require('path');

class TranslationManager {
  constructor() {
    this.translations = {};
  }

  loadTranslations(lang) {
    try {
      let translationsPath;
      const app = require('electron').app;
      
      if (app.isPackaged) {
        const possiblePaths = [
          path.join(process.resourcesPath, 'locales', `${lang}.json`),
          path.join(process.resourcesPath, '..', 'locales', `${lang}.json`),
          path.join(process.resourcesPath, 'app', 'locales', `${lang}.json`),
          path.join(__dirname, '..', '..', '..', 'locales', `${lang}.json`),
          path.join(__dirname, '..', '..', 'locales', `${lang}.json`)
        ];
        
        for (const possiblePath of possiblePaths) {
          if (fs.existsSync(possiblePath)) {
            translationsPath = possiblePath;
            break;
          }
        }
        
        if (!translationsPath) {
          throw new Error(`Translation file for ${lang} not found`);
        }
      } else {
        translationsPath = path.join(__dirname, '..', '..', 'locales', `${lang}.json`);
      }
      
      const data = fs.readFileSync(translationsPath);
      this.translations = JSON.parse(data);
    } catch (error) {
      console.error('Error loading translations:', error);
      this.loadEnglishFallback();
    }
  }

  loadEnglishFallback() {
    try {
      const app = require('electron').app;
      let enPath;
      
      if (app.isPackaged) {
        const possiblePaths = [
          path.join(process.resourcesPath, 'locales', 'en.json'),
          path.join(process.resourcesPath, '..', 'locales', 'en.json'),
          path.join(process.resourcesPath, 'app', 'locales', 'en.json'),
          path.join(__dirname, '..', '..', 'locales', 'en.json'),
          path.join(__dirname, '..', '..', '..', 'locales', 'en.json')
        ];
        
        for (const possiblePath of possiblePaths) {
          if (fs.existsSync(possiblePath)) {
            enPath = possiblePath;
            break;
          }
        }
      } else {
        enPath = path.join(__dirname, '..', '..', 'locales', 'en.json');
      }
      
      if (enPath && fs.existsSync(enPath)) {
        const enData = fs.readFileSync(enPath);
        this.translations = JSON.parse(enData);
      } else {
        throw new Error('English translation file not found');
      }
    } catch (e) {
      console.error('Error loading English translations:', e);
      this.translations = {};
    }
  }

  getTranslations(lang) {
    if (lang !== this.currentLang) {
      this.loadTranslations(lang);
    }
    return this.translations;
  }
}

module.exports = TranslationManager;