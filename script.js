// ================== ESTADO DE LA APLICACIÓN ==================
let cart = [];
let currentProduct = null;
let products = [];

// ================== ELEMENTOS DEL DOM ==================
const cartIcon = document.getElementById('cart-icon');
const cartModal = document.getElementById('cart-modal');
const closeCart = document.querySelector('.close-cart');
const cartItems = document.getElementById('cart-items');
const emptyCart = document.getElementById('empty-cart');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.querySelector('.cart-count');
const productModal = document.getElementById('product-modal');
const closeModal = document.querySelector('.close-modal');
const checkoutBtn = document.getElementById('checkout-btn');
const searchInput = document.getElementById('search-input');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navMenu = document.querySelector('.nav-menu');
const addCartModalBtn = document.getElementById('add-to-cart-modal');
const decreaseBtn = document.getElementById('decrease-quantity');
const increaseBtn = document.getElementById('increase-quantity');
const quantityInput = document.getElementById('product-quantity');
const featuredGrid = document.getElementById('featured-grid');

// ================== INICIALIZACIÓN 
document.addEventListener('DOMContentLoaded', function () {
    initApp();
});

async function initApp() {
    await loadProductsFromAPI();
    loadCartFromStorage();
    updateCartUI();
    renderProducts(products);
    setupEventListeners();
}

async function loadProductsFromAPI() {
    try {
        const response = await fetch('http://localhost:3000/api/products');
        if (!response.ok) throw new Error('Error al cargar productos');
        products = await response.json();
        console.log('Productos cargados desde el back-end:', products.length);
    } catch (error) {
        console.error('Error:', error);
        products = [
            { id: 1, name: "Error de conexión", price: 0, description: "No se pudo cargar productos desde el servidor.", image: "", category: "error" }
        ];
    }
}

// ================== EVENT LISTENERS ==================
function setupEventListeners() {
    // === CARRITO ===
    cartIcon.addEventListener('click', openCart);
    closeCart.addEventListener('click', closeCartModal);

    // === MODAL DE PRODUCTO ===
    closeModal.addEventListener('click', closeProductModal);
    addCartModalBtn.addEventListener('click', handleAddToCartFromModal);
    decreaseBtn.addEventListener('click', () => updateQuantity(-1));
    increaseBtn.addEventListener('click', () => updateQuantity(1));

    // === FINALIZAR COMPRA ===
    checkoutBtn.addEventListener('click', checkout);

    // === BÚSQUEDA EN TIEMPO REAL ===
    searchInput.addEventListener('input', filterProducts);

    // === MENÚ MÓVIL ===
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);

    // === FILTROS POR CATEGORÍA ===
    document.querySelectorAll('.filter-link, .category-card').forEach(element => {
        element.addEventListener('click', function (e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            filterByCategory(category);
        });
    });

    // === CERRAR MODALES AL HACER CLIC FUERA ===
    window.addEventListener('click', function (event) {
        if (event.target === productModal) closeProductModal();
        if (event.target === cartModal) closeCartModal();
    });

    // === CERRAR MODALES CON TECLA ESCAPE ===
    window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeProductModal();
            closeCartModal();
        }
    });

    // === EVENT DELEGATION PARA EL CARRITO (funciona para botones creados dinámicamente) ===
    cartItems.addEventListener('click', function (e) {
        const actionEl = e.target.closest('[data-action]');
        if (!actionEl) return;

        const productId = parseInt(actionEl.dataset.id);
        const action = actionEl.dataset.action;
        const product = cart.find(p => p.id === productId);
        if (!product) return;

        if (action === 'increase') {
            product.quantity++;
            saveCartToStorage();
            updateCartUI();
        } else if (action === 'decrease') {
            product.quantity--;
            if (product.quantity <= 0) {
                removeFromCart(productId);
            } else {
                saveCartToStorage();
                updateCartUI();
            }
        } else if (action === 'remove') {
            removeFromCart(productId);
        }
    });
}

// ================== FUNCIONES DE PRODUCTOS ==================
function renderProducts(productList) {
    featuredGrid.innerHTML = '';
    productList.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('data-category', product.category);
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-content">
                <h3>${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <p class="product-description">${product.description}</p>
                <button class="product-btn" data-product="${product.id}" type="button">Añadir al Carrito</button>
            </div>
        `;
        featuredGrid.appendChild(productCard);
    });

    document.querySelectorAll('.product-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const productId = Number(this.getAttribute('data-product'));
            openProductModal(productId);
        });
    });
}

function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    currentProduct = productId;
    document.getElementById('modal-product-img').src = product.image;
    document.getElementById('modal-product-name').textContent = product.name;
    document.getElementById('modal-product-description').textContent = product.description;
    document.getElementById('modal-product-price').textContent = `$${product.price.toFixed(2)}`;
    quantityInput.value = 1;

    productModal.style.display = 'block';
    document.getElementById('add-to-cart-modal').focus();
}

function closeProductModal() {
    productModal.style.display = 'none';
}

function handleAddToCartFromModal() {
    if (!currentProduct) return;
    const quantity = parseInt(quantityInput.value) || 1;
    addToCart(currentProduct, quantity);
    closeProductModal();
}

function updateQuantity(change) {
    let value = parseInt(quantityInput.value) || 1;
    value = Math.max(1, value + change);
    quantityInput.value = value;
}

// ================== FILTROS ==================
function filterByCategory(category) {
    document.querySelectorAll('.filter-link, .category-card').forEach(el => {
        el.classList.remove('active');
    });
    document.querySelectorAll(`[data-category="${category}"]`).forEach(el => {
        el.classList.add('active');
    });

    const sectionTitle = document.querySelector('#featured-products .section-title');
    switch (category) {
        case 'procesadores': sectionTitle.textContent = 'Procesadores'; break;
        case 'ram': sectionTitle.textContent = 'Memoria RAM'; break;
        case 'graficas': sectionTitle.textContent = 'Tarjetas Gráficas'; break;
        case 'almacenamiento': sectionTitle.textContent = 'Almacenamiento'; break;
        case 'gabinetes': sectionTitle.textContent = 'Gabinetes'; break;
        case 'placas': sectionTitle.textContent = 'Placas Madre'; break;
        default: sectionTitle.textContent = 'Productos Destacados';
    }

    if (category === 'all') {
        renderProducts(products);
    } else {
        const filtered = products.filter(product => product.category === category);
        renderProducts(filtered);
    }
}

function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    renderProducts(filtered);
}

// ================== CARRITO ==================
function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id == productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }

    saveCartToStorage();
    updateCartUI();
    showNotification(`${product.name} añadido al carrito`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartUI();
}

function updateCartUI() {
    cartItems.innerHTML = '';
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;

    const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${totalAmount.toFixed(2)}`;

    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        cartItems.appendChild(emptyCart);
    } else {
        emptyCart.style.display = 'none';
        cart.forEach(item => {
            const cartItemElement = createCartItemElement(item);
            cartItems.appendChild(cartItemElement);
        });
    }
}

function createCartItemElement(item) {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';

    const imgDiv = document.createElement('div');
    imgDiv.className = 'cart-item-image';
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name;
    imgDiv.appendChild(img);

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'cart-item-details';

    const nameP = document.createElement('p');
    nameP.className = 'cart-item-name';
    nameP.textContent = item.name;

    const priceP = document.createElement('p');
    priceP.className = 'cart-item-price';
    priceP.textContent = `$${item.price.toFixed(2)}`;

    const quantityDiv = document.createElement('div');
    quantityDiv.className = 'cart-item-quantity';

    const minusBtn = document.createElement('button');
    minusBtn.type = 'button';
    minusBtn.textContent = '-';
    minusBtn.dataset.action = 'decrease';
    minusBtn.dataset.id = item.id;
    minusBtn.className = 'cart-qty-btn';

    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.value = item.quantity;
    quantityInput.min = 1;
    quantityInput.readOnly = true;
    quantityInput.className = 'cart-qty-input';

    const plusBtn = document.createElement('button');
    plusBtn.type = 'button';
    plusBtn.textContent = '+';
    plusBtn.dataset.action = 'increase';
    plusBtn.dataset.id = item.id;
    plusBtn.className = 'cart-qty-btn';

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-item';
    const icon = document.createElement('i');
    icon.className = 'fas fa-trash';
    removeBtn.appendChild(icon);
    removeBtn.dataset.action = 'remove';
    removeBtn.dataset.id = item.id;

    quantityDiv.appendChild(minusBtn);
    quantityDiv.appendChild(quantityInput);
    quantityDiv.appendChild(plusBtn);
    quantityDiv.appendChild(removeBtn);

    detailsDiv.appendChild(nameP);
    detailsDiv.appendChild(priceP);
    detailsDiv.appendChild(quantityDiv);


    cartItem.appendChild(imgDiv);
    cartItem.appendChild(detailsDiv);

    return cartItem;
}

// ================== MODALES Y MENÚ ==================
function openCart() {
    updateCartUI();
    cartModal.style.display = 'block';
}

function closeCartModal() {
    cartModal.style.display = 'none';
}

function toggleMobileMenu() {
    navMenu.classList.toggle('active');
}

// ================== UTILIDADES ==================
function checkout() {
    if (cart.length === 0) {
        showNotification('Tu carrito está vacío');
        return;
    }
    showNotification('¡Gracias por tu compra! Esta es una demostración.');
    cart = [];
    saveCartToStorage();
    updateCartUI();
    closeCartModal();
}

function saveCartToStorage() {

    localStorage.setItem('tecnhub_cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('tecnhub_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart) || [];
        } catch (err) {
            cart = [];
            console.error('Error parseando carrito de localStorage:', err);
        }
    } else {
        cart = [];
    }
}

function showNotification(message) {
    alert(message);
}