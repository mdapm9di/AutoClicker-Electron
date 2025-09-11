# AutoClicker
![README-ru.md](https://github.com/mdapm9di/AutoClicker/blob/main/README-ru.md)

![screenshot](https://github.com/mdapm9di/AutoClicker/blob/main/preview.jpg)

## Appeal to all
This app is a personal project that I am creating for myself. I would be happy if it was useful to someone else, and I am always open to suggestions on how to improve it. Any help and constructive criticism is most welcome
## Features
- Customizable hotkey (default: F6)
- Adjustable click intervals (hours, minutes, seconds, milliseconds)
- Multiple mouse button support (left, right, middle)
- Different click types (single, double)
- Positioning modes (current cursor position or custom coordinates)
- Repeat options (until stopped or timed duration)
- Theme switching (light/dark)
- Multi-language support (English and Russian)
- Visual position selection tool
- Settings persistence
- Cross-platform compatibility (Windows, macOS, Linux)
## Installation
### Prerequisites
- Node.js (version 14 or higher recommended)
- npm or yarn package manager
### Steps
1. Clone or download the project
2. Navigate to the project directory in terminal/command prompt
3. Install dependencies:
```bash
npm install
```
## Running the Application
To start the application in development mode:
```bash
npm start
```
## Building for Distribution
To create executable files for your platform:
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
Built applications will be available in the `dist` folder.
## Usage
1. **Set Hotkey**: Click the hotkey input field and press your desired key combination
2. **Configure Interval**: Set desired click interval using time input fields
3. **Select Mouse Button**: Choose which mouse button to simulate
4. **Choose Click Type**: Select between single or double click
5. **Set Position Mode**:
   - "Current": Clicks at current cursor position
   - "Custom": Allows selecting specific screen coordinates
6. **Set Repeat Option**:
   - "Repeat until stopped": Continuous clicking
   - "Repeat for time": Clicks for specified duration (seconds)
7. **Toggle Theme**: Use theme button to switch between light and dark themes
8. **Select Language**: Use dropdown to switch between English and Russian
9. **Enable/Disable**: Toggle auto-clicker with button or configured hotkey
## Project Structure
```
├── main.js                    
├── index.html                 
├── selection.html             
├── src/
│   ├── js/
│   │   ├── main/               
│   │   │   ├── settingsManager.js
│   │   │   ├── translationManager.js
│   │   │   ├── clickerManager.js
│   │   │   └── windowManager.js
│   │   └── renderer/         
│   │       ├── mainWindow.js
│   │       └── selectionWindow.js
│   ├── styles/
│   │   ├── main.css
│   │   └── selection.css
│   └── locales/
│       ├── en.json
│       └── ru.json
├── assets/                    
└── package.json
```
## Settings Persistence
The application automatically saves your settings to config.json in the user data directory:
- Windows: `%APPDATA%/AutoClicker/data/config.json`
- macOS: `~/Library/Application Support/AutoClicker/data/config.json`
- Linux: `~/.config/AutoClicker/data/config.json`
## Troubleshooting
### Common Issues
1. **RobotJS Installation Error**:
   - Ensure Python and build tools are installed
   - Windows: Install Visual Studio Build Tools with C++ support
   - macOS: Install Xcode Command Line Tools
   - Linux: Install build-essential and other development tools
2. **Application Won't Start**:
   - Try deleting `node_modules` folder and running `npm install` again
3. **Hotkey Not Working**:
   - Some key combinations may be reserved by the operating system
   - Try using a different key combination
### Development Tips
- Check console for error messages if application behaves unexpectedly
- Ensure all file paths are correctly referenced in both development and production environments
## License
MIT License - see LICENSE file for details
## Changelog
### v1.0.4
**Full Changelog**: https://github.com/mdapm9di/AutoClicker/commits/1.0.4
- Added repeat duration option with time-based auto-stop
- Enhanced UI for repeat options with better visual feedback
- Improved settings management for new duration field
- Updated translation files for new features
### v1.0.3
**Full Changelog**: https://github.com/mdapm9di/AutoClicker/commits/1.0.3
- Code refactoring: modular architecture for better maintainability
- Improved settings and translation management
- Optimized window creation and management
### v1.0.2
**Full Changelog**: https://github.com/mdapm9di/AutoClicker/commits/1.0.2
- Added theme switching (light/dark)
- Improved settings saving with debouncing
- Updated to @jitsi/robotjs for better compatibility
- Enhanced UI with theme awareness
- Improved error handling and file path resolution
### v1.0.1
**Full Changelog**: https://github.com/mdapm9di/AutoClicker/commits/1.0.1
- Added settings persistence
- Enhanced error handling
- Improved multi-language support
- Various bug fixes
### v1.0.0
**Full Changelog**: https://github.com/mdapm9di/AutoClicker/commits/1.0.0
- Initial release
- Basic auto-clicker functionality
- Multi-language interface
- Hotkey support
