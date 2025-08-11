// بيانات السلة
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

// حفظ السلة
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  renderCart();
}

// إضافة للسلة
function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
}

// إزالة من السلة
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
}

// تحديث عداد السلة
function updateCartCount() {
  document.getElementById("stickerCount").textContent = cart.length;
}

// عرض محتوى السلة
function renderCart() {
  const sideItems = document.getElementById("sideItems");
  sideItems.innerHTML = "";
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    const div = document.createElement("div");
    div.textContent = `${item.name} x${item.qty} - ${item.price * item.qty} ر.ع`;
    sideItems.appendChild(div);
  });
  document.getElementById("sideTotalHead").textContent = total.toFixed(2) + " ريال عماني";
}

// فتح وإغلاق السلة
document.getElementById("orderSticker").onclick = () => {
  document.getElementById("cartSide").classList.add("open");
};

document.getElementById("closeCartBtn").onclick = () => {
  document.getElementById("cartSide").classList.remove("open");
};

// طلب عبر واتساب
document.getElementById("buyBtn").onclick = () => {
  let message = "طلب جديد:\n";
  cart.forEach(item => {
    message += `${item.name} x${item.qty} = ${item.price * item.qty} ر.ع\n`;
  });
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  message += `الإجمالي: ${total.toFixed(2)} ر.ع`;
  window.open(`https://wa.me/96800000000?text=${encodeURIComponent(message)}`);
};

// بيانات المنتجات (نسخة محلية)
let products = [
  { id: 1, name: "منتج 1", price: 5, images: ["https://via.placeholder.com/150"], desc: "وصف المنتج", type: "normal" },
  { id: 2, name: "عرض 1", price: 3, images: ["https://via.placeholder.com/150"], desc: "وصف العرض", type: "offer" }
];

// عرض المنتجات
function renderProducts() {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";
  products
    .filter(p => p.type === "normal")
    .forEach(p => grid.appendChild(createProductCard(p)));
}

// عرض العروض
function renderOffers() {
  const grid = document.getElementById("offersGrid");
  grid.innerHTML = "";
  products
    .filter(p => p.type === "offer")
    .forEach(p => grid.appendChild(createProductCard(p)));
}

// إنشاء كرت المنتج
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  const img = document.createElement("img");
  img.src = product.images[0];
  img.alt = product.name;

  const details = document.createElement("div");
  details.className = "details";

  const title = document.createElement("h3");
  title.textContent = product.name;

  const desc = document.createElement("p");
  desc.textContent = product.desc || "";

  const price = document.createElement("strong");
  price.textContent = `${product.price} ر.ع`;

  const btn = document.createElement("button");
  btn.textContent = "أضف للسلة";
  btn.onclick = () => addToCart(product);

  details.appendChild(title);
  details.appendChild(desc);
  details.appendChild(price);
  details.appendChild(btn);

  card.appendChild(img);
  card.appendChild(details);
  return card;
}

// لوحة التحكم
let isAdmin = false;

function closeAdmin() {
  document.getElementById("adminModal").style.display = "none";
}

function adminLogin() {
  const pass = document.getElementById("adminPass").value;
  if (pass === "7732") {
    isAdmin = true;
    document.getElementById("loginPanel").style.display = "none";
    document.getElementById("controlPanel").style.display = "block";
    renderAdminList();
  } else {
    alert("كلمة المرور غير صحيحة");
  }
}

function addProduct() {
  if (!isAdmin) return;

  const name = document.getElementById("prodName").value;
  const price = parseFloat(document.getElementById("prodPrice").value);
  const imagesInput = document.getElementById("prodImages").value;
  const desc = document.getElementById("prodDesc").value;
  const type = document.getElementById("prodType").value;

  const images = imagesInput.split(",").map(i => i.trim()).filter(i => i);

  const id = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;

  products.push({ id, name, price, images, desc, type });
  renderProducts();
  renderOffers();
  renderAdminList();
}

function renderAdminList() {
  const list = document.getElementById("adminList");
  list.innerHTML = "";
  products.forEach(p => {
    const div = document.createElement("div");
    div.textContent = `${p.id} - ${p.name} (${p.type})`;
    list.appendChild(div);
  });
}

// التنقل بين الصفحات
document.getElementById("nav-home").onclick = () => {
  document.getElementById("home").style.display = "block";
  document.getElementById("offers").style.display = "none";
  setActive("nav-home");
};

document.getElementById("nav-offers").onclick = () => {
  document.getElementById("home").style.display = "none";
  document.getElementById("offers").style.display = "block";
  setActive("nav-offers");
};

document.getElementById("nav-admin").onclick = () => {
  document.getElementById("adminModal").style.display = "block";
  setActive("nav-admin");
};

function setActive(id) {
  document.querySelectorAll("nav a").forEach(a => a.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// تحميل الصفحة
window.onload = () => {
  renderProducts();
  renderOffers();
  updateCartCount();
  renderCart();
};