# God's Eye Desktop

An Electron wrapper that turns the browser-based [God's Eye View](https://github.com/bilawalsidhu/gods-eye-view) 3D globe and the [Mission Control](https://github.com/masonerlinger-lab/mission-control) dashboard into native-feeling Windows desktop apps.

## Features
- **Two apps, one codebase**: launch in `globe` mode (God's Eye View) or `mc` mode (Mission Control), each with its own icon, title and taskbar identity.
- **Custom frameless title bar** with minimize, maximize and close buttons, plus F11 fullscreen.
- **Auto-start backends**: if the local server isn't running, the app starts it and waits until it's ready.
- **GPU-tuned**: GPU rasterization, zero-copy and no frame-rate cap in globe mode for a smooth 3D globe.
- **Remembers** window size, position and maximized state. Runs as a single instance and reloads automatically if the page fails to load.

## Tech stack
Electron, Node.js, and a BrowserView with a secure preload bridge (`contextBridge`).

## Setup
```powershell
git clone https://github.com/masonerlinger-lab/gods-eye-desktop
cd gods-eye-desktop
npm install
npx electron . --mode=globe   # or --mode=mc
```
Set `GEV_START_SCRIPT` if your God's Eye View checkout isn't at `~/Apps/gods-eye-view`.
