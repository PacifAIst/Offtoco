// desktop/preload.js
'use strict';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('offtoco', {
  onResults:       (cb) => ipcRenderer.on('results', (_e, data) => cb(data)),
  close:           ()   => ipcRenderer.send('close-popup'),
  copy:            (t)  => ipcRenderer.invoke('copy-to-clipboard', t),
  openExternal:    (u)  => ipcRenderer.invoke('open-external', u),
});
