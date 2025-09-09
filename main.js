const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const robot = require('@jitsi/robotjs');
const fs = require('fs');

// Импорт модулей
const SettingsManager = require('./src/js/main/settingsManager');
const TranslationManager = require('./src/js/main/translationManager');
const ClickerManager = require('./src/js/main/clickerManager');
const WindowManager = require('./src/js/main/windowManager');

app.commandLine.appendSwitch('disable-http-cache');
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');

// Инициализация менеджеров
const settingsManager = new SettingsManager();
const translationManager = new TranslationManager();
const clickerManager = new ClickerManager(robot);
const windowManager = new WindowManager();

let mainWindow;
let selectionWindow;

app.whenReady().then(() => {
  // Загрузка настроек и переводов
  settingsManager.loadSettings();
  translationManager.loadTranslations(settingsManager.get('language'));
  
  // Создание главного окна
  mainWindow = windowManager.createMainWindow(settingsManager.get('theme'));
  
  // Установка обработчика автоматической остановки
  clickerManager.onAutoStop(() => {
    settingsManager.set('enabled', false);
    mainWindow.webContents.send('clicker-toggled', false);
  });
  
  // Обработка событий IPC
  setupIpcHandlers();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = windowManager.createMainWindow(settingsManager.get('theme'));
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    cleanup();
    app.quit();
  }
});

function setupIpcHandlers() {
  // Обработчики событий IPC
  ipcMain.handle('get-settings', () => settingsManager.getAll());
  ipcMain.handle('get-translations', (event, lang) => translationManager.getTranslations(lang));
  
  ipcMain.on('update-settings', (event, newSettings) => {
    settingsManager.update(newSettings);
    clickerManager.restartIfNeeded(settingsManager.getAll());
  });
  
  ipcMain.on('toggle-clicker', (event, enabled) => {
    settingsManager.set('enabled', enabled);
    clickerManager.toggle(enabled, settingsManager.getAll());
  });
  
  ipcMain.on('start-position-selection', () => {
    selectionWindow = windowManager.createSelectionWindow();
    // Отправляем переводы в окно выбора позиции при создании
    selectionWindow.webContents.once('did-finish-load', () => {
      selectionWindow.webContents.send('language-changed', 
        settingsManager.get('language'), 
        translationManager.translations
      );
    });
  });
  
  ipcMain.on('position-selected', (event, x, y) => {
    if (selectionWindow) {
        selectionWindow.close();
        selectionWindow = null;
    }
    settingsManager.setPosition(x, y);
    // Отправляем событие с новыми координатами в главное окно
    mainWindow.webContents.send('position-updated', x, y);
  });

  
  ipcMain.on('register-hotkey', (event, hotkey) => {
    clickerManager.registerHotkey(hotkey, () => {
      const enabled = !settingsManager.get('enabled');
      settingsManager.set('enabled', enabled);
      clickerManager.toggle(enabled, settingsManager.getAll());
      // Отправляем событие об изменении состояния
      mainWindow.webContents.send('clicker-toggled', enabled);
    });
  });
  
  ipcMain.on('change-language', (event, lang) => {
    settingsManager.set('language', lang);
    translationManager.loadTranslations(lang);
    // Отправляем обновленные переводы в главное окно
    mainWindow.webContents.send('language-changed', lang, translationManager.translations);
    // И в окно выбора позиции, если оно открыто
    if (selectionWindow) {
      selectionWindow.webContents.send('language-changed', lang, translationManager.translations);
    }
  });
  
  ipcMain.on('change-theme', (event, theme) => {
    settingsManager.set('theme', theme);
  });
}

function cleanup() {
  globalShortcut.unregisterAll();
  clickerManager.stop();
  settingsManager.saveImmediately();
}