import path from 'node:path'
import process from 'node:process'

import { BrowserWindow, Menu, Tray, app, nativeImage } from 'electron'
import started from 'electron-squirrel-startup'

import { DEV } from './const'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit()
}

const icon = nativeImage.createFromPath(
  DEV
    ? path.join(process.cwd(), 'buildAssets/icons/icon.png')
    : path.join(app.getAppPath(), '..', 'icon.png'),
)

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    icon,
    autoHideMenuBar: true,
  })

  mainWindow.removeMenu()

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.setTitle('网易云音乐')
  mainWindow.on('page-title-updated', (_, title) => {
    mainWindow?.setTitle(title)
  })

  // and load the index.html of the app.
  // if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
  //   mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  //   // Open the DevTools.
  //   mainWindow.webContents.openDevTools()
  // } else {
  //   mainWindow.loadFile(
  //     path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
  //   )
  // }

  mainWindow.loadURL('https://music.163.com/st/webplayer')
  if (DEV) {
    mainWindow.webContents.openDevTools()
  }
}

function createTray() {
  tray = new Tray(icon)
  tray.setToolTip('网易云音乐')

  const contextMenu = Menu.buildFromTemplate([
    { label: '显示窗口', click: () => mainWindow?.show() },
    { label: '退出', click: () => app.quit() },
  ])

  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    mainWindow?.show()
  })
}

app.on('before-quit', () => {
  isQuitting = true
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createTray()
  createWindow()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
