const { globalShortcut, ipcMain } = require('electron');

class ClickerManager {
  constructor(robot) {
    this.robot = robot;
    this.clickInterval = null;
    this.stopTimer = null;
    this.currentHotkey = null;
    this.onAutoStopCallback = null;
  }

  start(settings) {
    this.stop();
    
    if (!settings.enabled) return;
    
    this.clickInterval = setInterval(() => {
      let x, y;
      
      if (settings.mode === 'current_position') {
        const mousePos = this.robot.getMousePos();
        x = mousePos.x;
        y = mousePos.y;
      } else {
        x = settings.customX;
        y = settings.customY;
        this.robot.moveMouse(x, y);
      }
      
      if (settings.clickType === 'single') {
        this.robot.mouseClick(settings.button);
      } else if (settings.clickType === 'double') {
        this.robot.mouseClick(settings.button);
        setTimeout(() => {
          this.robot.mouseClick(settings.button);
        }, 10);
      }
    }, settings.interval);

    // Добавляем таймер для автоматической остановки
    if (settings.repeatOption === 'repeat_for_time') {
      this.stopTimer = setTimeout(() => {
        this.stop();
        if (this.onAutoStopCallback) {
          this.onAutoStopCallback();
        }
      }, settings.repeatDuration * 1000);
    }
  }

  stop() {
    if (this.clickInterval !== null) {
      clearInterval(this.clickInterval);
      this.clickInterval = null;
    }
    
    if (this.stopTimer !== null) {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }
  }

  toggle(enabled, settings) {
    if (enabled) {
      this.start(settings);
    } else {
      this.stop();
    }
  }

  restartIfNeeded(settings) {
    if (this.clickInterval !== null) {
      this.stop();
      if (settings.enabled) {
        this.start(settings);
      }
    }
  }

  registerHotkey(hotkey, callback) {
    globalShortcut.unregisterAll();
    
    try {
      const registered = globalShortcut.register(hotkey, callback);
      
      if (registered) {
        this.currentHotkey = hotkey;
        console.log(`Hotkey ${hotkey} registered successfully`);
      } else {
        console.error(`Failed to register hotkey ${hotkey}`);
      }
    } catch (error) {
      console.error('Error registering hotkey:', error);
    }
  }

  onAutoStop(callback) {
    this.onAutoStopCallback = callback;
  }
}

module.exports = ClickerManager;