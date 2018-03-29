import { app, BrowserWindow } from 'electron';

const isDevelopment = process.env.NODE_ENV !== 'production';

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') { app.quit(); }
});

app.on('ready', function() {
  let mainWindow: BrowserWindow | null = new BrowserWindow({width: 800, height: 600});
  const url = isDevelopment
    ? `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
    : 'file://' + __dirname + '/build/index.html';
  mainWindow.loadURL(url);

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});
