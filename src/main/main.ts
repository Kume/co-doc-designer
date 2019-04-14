import { app, BrowserWindow, Menu } from 'electron';
import * as _ from 'underscore';

const isDevelopment = process.env.NODE_ENV !== 'production';

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') { app.quit(); }
});

app.on('ready', function() {
  const template = [{
    label: 'Application',
    submenu: [
      { role: 'quit' }
    ]}, {
    label: 'Edit',
    submenu: [
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
    ]},
    {
      label: 'View',
      submenu: _.compact([
        isDevelopment && { role: 'toggledevtools' },
      ])
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  let mainWindow: BrowserWindow | null = new BrowserWindow({width: 800, height: 600});
  const url = isDevelopment
    ? `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
    : 'file://' + __dirname + '/index.html';
  mainWindow.loadURL(url);

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});
