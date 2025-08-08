let products = JSON.parse(localStorage.getItem("products")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function renderProducts() {
    const productList = document.getElementById("product-list");
    if (!productList) return;
    productList.innerHTML = "";
    products.forEach(p => {
        const div = document.createElement("div");
        div.innerHTML = `
            <img src="${p.image}" alt="${p.name}">
            <h4>${p.name}</h4>
            <p>${p.price} ر.ع</p>
            ${isNew(p.date) ? '<span class="new-label">NEW</span>' : ''}
            <button onclick="addToCart(${p.id})">إضافة للسلة</button>
        `;
        productList.appendChild(div);
    });
}

function renderCart() {
    const cartItems = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const cartTotal = document.getElementById("cart-total");
    if (!cartItems) return;
    cartItems.innerHTML = "";
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.qty;
        cartItems.innerHTML += `
            ${item.name} (${item.qty})
            <button onclick="updateQty(${item.id}, 1)">+</button>
            <button onclick="updateQty(${item.id}, -1)">-</button><br>
        `;
    });
    cartCount.textContent = cart.length;
    cartTotal.textContent = total;
    localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(c => c.id === id);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    renderCart();
}

function updateQty(id, change) {
    const item = cart.find(c => c.id === id);
    if (!item) return;
    item.qty += change;
    if (item.qty <= 0) {
        cart = cart.filter(c => c.id !== id);
    }
    renderCart();
}

function addProduct() {
    const name = document.getElementById("product-name").value;
    const price = parseFloat(document.getElementById("product-price").value);
    const image = document.getElementById("product-image").value;
    if (!name || !price || !image) return alert("أكمل جميع الحقول");

    const newProduct = {
        id: Date.now(),
        name, price, image,
        date: new Date().toISOString()
    };
    products.push(newProduct);
    localStorage.setItem("products", JSON.stringify(products));
    loadAdminProducts();
}

function loadAdminProducts() {
    const adminList = document.getElementById("admin-products");
    if (!adminList) return;
    adminList.innerHTML = "";
    products.forEach(p => {
        const div = document.createElement("div");
        div.innerHTML = `
            <img src="${p.image}" alt="${p.name}">
            <h4>${p.name}</h4>
            <p>${p.price} ر.ع</p>
            <button onclick="deleteProduct(${p.id})">حذف</button>
        `;
        adminList.appendChild(div);
    });
}

function deleteProduct(id) {
    products = products.filter(p => p.id !== id);
    localStorage.setItem("products", JSON.stringify(products));
    loadAdminProducts();
}

function isNew(date) {
    const oneDay = 24 * 60 * 60 * 1000;
    return new Date() - new Date(date) < oneDay;
}

document.addEventListener("DOMContentLoaded", () => {
    renderProducts();
    renderCart();

    const cartBox = document.getElementById("cart");
    if (cartBox) {
        cartBox.addEventListener("dragend", function(e) {
            cartBox.style.left = e.pageX + "px";
            cartBox.style.top = e.pageY + "px";
        });
    }

    const orderBtn = document.getElementById("order-btn");
    if (orderBtn) {
        orderBtn.onclick = () => {
            let msg = "طلب جديد:\n";
            cart.forEach(item => {
                msg += `${item.name} x${item.qty} = ${item.price * item.qty} ر.ع\n`;
            });
            msg += `المجموع: ${cart.reduce((sum, i) => sum + (i.price * i.qty), 0)} ر.ع`;
            window.open(`https://wa.me/77324648?text=${encodeURIComponent(msg)}`);
        };
    }
});