const {app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow
let newProductWindow

if(process.env.NODE_ENV !== 'production'){
    require('electron-reload')(__dirname,{
        electron: path.join(__dirname,'../node_modules','.bin','electron')
    })
}

app.on('ready', () =>{
    mainWindow =  new BrowserWindow({width: 720, height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname,'views/index.html'),
        protocol: 'file',
        slashes: true
    }))

    const mainMenu = Menu.buildFromTemplate(templateMenu);
    Menu.setApplicationMenu(mainMenu);

    mainWindow.on('closed', ()=> {
        app.quit();
    });

});

function createNewProductWindows(){
    newProductWindow = new BrowserWindow({
        width: 400,
        height: 300,
        title: 'Add A New Product',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    //newProductWindow.setMenu(null);
    newProductWindow.loadURL(url.format({
        pathname: path.join(__dirname,'views/new-product.html'),
        protocol: 'file',
        slashes: true
    }))
    newProductWindow.on('closed', ()=> {
        newProductWindow = null;
    });
}

// Ipc Renderer Events
ipcMain.on('product:new', (e, newProduct) => {
    // send to the Main Window
    console.log(newProduct);
    mainWindow.webContents.send('product:new', newProduct);
    newProductWindow.close();
  });


const templateMenu = [
     {
         label: 'File',
         submenu:[
             {
                 label: 'New Product',
                 accelerator: 'Ctrl+N',
                 click(){
                    createNewProductWindows()
                 }                 
             },
             {
                label: 'Remove All Products',
                click() {
                    mainWindow.webContents.send('products:remove-all');
                  }
             },
             {
                label: 'Exit',
                accelerator: process.platform == 'darwin' ? 'command+Q' : 'Ctrl+Q',
                click(){
                   app.quit();
                }
             }
         ]
     }
];

if(process.platform === 'darwin'){
    templateMenu.unshift({
        label: app.getName()
    });
}

if(process.env.NODE_ENV !== 'production'){
    templateMenu.push({
        label: 'DevTools',
        submenu: [
            {
                label: 'Show/Hide Dev Tools',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}