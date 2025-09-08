const { ipcRenderer } = require('electron');

class SelectionWindow {
  constructor() {
    this.initializeElements();
    this.bindEvents();
    this.loadInitialTranslations();
  }

  initializeElements() {
    this.elements = {
      coordinates: document.getElementById('coordinates'),
      cancelBtn: document.getElementById('cancelBtn')
    };
  }

  async loadInitialTranslations() {
    try {
      // Загружаем переводы при инициализации
      const lang = 'en'; // По умолчанию, можно получить из главного процесса при необходимости
      const translations = await ipcRenderer.invoke('get-translations', lang);
      this.updateTranslations(translations);
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  }

  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.elements.coordinates.textContent = `X: ${e.screenX}, Y: ${e.screenY}`;
    });
    
    document.addEventListener('click', (e) => {
      const x = e.screenX;
      const y = e.screenY;
      
      ipcRenderer.send('position-selected', x, y);
    });
    
    this.elements.cancelBtn.addEventListener('click', () => {
      ipcRenderer.send('cancel-position-selection');
    });
    
    // IPC events
    ipcRenderer.on('language-changed', (event, lang, translations) => this.updateTranslations(translations));
    ipcRenderer.on('theme-changed', (event, theme) => this.applyTheme(theme));
  }

  updateTranslations(translations) {
    // Сохраняем текущие координаты перед обновлением переводов
    const currentCoords = this.elements.coordinates.textContent;
    
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (translations[key] && element !== this.elements.coordinates) {
        element.textContent = translations[key];
      }
    });
    
    // Восстанавливаем координаты
    this.elements.coordinates.textContent = currentCoords;
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

// Initialize the selection window when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SelectionWindow();
});