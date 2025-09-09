const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const robot = require('@jitsi/robotjs');
const fs = require('fs');

const SettingsManager = require('./src/js/main/settingsManager');
const TranslationManager = require('./src/js/main/translationManager');
const ClickerManager = require('./src/js/main/clickerManager');
const WindowManager = require('./src/js/main/windowManager');

app.commandLine.appendSwitch('disable-http-cache');
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');

const settingsManager = new SettingsManager();
const translationManager = new TranslationManager();
const clickerManager = new ClickerManager(robot);
const windowManager = new WindowManager();

let mainWindow;
let selectionWindow;

app.whenReady().then(() => {
  settingsManager.loadSettings();
  translationManager.loadTranslations(settingsManager.get('language'));
  
  mainWindow = windowManager.createMainWindow(settingsManager.get('theme'));
  
  clickerManager.onAutoStop(() => {
    settingsManager.set('enabled', false);
    mainWindow.webContents.send('clicker-toggled', false);
  });
  
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
    mainWindow.webContents.send('position-updated', x, y);
  });

  
  ipcMain.on('register-hotkey', (event, hotkey) => {
    clickerManager.registerHotkey(hotkey, () => {
      const enabled = !settingsManager.get('enabled');
      settingsManager.set('enabled', enabled);
      clickerManager.toggle(enabled, settingsManager.getAll());
      mainWindow.webContents.send('clicker-toggled', enabled);
    });
  });
  
  ipcMain.on('change-language', (event, lang) => {
    settingsManager.set('language', lang);
    translationManager.loadTranslations(lang);
    mainWindow.webContents.send('language-changed', lang, translationManager.translations);
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