let cart = JSON.parse(localStorage.getItem("cart") || "[]");

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  renderCart();
}

function addToCart(product) {
  const existing = cart.find(item => item.ID === product.ID);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.ID !== id);
  saveCart();
}

function updateCartCount() {
  document.getElementById("stickerCount").textContent = cart.length;
}

function renderCart() {
  const sideItems = document.getElementById("sideItems");
  sideItems.innerHTML = "";
  let total = 0;
  cart.forEach(item => {
    total += item.Price * item.qty;
    const div = document.createElement("div");
    div.textContent = `${item.Name} x${item.qty} - ${item.Price * item.qty} ر.ع`;
    sideItems.appendChild(div);
  });
  document.getElementById("sideTotalHead").textContent = total.toFixed(2) + " ريال عماني";
}

document.getElementById("orderSticker").onclick = () => {
  document.getElementById("cartSide").classList.add("open");
};

document.getElementById("closeCartBtn").onclick = () => {
  document.getElementById("cartSide").classList.remove("open");
};

document.getElementById("buyBtn").onclick = () => {
  let message = "طلب جديد:\n";
  cart.forEach(item => {
    message += `${item.Name} x${item.qty} = ${item.Price * item.qty} ر.ع\n`;
  });
  const total = cart.reduce((sum, i) => sum + i.Price * i.qty, 0);
  message += `الإجمالي: ${total.toFixed(2)} ر.ع`;
  window.open(`https://wa.me/96800000000?text=${encodeURIComponent(message)}`);
};