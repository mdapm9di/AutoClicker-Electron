const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const robot = require('robotjs');
const fs = require('fs');

let mainWindow;
let selectionWindow;
let clickInterval = null;
let currentLanguage = 'en';
let translations = {};

function loadTranslations(lang) {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'locales', `${lang}.json`));
    translations = JSON.parse(data);
  } catch (error) {
    console.error('Error loading translations:', error);
    const enData = fs.readFileSync(path.join(__dirname, './locales', 'en.json'));
    translations = JSON.parse(enData);
  }
}

let clickSettings = {
  hotkey: 'F6',
  interval: 1000,
  button: 'left',
  clickType: 'single',
  mode: 'current_position',
  customX: 0,
  customY: 0,
  enabled: false
};

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 450,
    height: 530,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    title: 'auto-clicker (electron) 1.0.0',
    icon: path.join(__dirname, 'assets/icon.png'),
    alwaysOnTop: true,
    resizable: false,
    minimizable: true,
    maximizable: false,
    fullscreenable: false,
    backgroundColor: '#1a1a1a',
    show: false,
    autoHideMenuBar: true
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.webContents.send('language-changed', currentLanguage, translations);
  });

}

function createSelectionWindow() {
  const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize;
  
  selectionWindow = new BrowserWindow({
    width: width,
    height: height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    movable: false,
    focusable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  
  selectionWindow.loadFile('src/selection.html');
  selectionWindow.setIgnoreMouseEvents(false);
  
  selectionWindow.once('ready-to-show', () => {
    selectionWindow.show();
    selectionWindow.webContents.send('language-changed', currentLanguage, translations);
  });
  
  return selectionWindow;
}

app.whenReady().then(() => {
  loadTranslations(currentLanguage);
  createMainWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('update-settings', (event, newSettings) => {
  clickSettings = { ...clickSettings, ...newSettings };
  console.log('Settings updated:', clickSettings);
  
  if (clickInterval !== null) {
    clearInterval(clickInterval);
    clickInterval = null;
    if (clickSettings.enabled) {
      startClicker();
    }
  }
});

ipcMain.on('toggle-clicker', (event, enabled) => {
  clickSettings.enabled = enabled;
  
  if (enabled) {
    startClicker();
  } else {
    stopClicker();
  }
  
  mainWindow.webContents.send('clicker-toggled', enabled);
});

ipcMain.on('start-position-selection', () => {
  selectionWindow = createSelectionWindow();
});

ipcMain.on('position-selected', (event, x, y) => {
  if (selectionWindow) {
    selectionWindow.close();
    selectionWindow = null;
  }
  
  clickSettings.customX = x;
  clickSettings.customY = y;
  
  mainWindow.webContents.send('position-updated', x, y);
  
  mainWindow.webContents.send('update-settings', clickSettings);
});

ipcMain.on('cancel-position-selection', () => {
  if (selectionWindow) {
    selectionWindow.close();
    selectionWindow = null;
  }
});

ipcMain.on('register-hotkey', (event, hotkey) => {
  globalShortcut.unregisterAll();
  
  try {
    const registered = globalShortcut.register(hotkey, () => {
      clickSettings.enabled = !clickSettings.enabled;
      
      if (clickSettings.enabled) {
        startClicker();
      } else {
        stopClicker();
      }
      
      mainWindow.webContents.send('clicker-toggled', clickSettings.enabled);
    });
    
    if (registered) {
      console.log(`Hotkey ${hotkey} registered successfully`);
    } else {
      console.error(`Failed to register hotkey ${hotkey}`);
    }
  } catch (error) {
    console.error('Error registering hotkey:', error);
  }
});

ipcMain.on('change-language', (event, lang) => {
  currentLanguage = lang;
  loadTranslations(lang);
  
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('language-changed', currentLanguage, translations);
  });
});

function startClicker() {
  if (clickInterval !== null) {
    clearInterval(clickInterval);
    clickInterval = null;
  }
  
  if (!clickSettings.enabled) return;
  
  console.log('Starting clicker with settings:', clickSettings);
  
  clickInterval = setInterval(() => {
    let x, y;
    
    if (clickSettings.mode === 'current_position') {
      const mousePos = robot.getMousePos();
      x = mousePos.x;
      y = mousePos.y;
    } else {
      x = clickSettings.customX;
      y = clickSettings.customY;
      robot.moveMouse(x, y);
    }
    
    if (clickSettings.clickType === 'single') {
      robot.mouseClick(clickSettings.button);
    } else if (clickSettings.clickType === 'double') {
      robot.mouseClick(clickSettings.button);
      setTimeout(() => {
        robot.mouseClick(clickSettings.button);
      }, 10);
    }
  }, clickSettings.interval);
}

function stopClicker() {
  if (clickInterval !== null) {
    clearInterval(clickInterval);
    clickInterval = null;
  }
}

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  stopClicker();
});