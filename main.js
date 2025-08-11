// ===============================
// main.js - نسخة rasco 9 (بدون تخزين محلي للمنتجات)
// ===============================

let products = [];
let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let currentImages = [];
let currentImageIndex = 0;

// عناصر DOM
const productsGrid = document.getElementById("productsGrid");
const offersGrid = document.getElementById("offersGrid");
const cartSide = document.getElementById("cartSide");
const sideItems = document.getElementById("sideItems");
const sideTotalHead = document.getElementById("sideTotalHead");
const stickerCount = document.getElementById("stickerCount");
const orderSticker = document.getElementById("orderSticker");
const buyBtnIndicator = document.getElementById("buyBtnIndicator");

function renderProducts() {
  productsGrid.innerHTML = "";
  offersGrid.innerHTML = "";
  products.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "card";
    let imgHtml = p.images?.length
      ? `<img src="${p.images[0]}" class="main-img" style="width:100%;height:140px;object-fit:cover;border-radius:8px;cursor:pointer" onclick="openImageViewer(${i}, 0)">`
      : "";
    card.innerHTML = `
      ${p.type === "offer" ? `<div class="badge-new">عرض</div>` : ""}
      ${imgHtml}
      <h4>${p.name}</h4>
      <p class="desc">${p.desc || ""}</p>
      <p class="price">${parseFloat(p.price).toFixed(2)} ر.ع</p>
      <button class="add-btn" onclick="addToCart(${i})">أضف للسلة</button>
    `;
    (p.type === "offer" ? offersGrid : productsGrid).appendChild(card);
  });
}

function addToCart(index) {
  const product = products[index];
  const existing = cart.find(c => c.name === product.name);
  existing ? (existing.qty += 1) : cart.push({ ...product, qty: 1 });
  saveCart();
  renderCart();
}

function renderCart() {
  sideItems.innerHTML = "";
  let total = 0;
  cart.forEach((item, i) => {
    total += item.price * item.qty;
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <img src="${item.images[0]}" />
      <div class="meta">
        <div class="name">${item.name}</div>
        <div class="sub">${(item.price * item.qty).toFixed(2)} ر.ع</div>
      </div>
      <div class="qty">
        <button onclick="changeQty(${i}, -1)">-</button>
        <span>${item.qty}</span>
        <button onclick="changeQty(${i}, 1)">+</button>
      </div>
      <button class="remove-btn" onclick="removeFromCart(${i})">حذف</button>
    `;
    sideItems.appendChild(div);
  });
  sideTotalHead.textContent = total.toFixed(2);
  stickerCount.style.display = cart.length ? "block" : "none";
  stickerCount.textContent = cart.length;
  buyBtnIndicator.style.display = cart.length ? "block" : "none";
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart();
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function openImageViewer(productIndex, imageIndex) {
  currentImages = products[productIndex].images || [];
  currentImageIndex = imageIndex;
  updateViewerImage();
  document.getElementById("imgViewer").style.display = "flex";
}

function updateViewerImage() {
  const img = document.getElementById("viewerImg");
  img.classList.add("fade");
  setTimeout(() => {
    img.src = currentImages[currentImageIndex];
    img.classList.remove("fade");
  }, 200);
}

document.getElementById("viewerPrev").onclick = () => {
  currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
  updateViewerImage();
};
document.getElementById("viewerNext").onclick = () => {
  currentImageIndex = (currentImageIndex + 1) % currentImages.length;
  updateViewerImage();
};
document.getElementById("viewerClose").onclick = () => {
  document.getElementById("imgViewer").style.display = "none";
};

function openAdmin() {
  document.getElementById("adminModal").style.display = "flex";
}
function closeAdmin() {
  document.getElementById("adminModal").style.display = "none";
}

function adminLogin() {
  const pass = document.getElementById("adminPass").value;
  if (pass === "1234") {
    document.getElementById("loginPanel").style.display = "none";
    document.getElementById("controlPanel").style.display = "block";
    renderAdminList();
  } else {
    alert("كلمة المرور غير صحيحة");
  }
}

function renderAdminList() {
  const list = document.getElementById("adminList");
  list.innerHTML = "";
  products.forEach((p, i) => {
    const div = document.createElement("div");
    div.style.padding = "5px 0";
    div.innerHTML = `
      <strong>${p.name}</strong> - ${p.price.toFixed(2)} ر.ع
      <button class="small-btn" onclick="deleteProduct(${i})">حذف</button>
    `;
    list.appendChild(div);
  });
}

document.getElementById("nav-home").onclick = () => showSection("home");
document.getElementById("nav-offers").onclick = () => showSection("offers");
document.getElementById("nav-admin").onclick = () => openAdmin();

function showSection(id) {
  document.querySelectorAll("main section").forEach(s => s.style.display = "none");
  document.getElementById(id).style.display = "block";
  document.querySelectorAll("nav a").forEach(a => a.classList.remove("active"));
  document.getElementById("nav-" + id).classList.add("active");
}

orderSticker.onclick = () => cartSide.classList.add("open");
document.getElementById("closeCartBtn").onclick = () => cartSide.classList.remove("open");

document.getElementById("buyBtn").onclick = () => {
  if (!cart.length) return alert("السلة فارغة");
  let msg = "طلب جديد:\n";
  cart.forEach(item => {
    msg += `${item.name} - ${item.qty} × ${item.price} ر.ع = ${(item.price * item.qty).toFixed(2)} ر.ع\n`;
  });
  msg += `\nالإجمالي: ${sideTotalHead.textContent} ر.ع`;
  window.open(`https://wa.me/96800000000?text=${encodeURIComponent(msg)}`, "_blank");
};

renderCart();