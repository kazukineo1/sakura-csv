// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  invoke: (channel, data) => {
    return ipcRenderer.invoke(channel, data);
  },
});
