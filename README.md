# auto-clicker-electron
A customizable auto-clicker application built with Electron, featuring multiple click modes, configurable intervals, hotkey support, and theme switching.

![screenshot](https://github.com/mdapm9di/auto-clicker-electron/blob/main/screenshot.jpg)
## Features
- Customizable hotkey support (F6 by default)
- Configurable click intervals (hours, minutes, seconds, milliseconds)
- Multiple mouse button support (left, right, middle)
- Different click types (single, double)
- Position modes (current cursor position or custom coordinates)
- Theme switching (light/dark mode)
- Multi-language support (English and Russian)
- Visual position selection tool
- Persistent settings storage
- Cross-platform compatibility (Windows, macOS, Linux)

## Installation
### Prerequisites
- Node.js (v14 or higher recommended)
- npm or yarn package manager
### Steps
1. Clone or download this project
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
Built applications will be available in the `dist` folder.
## Usage
1. **Set Hotkey**: Click on the hotkey input field and press your desired key combination
2. **Configure Interval**: Set the desired click interval using the time inputs
3. **Select Mouse Button**: Choose which mouse button to simulate
4. **Choose Click Type**: Select between single or double click
5. **Set Position Mode**:
   - "Current": Clicks at the current cursor position
   - "Custom": Allows selecting a specific screen coordinate
6. **Toggle Theme**: Use the theme button to switch between light and dark modes
7. **Select Language**: Use the dropdown to switch between English and Russian
8. **Enable/Disable**: Toggle the auto-clicker with the button or your configured hotkey
## Project Structure
```
├── main.js              # Main Electron process
├── index.html           # Main window UI
├── selection.html       # Position selection overlay
├── src/
│   ├── js/
│   │   └── renderer.js  # Renderer process logic
│   └── styles/
│       ├── main.css     # Main window styles
│       └── selection.css # Selection overlay styles
├── locales/             # Translation files (en.json, ru.json)
├── assets/              # Application icons
└── data/                # Settings storage (created automatically)
```
## Settings Persistence
The application automatically saves your settings to a config.json file in the user data directory:
- Windows: `%APPDATA%/auto-clicker-electron/data/config.json`
- macOS: `~/Library/Application Support/auto-clicker-electron/data/config.json`
- Linux: `~/.config/auto-clicker-electron/data/config.json`
## Troubleshooting
### Common Issues
1. **RobotJS installation fails**:
   - Ensure you have Python and build tools installed
   - Windows: Install Visual Studio Build Tools with C++ support
   - macOS: Install Xcode Command Line Tools
   - Linux: Install build-essential and other development tools
2. **Application won't start**:
   - Try deleting the `node_modules` folder and running `npm install` again
3. **Hotkey not working**:
   - Some hotkey combinations may be reserved by the operating system
   - Try using a different hotkey combination
### Development Tips
- To enable debugging, uncomment the DevTools line in main.js
- Check the console for error messages if the application behaves unexpectedly
## License
MIT License - see LICENSE file for details
## Changelog
### v1.0.2
- Added theme switching (light/dark mode)
- Improved settings persistence with debouncing
- Updated to @jitsi/robotjs for better compatibility
- Enhanced UI with theme-aware styling
- Better error handling and file path resolution
### v1.0.1
- Added settings persistence
- Improved error handling
- Enhanced multi-language support
- Fixed various bugs
### v1.0.0
- Initial release
- Basic auto-clicker functionality
- Multi-language interface
- Hotkey support

