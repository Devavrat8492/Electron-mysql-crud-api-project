const {BrowserWindow, Notification} = require('electron')
const {getConnection} = require('./database')
const { autoUpdater } = require('electron-updater');
const { app, ipcMain } = require('electron');



async function createProduct(product) {
    try {
        
        const conn = await getConnection();
        product.price = parseFloat(product.price)
        const result = await conn.query('INSERT INTO product SET ?', product)
        
        new Notification({
            title:'New Notification',
            body: 'New Product Has Been Saved Successfully'
        }).show();

        product.id = result.insertId;
        return product;

    } catch (error) {
        console.log(error)
    }
}


async function getProducts() {
    const conn = await getConnection();
    const results = await conn.query('SELECT * FROM product ORDER BY id DESC')
    console.log(results)
    return results;
} 

async function deleteProduct(id) {
    const conn = await getConnection();
    const result = await conn.query('DELETE FROM product WHERE id = ?',id)
    return result;
}

async function getProductById(id) {
    const conn = await getConnection();
    const result = await conn.query('SELECT * FROM product WHERE id = ?',id)
    return result[0];
}

async function updateProduct(id, product) {
    const conn = await getConnection();
    const result = await conn.query('UPDATE product SET ? WHERE id = ?', [product, id])
    console.log(result)
} 

let window

function createWindow() {
    window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true,
            contextIsolation: false,
        }

    })
    window.loadFile('src/ui/index.html');
    // <--------- UPDATE PART -------->
    window.once('ready-to-show', () => {
        autoUpdater.checkForUpdatesAndNotify();
      });
}


// UPDATE PART
ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {
  window.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
  window.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});
// UPDATE PART ^


module.exports = {
    createWindow,
    createProduct,
    getProducts,
    deleteProduct,
    getProductById,
    updateProduct
}