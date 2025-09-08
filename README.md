## auto-clicker-electron
A customizable auto-clicker application built with Electron, featuring multiple click modes, configurable intervals, and hotkey support.

![Appearance of the application](https://github.com/mdapm9di/auto-clicker-electron/blob/main/screenshot.jpg)

## Features
- Customizable hotkey support (F6 by default)
- Configurable click intervals (hours, minutes, seconds, milliseconds)
- Multiple mouse button support (left, right, middle)
- Different click types (single, double)
- Position modes (current cursor position or custom coordinates)
- Multi-language support (English and Russian)
- Visual position selection tool
- Persistent settings
## Installation
1. Ensure you have Node.js installed on your system
2. Clone or download this project
3. Navigate to the project directory in terminal/command prompt
4. Install dependencies:
```
npm install
```
## Running the Application
To start the application in development mode:
``
npm start
``
## Building for Distribution
To build executables for your platform:
```
# For Windows
npm run build-win
# For macOS
npm run build-mac
# For Linux
npm run build-linux
# For all platforms
npm run build
```
Built applications will be available in the dist folder.
## Usage
1. Set Hotkey: Click on the hotkey input field and press your desired key combination
2. Configure Interval: Set the desired click interval using the time inputs
3. Select Mouse Button: Choose which mouse button to simulate
4. Choose Click Type: Select between single or double click
5. Set Position Mode:
- "Current": Clicks at the current cursor position
- "Custom": Allows selecting a specific screen coordinate
6. Enable/Disable: Toggle the auto-clicker with the button or your configured hotkey
## Project Structure
```
├── main.js              # Main Electron process
├── index.html           # Main window UI
├── selection.html       # Position selection overlay
├── src/
│   ├── js/
│   │   └── renderer.js  # Renderer process logic
│   └── styles/
│       ├── main.css      # Main window styles
│       └── selection.css # Selection overlay styles
├── locales/              # Translation files
└── assets/               # Application icons
```
## Requirements
- Node.js (v14 or higher recommended)
- npm or yarn package manager
## Troubleshooting
If you encounter issues with robotjs (the module that handles mouse actions), you may need to install additional build tools:
- Windows: Visual Studio Build Tools with C++ support
- macOS: Xcode Command Line Tools
- Linux: Python, make, GCC, and other build essentials






