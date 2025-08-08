let products = JSON.parse(localStorage.getItem('products')) || [];
let offers = JSON.parse(localStorage.getItem('offers')) || [];
let cart = [];

const productsContainer = document.getElementById('products-container');
const offersContainer = document.getElementById('offers-container');
const cartCount = document.getElementById('cart-count');
const cartBadge = document.getElementById('cart-badge');

function displayProducts(list, container) {
  container.innerHTML = "";
  list.forEach((p, index) => {
    const productDiv = document.createElement('div');
    productDiv.className = 'product';
    productDiv.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>${p.price} ر.س</p>
      <button onclick="addToCart(${index}, '${container.id}')">+</button>
    `;
    container.appendChild(productDiv);
  });
}

function addToCart(index, containerId) {
  let selectedList = containerId === 'offers-container' ? offers : products;
  cart.push(selectedList[index]);
  updateCart();
}

function updateCart() {
  cartCount.textContent = cart.length;
  cartBadge.style.display = cart.length > 0 ? 'block' : 'none';

  let total = 0;
  let cartHTML = "";
  let bottomCartHTML = "";

  cart.forEach(item => {
    total += parseFloat(item.price);
    cartHTML += `<div>${item.name} - ${item.price} ر.س</div>`;
    bottomCartHTML += `<div>${item.name} - ${item.price} ر.س</div>`;
  });

  document.getElementById('cart-items').innerHTML = cartHTML;
  document.getElementById('bottom-cart-items').innerHTML = bottomCartHTML;
  document.getElementById('cart-total').textContent = total;
  document.getElementById('bottom-cart-total').textContent = total;
}

function toggleCart() {
  const cartPopup = document.getElementById('cart-popup');
  cartPopup.style.display = cartPopup.style.display === 'block' ? 'none' : 'block';
}

function sendWhatsApp() {
  let message = "طلب جديد:\n";
  cart.forEach(item => message += `${item.name} - ${item.price} ر.س\n`);
  window.open(`https://wa.me/77324648?text=${encodeURIComponent(message)}`, '_blank');
}

document.getElementById('offers-link').addEventListener('click', () => {
  productsContainer.style.display = 'none';
  offersContainer.style.display = 'grid';
  displayProducts(offers, offersContainer);
});

displayProducts(products, productsContainer);