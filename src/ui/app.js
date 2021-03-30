const productForm = document.getElementById('productForm');

const { remote } = require('electron')
const main = remote.require('./main')
const { ipcRenderer } = require('electron');
 

const productName = document.getElementById('name');
const productPrice = document.getElementById('price');
const productDescription = document.getElementById('description');
const productsList = document.getElementById('products')

// UPDATE PART
const notification = document.getElementById('notification');
const message = document.getElementById('message');
const restartButton = document.getElementById('restart-button');

ipcRenderer.on('update_available', () => {
    ipcRenderer.removeAllListeners('update_available');
    message.innerText = 'A new update is available. Downloading now...';
    notification.classList.remove('hidden');
});
ipcRenderer.on('update_downloaded', () => {
    ipcRenderer.removeAllListeners('update_downloaded');
    message.innerText = 'Update Downloaded. It will be installed on restart. Restart now?';
    restartButton.classList.remove('hidden');
    notification.classList.remove('hidden');
});


function closeNotification() {
    notification.classList.add('hidden');
}
function restartApp() {
    ipcRenderer.send('restart_app');
}

// UPDATE PART ^

let products = []
let editingStatus = false;
let editProductId;


productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newProduct = {
        name: productName.value,
        price: productPrice.value,
        description: productDescription.value
    
    }
    if (!editingStatus) {
        const result = await main.createProduct(newProduct)
        console.log(result);
    } else {
        const productUpdated = await main.updateProduct(editProductId, newProduct);
        console.log(productUpdated);

        editingStatus = false;
        editProductId = "";
    }

        productForm.reset();
        productName.focus();


    getProducts();

});

async function deleteProduct(id) {
    await main.deleteProduct(id)
    await getProducts();
};

async function editProduct(id) {
    const product = await main.getProductById(id)
    productName.value = product.name;
    productPrice.value = product.price;
    productDescription.value = product.description;

    editingStatus = true;
    editProductId = id;
}

function renderProducts(tasks) {
    productsList.innerHTML = "";
    products.forEach(product => {
        productsList.innerHTML += `
            <div class="card card-body my-2 animated fadeInLeft">
                <h4>${product.name}</h4>
                <p>${product.description}</p>
                <h3>${product.price}</h3>
                <p>
                    <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">
                        DELETE
                    </button>
                    <button class="btn btn-secondary" onclick="editProduct('${product.id}')">
                        EDIT
                    </button>
                </p>
            </div>
        `;
    })
}



const getProducts = async () => {
    products = await main.getProducts();
    renderProducts(products);
};
  
async function init() {
    getProducts();
}
  
init();
  

