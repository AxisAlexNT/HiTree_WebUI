import { join } from "path";
import { format } from "url";
import { app, BrowserWindow } from "electron";

const isDev = process.env.npm_lifecycle_event === "app:dev" ? true : false;

console.log("main.[ts|js]: __dirname is " + __dirname);

console.log("index.html path is " + join(__dirname, "../../../index.html"));
console.log("preload.js path is " + join(__dirname, "../preload/preload.js"));

const urlFormatted = format({
  pathname: join(__dirname, "../../../index.html"),
  protocol: "file:",
  slashes: true,
});

const preloadURLFormatted = format({
  pathname: join(__dirname, "../preload/preload.js"),
  protocol: "file:",
  slashes: true,
});

console.log("urlFormatted is ", urlFormatted);

console.log("isDev is " + isDev);

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 1024,
    webPreferences: {
      preload: preloadURLFormatted,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(isDev ? "http://localhost:8080" : urlFormatted);
  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
