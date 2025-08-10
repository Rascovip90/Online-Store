const ADMIN_PASSWORD = "7732";
let isAdmin = false;

function adminLogin() {
  const pass = document.getElementById("adminPass").value;
  if (pass === ADMIN_PASSWORD) {
    isAdmin = true;
    document.getElementById("loginPanel").style.display = "none";
    document.getElementById("controlPanel").style.display = "block";
    renderAdminList();
  } else {
    alert("كلمة المرور غير صحيحة");
  }
}

function closeAdmin() {
  document.getElementById("adminModal").style.display = "none";
}

async function addProduct() {
  if (!isAdmin) return;

  const name = document.getElementById("prodName").value;
  const price = parseFloat(document.getElementById("prodPrice").value);
  const imagesInput = document.getElementById("prodImages").value;
  const desc = document.getElementById("prodDesc").value;
  const type = document.getElementById("prodType").value;

  const images = imagesInput.split(",").map(i => i.trim()).filter(i => i);

  await supabaseClient.from("products").insert([{
    name,
    price,
    images,
    description: desc,
    type
  }]);

  renderProducts();
  renderOffers();
  renderAdminList();
}

async function deleteProduct(id) {
  await supabaseClient.from("products").delete().eq("id", id);
  renderProducts();
  renderOffers();
  renderAdminList();
}

async function renderAdminList() {
  const list = document.getElementById("adminList");
  list.innerHTML = "";
  const products = await fetchProducts();
  products.forEach(p => {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "space-between";

    const title = document.createElement("span");
    title.textContent = p.name;

    const delBtn = document.createElement("button");
    delBtn.textContent = "حذف";
    delBtn.onclick = () => deleteProduct(p.id);

    row.appendChild(title);
    row.appendChild(delBtn);
    list.appendChild(row);
  });
}