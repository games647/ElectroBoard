const electron = require('electron')

// Module to control application life.
const {app, globalShortcut} = require('electron');
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1200, height: 600});

  // and load the i.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  //hide the menu items for fullscreen usage
  mainWindow.setMenu(null);

  mainWindow.maximize();

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();

  app.on('browser-window-focus', () => {
    globalShortcut.register('F11', () => {
      mainWindow.setFullScreen(!mainWindow.isFullScreen())
    });

    globalShortcut.register('F12', () => {
      mainWindow.webContents.toggleDevTools();
    });
  });

  app.on('browser-window-blur', () => {
    globalShortcut.unregister('F11');
    globalShortcut.unregister('F12');
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
app.on('ready', () => {
  mainWindow.webContents.on('did-finish-load', () => {
    var fs = require('fs');

    fs.readFile('config.json', 'utf8', (err, data) => {
      if (err) {
        return console.log(err);
      }

      var config = JSON.parse(data);
      mainWindow.webContents.send('config-loaded', config);
    });
  });
})