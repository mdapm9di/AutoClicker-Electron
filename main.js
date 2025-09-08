const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const robot = require('@jitsi/robotjs');
const fs = require('fs');

app.commandLine.appendSwitch('disable-http-cache');
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');

let mainWindow;
let selectionWindow;
let clickInterval = null;
let currentLanguage = 'en';
let currentTheme = 'dark';
let translations = {};

const defaultSettings = {
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

let clickSettings = { ...defaultSettings };
let saveTimeout = null;

function loadSettings() {
  try {
    const dataDir = path.join(app.getPath('userData'), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const filePath = path.join(dataDir, 'config.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const savedSettings = JSON.parse(data);
      
      return { ...defaultSettings, ...savedSettings };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return { ...defaultSettings };
}

function saveSettings(settings) {
  try {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      try {
        const dataDir = path.join(app.getPath('userData'), 'data');
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        
        const filePath = path.join(dataDir, 'config.json');
        
        const settingsToSave = { ...settings };
        delete settingsToSave.enabled;
        
        fs.writeFileSync(filePath, JSON.stringify(settingsToSave, null, 2));
        console.log('Settings saved to:', filePath);
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    }, 500);
  } catch (error) {
    console.error('Error setting save timeout:', error);
  }
}

function saveSettingsImmediately(settings) {
  try {
    clearTimeout(saveTimeout);
    const dataDir = path.join(app.getPath('userData'), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const filePath = path.join(dataDir, 'config.json');
    
    const settingsToSave = { ...settings };
    delete settingsToSave.enabled;
    
    fs.writeFileSync(filePath, JSON.stringify(settingsToSave, null, 2));
    console.log('Settings immediately saved to:', filePath);
  } catch (error) {
    console.error('Error immediately saving settings:', error);
  }
}

function loadTranslations(lang) {
  try {
    let translationsPath;
    
    if (app.isPackaged) {
      const possiblePaths = [
        path.join(process.resourcesPath, 'locales', `${lang}.json`),
        path.join(process.resourcesPath, '..', 'locales', `${lang}.json`),
        path.join(process.resourcesPath, 'app', 'locales', `${lang}.json`),
        path.join(__dirname, 'locales', `${lang}.json`),
        path.join(__dirname, '..', 'locales', `${lang}.json`)
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
      translationsPath = path.join(__dirname, 'locales', `${lang}.json`);
    }
    
    const data = fs.readFileSync(translationsPath);
    translations = JSON.parse(data);
  } catch (error) {
    console.error('Error loading translations:', error);
    try {
      let enPath;
      
      if (app.isPackaged) {
        const possiblePaths = [
          path.join(process.resourcesPath, 'locales', 'en.json'),
          path.join(process.resourcesPath, '..', 'locales', 'en.json'),
          path.join(process.resourcesPath, 'app', 'locales', 'en.json'),
          path.join(__dirname, 'locales', 'en.json'),
          path.join(__dirname, '..', 'locales', 'en.json')
        ];
        
        for (const possiblePath of possiblePaths) {
          if (fs.existsSync(possiblePath)) {
            enPath = possiblePath;
            break;
          }
        }
      } else {
        enPath = path.join(__dirname, 'locales', 'en.json');
      }
      
      if (enPath && fs.existsSync(enPath)) {
        const enData = fs.readFileSync(enPath);
        translations = JSON.parse(enData);
      } else {
        throw new Error('English translation file not found');
      }
    } catch (e) {
      console.error('Error loading English translations:', e);
      translations = {};
    }
  }
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 450,
    height: 530,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    title: 'auto-clicker-electron',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    alwaysOnTop: true,
    resizable: false,
    minimizable: true,
    maximizable: false,
    fullscreenable: false,
    backgroundColor: currentTheme === 'dark' ? '#1a1a1a' : '#ffffff',
    show: false,
    autoHideMenuBar: true
  });

  if (app.isPackaged) {
    const possiblePaths = [
      path.join(process.resourcesPath, 'index.html'),
      path.join(process.resourcesPath, '..', 'index.html'),
      path.join(process.resourcesPath, 'app', 'index.html'),
      path.join(__dirname, 'index.html'),
      path.join(__dirname, '..', 'index.html')
    ];
    
    let htmlPath;
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        htmlPath = possiblePath;
        break;
      }
    }
    
    if (htmlPath) {
      mainWindow.loadFile(htmlPath);
    } else {
      console.error('Index.html not found in any of the expected locations');
      mainWindow.loadURL(`data:text/html;charset=utf-8,
        <html><body>
          <h1>Error</h1>
          <p>Application files not found. Please reinstall the application.</p>
        </body></html>
      `);
    }
  } else {
    mainWindow.loadFile('index.html');
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    mainWindow.webContents.send('settings-loaded', clickSettings);
    mainWindow.webContents.send('language-changed', clickSettings.language, translations);
    mainWindow.webContents.send('theme-changed', clickSettings.theme);
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
  
  if (app.isPackaged) {
    const possiblePaths = [
      path.join(process.resourcesPath, 'src', 'selection.html'),
      path.join(process.resourcesPath, '..', 'src', 'selection.html'),
      path.join(process.resourcesPath, 'app', 'src', 'selection.html'),
      path.join(__dirname, 'src', 'selection.html'),
      path.join(__dirname, '..', 'src', 'selection.html')
    ];
    
    let htmlPath;
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        htmlPath = possiblePath;
        break;
      }
    }
    
    if (htmlPath) {
      selectionWindow.loadFile(htmlPath);
    } else {
      console.error('Selection.html not found in any of the expected locations');
      selectionWindow.loadURL(`data:text/html;charset=utf-8,
        <html><body>
          <h1>Error</h1>
          <p>Selection screen files not found. Please reinstall the application.</p>
        </body></html>
      `);
    }
  } else {
    selectionWindow.loadFile('src/selection.html');
  }
  
  selectionWindow.setIgnoreMouseEvents(false);
  
  selectionWindow.once('ready-to-show', () => {
    selectionWindow.show();
    selectionWindow.webContents.send('language-changed', currentLanguage, translations);
    selectionWindow.webContents.send('theme-changed', currentTheme);
  });
  
  return selectionWindow;
}

app.whenReady().then(() => {
  clickSettings = loadSettings();
  currentLanguage = clickSettings.language;
  currentTheme = clickSettings.theme;
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
  
  saveSettings(clickSettings);
  
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
  saveSettings(clickSettings);
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
  
  saveSettings(clickSettings);
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
      saveSettings(clickSettings);
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
  clickSettings.language = lang;
  
  saveSettingsImmediately(clickSettings);
  
  loadTranslations(lang);
  
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('language-changed', currentLanguage, translations);
  });
});

ipcMain.on('change-theme', (event, theme) => {
  currentTheme = theme;
  clickSettings.theme = theme;
  
  saveSettings(clickSettings);
  
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('theme-changed', currentTheme);
  });
});

ipcMain.on('get-initial-settings', (event) => {
  event.reply('settings-loaded', clickSettings);
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
  clearTimeout(saveTimeout);
});