const { BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

class WindowManager {
  createMainWindow(theme) {
    const mainWindow = new BrowserWindow({
      width: 450,
      height: 525,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      title: 'auto-clicker-electron',
      icon: path.join(__dirname, '..', '..', '..', 'assets', 'icon.png'),
      alwaysOnTop: true,
      resizable: false,
      minimizable: true,
      maximizable: false,
      fullscreenable: false,
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
      show: false,
      autoHideMenuBar: true
    });

    const htmlPath = this.findHtmlPath('../index.html');
    mainWindow.loadFile(htmlPath);

    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
    });
    
    return mainWindow;
  }

  createSelectionWindow() {
    const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize;
    
    const selectionWindow = new BrowserWindow({
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
    
    // Исправленный путь - убрали src/ из пути
    const htmlPath = this.findHtmlPath('../selection.html');
    selectionWindow.loadFile(htmlPath);
    
    selectionWindow.setIgnoreMouseEvents(false);
    
    selectionWindow.once('ready-to-show', () => {
      selectionWindow.show();
    });
    
    return selectionWindow;
  }

  findHtmlPath(filename) {
    const app = require('electron').app;
    
    if (app.isPackaged) {
      const possiblePaths = [
        path.join(process.resourcesPath, filename),
        path.join(process.resourcesPath, '..', filename),
        path.join(process.resourcesPath, 'app', filename),
        path.join(__dirname, '..', '..', '..', filename),
        path.join(__dirname, '..', '..', filename)
      ];
      
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          return possiblePath;
        }
      }
      
      console.error(`${filename} not found in any of the expected locations`);
      return this.createErrorWindow('Application files not found. Please reinstall the application.');
    } else {
      // В режиме разработки используем прямой путь к файлу
      return path.join(__dirname, '..', '..', filename);
    }
  }

  createErrorWindow(message) {
    const errorWindow = new BrowserWindow({
      width: 400,
      height: 200,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });
    
    errorWindow.loadURL(`data:text/html;charset=utf-8,
      <html><body>
        <h1>Error</h1>
        <p>${message}</p>
      </body></html>
    `);
    
    return errorWindow;
  }
}

module.exports = WindowManager;