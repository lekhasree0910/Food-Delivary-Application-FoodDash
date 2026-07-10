const API_BASE = 'http://127.0.0.1:8000/api';

const FOOD_ICONS = ['🍕', '🍔', '🍛', '🍜', '🥘', '🍲', '🥗', '🍣', '🍱', '🌮', '🍟', '🍩'];
const RESTAURANT_COLORS = [
    'linear-gradient(135deg, #ff6b35, #ffc857)',
    'linear-gradient(135deg, #004e89, #1a936f)',
    'linear-gradient(135deg, #7b2cbf, #c77dff)',
    'linear-gradient(135deg, #e63946, #f4a261)',
    'linear-gradient(135deg, #023e8a, #0077b6)',
];

function getRandomIcon() {
    return FOOD_ICONS[Math.floor(Math.random() * FOOD_ICONS.length)];
}

function getRandomColor() {
    return RESTAURANT_COLORS[Math.floor(Math.random() * RESTAURANT_COLORS.length)];
}

// ── Toast ──
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// ── Auth ──
function getUser() {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
}

function getCustomer() {
    const user = getUser();
    return (user && user.role === 'customer') ? user : null;
}

function updateNav() {
    const user = getUser();
    const navAuth = document.getElementById('navAuth');
    const navUser = document.getElementById('navUser');
    const navUserName = document.getElementById('navUserName');

    // Update navbar links based on role
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        if (user && user.role === 'owner') {
            navLinks.innerHTML = `
                <a href="index.html">Home</a>
                <a href="dashboard.html">Restaurant Portal</a>
            `;
        } else if (user && user.role === 'admin') {
            navLinks.innerHTML = `
                <a href="index.html">Home</a>
                <a href="dashboard.html">Admin Dashboard</a>
            `;
        } else {
            navLinks.innerHTML = `
                <a href="index.html">Home</a>
                <a href="restaurants.html">Restaurants</a>
                <a href="menu.html">Menu</a>
                <a href="cart.html"><i class="fas fa-shopping-cart"></i> Cart</a>
                <a href="orders.html">Orders</a>
            `;
        }

        // Highlight active page
        const page = window.location.pathname.split('/').pop() || 'index.html';
        const activeLink = navLinks.querySelector(`a[href="${page}"]`);
        if (activeLink) {
            navLinks.querySelectorAll('a').forEach(a => a.classList.remove('active'));
            activeLink.classList.add('active');
        }
    }

    if (navAuth && navUser && navUserName) {
        if (user) {
            navAuth.style.display = 'none';
            navUser.style.display = 'flex';
            const name = user.full_name || user.owner_name || 'User';
            navUserName.textContent = `Hello, ${name.split(' ')[0]}`;
        } else {
            navAuth.style.display = 'flex';
            navUser.style.display = 'none';
        }
    }
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('customer');
    localStorage.removeItem('cartItems');
    showToast('Logged out successfully!', 'info');
    setTimeout(() => window.location.href = 'index.html', 500);
}

function toggleMenu() {
    document.querySelectorAll('.nav-links, .nav-auth, .nav-user').forEach(el => {
        el.classList.toggle('open');
    });
}

// ── Login Role Tabs ──
let currentLoginRole = 'customer';
function switchLoginRole(role) {
    currentLoginRole = role;
    document.querySelectorAll('.role-tab').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.role-tab')?.classList.add('active');
    document.getElementById('loginRole').value = role;
    
    const titleEl = document.getElementById('loginTitle');
    const registerLink = document.getElementById('registerLink');
    
    if (role === 'customer') {
        titleEl.textContent = 'Customer Login';
        if (registerLink) registerLink.style.display = 'inline';
    } else if (role === 'owner') {
        titleEl.textContent = 'Restaurant Login';
        if (registerLink) registerLink.style.display = 'inline';
    } else {
        titleEl.textContent = 'Admin Login';
        if (registerLink) registerLink.style.display = 'inline';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const role = document.getElementById('loginRole').value;
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const msgEl = document.getElementById('loginMessage');

    let endpoint = '/customers/login/';
    if (role === 'owner') {
        endpoint = '/owners/login/';
    } else if (role === 'admin') {
        endpoint = '/admins/login/';
    }

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {
            const userObj = data.customer || data.owner || data.admin;
            userObj.role = role;
            localStorage.setItem('user', JSON.stringify(userObj));
            localStorage.setItem('customer', JSON.stringify(userObj)); // compatibility
            showToast('Login successful!');
            setTimeout(() => {
                if (role === 'customer') {
                    window.location.href = 'index.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }, 800);
        } else {
            msgEl.innerHTML = `<p style="color:#dc3545;margin-top:1rem;text-align:center;">${data.error}</p>`;
        }
    } catch (err) {
        msgEl.innerHTML = `<p style="color:#dc3545;margin-top:1rem;text-align:center;">Server error. Please try again.</p>`;
    }
}

// ── Register Role Tabs ──
let currentRegisterRole = 'customer';
function switchRegisterRole(role) {
    currentRegisterRole = role;
    document.querySelectorAll('.role-tab').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.role-tab')?.classList.add('active');
    document.getElementById('registerRole').value = role;

    const titleEl = document.getElementById('registerTitle');
    const nameLabel = document.getElementById('nameLabel');
    const customerFields = document.getElementById('customerFields');
    const ownerFields = document.getElementById('ownerFields');

    if (role === 'customer') {
        titleEl.textContent = 'Customer Registration';
        nameLabel.innerHTML = '<i class="fas fa-user"></i> Full Name';
        customerFields.style.display = 'block';
        ownerFields.style.display = 'none';
        document.getElementById('regName').placeholder = 'Enter your full name';
    } else if (role === 'owner') {
        titleEl.textContent = 'Restaurant Owner Registration';
        nameLabel.innerHTML = '<i class="fas fa-user"></i> Owner Name';
        customerFields.style.display = 'none';
        ownerFields.style.display = 'block';
        document.getElementById('regName').placeholder = 'Enter owner name';
    } else if (role === 'admin') {
        titleEl.textContent = 'Admin Registration';
        nameLabel.innerHTML = '<i class="fas fa-user-shield"></i> Full Name';
        customerFields.style.display = 'none';
        ownerFields.style.display = 'none';
        document.getElementById('regName').placeholder = 'Enter admin full name';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const role = document.getElementById('registerRole').value;
    const msgEl = document.getElementById('registerMessage');

    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const phone = document.getElementById('regPhone').value;
    const name = document.getElementById('regName').value;

    let body = {};
    let endpoint = '/customers/add/';

    if (role === 'customer') {
        body = {
            full_name: name,
            email: email,
            password: password,
            phone: phone,
            address: document.getElementById('regAddress').value || '',
            city: document.getElementById('regCity').value || '',
        };
        endpoint = '/customers/add/';
    } else if (role === 'owner') {
        body = {
            owner_name: name,
            email: email,
            password: password,
            phone: phone,
            restaurant_name: document.getElementById('regRestaurantName').value || '',
            location: document.getElementById('regRestaurantLocation').value || '',
            cuisine: document.getElementById('regRestaurantCuisine').value || '',
        };
        endpoint = '/owners/add/';
    } else if (role === 'admin') {
        body = {
            full_name: name,
            email: email,
            password: password,
            phone: phone
        };
        endpoint = '/admins/add/';
    }

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();

        if (res.ok) {
            showToast('Registration successful! Please login.');
            setTimeout(() => window.location.href = 'login.html', 1000);
        } else {
            msgEl.innerHTML = `<p style="color:#dc3545;margin-top:1rem;text-align:center;">${data.error}</p>`;
        }
    } catch (err) {
        msgEl.innerHTML = `<p style="color:#dc3545;margin-top:1rem;text-align:center;">Server error. Please try again.</p>`;
    }
}

// ── Home Page ──
async function loadHomePage() {
    updateNav();
    loadFeaturedFoods();
    loadTopRestaurants();
}

async function loadFeaturedFoods() {
    const container = document.getElementById('featuredFoods');
    if (!container) return;
    container.innerHTML = '<div class="spinner"></div>';

    try {
        const res = await fetch(`${API_BASE}/foods/`);
        const foods = await res.json();

        const featured = foods.slice(0, 6);
        container.innerHTML = featured.map(food => `
            <div class="food-card glass" style="animation: fadeInUp 0.5s ease ${Math.random() * 0.3}s backwards">
                <div class="card-img" style="background: ${getRandomColor()}">
                    ${getRandomIcon()}
                    <span class="availability-badge ${food.availability === 'Available' ? 'badge-available' : 'badge-outofstock'}">${food.availability}</span>
                </div>
                <h3>${food.food_name}</h3>
                <div class="food-meta">${food.restaurant_name} &bull; ${food.category}</div>
                <div class="price">₹${food.price}</div>
                <button class="btn btn-primary btn-full btn-sm" onclick='addToCart(${JSON.stringify(food).replace(/'/g, "\\'")})'>
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">Unable to load food items</p>';
    }
}

async function loadTopRestaurants() {
    const container = document.getElementById('topRestaurants');
    if (!container) return;
    container.innerHTML = '<div class="spinner"></div>';

    try {
        const res = await fetch(`${API_BASE}/restaurants/`);
        const restaurants = await res.json();

        const top = restaurants.slice(0, 4);
        container.innerHTML = top.map(r => `
            <div class="restaurant-card glass" style="animation: fadeInUp 0.5s ease ${Math.random() * 0.3}s backwards">
                <div class="card-img" style="background: ${getRandomColor()}">
                    🏪
                </div>
                <h3>${r.restaurant_name}</h3>
                <div class="card-meta">
                    <span class="rating"><i class="fas fa-star"></i> ${r.rating}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${r.location}</span>
                </div>
                <div class="card-meta">
                    <span><i class="fas fa-utensils"></i> ${r.cuisine}</span>
                </div>
                <div class="card-actions">
                    <a href="menu.html?restaurant=${encodeURIComponent(r.restaurant_name)}" class="btn btn-primary btn-sm">
                        <i class="fas fa-book-open"></i> View Menu
                    </a>
                </div>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">Unable to load restaurants</p>';
    }
}

function searchFromHome() {
    const query = document.getElementById('homeSearch').value;
    if (query.trim()) {
        window.location.href = `restaurants.html?search=${encodeURIComponent(query)}`;
    }
}

// ── Restaurants Page ──
async function loadRestaurants() {
    updateNav();
    const container = document.getElementById('restaurantList');
    container.innerHTML = '<div class="spinner"></div>';

    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get('search') || '';
    if (search) {
        document.getElementById('restaurantSearch').value = search;
    }

    try {
        const res = await fetch(`${API_BASE}/restaurants/?search=${encodeURIComponent(search)}`);
        const restaurants = await res.json();
        renderRestaurants(restaurants);
    } catch (err) {
        container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">Unable to load restaurants</p>';
    }
}

function renderRestaurants(restaurants) {
    const container = document.getElementById('restaurantList');
    if (restaurants.length === 0) {
        container.innerHTML = '<div class="empty-state glass"><i class="fas fa-store"></i><h3>No restaurants found</h3></div>';
        return;
    }

    container.innerHTML = restaurants.map(r => `
        <div class="restaurant-card glass" style="animation: fadeInUp 0.4s ease ${Math.random() * 0.2}s backwards">
            <div class="card-img" style="background: ${getRandomColor()}">🏪</div>
            <h3>${r.restaurant_name}</h3>
            <div class="card-meta">
                <span class="rating"><i class="fas fa-star"></i> ${r.rating}</span>
                <span><i class="fas fa-map-marker-alt"></i> ${r.location}</span>
            </div>
            <div class="card-meta">
                <span><i class="fas fa-utensils"></i> ${r.cuisine}</span>
                <span><i class="fas fa-user"></i> ${r.owner_name}</span>
            </div>
            <div class="card-actions">
                <a href="menu.html?restaurant=${encodeURIComponent(r.restaurant_name)}" class="btn btn-primary btn-sm">
                    <i class="fas fa-book-open"></i> View Menu
                </a>
            </div>
        </div>
    `).join('');
}

let searchTimeout;
function searchRestaurants() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        const query = document.getElementById('restaurantSearch').value;
        try {
            const res = await fetch(`${API_BASE}/restaurants/?search=${encodeURIComponent(query)}`);
            const restaurants = await res.json();
            renderRestaurants(restaurants);
        } catch (err) {}
    }, 300);
}

// ── Menu Page ──
async function loadFoods() {
    updateNav();
    const container = document.getElementById('foodList');
    container.innerHTML = '<div class="spinner"></div>';

    const urlParams = new URLSearchParams(window.location.search);
    const restaurant = urlParams.get('restaurant') || '';

    try {
        const url = restaurant
            ? `${API_BASE}/foods/?restaurant=${encodeURIComponent(restaurant)}`
            : `${API_BASE}/foods/`;
        const res = await fetch(url);
        const foods = await res.json();
        renderFoods(foods);
    } catch (err) {
        container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">Unable to load food items</p>';
    }
}

function renderFoods(foods) {
    const container = document.getElementById('foodList');
    if (foods.length === 0) {
        container.innerHTML = '<div class="empty-state glass"><i class="fas fa-utensils"></i><h3>No food items found</h3></div>';
        return;
    }

    container.innerHTML = foods.map(food => `
        <div class="food-card glass" style="animation: fadeInUp 0.4s ease ${Math.random() * 0.2}s backwards">
            <div class="card-img" style="background: ${getRandomColor()}">
                ${getRandomIcon()}
                <span class="availability-badge ${food.availability === 'Available' ? 'badge-available' : 'badge-outofstock'}">${food.availability}</span>
            </div>
            <h3>${food.food_name}</h3>
            <div class="food-meta">${food.restaurant_name} &bull; ${food.category}</div>
            <div class="price">₹${food.price}</div>
            <button class="btn ${food.availability === 'Available' ? 'btn-primary' : 'btn-secondary'} btn-full btn-sm"
                ${food.availability !== 'Available' ? 'disabled' : ''}
                onclick='addToCart(${JSON.stringify(food).replace(/'/g, "\\'")})'>
                <i class="fas fa-cart-plus"></i> ${food.availability === 'Available' ? 'Add to Cart' : 'Out of Stock'}
            </button>
        </div>
    `).join('');
}

let foodSearchTimeout;
function searchFoods() {
    clearTimeout(foodSearchTimeout);
    foodSearchTimeout = setTimeout(async () => {
        const search = document.getElementById('foodSearch').value.trim();
        const category = document.getElementById('categoryFilter').value;
        const urlParams = new URLSearchParams(window.location.search);
        const restaurant = urlParams.get('restaurant') || '';

        try {
            let url = restaurant
                ? `${API_BASE}/foods/?restaurant=${encodeURIComponent(restaurant)}`
                : `${API_BASE}/foods/`;
            
            const res = await fetch(url);
            let foods = await res.json();

            // Client-side filtering for category
            if (category) {
                foods = foods.filter(f => f.category === category);
            }

            // Client-side filtering for search query
            if (search) {
                const query = search.toLowerCase();
                foods = foods.filter(f => 
                    f.food_name.toLowerCase().includes(query) || 
                    f.category.toLowerCase().includes(query) ||
                    f.restaurant_name.toLowerCase().includes(query)
                );
            }

            renderFoods(foods);
        } catch (err) {}
    }, 300);
}

// ── Cart ──
function getCartItems() {
    const customer = getCustomer();
    if (!customer) return [];
    const allCarts = JSON.parse(localStorage.getItem('allCarts') || '{}');
    return allCarts[customer.email] || [];
}

function saveCartItems(items) {
    const customer = getCustomer();
    if (!customer) return;
    const allCarts = JSON.parse(localStorage.getItem('allCarts') || '{}');
    allCarts[customer.email] = items;
    localStorage.setItem('allCarts', JSON.stringify(allCarts));
}

async function addToCart(food) {
    const customer = getCustomer();
    if (!customer) {
        showToast('Please login to add items to cart', 'error');
        setTimeout(() => window.location.href = 'login.html', 1000);
        return;
    }

    const body = {
        customer_name: customer.full_name,
        food_name: food.food_name,
        restaurant_name: food.restaurant_name,
        quantity: 1,
        price: food.price,
        total_price: food.price,
    };

    try {
        const res = await fetch(`${API_BASE}/cart/add/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            showToast(`${food.food_name} added to cart!`);
        } else {
            const data = await res.json();
            showToast(data.error || 'Failed to add item', 'error');
        }
    } catch (err) {
        showToast('Server error', 'error');
    }
}

async function loadCart() {
    updateNav();
    const customer = getCustomer();
    if (!customer) {
        document.getElementById('cartItems').innerHTML = '';
        document.getElementById('cartSummary').style.display = 'none';
        document.getElementById('emptyCart').style.display = 'block';
        return;
    }

    const container = document.getElementById('cartItems');
    container.innerHTML = '<div class="spinner"></div>';

    try {
        const res = await fetch(`${API_BASE}/cart/?customer_name=${encodeURIComponent(customer.full_name)}`);
        const items = await res.json();

        if (items.length === 0) {
            container.innerHTML = '';
            document.getElementById('cartSummary').style.display = 'none';
            document.getElementById('emptyCart').style.display = 'block';
            return;
        }

        document.getElementById('emptyCart').style.display = 'none';
        document.getElementById('cartSummary').style.display = 'block';

        renderCartItems(items);
    } catch (err) {
        container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">Unable to load cart</p>';
    }
}

function renderCartItems(items) {
    const container = document.getElementById('cartItems');
    let subtotal = 0;

    container.innerHTML = items.map(item => {
        subtotal += item.total_price;
        return `
            <div class="cart-item glass">
                <div class="item-icon">${getRandomIcon()}</div>
                <div class="item-info">
                    <h4>${item.food_name}</h4>
                    <p>${item.restaurant_name || ''} &bull; ₹${item.price} each</p>
                </div>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="updateQuantity('${item._id}', ${item.quantity - 1}, ${item.price})">-</button>
                    <span style="min-width:30px;text-align:center;font-weight:600;">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity('${item._id}', ${item.quantity + 1}, ${item.price})">+</button>
                </div>
                <div class="item-total">₹${item.total_price}</div>
                <button class="btn btn-danger btn-sm" onclick="removeFromCart('${item._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');

    document.getElementById('subtotal').textContent = `₹${subtotal}`;
    document.getElementById('grandTotal').textContent = `₹${subtotal + 40}`;
}

async function updateQuantity(id, qty, price) {
    if (qty < 1) {
        removeFromCart(id);
        return;
    }

    try {
        await fetch(`${API_BASE}/cart/update/${id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: qty, price: price })
        });
        loadCart();
    } catch (err) {
        showToast('Failed to update', 'error');
    }
}

async function removeFromCart(id) {
    try {
        await fetch(`${API_BASE}/cart/delete/${id}/`, { method: 'DELETE' });
        showToast('Item removed from cart', 'info');
        loadCart();
    } catch (err) {
        showToast('Failed to remove item', 'error');
    }
}

async function checkout() {
    const customer = getCustomer();
    if (!customer) {
        showToast('Please login first', 'error');
        return;
    }

    try {
        const cartRes = await fetch(`${API_BASE}/cart/?customer_name=${encodeURIComponent(customer.full_name)}`);
        const items = await cartRes.json();

        if (items.length === 0) {
            showToast('Your cart is empty', 'error');
            return;
        }

        const total = items.reduce((sum, item) => sum + item.total_price, 0) + 40;
        const orderItems = items.map(i => `${i.food_name} x${i.quantity}`).join(', ');
        const restaurantName = items[0].restaurant_name || 'Multiple Restaurants';

        const orderBody = {
            customer_name: customer.full_name,
            restaurant_name: restaurantName,
            order_items: orderItems,
            total_amount: total,
            payment_status: 'Paid',
            delivery_status: 'Preparing',
        };

        const res = await fetch(`${API_BASE}/orders/add/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderBody)
        });

        if (res.ok) {
            showToast('Order placed successfully!');
            setTimeout(() => window.location.href = 'orders.html', 1000);
        } else {
            const data = await res.json();
            showToast(data.error || 'Failed to place order', 'error');
        }
    } catch (err) {
        showToast('Server error', 'error');
    }
}

// ── Orders ──
function getTimelineHTML(status) {
    if (status === 'Cancelled') {
        return `
            <div class="order-timeline timeline-cancelled" style="width: 100%;">
                <div class="timeline-step active">
                    <div class="timeline-node"><i class="fas fa-times-circle"></i></div>
                    <div class="timeline-label">Cancelled</div>
                </div>
            </div>
        `;
    }
    
    const steps = ['Preparing', 'Out for Delivery', 'Delivered'];
    const icons = ['utensils', 'motorcycle', 'check-circle'];
    const currentIdx = steps.indexOf(status);
    
    let html = '<div class="order-timeline" style="width: 100%;">';
    for (let i = 0; i < steps.length; i++) {
        const isActive = i <= currentIdx;
        html += `
            <div class="timeline-step ${isActive ? 'active' : ''}">
                <div class="timeline-node"><i class="fas fa-${icons[i]}"></i></div>
                <div class="timeline-label">${steps[i]}</div>
            </div>
        `;
        if (i < steps.length - 1) {
            const isLineActive = i < currentIdx;
            html += `<div class="timeline-line ${isLineActive ? 'active' : ''}"></div>`;
        }
    }
    html += '</div>';
    return html;
}

// ── Orders ──
async function loadOrders() {
    updateNav();
    const customer = getCustomer();
    if (!customer) {
        document.getElementById('ordersContainer').innerHTML = '';
        document.getElementById('emptyOrders').style.display = 'block';
        return;
    }

    const container = document.getElementById('ordersContainer');
    container.innerHTML = '<div class="spinner"></div>';

    try {
        const res = await fetch(`${API_BASE}/orders/?customer_name=${encodeURIComponent(customer.full_name)}`);
        const orders = await res.json();

        if (orders.length === 0) {
            container.innerHTML = '';
            document.getElementById('emptyOrders').style.display = 'block';
            return;
        }

        document.getElementById('emptyOrders').style.display = 'none';

        container.innerHTML = orders.map(order => `
            <div class="order-card glass" style="animation: fadeInUp 0.4s ease ${Math.random() * 0.2}s backwards">
                <div class="order-info">
                    <h3><i class="fas fa-receipt"></i> Order #${order._id.slice(-6).toUpperCase()}</h3>
                    <p><i class="fas fa-store"></i> ${order.restaurant_name}</p>
                    <p><i class="fas fa-utensils"></i> ${order.order_items}</p>
                </div>
                <div class="order-status">
                    <span class="status-badge ${order.payment_status === 'Paid' ? 'status-paid' : 'status-pending'}">
                        <i class="fas fa-credit-card"></i> ${order.payment_status}
                    </span>
                    <span class="status-badge status-${order.delivery_status.toLowerCase().replace(' ', '')}">
                        <i class="fas fa-${order.delivery_status === 'Delivered' ? 'check-circle' : order.delivery_status === 'Cancelled' ? 'times-circle' : 'motorcycle'}"></i>
                        ${order.delivery_status}
                    </span>
                </div>
                
                ${getTimelineHTML(order.delivery_status)}
                
                <div class="order-amount">
                    <div class="amount">₹${order.total_amount}</div>
                    ${order.delivery_status === 'Preparing' ? `
                        <button class="btn btn-danger btn-sm" style="margin-top:0.5rem;" onclick="cancelOrder('${order._id}')">
                            <i class="fas fa-times"></i> Cancel Order
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">Unable to load orders</p>';
    }
}

async function cancelOrder(id) {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
        await fetch(`${API_BASE}/orders/update/${id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ delivery_status: 'Cancelled' })
        });
        showToast('Order cancelled', 'info');
        loadOrders();
    } catch (err) {
        showToast('Failed to cancel order', 'error');
    }
}

// ── Dashboards & Admin Portals ──
let currentTab = 'customers';

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.closest('.tab-btn')?.classList.add('active');
    }

    switch (tab) {
        case 'customers': loadAdminCustomers(); break;
        case 'restaurants': loadAdminRestaurants(); break;
        case 'foods': loadAdminFoods(); break;
        case 'orders': loadAdminOrders(); break;
        case 'owner_menu': loadOwnerFoods(); break;
        case 'owner_orders': loadOwnerOrders(); break;
    }
}

function initDashboard() {
    updateNav();
    const user = getUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    if (user.role === 'customer') {
        window.location.href = 'index.html';
        return;
    }

    const titleEl = document.getElementById('dashboardTitle');
    const tabsEl = document.getElementById('dashboardTabs');

    if (user.role === 'owner') {
        titleEl.innerHTML = `<i class="fas fa-store"></i> Restaurant Portal - ${user.restaurant_name}`;
        tabsEl.innerHTML = `
            <button class="tab-btn active" onclick="switchTab('owner_menu')">
                <i class="fas fa-utensils"></i> My Restaurant Menu
            </button>
            <button class="tab-btn" onclick="switchTab('owner_orders')">
                <i class="fas fa-receipt"></i> Restaurant Orders
            </button>
        `;
        switchTab('owner_menu');
    } else if (user.role === 'admin') {
        titleEl.innerHTML = `<i class="fas fa-tachometer-alt"></i> Admin Dashboard`;
        tabsEl.innerHTML = `
            <button class="tab-btn active" onclick="switchTab('customers')">
                <i class="fas fa-users"></i> Customers
            </button>
            <button class="tab-btn" onclick="switchTab('restaurants')">
                <i class="fas fa-store"></i> Restaurants
            </button>
            <button class="tab-btn" onclick="switchTab('foods')">
                <i class="fas fa-utensils"></i> Food Items
            </button>
            <button class="tab-btn" onclick="switchTab('orders')">
                <i class="fas fa-receipt"></i> Orders
            </button>
        `;
        switchTab('customers');
    }
}

// ── Admin: Customers ──
async function loadAdminCustomers() {
    const container = document.getElementById('tabContent');
    container.innerHTML = '<div class="spinner"></div>';

    try {
        const res = await fetch(`${API_BASE}/customers/`);
        const customers = await res.json();

        container.innerHTML = `
            <div class="admin-header">
                <h2><i class="fas fa-users"></i> Customers (${customers.length})</h2>
                <button class="btn btn-primary" onclick="openCustomerModal()">
                    <i class="fas fa-plus"></i> Add Customer
                </button>
            </div>
            <div style="overflow-x:auto;">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>City</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customers.map(c => `
                            <tr>
                                <td><strong>${c.full_name}</strong></td>
                                <td>${c.email}</td>
                                <td>${c.phone}</td>
                                <td>${c.city}</td>
                                <td class="actions">
                                    <button class="btn btn-info btn-sm" onclick='openCustomerModal(${JSON.stringify(c).replace(/'/g, "\\'")})'>
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteItem('customers', '${c._id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">Unable to load customers</p>';
    }
}

function openCustomerModal(customer = null) {
    document.getElementById('modalTitle').textContent = customer ? 'Edit Customer' : 'Add Customer';
    document.getElementById('modalBody').innerHTML = `
        <form onsubmit="saveCustomer(event, '${customer ? customer._id : ''}')">
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" id="cName" value="${customer ? customer.full_name : ''}" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="cEmail" value="${customer ? customer.email : ''}" required ${customer ? 'readonly' : ''}>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" id="cPassword" ${customer ? '' : 'required'} placeholder="${customer ? 'Leave blank to keep current' : 'Enter password'}">
            </div>
            <div class="form-group">
                <label>Phone</label>
                <input type="text" id="cPhone" value="${customer ? customer.phone : ''}" required>
            </div>
            <div class="form-group">
                <label>Address</label>
                <input type="text" id="cAddress" value="${customer ? customer.address : ''}" required>
            </div>
            <div class="form-group">
                <label>City</label>
                <input type="text" id="cCity" value="${customer ? customer.city : ''}" required>
            </div>
            <button type="submit" class="btn btn-primary btn-full">${customer ? 'Update' : 'Register'} Customer</button>
        </form>
    `;
    document.getElementById('modalOverlay').classList.add('active');
}

async function saveCustomer(e, id) {
    e.preventDefault();
    const body = {
        full_name: document.getElementById('cName').value,
        email: document.getElementById('cEmail').value,
        phone: document.getElementById('cPhone').value,
        address: document.getElementById('cAddress').value,
        city: document.getElementById('cCity').value,
    };
    const password = document.getElementById('cPassword').value;
    if (password) body.password = password;

    try {
        const url = id ? `${API_BASE}/customers/update/${id}/` : `${API_BASE}/customers/add/`;
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            showToast(id ? 'Customer updated!' : 'Customer added!');
            closeModal();
            loadAdminCustomers();
        } else {
            const data = await res.json();
            showToast(data.error || 'Failed', 'error');
        }
    } catch (err) {
        showToast('Server error', 'error');
    }
}

// ── Admin: Restaurants ──
async function loadAdminRestaurants() {
    const container = document.getElementById('tabContent');
    container.innerHTML = '<div class="spinner"></div>';

    try {
        const res = await fetch(`${API_BASE}/restaurants/`);
        const restaurants = await res.json();

        container.innerHTML = `
            <div class="admin-header">
                <h2><i class="fas fa-store"></i> Restaurants (${restaurants.length})</h2>
                <button class="btn btn-primary" onclick="openRestaurantModal()">
                    <i class="fas fa-plus"></i> Add Restaurant
                </button>
            </div>
            <div style="overflow-x:auto;">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Owner</th>
                            <th>Location</th>
                            <th>Cuisine</th>
                            <th>Rating</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${restaurants.map(r => `
                            <tr>
                                <td><strong>${r.restaurant_name}</strong></td>
                                <td>${r.owner_name}</td>
                                <td>${r.location}</td>
                                <td>${r.cuisine}</td>
                                <td class="rating"><i class="fas fa-star"></i> ${r.rating}</td>
                                <td class="actions">
                                    <button class="btn btn-info btn-sm" onclick='openRestaurantModal(${JSON.stringify(r).replace(/'/g, "\\'")})'>
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteItem('restaurants', '${r._id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">Unable to load restaurants</p>';
    }
}

function openRestaurantModal(restaurant = null) {
    document.getElementById('modalTitle').textContent = restaurant ? 'Edit Restaurant' : 'Add Restaurant';
    document.getElementById('modalBody').innerHTML = `
        <form onsubmit="saveRestaurant(event, '${restaurant ? restaurant._id : ''}')">
            <div class="form-group">
                <label>Restaurant Name</label>
                <input type="text" id="rName" value="${restaurant ? restaurant.restaurant_name : ''}" required>
            </div>
            <div class="form-group">
                <label>Owner Name</label>
                <input type="text" id="rOwner" value="${restaurant ? restaurant.owner_name : ''}" required>
            </div>
            <div class="form-group">
                <label>Location</label>
                <input type="text" id="rLocation" value="${restaurant ? restaurant.location : ''}" required>
            </div>
            <div class="form-group">
                <label>Cuisine</label>
                <input type="text" id="rCuisine" value="${restaurant ? restaurant.cuisine : ''}" required>
            </div>
            <div class="form-group">
                <label>Rating</label>
                <input type="number" id="rRating" step="0.1" min="0" max="5" value="${restaurant ? restaurant.rating : '4.0'}" required>
            </div>
            <button type="submit" class="btn btn-primary btn-full">${restaurant ? 'Update' : 'Add'} Restaurant</button>
        </form>
    `;
    document.getElementById('modalOverlay').classList.add('active');
}

async function saveRestaurant(e, id) {
    e.preventDefault();
    const body = {
        restaurant_name: document.getElementById('rName').value,
        owner_name: document.getElementById('rOwner').value,
        location: document.getElementById('rLocation').value,
        cuisine: document.getElementById('rCuisine').value,
        rating: parseFloat(document.getElementById('rRating').value),
    };

    try {
        const url = id ? `${API_BASE}/restaurants/update/${id}/` : `${API_BASE}/restaurants/add/`;
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            showToast(id ? 'Restaurant updated!' : 'Restaurant added!');
            closeModal();
            loadAdminRestaurants();
        } else {
            const data = await res.json();
            showToast(data.error || 'Failed', 'error');
        }
    } catch (err) {
        showToast('Server error', 'error');
    }
}

// ── Admin: Foods ──
async function loadAdminFoods() {
    const container = document.getElementById('tabContent');
    container.innerHTML = '<div class="spinner"></div>';

    try {
        const res = await fetch(`${API_BASE}/foods/`);
        const foods = await res.json();

        container.innerHTML = `
            <div class="admin-header">
                <h2><i class="fas fa-utensils"></i> Food Items (${foods.length})</h2>
                <button class="btn btn-primary" onclick="openFoodModal()">
                    <i class="fas fa-plus"></i> Add Food Item
                </button>
            </div>
            <div style="overflow-x:auto;">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Food Name</th>
                            <th>Restaurant</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Availability</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${foods.map(f => `
                            <tr>
                                <td><strong>${f.food_name}</strong></td>
                                <td>${f.restaurant_name}</td>
                                <td>${f.category}</td>
                                <td class="rating">₹${f.price}</td>
                                <td><span class="status-badge ${f.availability === 'Available' ? 'status-delivered' : 'status-cancelled'}">${f.availability}</span></td>
                                <td class="actions">
                                    <button class="btn btn-info btn-sm" onclick='openFoodModal(${JSON.stringify(f).replace(/'/g, "\\'")})'>
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteItem('foods', '${f._id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">Unable to load food items</p>';
    }
}

function openFoodModal(food = null) {
    const user = getUser();
    const isOwner = user && user.role === 'owner';
    const restaurantVal = isOwner ? user.restaurant_name : (food ? food.restaurant_name : '');
    const readonlyAttr = isOwner ? 'readonly style="background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.5);"' : '';

    document.getElementById('modalTitle').textContent = food ? 'Edit Food Item' : 'Add Food Item';
    document.getElementById('modalBody').innerHTML = `
        <form onsubmit="saveFood(event, '${food ? food._id : ''}')">
            <div class="form-group">
                <label>Food Name</label>
                <input type="text" id="fName" value="${food ? food.food_name : ''}" required>
            </div>
            <div class="form-group">
                <label>Restaurant Name</label>
                <input type="text" id="fRestaurant" value="${restaurantVal}" ${readonlyAttr} required>
            </div>
            <div class="form-group">
                <label>Category</label>
                <select id="fCategory" required>
                    <option value="Starter" ${food && food.category === 'Starter' ? 'selected' : ''}>Starter</option>
                    <option value="Main Course" ${food && food.category === 'Main Course' ? 'selected' : ''}>Main Course</option>
                    <option value="Dessert" ${food && food.category === 'Dessert' ? 'selected' : ''}>Dessert</option>
                    <option value="Beverage" ${food && food.category === 'Beverage' ? 'selected' : ''}>Beverage</option>
                    <option value="Snack" ${food && food.category === 'Snack' ? 'selected' : ''}>Snack</option>
                </select>
            </div>
            <div class="form-group">
                <label>Price (₹)</label>
                <input type="number" id="fPrice" min="1" value="${food ? food.price : ''}" required>
            </div>
            <div class="form-group">
                <label>Availability</label>
                <select id="fAvailability" required>
                    <option value="Available" ${food && food.availability === 'Available' ? 'selected' : ''}>Available</option>
                    <option value="Out of Stock" ${food && food.availability === 'Out of Stock' ? 'selected' : ''}>Out of Stock</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary btn-full">${food ? 'Update' : 'Add'} Food Item</button>
        </form>
    `;
    document.getElementById('modalOverlay').classList.add('active');
}

async function saveFood(e, id) {
    e.preventDefault();
    const user = getUser();
    const isOwner = user && user.role === 'owner';
    const body = {
        food_name: document.getElementById('fName').value,
        restaurant_name: document.getElementById('fRestaurant').value,
        category: document.getElementById('fCategory').value,
        price: parseInt(document.getElementById('fPrice').value),
        availability: document.getElementById('fAvailability').value,
    };

    try {
        const url = id ? `${API_BASE}/foods/update/${id}/` : `${API_BASE}/foods/add/`;
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            showToast(id ? 'Food item updated!' : 'Food item added!');
            closeModal();
            if (isOwner) {
                loadOwnerFoods();
            } else {
                loadAdminFoods();
            }
        } else {
            const data = await res.json();
            showToast(data.error || 'Failed', 'error');
        }
    } catch (err) {
        showToast('Server error', 'error');
    }
}

// ── Admin: Orders ──
async function loadAdminOrders() {
    const container = document.getElementById('tabContent');
    container.innerHTML = '<div class="spinner"></div>';

    try {
        const res = await fetch(`${API_BASE}/orders/`);
        const orders = await res.json();

        container.innerHTML = `
            <div class="admin-header">
                <h2><i class="fas fa-receipt"></i> Orders (${orders.length})</h2>
            </div>
            <div style="overflow-x:auto;">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Restaurant</th>
                            <th>Items</th>
                            <th>Amount</th>
                            <th>Payment</th>
                            <th>Delivery</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(o => `
                            <tr>
                                <td><strong>#${o._id.slice(-6).toUpperCase()}</strong></td>
                                <td>${o.customer_name}</td>
                                <td>${o.restaurant_name}</td>
                                <td>${o.order_items}</td>
                                <td class="rating">₹${o.total_amount}</td>
                                <td><span class="status-badge ${o.payment_status === 'Paid' ? 'status-paid' : 'status-pending'}">${o.payment_status}</span></td>
                                <td>
                                    <select class="status-select" onchange="updateDeliveryStatus('${o._id}', this.value)" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:white;padding:0.3rem;border-radius:6px;font-family:Poppins;">
                                        <option value="Preparing" ${o.delivery_status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                                        <option value="Out for Delivery" ${o.delivery_status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                                        <option value="Delivered" ${o.delivery_status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                                        <option value="Cancelled" ${o.delivery_status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                                    </select>
                                </td>
                                <td class="actions">
                                    <button class="btn btn-danger btn-sm" onclick="deleteItem('orders', '${o._id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">Unable to load orders</p>';
    }
}

async function updateDeliveryStatus(id, status) {
    try {
        await fetch(`${API_BASE}/orders/update/${id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ delivery_status: status })
        });
        showToast('Order status updated!');
    } catch (err) {
        showToast('Failed to update status', 'error');
    }
}

// ── Restaurant Owner Dashboard Portals ──
async function loadOwnerFoods() {
    const container = document.getElementById('tabContent');
    container.innerHTML = '<div class="spinner"></div>';
    const user = getUser();

    try {
        const res = await fetch(`${API_BASE}/foods/?restaurant=${encodeURIComponent(user.restaurant_name)}`);
        const foods = await res.json();

        container.innerHTML = `
            <div class="admin-header">
                <h2><i class="fas fa-utensils"></i> My Menu Items (${foods.length})</h2>
                <button class="btn btn-primary" onclick="openFoodModal()">
                    <i class="fas fa-plus"></i> Add Food Item
                </button>
            </div>
            <div style="overflow-x:auto;">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Food Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Availability</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${foods.map(f => `
                            <tr>
                                <td><strong>${f.food_name}</strong></td>
                                <td>${f.category}</td>
                                <td>₹${f.price}</td>
                                <td><span class="status-badge ${f.availability === 'Available' ? 'status-delivered' : 'status-cancelled'}">${f.availability}</span></td>
                                <td class="actions">
                                    <button class="btn btn-info btn-sm" onclick='openFoodModal(${JSON.stringify(f).replace(/'/g, "\\'")})'>
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteItem('foods', '${f._id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">Unable to load food items</p>';
    }
}

async function loadOwnerOrders() {
    const container = document.getElementById('tabContent');
    container.innerHTML = '<div class="spinner"></div>';
    const user = getUser();

    try {
        const res = await fetch(`${API_BASE}/orders/?restaurant_name=${encodeURIComponent(user.restaurant_name)}`);
        const orders = await res.json();

        container.innerHTML = `
            <div class="admin-header">
                <h2><i class="fas fa-receipt"></i> Restaurant Orders (${orders.length})</h2>
            </div>
            <div style="overflow-x:auto;">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Amount</th>
                            <th>Payment</th>
                            <th>Delivery</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(o => `
                            <tr>
                                <td><strong>#${o._id.slice(-6).toUpperCase()}</strong></td>
                                <td>${o.customer_name}</td>
                                <td>${o.order_items}</td>
                                <td>₹${o.total_amount}</td>
                                <td><span class="status-badge ${o.payment_status === 'Paid' ? 'status-paid' : 'status-pending'}">${o.payment_status}</span></td>
                                <td>
                                    <select class="status-select" onchange="updateDeliveryStatus('${o._id}', this.value)" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:white;padding:0.3rem;border-radius:6px;font-family:Poppins;">
                                        <option value="Preparing" ${o.delivery_status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                                        <option value="Out for Delivery" ${o.delivery_status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                                        <option value="Delivered" ${o.delivery_status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                                        <option value="Cancelled" ${o.delivery_status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                                    </select>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">Unable to load orders</p>';
    }
}

// ── Delete ──
async function deleteItem(module, id) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    const user = getUser();
    const isOwner = user && user.role === 'owner';

    try {
        const res = await fetch(`${API_BASE}/${module}/${id}/`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Item deleted successfully!');
            if (isOwner) {
                if (module === 'foods') loadOwnerFoods();
            } else {
                switch (module) {
                    case 'customers': loadAdminCustomers(); break;
                    case 'restaurants': loadAdminRestaurants(); break;
                    case 'foods': loadAdminFoods(); break;
                    case 'orders': loadAdminOrders(); break;
                }
            }
        } else {
            showToast('Failed to delete item', 'error');
        }
    } catch (err) {
        showToast('Server error', 'error');
    }
}

// ── Modal ──
function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

// ── Init ──
document.addEventListener('DOMContentLoaded', updateNav);
