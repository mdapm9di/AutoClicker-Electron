# auto-clicker-electron
Auto-clicker with advanced settings, built on Electron. Supports multiple click modes, custom intervals, theme switching and multilingual interface.

![screenshot](https://github.com/mdapm9di/auto-clicker-electron/blob/main/screenshot.jpg)
### Appeal to all
This app is a personal project that I am creating for myself. I would be happy if it was useful to someone else, and I am always open to suggestions on how to improve it. Any help and constructive criticism is most welcome
## Features
- Customizable hotkey (default F6)
- Customizable click interval (hours, minutes, seconds, milliseconds)
- Multiple mouse buttons (left, right, middle)
- Different click types (single, double)
- Positioning modes (current cursor position or selected coordinates)
- Theme switching (light/dark)
- Multilingual support (English and Russian)
- Visual position selection tool
- Save settings
- Cross-platform (Windows, macOS, Linux)
## Installation
### Prerequisites
- Node.js (version 14 or higher recommended)
- npm or yarn
### Steps
1. Clone or download the project
2. Go to the project directory in the terminal/command line
3. Install dependencies:
```bash
npm install
```
## Run the application
To run the application in development mode:
```bash
npm start
```
## Build for distribution
To build executables for your platform:
```bash
# For Windows
npm run build-win

# For macOS
npm run build-mac

# For Linux
npm run build-linux

# For all platforms
npm run build
```
The built applications will be available in the `dist` folder.
## Usage
1. **Set Hotkey**: Click on the hotkey input field and press the desired key combination
2. **Configure Interval**: Set the desired click interval using the time input fields
3. **Select Mouse Button**: Choose which mouse button to simulate
4. **Select Click Type**: Choose between single or double click
5. **Set Position Mode**:
- "Current": Clicks at the current cursor position
- "Selected": Allows you to select specific coordinates on the screen
6. **Switch Theme**: Use the theme button to switch between light and dark themes
7. **Select Language**: Use the dropdown to switch between English and Russian
8. **Turn On/Off**: Toggle the autoclicker with a button or a configured hotkey
## Project Structure
```
├── main.js # Main Process Electron
├── index.html # Main UI window
├── selection.html # Position selection window
├── src/
│ ├── js/
│ │ ├── main/ # Main process modules
│ │ │ ├── settingsManager.js
│ │ │ ├── translationManager.js
│ │ │ ├── clickerManager.js
│ │ │ └── windowManager.js
│ │ └── renderer/ # Render process modules
│ │ ├── mainWindow.js
│ │ └── selectionWindow.js
│ ├── styles/
│ │ ├── main.css
│ │ └── selection.css
│ └── locales/
│ ├── en.json
│ └── ru.json
├── assets/ # Application icons
└── package.json
```
## Saving settings
The application automatically saves your settings to the config.json file in the user data directory:
- Windows: `%APPDATA%/auto-clicker-electron/data/config.json`
- macOS: `~/Library/Application Support/auto-clicker-electron/data/config.json`
- Linux: `~/.config/auto-clicker-electron/data/config.json`
## Troubleshooting
### Common issues
1. **RobotJS installation error**:
- Make sure Python and build tools are installed
- Windows: Install Visual Studio Build Tools with C++ support
- macOS: Install Xcode Command Line Tools
- Linux: Install build-essential and other development tools
2. **Application does not start**:
- Try deleting the `node_modules` folder and running `npm install` again
3. **Hotkey not working**:
- Some key combinations may be occupied by the operating system
- Try using a different key combination
### Development tips
- To enable debugging uncomment DevTools line in main.js
- Check console for error messages if app behaves unexpectedly
## License
MIT License - see LICENSE file for details
## Changelog
### v1.0.3
- Code refactoring: split into modules for better maintainability
- Improved settings and translations management
- Optimized window creation and management
### v1.0.2
- Added theme switching (light/dark)
- Improved settings saving with debounce
- Updated to @jitsi/robotjs for better compatibility
- Improved theme-aware UI
- Improved error handling and file path resolution
### v1.0.1
- Added settings saving
- Improved error handling
- Improved multilingual support
- Various bug fixes
### v1.0.0
- Initial release
- Core functionality autoclicker
- Multilingual interface
- Hotkey support
