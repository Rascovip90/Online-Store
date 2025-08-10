let cart = [];

function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  updateCartUI();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartUI();
}

function updateCartUI() {
  const sideItems = document.getElementById("sideItems");
  const stickerCount = document.getElementById("stickerCount");
  const totalHead = document.getElementById("sideTotalHead");

  sideItems.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    total += item.price * item.qty;

    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.alignItems = "center";

    const name = document.createElement("span");
    name.textContent = `${item.name} × ${item.qty}`;

    const price = document.createElement("span");
    price.textContent = `${(item.price * item.qty).toFixed(2)} ر.ع`;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "حذف";
    removeBtn.onclick = () => removeFromCart(item.id);

    row.appendChild(name);
    row.appendChild(price);
    row.appendChild(removeBtn);
    sideItems.appendChild(row);
  });

  stickerCount.textContent = cart.length;
  totalHead.textContent = `${total.toFixed(2)} ر.ع`;
}

async function checkout(userId) {
  for (const item of cart) {
    await supabaseClient.from("orders").insert([{
      user_id: userId,
      product_id: item.id,
      quantity: item.qty
    }]);
  }
  alert("تم إرسال الطلب بنجاح ✅");
  cart = [];
  updateCartUI();
}